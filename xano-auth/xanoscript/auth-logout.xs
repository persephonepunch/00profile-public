# POST /auth/logout - Logout and revoke auth token
# API Group: AUTH
# Authentication: Required (Bearer token)

# === REQUIRE AUTHENTICATION ===
requiresAuth users

# === REVOKE AUTH TOKEN ===
revokeAuthToken

# === RETURN SUCCESS ===
response {
  "success": true,
  "message": "Logged out successfully"
}
