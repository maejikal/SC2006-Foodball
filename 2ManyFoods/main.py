from flask import *
from __init__ import *
from db import *
from models import *
from recommendations import *
app = Flask(__name__)

rec_cons = {}

@app.route('/')
def root():
    return render_template('D:/NTU/SC2006/2006-SCSB-35/2ManyFoods/Frontend/2manyfoods-frontend/viindex.html')


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

@app.route('/joingroup/<groupID>', methods=['GET'])
async def join_group(groupID):
    group = await group_collection.find_one({"GroupID":groupID})
    if not group:
        return render_template("create_group.html")
    else:
        return group_controller.handle_join_grp()
        # return render_template("group_joined.html")

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
    con = RecommendationController(group, Location(location), radius)
    rec_cons[groupID] = con
    return render_template('foodball.html', recommendations=con)

@app.route('/foodball/<groupID>/voting')
async def group_voting(groupID):
    global rec_cons
    con = rec_cons[groupID]
    return render_template("voting.html", options=con.recommendations)

if __name__ == "__main__":
    app.run(debug=True)

