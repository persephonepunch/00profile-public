# POST /cards/:id/like - Like a card
# API Group: CARDS
# Authentication: Required

# === INPUT PARAMETERS ===
input card_id integer

# === GET AUTHENTICATED USER ===
var auth_header $request.headers.Authorization
precondition $auth_header != "" "Authorization required" 401

var token $auth_header|replace:"Bearer ":""
var auth_user $token|auth_decode

precondition $auth_user != null "Invalid token" 401

# === GET CARD ===
var card cards|query_single:{
  "filters": {"id": "$input.card_id", "status": "published"}
}

precondition $card != null "Card not found" 404

# === CHECK LIKE PERMISSION ===
var can_like false

# Owner can always like
conditional $auth_user.id == $card.user_id
  var can_like true
endconditional

# Public cards with likes enabled
conditional $can_like == false
  conditional $card.visibility == "public"
    conditional $card.allow_likes == true
      var can_like true
    endconditional
  endconditional
endconditional

# Shared cards - check share permissions
conditional $can_like == false
  conditional $card.visibility == "shared"
    var share card_shares|query_single:{
      "filters": {
        "card_id": "$input.card_id",
        "shared_with_user_id": "$auth_user.id",
        "status": "accepted"
      }
    }
    conditional $share != null
      conditional $share.can_like == true
        conditional $card.allow_likes == true
          var can_like true
        endconditional
      endconditional
    endconditional
  endconditional
endconditional

precondition $can_like == true "You don't have permission to like this card" 403

# === CHECK IF ALREADY LIKED ===
var existing_like card_likes|query_single:{
  "filters": {
    "card_id": "$input.card_id",
    "user_id": "$auth_user.id"
  }
}

conditional $existing_like != null
  throw ALREADY_LIKED "You already liked this card" 400
endconditional

# === CREATE LIKE ===
var new_like card_likes|create:{
  "card_id": "$input.card_id",
  "user_id": "$auth_user.id",
  "created_at": "now"
}

# === UPDATE LIKE COUNT ===
var new_count $card.like_count + 1
var updated_card cards|edit:$card.id:{
  "like_count": "$new_count"
}

# === RETURN SUCCESS ===
response {
  "success": true,
  "liked": true,
  "like_count": $new_count
}
