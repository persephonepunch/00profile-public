# POST /invites - Create a new invite
# API Group: AUTH
# Authentication: Required (admin or instructor only)

# === REQUIRE AUTHENTICATION ===
requiresAuth users

# === GET CURRENT USER TO CHECK PERMISSIONS ===
var current_user users|query_single:{"filters":{"id":"id"}}

# === VERIFY USER CAN CREATE INVITES ===
# Admins can invite anyone, instructors can invite students
var can_invite false

conditional $current_user.role == "admin"
  var can_invite true
endconditional

conditional $current_user.role == "instructor"
  var can_invite true
endconditional

conditional $current_user.role == "student"
  # Students can only invite family members
  conditional $input.role == "family_member"
    var can_invite true
  endconditional
endconditional

conditional $can_invite == false
  throw FORBIDDEN "You don't have permission to create invites" 403
endconditional

# === INPUT PARAMETERS ===
input email text
input role text
input sub_role text
input target_user_id integer

# === VALIDATE INPUTS ===
precondition $input.email != "" "Email is required" 400
precondition $input.role != "" "Role is required" 400

# === VALIDATE ROLE IS ALLOWED ===
var valid_roles ["student", "instructor", "family_member", "admin", "sponsor"]
var role_valid $valid_roles|contains:$input.role

conditional $role_valid == false
  throw INVALID_ROLE "Invalid role. Must be one of: student, instructor, family_member, admin, sponsor" 400
endconditional

# === ADDITIONAL ROLE RESTRICTIONS ===
# Non-admins can't create admin invites
conditional $current_user.role != "admin"
  conditional $input.role == "admin"
    throw FORBIDDEN "Only admins can create admin invites" 403
  endconditional
  conditional $input.role == "sponsor"
    throw FORBIDDEN "Only admins can create sponsor invites" 403
  endconditional
endconditional

# Instructors can only invite students
conditional $current_user.role == "instructor"
  conditional $input.role != "student"
    throw FORBIDDEN "Instructors can only invite students" 403
  endconditional
endconditional

# Students can only invite family members for themselves
conditional $current_user.role == "student"
  conditional $input.target_user_id != id
    throw FORBIDDEN "Students can only invite family members for themselves" 403
  endconditional
endconditional

# === CHECK FOR EXISTING PENDING INVITE ===
var email_lower $input.email|to_lower
var existing_invite invites|query_single:{"filters":{"email":"$email_lower","status":"pending"}}

conditional $existing_invite != null
  throw DUPLICATE_INVITE "A pending invite already exists for this email" 409
endconditional

# === GENERATE UNIQUE TOKEN ===
var token $email_lower|hash|substring:0:32

# === CALCULATE EXPIRY (7 days from now) ===
var expires_at now|add_secs_to_timestamp:604800

# === CREATE INVITE ===
var new_invite invites|add:{
  "token": "$token",
  "email": "$email_lower",
  "role": "$input.role",
  "sub_role": "$input.sub_role",
  "status": "pending",
  "invited_by_user_id": "id",
  "target_user_id": "$input.target_user_id",
  "expires_at": "$expires_at",
  "created_at": "now"
}

# === BUILD INVITE URL ===
var invite_url $env.APP_URL ~ "/signup?token=" ~ "$token"

# === GET INVITER NAME FOR EMAIL ===
var inviter_name $current_user.first_name ~ " " ~ $current_user.last_name

# === SEND INVITE EMAIL ===
functionRun util-send-invite-email {
  "to_email": "$email_lower",
  "invite_token": "$token",
  "role": "$input.role",
  "inviter_name": "$inviter_name"
} email_result

# === RETURN SUCCESS ===
response {
  "success": true,
  "invite": {
    "id": "$new_invite.id",
    "email": "$email_lower",
    "role": "$input.role",
    "sub_role": "$input.sub_role",
    "token": "$token",
    "expires_at": "$expires_at",
    "invite_url": "$invite_url"
  },
  "email_sent": "$email_result.success"
}
