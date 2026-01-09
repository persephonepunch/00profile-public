# GET /cards/:id/comments - Get comments for a card
# API Group: CARDS
# Authentication: Optional (depends on card visibility)

# === INPUT PARAMETERS ===
input card_id integer
input page integer
input per_page integer
input share_token text    # Optional: for shared card access

# === SET DEFAULTS ===
var page $input.page|default:1
var per_page $input.per_page|default:20
conditional $per_page > 50
  var per_page 50
endconditional

# === GET CARD ===
var card cards|query_single:{
  "filters": {"id": "$input.card_id", "status": "published"}
}

precondition $card != null "Card not found" 404

# === GET AUTHENTICATED USER (optional) ===
var auth_header $request.headers.Authorization
var auth_user null
conditional $auth_header != ""
  var token $auth_header|replace:"Bearer ":""
  var auth_user $token|auth_decode
endconditional

# === CHECK VIEW PERMISSION ===
var can_view false

# Owner can always view
conditional $auth_user != null
  conditional $auth_user.id == $card.user_id
    var can_view true
  endconditional
endconditional

# Public cards
conditional $can_view == false
  conditional $card.visibility == "public"
    var can_view true
  endconditional
endconditional

# Shared cards - check share
conditional $can_view == false
  conditional $card.visibility == "shared"
    # Check by token
    conditional $input.share_token != ""
      var token_hash $input.share_token|hash
      var share card_shares|query_single:{
        "filters": {
          "card_id": "$input.card_id",
          "token": "$token_hash",
          "status": "accepted"
        }
      }
      conditional $share != null
        var can_view $share.can_view
      endconditional
    endconditional

    # Check by user
    conditional $can_view == false
      conditional $auth_user != null
        var share card_shares|query_single:{
          "filters": {
            "card_id": "$input.card_id",
            "shared_with_user_id": "$auth_user.id",
            "status": "accepted"
          }
        }
        conditional $share != null
          var can_view $share.can_view
        endconditional
      endconditional
    endconditional
  endconditional
endconditional

precondition $can_view == true "You don't have permission to view comments on this card" 403

# === GET TOP-LEVEL COMMENTS ===
var offset ($page - 1) * $per_page

var comments card_comments|query:{
  "filters": {
    "card_id": "$input.card_id",
    "parent_id": null,
    "status": "visible"
  },
  "sort": {"created_at": "desc"},
  "offset": $offset,
  "limit": $per_page
}

# === GET TOTAL COUNT ===
var total_count card_comments|count:{
  "filters": {
    "card_id": "$input.card_id",
    "parent_id": null,
    "status": "visible"
  }
}

# === ENRICH COMMENTS WITH USER INFO AND REPLIES ===
var enriched_comments []

foreach $comments as $comment
  # Get commenter info
  var commenter users|query_single:{
    "filters": {"id": "$comment.user_id"}
  }

  var commenter_info {
    "id": $commenter.id,
    "first_name": $commenter.first_name,
    "last_name": $commenter.last_name,
    "avatar": $commenter.avatar
  }

  # Get replies (limited to 3)
  var replies card_comments|query:{
    "filters": {
      "card_id": "$input.card_id",
      "parent_id": "$comment.id",
      "status": "visible"
    },
    "sort": {"created_at": "asc"},
    "limit": 3
  }

  var replies_count card_comments|count:{
    "filters": {
      "card_id": "$input.card_id",
      "parent_id": "$comment.id",
      "status": "visible"
    }
  }

  # Enrich replies with user info
  var enriched_replies []
  foreach $replies as $reply
    var reply_user users|query_single:{
      "filters": {"id": "$reply.user_id"}
    }
    var enriched_reply {
      "id": $reply.id,
      "content": $reply.content,
      "created_at": $reply.created_at,
      "user": {
        "id": $reply_user.id,
        "first_name": $reply_user.first_name,
        "last_name": $reply_user.last_name,
        "avatar": $reply_user.avatar
      }
    }
    var enriched_replies $enriched_replies|push:$enriched_reply
  endforeach

  # Check if current user is author
  var is_author false
  conditional $auth_user != null
    conditional $auth_user.id == $comment.user_id
      var is_author true
    endconditional
  endconditional

  # Build enriched comment
  var enriched_comment {
    "id": $comment.id,
    "content": $comment.content,
    "created_at": $comment.created_at,
    "user": $commenter_info,
    "is_author": $is_author,
    "replies": $enriched_replies,
    "replies_count": $replies_count,
    "has_more_replies": $replies_count > 3
  }

  var enriched_comments $enriched_comments|push:$enriched_comment
endforeach

# === CALCULATE PAGINATION ===
var total_pages $total_count / $per_page|ceil

# === RETURN COMMENTS ===
response {
  "comments": $enriched_comments,
  "pagination": {
    "page": $page,
    "per_page": $per_page,
    "total": $total_count,
    "total_pages": $total_pages,
    "has_more": $page < $total_pages
  }
}
