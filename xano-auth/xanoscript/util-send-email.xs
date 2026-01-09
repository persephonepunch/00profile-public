# FUNCTION: util-send-email
# Sends an email via SendGrid API
#
# INPUTS:
#   to_email (text) - Recipient email address
#   to_name (text) - Recipient name (optional)
#   subject (text) - Email subject
#   html_content (text) - HTML email body
#   text_content (text) - Plain text email body (optional, fallback)
#
# RETURNS:
#   success (boolean) - Whether email was sent
#   message_id (text) - SendGrid message ID if successful
#   error (text) - Error message if failed
#
# USAGE IN XANO:
#   Create as a Function in Xano, then call via:
#   functionRun util-send-email {"to_email": "user@example.com", "subject": "Hello", "html_content": "<p>Hi!</p>"} result

# === FUNCTION PARAMETERS ===
param to_email text
param to_name text
param subject text
param html_content text
param text_content text

# === VALIDATE REQUIRED INPUTS ===
precondition $param.to_email != "" "Recipient email is required" 400
precondition $param.subject != "" "Subject is required" 400
precondition $param.html_content != "" "HTML content is required" 400

# === BUILD SENDGRID REQUEST ===
# Build personalization object
var to_obj {}|set:"email":$param.to_email

conditional $param.to_name != ""
  var to_obj $to_obj|set:"name":$param.to_name
endconditional

# Build content array
var content_array []
var html_obj {}|set:"type":"text/html"|set:"value":$param.html_content
var content_array $content_array|push:$html_obj

conditional $param.text_content != ""
  var text_obj {}|set:"type":"text/plain"|set:"value":$param.text_content
  var content_array []|push:$text_obj|push:$html_obj
endconditional

# Build from object
var from_obj {}|set:"email":$env.SENDGRID_FROM_EMAIL|set:"name":$env.SENDGRID_FROM_NAME

# Build personalizations array
var personalization {}|set:"to":[]|push:$to_obj
var personalizations []|push:$personalization

# Build full request body
var request_body {}
var request_body $request_body|set:"personalizations":$personalizations
var request_body $request_body|set:"from":$from_obj
var request_body $request_body|set:"subject":$param.subject
var request_body $request_body|set:"content":$content_array

# === SEND EMAIL VIA SENDGRID ===
apiRequest "https://api.sendgrid.com/v3/mail/send" "POST" {
  "headers": {
    "Authorization": "Bearer $env.SENDGRID_API_KEY",
    "Content-Type": "application/json"
  },
  "body": "$request_body"
} email_result

# === CHECK RESPONSE ===
var status $email_result.response.status

# SendGrid returns 202 Accepted for successful sends
conditional $status == 202
  # Get message ID from headers
  var message_id $email_result.response.headers.x-message-id
  return {
    "success": true,
    "message_id": "$message_id",
    "status": 202
  }
endconditional

# Handle errors
conditional $status >= 400
  var error_body $email_result.response.result
  var error_message $error_body.errors[0].message

  conditional $error_message == null
    var error_message "Failed to send email"
  endconditional

  return {
    "success": false,
    "error": "$error_message",
    "status": "$status"
  }
endconditional

# Fallback for unexpected status
return {
  "success": false,
  "error": "Unexpected response from email service",
  "status": "$status"
}
