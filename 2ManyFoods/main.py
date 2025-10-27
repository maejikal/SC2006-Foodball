from flask import *
from flask_cors import CORS
from __init__ import *
from db import *
from models import *
from controllers import recommendations as recommendations_controller
from datetime import datetime
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

@app.route('/api/groups/join', methods=['POST'])
def join_group_by_code():
    return group_controller.handle_join_by_invite_code(request.get_json())

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

@app.route('/account/dietary/<username>', methods=['GET'])
def get_dietary(username):
    return user_controller.get_dietary_preferences(username)

@app.route('/account/cuisine/<username>', methods=['GET'])
def get_cuisine(username):
    return user_controller.get_cuisine_preferences(username)

@app.route('/account/info/<username>', methods=['GET'])
def get_account_info_route(username):
    return user_controller.get_account_info(username)

@app.route('/api/groups/create', methods=['POST'])
def create_group_route():
    data = request.get_json()
    return group_controller.handle_create_group(data)

@app.route('/api/groups/user/<username>', methods=['GET'])
def get_user_groups(username):
    return group_controller.handle_get_user_groups(username)

@app.route('/api/groups/<grp_id>', methods=['GET'])
def get_group_details(grp_id):
    return group_controller.handle_get_group_details(grp_id)

@app.route('/api/groups/leave', methods=['POST'])
def leave_group():
    return group_controller.handle_leave_group(request.get_json())

@app.route('/api/search', methods=['GET'])
def solo_search():
    return recommendations_controller.handle_solo_search()

from datetime import datetime

@app.route('/api/history/add', methods=['POST'])
def add_to_history():
    """Add restaurant to user's food history"""
    try:
        data = request.get_json()
        username = data.get('username')
        restaurant = data.get('restaurant')
        
        if not username or not restaurant:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Create history entry with restaurant details
        history_entry = {
            "restaurant_id": restaurant['id'],
            "restaurant_name": restaurant['name'],
            "address": restaurant.get('address', 'N/A'),
            "price_range": restaurant.get('price_range', 0),
            "cuisine": restaurant.get('cuisine', 'Unknown'),
            "visited_date": datetime.now().isoformat(),
            "image": restaurant.get('image', '')
        }
        
        # Use existing service to update food history
        from services import user as user_services
        user_services.update_foodhistory(username, history_entry)
        
        return jsonify({
            "message": "Restaurant added to history successfully",
            "restaurant": restaurant['name']
        }), 200
        
    except Exception as e:
        print(f"Error adding to history: {e}")
        return jsonify({"error": str(e)}), 500

    
@app.route('/api/history/get', methods=['GET'])
def get_food_history():
    """Get user's food history"""
    try:
        username = request.args.get('username')
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        # Use existing service to get user
        from services import user as user_services
        user_doc = user_services.get_user_by_username(username)
        
        if not user_doc:
            return jsonify({"error": "User not found"}), 404
        
        # Get food history (returns array)
        food_history = user_doc.get("FoodHistory", [])
        
        return jsonify({
            "success": True,
            "history": food_history
        }), 200
        
    except Exception as e:
        print(f"Error getting food history: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/review/create', methods=['POST'])
def create_review():
    return review_controller.handle_create_review()

@app.route('/api/review/update', methods=['PUT'])
def update_review():
    return review_controller.handle_update_review()

@app.route('/api/review/get', methods=['GET'])
def get_review():
    """Get user's reviews"""
    try:
        username = request.args.get('username')
        restaurant_id = request.args.get('restaurant_id')
        
        if not username or not restaurant_id:
            return jsonify({"error": "Missing parameters"}), 400
        
        # Get reviews from services
        from services import review as review_services
        reviews = review_services.get_user_reviews(username)
        
        # Find specific restaurant review
        restaurant_review = None
        for review in reviews:
            if review.get("EateryID") == restaurant_id:
                restaurant_review = review
                break
        
        if not restaurant_review:
            return jsonify({"error": "Review not found"}), 404
        
        return jsonify({
            "success": True,
            "review": {
                "rating": restaurant_review.get("Rating"),
                "comment": restaurant_review.get("Comment"),
                "photo": restaurant_review.get("Photo"),
                "date": restaurant_review.get("Date")
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting review: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8080, debug=True)