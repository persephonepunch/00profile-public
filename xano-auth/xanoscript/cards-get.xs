# GET /cards/:id - Get a card with permission check
# API Group: CARDS
# Authentication: Optional (required for private/shared cards)

# === INPUT PARAMETERS ===
input card_id integer
input share_token text    # Optional: for shared card access

# === GET CARD ===
var card cards|query_single:{
  "filters": {"id": "$input.card_id"}
}

precondition $card != null "Card not found" 404

# === CHECK IF PUBLISHED (unless owner) ===
# Get authenticated user (optional)
var auth_header $request.headers.Authorization
var auth_user null
conditional $auth_header != ""
  var token $auth_header|replace:"Bearer ":""
  var auth_user $token|auth_decode
endconditional

var is_owner false
conditional $auth_user != null
  conditional $auth_user.id == $card.user_id
    var is_owner true
  endconditional
endconditional

# Non-owners can only see published cards
conditional $is_owner == false
  precondition $card.status == "published" "Card not found" 404
endconditional

# === PERMISSION CHECK ===
var permissions {
  "can_view": false,
  "can_comment": false,
  "can_like": false,
  "is_owner": $is_owner
}

# Owner has full access
conditional $is_owner == true
  var permissions {
    "can_view": true,
    "can_comment": true,
    "can_like": true,
    "is_owner": true
  }
endconditional

# Public cards
conditional $is_owner == false
  conditional $card.visibility == "public"
    var permissions.can_view true
    conditional $auth_user != null
      var permissions.can_comment $card.allow_comments
      var permissions.can_like $card.allow_likes
    endconditional
  endconditional
endconditional

# Private cards - only owner (already handled above)
conditional $is_owner == false
  conditional $card.visibility == "private"
    throw FORBIDDEN "You don't have permission to view this card" 403
  endconditional
endconditional

# Shared cards - check share record
conditional $is_owner == false
  conditional $card.visibility == "shared"
    var share null

    # Check by share token
    conditional $input.share_token != ""
      var token_hash $input.share_token|hash
      var share card_shares|query_single:{
        "filters": {
          "card_id": "$input.card_id",
          "token": "$token_hash",
          "status": "accepted"
        }
      }
    endconditional

    # Check by user ID if logged in
    conditional $share == null
      conditional $auth_user != null
        var share card_shares|query_single:{
          "filters": {
            "card_id": "$input.card_id",
            "shared_with_user_id": "$auth_user.id",
            "status": "accepted"
          }
        }
      endconditional
    endconditional

    # Validate share
    conditional $share == null
      throw FORBIDDEN "You don't have permission to view this card" 403
    endconditional

    # Check expiration
    conditional $share.expires_at != null
      conditional $share.expires_at < now
        throw EXPIRED "This share link has expired" 403
      endconditional
    endconditional

    # Set permissions from share
    var permissions.can_view $share.can_view
    var permissions.can_comment $share.can_comment
    var permissions.can_like $share.can_like
  endconditional
endconditional

# Final permission check
precondition $permissions.can_view == true "You don't have permission to view this card" 403

# === INCREMENT VIEW COUNT (for non-owners) ===
conditional $is_owner == false
  var updated cards|edit:$card.id:{
    "view_count": "$card.view_count + 1"
  }
endconditional

# === CHECK IF USER LIKED THIS CARD ===
var user_liked false
conditional $auth_user != null
  var existing_like card_likes|query_single:{
    "filters": {
      "card_id": "$input.card_id",
      "user_id": "$auth_user.id"
    }
  }
  conditional $existing_like != null
    var user_liked true
  endconditional
endconditional

# === GET CARD OWNER INFO ===
var owner users|query_single:{
  "filters": {"id": "$card.user_id"}
}

var owner_info {
  "id": $owner.id,
  "first_name": $owner.first_name,
  "last_name": $owner.last_name,
  "avatar": $owner.avatar
}

# === RETURN CARD WITH PERMISSIONS ===
response {
  "card": $card,
  "owner": $owner_info,
  "permissions": $permissions,
  "user_liked": $user_liked
}
