# GET /invites/validate - Validate an invite token
# API Group: AUTH
# Authentication: None (public endpoint)

# === INPUT PARAMETERS ===
input token text

# === VALIDATE INPUT ===
precondition $input.token != "" "Token is required" 400

# === FIND INVITE BY TOKEN ===
var invite invites|query_single:{"filters":{"token":"$input.token"}}

# === CHECK INVITE EXISTS ===
conditional $invite == null
  response {
    "valid": false,
    "error": "INVALID_TOKEN",
    "message": "Invalid or expired invite token"
  }
endconditional

# === CHECK INVITE STATUS ===
conditional $invite.status != "pending"
  response {
    "valid": false,
    "error": "TOKEN_USED",
    "message": "This invite has already been used"
  }
endconditional

# === CHECK INVITE NOT EXPIRED ===
conditional $invite.expires_at < now
  response {
    "valid": false,
    "error": "TOKEN_EXPIRED",
    "message": "This invite has expired"
  }
endconditional

# === GET INVITER INFO ===
var inviter null
conditional $invite.invited_by_user_id != null
  var inviter users|query_single:{"filters":{"id":"$invite.invited_by_user_id"}}
endconditional

# === RETURN VALID INVITE INFO ===
response {
  "valid": true,
  "invite": {
    "email": "$invite.email",
    "role": "$invite.role",
    "sub_role": "$invite.sub_role",
    "expires_at": "$invite.expires_at"
  },
  "invited_by": {
    "first_name": "$inviter.first_name",
    "last_name": "$inviter.last_name"
  }
}
