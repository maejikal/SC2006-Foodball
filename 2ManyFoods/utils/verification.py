from flask_mail import Message,Mail
from random import randint
def send_email(app, email):
    msg = Message(
        subject = "Your 2ManyFoods Verification Code",
        sender = "noreply@2manyfood.com",
        recipient = email
    )
    code = str(randint(0,999999))
    while len(code) < 6:
        code = "0" + code
    msg.body = "Your verification code is " + code
    mail = Mail(app)
    mail.connect().send(msg)
    return code
