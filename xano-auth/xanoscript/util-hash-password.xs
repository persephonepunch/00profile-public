# POST /util/hash-password - Hash a password (utility endpoint)
# API Group: AUTH
# Authentication: None
# WARNING: DELETE THIS ENDPOINT AFTER CREATING TEST USERS!

# === INPUT PARAMETERS ===
input password text

# === VALIDATE INPUT ===
precondition $input.password != "" "Password is required" 400

# === HASH THE PASSWORD ===
var hashed $input.password|hash

# === RETURN HASH ===
response {
  "hash": "$hashed"
}
