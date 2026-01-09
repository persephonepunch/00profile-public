# FUNCTION: util-send-invite-email
# Sends an invite email to a new user
#
# INPUTS:
#   to_email (text) - Recipient email address
#   invite_token (text) - The invite token for signup URL
#   role (text) - Role being invited to (student, instructor, etc.)
#   inviter_name (text) - Name of person who sent invite
#
# RETURNS:
#   success (boolean) - Whether email was sent
#   message_id (text) - SendGrid message ID if successful

# === FUNCTION PARAMETERS ===
param to_email text
param invite_token text
param role text
param inviter_name text

# === BUILD SIGNUP URL ===
var signup_url $env.APP_URL ~ "/signup?token=" ~ "$param.invite_token"

# === FORMAT ROLE FOR DISPLAY ===
var role_display $param.role|replace:"_":" "|capitalize

# === BUILD EMAIL CONTENT ===
var subject "You're invited to join USC Story"

conditional $param.inviter_name != ""
  var subject $param.inviter_name ~ " invited you to join USC Story"
endconditional

# HTML Email Template
var html_content "<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>You're Invited!</title>
</head>
<body style=\"margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;\">
  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 600px; margin: 0 auto; padding: 40px 20px;\">
    <tr>
      <td style=\"background-color: #ffffff; border-radius: 12px; padding: 48px 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);\">

        <!-- Logo/Header -->
        <div style=\"text-align: center; margin-bottom: 32px;\">
          <h1 style=\"color: #8B0000; font-size: 28px; margin: 0;\">USC Story</h1>
        </div>

        <!-- Main Content -->
        <h2 style=\"color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;\">
          You're Invited!
        </h2>

        <p style=\"color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;\">"

conditional $param.inviter_name != ""
  var html_content $html_content ~ "<strong>" ~ $param.inviter_name ~ "</strong> has invited you to join USC Story as a <strong>" ~ $role_display ~ "</strong>."
endconditional

conditional $param.inviter_name == ""
  var html_content $html_content ~ "You've been invited to join USC Story as a <strong>" ~ $role_display ~ "</strong>."
endconditional

var html_content $html_content ~ "</p>

        <!-- CTA Button -->
        <div style=\"text-align: center; margin: 32px 0;\">
          <a href=\"" ~ $signup_url ~ "\" style=\"display: inline-block; background-color: #8B0000; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;\">
            Accept Invitation
          </a>
        </div>

        <!-- Link Fallback -->
        <p style=\"color: #6b7280; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;\">
          Or copy and paste this link into your browser:
        </p>
        <p style=\"color: #8B0000; font-size: 14px; word-break: break-all; margin: 8px 0 0 0; text-align: center;\">
          " ~ $signup_url ~ "
        </p>

        <!-- Expiration Notice -->
        <p style=\"color: #9ca3af; font-size: 13px; margin: 32px 0 0 0; text-align: center;\">
          This invitation expires in 7 days.
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style=\"padding: 24px 20px; text-align: center;\">
        <p style=\"color: #9ca3af; font-size: 13px; margin: 0;\">
          &copy; USC Story. All rights reserved.
        </p>
        <p style=\"color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;\">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>"

# Plain text fallback
var text_content "You're Invited to USC Story!\n\n"

conditional $param.inviter_name != ""
  var text_content $text_content ~ $param.inviter_name ~ " has invited you to join USC Story as a " ~ $role_display ~ ".\n\n"
endconditional

conditional $param.inviter_name == ""
  var text_content $text_content ~ "You've been invited to join USC Story as a " ~ $role_display ~ ".\n\n"
endconditional

var text_content $text_content ~ "Click here to accept: " ~ $signup_url ~ "\n\n"
var text_content $text_content ~ "This invitation expires in 7 days.\n\n"
var text_content $text_content ~ "If you didn't expect this invitation, you can safely ignore this email."

# === SEND EMAIL ===
functionRun util-send-email {
  "to_email": "$param.to_email",
  "subject": "$subject",
  "html_content": "$html_content",
  "text_content": "$text_content"
} email_result

return $email_result
