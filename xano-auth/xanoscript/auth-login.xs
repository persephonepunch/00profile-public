# POST /auth/login - Login with email and password
# API Group: AUTH
# Authentication: None (public endpoint)
# Rate Limit: 5/minute recommended

# === INPUT PARAMETERS ===
input email text
input password text

# === INPUT VALIDATION ===
precondition $input.email != "" "Email is required" 400
precondition $input.password != "" "Password is required" 400

# === FIND USER BY EMAIL (case-insensitive) ===
var email_lower $input.email|to_lower
var user users|query_single:{"filters":{"email":"$email_lower"}}

# === CHECK USER EXISTS ===
conditional $user == null
  throw INVALID_CREDENTIALS "Invalid email or password" 401
endconditional

# === CHECK USER STATUS ===
conditional $user.status == "suspended"
  throw ACCOUNT_SUSPENDED "Your account has been suspended. Please contact support." 403
endconditional

conditional $user.status == "pending"
  throw ACCOUNT_PENDING "Your account is pending activation" 403
endconditional

conditional $user.status == "inactive"
  throw ACCOUNT_INACTIVE "Your account is inactive" 403
endconditional

# === VERIFY PASSWORD ===
var password_valid $input.password|check_password:$user.password

conditional $password_valid == false
  throw INVALID_CREDENTIALS "Invalid email or password" 401
endconditional

# === UPDATE LAST LOGIN TIMESTAMP ===
var updated_user users|edit:{"id":"$user.id"}:{"last_login_at":"now","updated_at":"now"}

# === CREATE AUTH TOKEN ===
var auth_token users|create_auth_token:$user.id

# === BUILD RESPONSE ===
response {
  "success": true,
  "authToken": "$auth_token",
  "user": {
    "id": "$user.id",
    "email": "$user.email",
    "role": "$user.role",
    "sub_role": "$user.sub_role",
    "first_name": "$user.first_name",
    "last_name": "$user.last_name",
    "profile_image_url": "$user.profile_image_url"
  }
}
