# POST /auth/signup-simple - Simple signup without invite (FOR TESTING ONLY)
# API Group: AUTH
# Authentication: None (public endpoint)
# WARNING: This is for development/testing only. Use invite-based signup in production.

# === INPUT PARAMETERS ===
input email text
input password text
input first_name text
input last_name text
input role text
input phone text

# === INPUT VALIDATION ===
precondition $input.email != "" "Email is required" 400
precondition $input.password|length >= 8 "Password must be at least 8 characters" 400
precondition $input.first_name != "" "First name is required" 400
precondition $input.last_name != "" "Last name is required" 400

# === SET DEFAULT ROLE IF NOT PROVIDED ===
var user_role $input.role
conditional $user_role == ""
  var user_role "student"
endconditional

# === NORMALIZE EMAIL ===
var email_lower $input.email|to_lower

# === CHECK USER DOESN'T ALREADY EXIST ===
var existing_user users|query_single:{"filters":{"email":"$email_lower"}}

conditional $existing_user != null
  throw USER_EXISTS "An account with this email already exists" 409
endconditional

# === HASH PASSWORD ===
var hashed_password $input.password|hash

# === CREATE USER ===
var new_user users|add:{
  "email": "$email_lower",
  "password": "$hashed_password",
  "role": "$user_role",
  "sub_role": null,
  "first_name": "$input.first_name",
  "last_name": "$input.last_name",
  "phone": "$input.phone",
  "status": "active",
  "email_verified": true,
  "invited_by_user_id": null,
  "created_at": "now",
  "updated_at": "now"
}

# === CREATE DEFAULT PRIVACY SETTINGS ===
var privacy privacy_settings|add:{
  "user_id": "$new_user.id",
  "show_profile_public": true,
  "show_major_public": true,
  "show_cohort_public": false,
  "allow_classmate_view": true,
  "allow_instructor_contact": true,
  "created_at": "now",
  "updated_at": "now"
}

# === CREATE AUTH TOKEN ===
var auth_token users|create_auth_token:$new_user.id

# === BUILD RESPONSE ===
response {
  "success": true,
  "authToken": "$auth_token",
  "user": {
    "id": "$new_user.id",
    "email": "$new_user.email",
    "role": "$new_user.role",
    "first_name": "$new_user.first_name",
    "last_name": "$new_user.last_name"
  }
}
