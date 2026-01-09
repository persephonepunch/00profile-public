# POST /auth/forgot-password - Request password reset email
# API Group: AUTH
# Authentication: None (public endpoint)
# Rate Limit: 3 requests per minute (configure in Xano)

# === INPUT PARAMETERS ===
input email text

# === VALIDATE INPUT ===
precondition $input.email != "" "Email is required" 400

# === NORMALIZE EMAIL ===
var email_lower $input.email|to_lower

# === FIND USER (silently - don't reveal if exists) ===
var user users|query_single:{"filters":{"email":"$email_lower"}}

# === IF USER EXISTS, SEND RESET EMAIL ===
conditional $user != null
  # Generate reset token
  var reset_token $email_lower ~ now|random_string:32

  # Hash the token for storage (store hash, send plain token)
  var token_hash $reset_token|hash

  # Calculate expiry (1 hour from now)
  var expires_at now|add_secs_to_timestamp:3600

  # Create password reset record in invites table
  # Using invites table with metadata to identify as password reset
  var reset_invite invites|add:{
    "token": "$token_hash",
    "email": "$email_lower",
    "role": "$user.role",
    "status": "pending",
    "invited_by_user_id": "$user.id",
    "target_user_id": "$user.id",
    "expires_at": "$expires_at",
    "created_at": "now"
  }

  # Get user's name for email
  var user_name $user.first_name

  # Send password reset email (with plain token, not hash)
  functionRun util-send-reset-email {
    "to_email": "$email_lower",
    "to_name": "$user_name",
    "reset_token": "$reset_token"
  } email_result
endconditional

# === ALWAYS RETURN SUCCESS (security - don't reveal if email exists) ===
response {
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link."
}
