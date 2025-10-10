from flask import *
from __init__ import *

app = Flask(__name__)

@app.route('/')
def root():
    return "placeholder"

@app.route('/signup',methods=['POST'])
def signup_route():
    return auth_controller.signup()

@app.route('/login', methods=['POST'])
def login_route():
    return auth_controller.login()

if __name__ == "__main__":
    app.run()
