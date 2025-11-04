from flask_mail import Message,Mail
from random import randint

def mail(app, email):
    msg = Message(                                            #create Message object, set subject of email, sender of email and recipients
        subject = "Your 2ManyFoods Verification Code",              
        sender = '2manyfood@gmail.com',
        recipients = [email]
    )
    code = str(randint(0,999999))                             #generate random 6 digit verification code
    while len(code) < 6:
        code = "0" + code                                     #append 0 to front if < 6 digits

    msg.body = "Your verification code is " + code
    mail = Mail()                                             #create Mail object
    app.secret_key = "dev"                                    #initialise required fields, such as using gmail with correct port and SSL, and valid email with password
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 465
    app.config["MAIL_USE_SSL"] = True
    app.config["MAIL_USERNAME"] = '2manyfood@gmail.com'  
    app.config["MAIL_PASSWORD"] = 'efbe lvjd xfpa uhcj'

    app.config["MAIL_DEBUG"] = True                           
    app.config["DEBUG"] = True
    app.config["TESTING"] = False                             #set to False else will never send email
    app.config["MAIL_SUPPRESS_SEND"] = False

    mail.init_app(app)                                        #update mail object with new fields
    # app.secret_key = "dev"
    # app.config["MAIL_SERVER"] = "smtp.gmail.com"
    # app.config["MAIL_PORT"] = 465
    # app.config["MAIL_USE_SSL"] = True
    # app.config["MAIL_USERNAME"] = '2manyfood@gmail.com'  
    # app.config["MAIL_PASSWORD"] = 'efbe lvjd xfpa uhcj'

    # app.config["MAIL_DEBUG"] = True
    # app.config["DEBUG"] = True
    # app.config["TESTING"] = False
    # app.config["MAIL_SUPPRESS_SEND"] = False

    # mail.init_app(app)
    # app.secret_key = "dev2"
    app.secret_key = "dev2" 
    mail.send(msg)                                            #send message to email
    return code





# def send_email(email):
#     msg = Message(
#         subject = "Your 2ManyFoods Verification Code",
#         sender = '2manyfood@gmail.com',
#         recipients = [email]
#     )
#     code = str(randint(0,999999))
#     while len(code) < 6:
#         code = "0" + code
#     msg.body = "Your verification code is " + code
#     mail = Mail()
    

#     mail.init_app(app)
#     app.secret_key = "dev2"
#     mail.send(msg)
#     return code# def send_email(email):
#     msg = Message(
#         subject = "Your 2ManyFoods Verification Code",
#         sender = '2manyfood@gmail.com',
#         recipients = [email]
#     )
#     code = str(randint(0,999999))
#     while len(code) < 6:
#         code = "0" + code
#     msg.body = "Your verification code is " + code
#     mail = Mail()
    

#     mail.init_app(app)
#     app.secret_key = "dev2"
#     mail.send(msg)
#     return code

