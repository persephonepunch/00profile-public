# POST /cards - Create a new card
# API Group: CARDS
# Authentication: Required

# === INPUT PARAMETERS ===
input title text
input content text
input excerpt text
input cover_image text
input visibility text      # public, private, shared
input status text          # draft, published
input allow_comments boolean
input allow_likes boolean
input tags array

# === GET AUTHENTICATED USER ===
var auth_header $request.headers.Authorization
precondition $auth_header != "" "Authorization required" 401

var token $auth_header|replace:"Bearer ":""
var auth_user $token|auth_decode

precondition $auth_user != null "Invalid token" 401

# === VALIDATE INPUTS ===
precondition $input.title != "" "Title is required" 400
precondition $input.content != "" "Content is required" 400

# Validate visibility
var valid_visibility ["public", "private", "shared"]
precondition $valid_visibility|includes:$input.visibility "Invalid visibility. Must be: public, private, or shared" 400

# Validate status
var valid_status ["draft", "published"]
var status $input.status
conditional $status == ""
  var status "draft"
endconditional
precondition $valid_status|includes:$status "Invalid status. Must be: draft or published" 400

# === GENERATE EXCERPT IF NOT PROVIDED ===
var excerpt $input.excerpt
conditional $excerpt == ""
  # Strip HTML and take first 200 chars
  var excerpt $input.content|strip_tags|truncate:200
endconditional

# === SET PUBLISHED_AT IF PUBLISHING ===
var published_at null
conditional $status == "published"
  var published_at now
endconditional

# === CREATE CARD ===
var new_card cards|create:{
  "user_id": "$auth_user.id",
  "title": "$input.title",
  "content": "$input.content",
  "excerpt": "$excerpt",
  "cover_image": "$input.cover_image",
  "visibility": "$input.visibility",
  "status": "$status",
  "allow_comments": "$input.allow_comments|default:true",
  "allow_likes": "$input.allow_likes|default:true",
  "like_count": 0,
  "comment_count": 0,
  "view_count": 0,
  "tags": "$input.tags|default:[]",
  "created_at": "now",
  "updated_at": "now",
  "published_at": "$published_at"
}

# === RETURN CREATED CARD ===
response {
  "success": true,
  "card": $new_card
}
