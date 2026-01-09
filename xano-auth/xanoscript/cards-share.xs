# POST /cards/:id/share - Create share invitation
# API Group: CARDS
# Authentication: Required (owner only)

# === INPUT PARAMETERS ===
input card_id integer
input email text
input can_view boolean
input can_comment boolean
input can_like boolean
input message text
input expires_in_days integer

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

# === VERIFY OWNERSHIP ===
precondition $auth_user.id == $card.user_id "Only the card owner can share" 403

# === VALIDATE INPUTS ===
precondition $input.email != "" "Email is required" 400
precondition $input.email|is_email "Invalid email address" 400

# can_view is always true for shares
var can_view true

# === CHECK IF ALREADY SHARED WITH THIS EMAIL ===
var existing_share card_shares|query_single:{
  "filters": {
    "card_id": "$input.card_id",
    "shared_with_email": "$input.email",
    "status": ["pending", "accepted"]
  }
}

conditional $existing_share != null
  throw ALREADY_SHARED "This card is already shared with this email" 400
endconditional

# === GENERATE SHARE TOKEN ===
var raw_token $input.card_id|concat:$input.email|concat:now|concat:random:32
var token_hash $raw_token|hash

# The actual token sent to user (before hashing)
var share_token random:48

# === CHECK IF RECIPIENT IS A REGISTERED USER ===
var recipient users|query_single:{
  "filters": {"email": "$input.email"}
}

var shared_with_user_id null
conditional $recipient != null
  var shared_with_user_id $recipient.id
endconditional

# === CALCULATE EXPIRATION ===
var expires_at null
conditional $input.expires_in_days > 0
  var expires_at now|add_days:$input.expires_in_days
endconditional

# === CREATE SHARE RECORD ===
var new_share card_shares|create:{
  "card_id": "$input.card_id",
  "shared_by_user_id": "$auth_user.id",
  "shared_with_user_id": "$shared_with_user_id",
  "shared_with_email": "$input.email",
  "token": "$share_token|hash",
  "can_view": true,
  "can_comment": "$input.can_comment|default:true",
  "can_like": "$input.can_like|default:true",
  "status": "pending",
  "message": "$input.message",
  "created_at": "now",
  "expires_at": "$expires_at"
}

# === SEND INVITATION EMAIL ===
var sharer_name $auth_user.first_name
conditional $sharer_name == ""
  var sharer_name $auth_user.email|split:"@"|first
endconditional

var share_url "https://yourdomain.com/cards/view/"
var share_url $share_url|concat:$share_token

# Build email content
var email_subject $sharer_name
var email_subject $email_subject|concat:" shared a story with you"

var email_html "<div style='font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;'>"
var email_html $email_html|concat:"<div style='background: #8B0000; color: white; padding: 24px; text-align: center;'>"
var email_html $email_html|concat:"<h1 style='margin: 0; font-size: 24px;'>Story Shared With You</h1>"
var email_html $email_html|concat:"</div>"
var email_html $email_html|concat:"<div style='padding: 32px; background: #fff;'>"
var email_html $email_html|concat:"<p style='font-size: 16px; color: #374151;'><strong>"
var email_html $email_html|concat:$sharer_name
var email_html $email_html|concat:"</strong> has shared their story with you:</p>"
var email_html $email_html|concat:"<div style='background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;'>"
var email_html $email_html|concat:"<h2 style='margin: 0 0 8px 0; color: #1f2937;'>"
var email_html $email_html|concat:$card.title
var email_html $email_html|concat:"</h2>"
var email_html $email_html|concat:"<p style='margin: 0; color: #6b7280;'>"
var email_html $email_html|concat:$card.excerpt
var email_html $email_html|concat:"</p>"
var email_html $email_html|concat:"</div>"

# Add personal message if provided
conditional $input.message != ""
  var email_html $email_html|concat:"<div style='background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;'>"
  var email_html $email_html|concat:"<p style='margin: 0; color: #92400e; font-style: italic;'>\""
  var email_html $email_html|concat:$input.message
  var email_html $email_html|concat:"\"</p>"
  var email_html $email_html|concat:"</div>"
endconditional

var email_html $email_html|concat:"<div style='text-align: center; margin: 32px 0;'>"
var email_html $email_html|concat:"<a href='"
var email_html $email_html|concat:$share_url
var email_html $email_html|concat:"' style='background: #8B0000; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;'>View Story</a>"
var email_html $email_html|concat:"</div>"

# Permissions info
var email_html $email_html|concat:"<p style='font-size: 14px; color: #6b7280; text-align: center;'>You can: view"
conditional $input.can_comment == true
  var email_html $email_html|concat:", comment"
endconditional
conditional $input.can_like == true
  var email_html $email_html|concat:", like"
endconditional
var email_html $email_html|concat:"</p>"

conditional $expires_at != null
  var email_html $email_html|concat:"<p style='font-size: 12px; color: #9ca3af; text-align: center;'>This link expires in "
  var email_html $email_html|concat:$input.expires_in_days
  var email_html $email_html|concat:" days.</p>"
endconditional

var email_html $email_html|concat:"</div></div>"

# Plain text version
var email_text $sharer_name
var email_text $email_text|concat:" shared a story with you: "
var email_text $email_text|concat:$card.title
var email_text $email_text|concat:"\n\nView it here: "
var email_text $email_text|concat:$share_url

# Send email via SendGrid (assuming util-send-email function exists)
# var email_result util-send-email|call:{"to":"$input.email","subject":"$email_subject","html":"$email_html","text":"$email_text"}

# === RETURN SUCCESS ===
response {
  "success": true,
  "share": {
    "id": $new_share.id,
    "email": $input.email,
    "can_view": true,
    "can_comment": $input.can_comment,
    "can_like": $input.can_like,
    "status": "pending",
    "expires_at": $expires_at
  },
  "share_url": $share_url,
  "message": "Invitation sent successfully"
}
