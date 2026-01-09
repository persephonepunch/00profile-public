# POST /cards/:id/comments - Add a comment to a card
# API Group: CARDS
# Authentication: Required

# === INPUT PARAMETERS ===
input card_id integer
input content text
input parent_id integer    # Optional: for replies

# === GET AUTHENTICATED USER ===
var auth_header $request.headers.Authorization
precondition $auth_header != "" "Authorization required" 401

var token $auth_header|replace:"Bearer ":""
var auth_user $token|auth_decode

precondition $auth_user != null "Invalid token" 401

# === VALIDATE INPUT ===
precondition $input.content != "" "Comment content is required" 400
precondition $input.content|length <= 2000 "Comment must be 2000 characters or less" 400

# === GET CARD ===
var card cards|query_single:{
  "filters": {"id": "$input.card_id", "status": "published"}
}

precondition $card != null "Card not found" 404

# === CHECK COMMENT PERMISSION ===
var can_comment false

# Owner can always comment
conditional $auth_user.id == $card.user_id
  var can_comment true
endconditional

# Public cards with comments enabled
conditional $can_comment == false
  conditional $card.visibility == "public"
    conditional $card.allow_comments == true
      var can_comment true
    endconditional
  endconditional
endconditional

# Shared cards - check share permissions
conditional $can_comment == false
  conditional $card.visibility == "shared"
    var share card_shares|query_single:{
      "filters": {
        "card_id": "$input.card_id",
        "shared_with_user_id": "$auth_user.id",
        "status": "accepted"
      }
    }
    conditional $share != null
      conditional $share.can_comment == true
        conditional $card.allow_comments == true
          var can_comment true
        endconditional
      endconditional
    endconditional
  endconditional
endconditional

precondition $can_comment == true "You don't have permission to comment on this card" 403

# === VALIDATE PARENT COMMENT (if reply) ===
conditional $input.parent_id > 0
  var parent_comment card_comments|query_single:{
    "filters": {
      "id": "$input.parent_id",
      "card_id": "$input.card_id",
      "status": "visible"
    }
  }
  precondition $parent_comment != null "Parent comment not found" 404
endconditional

# === CREATE COMMENT ===
var new_comment card_comments|create:{
  "card_id": "$input.card_id",
  "user_id": "$auth_user.id",
  "parent_id": "$input.parent_id|default:null",
  "content": "$input.content",
  "status": "visible",
  "created_at": "now",
  "updated_at": "now"
}

# === UPDATE COMMENT COUNT ===
var new_count $card.comment_count + 1
var updated_card cards|edit:$card.id:{
  "comment_count": "$new_count"
}

# === GET COMMENTER INFO ===
var commenter_info {
  "id": $auth_user.id,
  "first_name": $auth_user.first_name,
  "last_name": $auth_user.last_name,
  "avatar": $auth_user.avatar
}

# === RETURN SUCCESS ===
response {
  "success": true,
  "comment": {
    "id": $new_comment.id,
    "content": $new_comment.content,
    "parent_id": $new_comment.parent_id,
    "created_at": $new_comment.created_at,
    "user": $commenter_info
  },
  "comment_count": $new_count
}
