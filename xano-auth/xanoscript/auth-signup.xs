# POST /auth/signup - Register with invite token
# API Group: AUTH
# Authentication: None (public endpoint)
# Rate Limit: 10/minute recommended

# === INPUT PARAMETERS ===
input invite_token text
input email text
input password text
input first_name text
input last_name text
input phone text

# === INPUT VALIDATION ===
precondition $input.invite_token != "" "Invite token is required" 400
precondition $input.email != "" "Email is required" 400
precondition $input.password|length >= 8 "Password must be at least 8 characters" 400
precondition $input.first_name != "" "First name is required" 400
precondition $input.last_name != "" "Last name is required" 400

# === FIND INVITE BY TOKEN ===
var invite invites|query_single:{"filters":{"token":"$input.invite_token"}}

# === VALIDATE INVITE EXISTS ===
conditional $invite == null
  throw INVALID_TOKEN "Invalid or expired invite token" 400
endconditional

# === CHECK INVITE STATUS ===
conditional $invite.status != "pending"
  throw TOKEN_USED "This invite has already been used" 400
endconditional

# === CHECK INVITE NOT EXPIRED ===
conditional $invite.expires_at < now
  throw TOKEN_EXPIRED "This invite has expired" 400
endconditional

# === VERIFY EMAIL MATCHES INVITE ===
var invite_email_lower $invite.email|to_lower
var input_email_lower $input.email|to_lower

conditional $invite_email_lower != $input_email_lower
  throw EMAIL_MISMATCH "Email does not match invite" 400
endconditional

# === CHECK USER DOESN'T ALREADY EXIST ===
var existing_user users|query_single:{"filters":{"email":"$input_email_lower"}}

conditional $existing_user != null
  throw USER_EXISTS "An account with this email already exists" 409
endconditional

# === HASH PASSWORD ===
var hashed_password $input.password|hash

# === CREATE USER ===
var new_user users|add:{
  "email": "$input_email_lower",
  "password": "$hashed_password",
  "role": "$invite.role",
  "sub_role": "$invite.sub_role",
  "first_name": "$input.first_name",
  "last_name": "$input.last_name",
  "phone": "$input.phone",
  "status": "active",
  "email_verified": true,
  "invited_by_user_id": "$invite.invited_by_user_id",
  "created_at": "now",
  "updated_at": "now"
}

# === CREATE FAMILY RELATIONSHIP IF FAMILY MEMBER INVITE ===
conditional $invite.role == "family_member"
  conditional $invite.target_user_id != null
    var family_rel family_relationships|add:{
      "student_user_id": "$invite.target_user_id",
      "family_member_user_id": "$new_user.id",
      "relationship_type": "$invite.sub_role",
      "status": "active",
      "can_view_loans": true,
      "can_view_payments": true,
      "can_view_calendar": true,
      "created_at": "now",
      "updated_at": "now"
    }
  endconditional
endconditional

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

# === MARK INVITE AS ACCEPTED ===
var updated_invite invites|edit:{"id":"$invite.id"}:{
  "status": "accepted",
  "accepted_at": "now"
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
    "sub_role": "$new_user.sub_role",
    "first_name": "$new_user.first_name",
    "last_name": "$new_user.last_name"
  }
}
