# GET /auth/me - Get current authenticated user with permissions
# API Group: AUTH
# Authentication: Required (Bearer token)

# === REQUIRE AUTHENTICATION ===
# After this, 'id' contains the authenticated user's ID
requiresAuth users

# === GET USER RECORD ===
var user users|query_single:{"filters":{"id":"id"}}

# === GET PRIVACY SETTINGS ===
var privacy privacy_settings|query_single:{"filters":{"user_id":"id"}}

# === INITIALIZE EMPTY ARRAYS FOR OPTIONAL DATA ===
var family_members []
var linked_students []
var support_cards []
var user_cohorts []

# === GET COHORTS (if user_cohorts table exists) ===
# Uncomment when user_cohorts table is created:
# var user_cohorts user_cohorts|query:{"filters":{"user_id":"id","status":"active"}}

# === GET FAMILY MEMBERS (for students) ===
conditional $user.role == "student"
  var family_members family_relationships|query:{"filters":{"student_user_id":"id","status":"active"}}
  # Optional: Get support cards for students
  # var support_cards support_cards|query:{"filters":{"student_user_id":"id","is_active":true},"sort":{"display_order":"asc"}}
endconditional

# === GET LINKED STUDENTS (for family members) ===
conditional $user.role == "family_member"
  var linked_students family_relationships|query:{"filters":{"family_member_user_id":"id","status":"active"}}
endconditional

# === BUILD PERMISSIONS OBJECT BASED ON ROLE ===
var permissions {}

# Admin permissions
conditional $user.role == "admin"
  var permissions {
    "can_manage_users": true,
    "can_manage_cohorts": true,
    "can_view_all_students": true,
    "can_invite_all_roles": true,
    "can_view_financial_data": true
  }
endconditional

# Instructor permissions
conditional $user.role == "instructor"
  var permissions {
    "can_view_cohort_students": true,
    "can_invite_students": true,
    "can_manage_cohort": true,
    "can_view_student_work": true
  }
endconditional

# Student permissions
conditional $user.role == "student"
  var permissions {
    "can_invite_family": true,
    "can_view_own_loans": true,
    "can_view_classmates": true,
    "can_create_support_cards": true,
    "can_manage_privacy": true
  }
endconditional

# Family member permissions
conditional $user.role == "family_member"
  var permissions {
    "can_view_student_loans": true,
    "can_view_payment_calendar": true,
    "can_contribute_to_support_cards": true
  }
endconditional

# Sponsor permissions
conditional $user.role == "sponsor"
  var permissions {
    "can_view_endowment_stats": true,
    "can_manage_corporate_programs": true
  }
endconditional

# === BUILD RESPONSE ===
response {
  "user": {
    "id": "$user.id",
    "email": "$user.email",
    "role": "$user.role",
    "sub_role": "$user.sub_role",
    "first_name": "$user.first_name",
    "last_name": "$user.last_name",
    "profile_image_url": "$user.profile_image_url",
    "phone": "$user.phone",
    "status": "$user.status"
  },
  "permissions": "$permissions",
  "privacy_settings": "$privacy",
  "cohorts": "$user_cohorts",
  "family_members": "$family_members",
  "linked_students": "$linked_students",
  "support_cards": "$support_cards"
}
