from flask import *
from flask_cors import CORS
from __init__ import *
from db import *
from models import *
app = Flask(__name__)
CORS(app)

rec_cons = {}

@app.route('/')
def root():
    return "placeholder"


@app.route('/signup', methods=['POST'])
def signup_route():
    return auth_controller.signup(request.get_json())


@app.route('/login', methods=['POST'])
def login_route():
    return auth_controller.login(request.get_json())

@app.route('/joingroup/<groupID>', methods=['GET'])
async def join_group(groupID):
    return group_controller.handle_join_grp(request.get_json(), groupID)

@app.route('/foodball/<groupID>')
async def generate_recommendation(groupID):
    global rec_cons
    if groupID not in rec_cons.keys():
        location = request.args['location']
        radius = request.args['location']
        group_rec = await group_collection.find_one({"groupID": groupID})
        users = {}
        for userID in group_rec.users:
            user_rec = await user_collection.find_one({"ID": userID})
            users[userID] = user_rec
        group = Group(group_rec.name, users, group_rec.GroupPhoto, group_rec.id)
        con = recommendation_controller(group, Location(location), radius)
        rec_cons[groupID] = con 
    else:
        con = rec_cons[groupID]
    return con.getRecommendations()

@app.route('/refresh/<groupID>')
def refresh_group(groupID):
    global rec_cons
    try:
        con = rec_cons[groupID]
        return jsonify({"recommendations": con.recommendations})
    except:
        return jsonify({"recommendations": {}}), 400

@app.route('/foodball/<groupID>/vote')
async def group_voting(groupID):
    global rec_cons
    userID = request.args['userID']
    vote = request.args['vote']
    try:
        con = rec_cons[groupID]
        con.Users[userID]['vote'] = vote
        return ""
    except:
        return "", 400
    
@app.route('/update_prefs', methods=["POST"])
def update():
    groupID = request.args['groupID']
    userID = request.args['user']
    pref = request.args['preferences']
    updatedb("Users", {"_id": userID, "Preferences": pref})
    if groupID in rec_cons.keys():
        rec_cons[groupID].updatePref(userID, pref)
        return jsonify({"recommendations": rec_cons[groupID].getRecommendations()})

@app.route('/refresh', methods=['GET'])
def refresh():
    global rec_cons
    groupID = request.args['groupID']
    if groupID in rec_cons.keys():
        voted = None in [i["vote"] for i in rec_cons[groupID].Users]
        if voted:
            return jsonify({"finalVote": rec_cons[groupID].finishVoting()}) 
        return jsonify({"recommendations": rec_cons[groupID].getRecommendations()})
    
@app.route('/account/security', methods=['POST'])
def update_security():
    return user_controller.update_user_profile(request.get_json(), section='security')

@app.route('/account/dietary', methods=['POST'])
def update_dietary():
    return user_controller.update_user_profile(request.get_json(), section='dietary')

@app.route('/account/cuisine', methods=['POST'])
def update_cuisine():
    return user_controller.update_user_profile(request.get_json(), section='cuisine')

if __name__ == "__main__":
    app.run(port=8080, debug=True)