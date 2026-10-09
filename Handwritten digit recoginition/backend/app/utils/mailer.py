from flask_mail import Message
from app.extensions import mail
from flask import current_app


def send_password_reset_email(to_email: str, name: str, reset_link: str):
    subject = "Reset your DigiSense password"
    text_body = (
        f"Hi {name},\n\n"
        f"We received a request to reset your DigiSense password. "
        f"Click the link below to choose a new one:\n\n{reset_link}\n\n"
        f"This link expires in {current_app.config['RESET_TOKEN_EXPIRES_MINUTES']} minutes. "
        f"If you didn't request this, you can safely ignore this email.\n\n"
        f"— DigiSense"
    )
    html_body = f"""
    <div style="font-family: Inter, Arial, sans-serif; background:#050505; padding:32px; color:#F5F5F7;">
      <div style="max-width:480px;margin:0 auto;background:#0c0c12;border:1px solid #1f1f28;border-radius:16px;padding:32px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6C63FF,#00D4FF);
                    display:flex;align-items:center;justify-content:center;color:#050505;font-weight:700;
                    font-family:monospace;margin-bottom:20px;">AI</div>
        <h2 style="margin:0 0 12px;font-size:20px;">Reset your password</h2>
        <p style="color:#9CA3AF;line-height:1.6;font-size:14px;">
          Hi {name}, we received a request to reset the password for your
          DigiSense account. Click the button below to choose a new one.
          This link expires in {current_app.config['RESET_TOKEN_EXPIRES_MINUTES']} minutes.
        </p>
        <a href="{reset_link}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;border-radius:999px;
                  background:linear-gradient(90deg,#6C63FF,#3ABEFF);color:white;text-decoration:none;
                  font-weight:600;font-size:14px;">
          Reset password
        </a>
        <p style="color:#6b7280;font-size:12px;margin-top:24px;">
          Didn't request this? You can safely ignore this email — your password won't change.
        </p>
      </div>
    </div>
    """
    msg = Message(subject=subject, recipients=[to_email], body=text_body, html=html_body)
    mail.send(msg)
