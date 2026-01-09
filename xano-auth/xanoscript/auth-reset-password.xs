# POST /auth/reset-password - Reset password with token
# API Group: AUTH
# Authentication: None (public endpoint)

# === INPUT PARAMETERS ===
input token text
input password text
input password_confirm text

# === VALIDATE INPUTS ===
precondition $input.token != "" "Reset token is required" 400
precondition $input.password != "" "Password is required" 400
precondition $input.password|length >= 8 "Password must be at least 8 characters" 400
precondition $input.password == $input.password_confirm "Passwords do not match" 400

# === HASH THE TOKEN TO MATCH STORED HASH ===
var token_hash $input.token|hash

# === FIND RESET INVITE ===
var reset_invite invites|query_single:{"filters":{"token":"$token_hash","status":"pending"}}

# === VALIDATE RESET TOKEN ===
conditional $reset_invite == null
  throw INVALID_TOKEN "Invalid or expired reset link" 400
endconditional

# Check if expired
conditional $reset_invite.expires_at < now
  # Mark as expired
  var updated invites|edit:$reset_invite.id:{"status":"expired"}
  throw TOKEN_EXPIRED "This reset link has expired. Please request a new one." 400
endconditional

# === GET USER ===
var user users|query_single:{"filters":{"id":"$reset_invite.target_user_id"}}

conditional $user == null
  throw USER_NOT_FOUND "User not found" 404
endconditional

# === HASH NEW PASSWORD ===
var hashed_password $input.password|hash

# === UPDATE USER PASSWORD ===
var updated_user users|edit:$user.id:{
  "password": "$hashed_password",
  "updated_at": "now"
}

# === MARK RESET INVITE AS USED ===
var updated_invite invites|edit:$reset_invite.id:{
  "status": "accepted",
  "accepted_at": "now"
}

# === REVOKE ALL EXISTING SESSIONS (security) ===
# This forces user to login again with new password
# Note: If you have a sessions table, you'd delete sessions here

# === RETURN SUCCESS ===
response {
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
