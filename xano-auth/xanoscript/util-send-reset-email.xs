# FUNCTION: util-send-reset-email
# Sends a password reset email
#
# INPUTS:
#   to_email (text) - Recipient email address
#   to_name (text) - Recipient name
#   reset_token (text) - The password reset token
#
# RETURNS:
#   success (boolean) - Whether email was sent
#   message_id (text) - SendGrid message ID if successful

# === FUNCTION PARAMETERS ===
param to_email text
param to_name text
param reset_token text

# === BUILD RESET URL ===
var reset_url $env.APP_URL ~ "/reset-password?token=" ~ "$param.reset_token"

# === BUILD EMAIL CONTENT ===
var subject "Reset your USC Story password"

# HTML Email Template
var html_content "<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>Reset Your Password</title>
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
          Reset Your Password
        </h2>

        <p style=\"color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0; text-align: center;\">
          Hi"

conditional $param.to_name != ""
  var html_content $html_content ~ " " ~ $param.to_name
endconditional

var html_content $html_content ~ ",
        </p>

        <p style=\"color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;\">
          We received a request to reset your password. Click the button below to create a new password.
        </p>

        <!-- CTA Button -->
        <div style=\"text-align: center; margin: 32px 0;\">
          <a href=\"" ~ $reset_url ~ "\" style=\"display: inline-block; background-color: #8B0000; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;\">
            Reset Password
          </a>
        </div>

        <!-- Link Fallback -->
        <p style=\"color: #6b7280; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;\">
          Or copy and paste this link into your browser:
        </p>
        <p style=\"color: #8B0000; font-size: 14px; word-break: break-all; margin: 8px 0 0 0; text-align: center;\">
          " ~ $reset_url ~ "
        </p>

        <!-- Expiration Notice -->
        <p style=\"color: #9ca3af; font-size: 13px; margin: 32px 0 0 0; text-align: center;\">
          This link expires in 1 hour for security.
        </p>

        <!-- Security Notice -->
        <div style=\"background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 24px;\">
          <p style=\"color: #92400e; font-size: 14px; margin: 0; text-align: center;\">
            If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account security.
          </p>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style=\"padding: 24px 20px; text-align: center;\">
        <p style=\"color: #9ca3af; font-size: 13px; margin: 0;\">
          &copy; USC Story. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>"

# Plain text fallback
var text_content "Reset Your Password\n\n"
var text_content $text_content ~ "Hi"

conditional $param.to_name != ""
  var text_content $text_content ~ " " ~ $param.to_name
endconditional

var text_content $text_content ~ ",\n\n"
var text_content $text_content ~ "We received a request to reset your password.\n\n"
var text_content $text_content ~ "Click here to reset: " ~ $reset_url ~ "\n\n"
var text_content $text_content ~ "This link expires in 1 hour for security.\n\n"
var text_content $text_content ~ "If you didn't request this, please ignore this email."

# === SEND EMAIL ===
functionRun util-send-email {
  "to_email": "$param.to_email",
  "to_name": "$param.to_name",
  "subject": "$subject",
  "html_content": "$html_content",
  "text_content": "$text_content"
} email_result

return $email_result
