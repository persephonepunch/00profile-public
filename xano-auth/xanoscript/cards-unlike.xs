# DELETE /cards/:id/like - Unlike a card
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
  "filters": {"id": "$input.card_id"}
}

precondition $card != null "Card not found" 404

# === FIND EXISTING LIKE ===
var existing_like card_likes|query_single:{
  "filters": {
    "card_id": "$input.card_id",
    "user_id": "$auth_user.id"
  }
}

precondition $existing_like != null "You haven't liked this card" 400

# === DELETE LIKE ===
var deleted card_likes|delete:$existing_like.id

# === UPDATE LIKE COUNT ===
var new_count $card.like_count - 1
conditional $new_count < 0
  var new_count 0
endconditional

var updated_card cards|edit:$card.id:{
  "like_count": "$new_count"
}

# === RETURN SUCCESS ===
response {
  "success": true,
  "liked": false,
  "like_count": $new_count
}
