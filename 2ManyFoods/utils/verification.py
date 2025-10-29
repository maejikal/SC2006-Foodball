from flask_mail import Message,Mail
from random import randint
def send_email(app, email):
    msg = Message(
        subject = "Your 2ManyFoods Verification Code",
        recipient = email
    )
    code = str(randint(0,999999))
    while len(code) < 6:
        code = "0" + code
    msg.body = "Your verification code is " + code
    mail = Mail()
    app.secret_key = "dev"
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_SSL"] = True
    app.config["MAIL_USERNAME"] = 'noreply@2manyfood.com'  
    app.config["MAIL_PASSWORD"] = 'password'
    mail.init_app(app)
    app.secret_key = "dev2"
    mail.connect().send(msg)
    return code
