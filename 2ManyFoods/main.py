from flask import *
from flask_cors import CORS
from __init__ import *
from db import *
from models import *
from controllers import recommendations as recommendations_controller
from datetime import datetime
from controllers import group as group_cons
from controllers import eatery as eatery_cons
from bson.objectid import ObjectId
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

@app.route('/foodball/<groupName>')
async def generate_recommendation(groupName):
    global rec_cons
    if groupName not in rec_cons.keys():
        location = request.args['location']
        radius = 500
        group_rec = await searchdb('Groups', 'group_name',groupName)
        if group_rec != None:
            users = {}
            id = group_rec["_id"]
            for userID in group_rec['users']:
                user_rec = await searchdb('Username', 'username',userID)
                users[userID] = user_rec
            
        else:
            users = await searchdb('Username', 'username', groupName)
            id = users["_id"]
        group = Group(groupName, users, None, id)
        con = recommendation_controller(group, Location(location), radius)
        rec_cons[groupName] = con 
    else:
        con = rec_cons[groupName]
    return con.getRecommendations()

@app.route('/refresh/<groupID>')
def refresh_group(groupID):
    global rec_cons
    
    if groupID not in rec_cons:
        print(f"GroupID {groupID} not in cache - returning empty")
        return jsonify({
            "recommendations": [], 
            "votingStatus": {},
            "voteDetails": {}
        }), 200
    
    try:
        con = rec_cons[groupID]
        
        
        return jsonify({
            "recommendations": con.recommendations
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"recommendations": [], "votingStatus": {}, "voteDetails": {}}), 200


@app.route('/foodball/<groupID>/vote', methods=['POST'])
def group_voting(groupID):
    global rec_cons
    data = request.get_json()
    username = data.get('username')
    restaurant_id = data.get('restaurant_ids', [])
    
    try:
        
        con = rec_cons[groupID]
        con.Users["username"]["vote"] = restaurant_id
        voted = None in [i["vote"] for i in rec_cons[groupID].Users]
        if voted:
            return jsonify({"finalVote": rec_cons[groupID].finishVoting()}) 
        return jsonify({"recommendations": rec_cons[groupID].getRecommendations()})
    
    except Exception as e:
        print(f"Vote error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400
    
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
    return user_controller.update_user_profile(request.get_json())

@app.route('/account/dietary', methods=['POST'])
def update_dietary():
    return user_controller.update_user_profile(request.get_json())

@app.route('/account/cuisine', methods=['POST'])
def update_cuisine():
    return user_controller.update_user_profile(request.get_json())

@app.route('/account/<username>', methods=['GET']) # one route just to get everything from user
def get_user_profile(username):
    return user_controller.get_user_profile(username)

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

@app.route('/api/history/add', methods=['POST'])
def add_to_history():
    """Add restaurant to user's food history"""
    try:
        data = request.get_json()
        username = data.get('username')
        restaurant = data.get('restaurant')
        
        if not username or not restaurant:
            return jsonify({"error": "Missing required fields"}), 400
        
        history_entry = {
            "restaurant_id": restaurant['id'],
            "restaurant_name": restaurant['name'],
            "address": restaurant.get('address', 'N/A'),
            "price_range": restaurant.get('price_range', 0),
            "cuisine": restaurant.get('cuisine', 'Unknown'),
            "visited_date": datetime.now().isoformat(),
            "image": restaurant.get('image', '')
        }
        
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
        
        from services import review as review_services
        reviews = review_services.get_user_reviews(username)
        
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


# Get group status (for polling)
@app.route('/api/group/<group_id>/status', methods=['GET'])
def get_group_status(group_id):
    try:
        group = group_cons.get_group_by_id(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        return jsonify({
            'members': group.get('members', []),
            'all_ready': all(m.get('preferences_set', False) for m in group.get('members', [])),
            'voting_started': group.get('voting_started', False),
            'restaurants': group.get('restaurants', [])
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Update member preferences in group
@app.route('/api/group/<group_id>/preferences', methods=['POST'])
def update_group_preferences(group_id):
    try:
        data = request.json
        username = data.get('username')
        cuisines = data.get('cuisines', [])
        price_range = data.get('price_range', 50)
        hunger_level = data.get('hunger_level', 5)
        
        group_cons.update_member_preferences(
            group_id, 
            username, 
            cuisines, 
            price_range, 
            hunger_level
        )
        
        return jsonify({'message': 'Preferences updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Start voting
@app.route('/api/group/<group_id>/start-voting', methods=['POST'])
def start_voting(group_id):
    try:
        data = request.json
        restaurants = data.get('restaurants', [])
        
        group_cons.start_voting(group_id, restaurants)
        
        return jsonify({'message': 'Voting started'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/group/<group_id>/vote', methods=['POST'])
def submit_vote(group_id):
    try:
        data = request.json
        username = data.get('username')
        restaurant_ids = data.get('restaurant_ids', [])
        
        if not restaurant_ids or len(restaurant_ids) == 0:
            return jsonify({'error': 'Must select one restaurant'}), 400
        
        group = group_cons.get_group_by_id(group_id)
        if any(v['username'] == username for v in group.get('votes', [])):
            return jsonify({'error': 'Already voted'}), 400
        
        group_cons.add_vote(group_id, username, restaurant_ids)
        
        group = group_cons.get_group_by_id(group_id)
        all_voted = all(m.get('has_voted', False) for m in group.get('members', []))
        
        if all_voted:
            winner = group_cons.calculate_winner(group_id)
            return jsonify({'message': 'Vote submitted', 'voting_complete': True, 'winner': winner}), 200
        
        return jsonify({'message': 'Vote submitted', 'voting_complete': False}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get voting results
@app.route('/api/group/<group_id>/votes', methods=['GET'])
def get_votes(group_id):
    try:
        group = group_cons.get_group_by_id(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        votes = group.get('votes', [])
        all_voted = all(m.get('has_voted', False) for m in group.get('members', []))
        
        winner = None
        if all_voted and votes:
            winner = group_cons.calculate_winner(group_id)
        
        return jsonify({
            'votes': votes,
            'voting_complete': all_voted,
            'winner': winner 
        }), 200
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/group/<group_id>', methods=['POST', 'OPTIONS'])
def get_group_recommendations(group_id):
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response, 200
    
    try:
        eateries = recommendations_controller.handle_group_search(group_id)
        return jsonify({
            "message": "Group recommendations generated",
            "eateries": eateries
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=8080, debug=True)

