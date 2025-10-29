from flask_mail import Message,Mail
from random import randint
def send_email(app, email):
    msg = Message(
        subject = "Your 2ManyFoods Verification Code",
        sender = '2manyfood@gmail.com',
        recipients = [email]
    )
    code = str(randint(0,999999))
    while len(code) < 6:
        code = "0" + code
    msg.body = "Your verification code is " + code
    mail = Mail()
    app.secret_key = "dev"
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 465
    app.config["MAIL_USE_SSL"] = True
    app.config["MAIL_USERNAME"] = '2manyfood@gmail.com'  
    app.config["MAIL_PASSWORD"] = 'VerySecret123!'

    app.config["MAIL_DEBUG"] = True
    app.config["DEBUG"] = True
    app.config["TESTING"] = False
    app.config["MAIL_SUPPRESS_SEND"] = False
    
    mail.init_app(app)
    app.secret_key = "dev2"
    mail.connect().send(msg)
    return code
