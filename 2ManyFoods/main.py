from flask import *
from __init__ import *

app = Flask(__name__)


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/signup', methods=['POST', 'GET'])
def signup_route():
    if request.method == 'POST':
        return auth_controller.signup()
    elif request.method == 'GET':
        return render_template('signup.html')


@app.route('/login', methods=['POST', 'GET'])
def login_route():
    if request.method == 'POST':
        return auth_controller.login()
    elif request.method == 'GET':
        return render_template('login.html')



if __name__ == "__main__":
    app.run()
