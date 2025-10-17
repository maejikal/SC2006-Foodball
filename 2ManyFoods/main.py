from flask import *
from __init__ import *
from db import *
from models import *
app = Flask(__name__)

rec_cons = {}

@app.route('/')
def root():
    return "placeholder"


@app.route('/signup')
def signup_route():
    return auth_controller.signup()


@app.route('/login')
def login_route():
    return auth_controller.login()

@app.route('/joingroup/<groupID>', methods=['GET'])
async def join_group(groupID):
    return group_controller.handle_join_grp(groupID)

@app.route('/foodball/<groupID>')
async def make_reco(groupID):
    location = request.location
    radius = request.radius
    global rec_cons
    group_rec = await group_collection.find_one({"groupID": groupID})
    users = []
    for userID in group_rec.users:
        user_rec = await user_collection.find_one({"ID": userID})
        users.append(user_rec)
    group = Group(group_rec.name, users, group_rec.GroupPhoto, group_rec.id)
    con = recommendation_controller(group, Location(location), radius)
    rec_cons[groupID] = con
    return ""

@app.route('/refresh/<groupID>')
def refresh(groupID):
    global rec_cons
    try:
        con = rec_cons[groupID]
        return jsonify({"recommendations": con.recommendations})
    except:
        return jsonify({"recommendations": ""}), 400

@app.route('/foodball/<groupID>/voting')
async def group_voting(groupID):
    global rec_cons
    try:
        con = rec_cons[groupID]
        return jsonify({"recommendations": con.recommendations})
    except:
        return jsonify({"recommendations": ""}), 400

if __name__ == "__main__":
    app.run(debug=True)

