from flask import *
from flask_cors import CORS
from flask_mail import Mail
from __init__ import *
from db import *
from models import *
from controllers import recommendations as recommendations_controller
from datetime import datetime, timedelta
from controllers import group as group_cons
from controllers import eatery as eatery_cons
from bson.objectid import ObjectId
from services import user as user_services

from utils import verification
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

rec_cons = {}
verification_codes = {}


@app.route('/signup', methods=['POST', 'OPTIONS'])
def signup_route():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response, 200

    return auth_controller.signup(app, request.get_json())


mail = Mail(app)


@app.route('/send-verification', methods=['POST'])
def send_verification():
    """Send verification code to email"""
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # Check if email already exists in database
        from services import user as user_services
        existing_user = user_services.get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "Email already registered"}), 400

        # Generate 6-digit verification code
        # code = ''.join(random.choices(string.digits, k=6))

        code = verification.mail(app, email)
        # Store code with expiration (10 minutes)
        verification_codes[email] = {
            'code': code,
            'expires_at': datetime.now() + timedelta(minutes=10)
        }

        # TODO: Send email with verification code
        # For now, just print it (in production, use email service)
        # verification.mail(app, email)
        # print(f"Verification code for {email}: {code}")

        return jsonify({
            "message": "Verification code sent successfully",
            "email": email,
        }), 200

    except Exception as e:
        print(f"Error sending verification: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify email with code"""
    try:
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')

        if not email or not code:
            return jsonify({"error": "Email and code are required"}), 400

        # Check if code exists
        if email not in verification_codes:
            return jsonify({"error": "No verification code found for this email"}), 400

        stored_data = verification_codes[email]

        # Check if code expired
        if datetime.now() > stored_data['expires_at']:
            del verification_codes[email]
            return jsonify({"error": "Verification code expired. Please request a new one"}), 400

        # Check if code matches
        if stored_data['code'] != code:
            return jsonify({"error": "Invalid verification code"}), 400

        # Code is valid - remove it
        del verification_codes[email]

        return jsonify({
            "message": "Email verified successfully",
            "email": email
        }), 200

    except Exception as e:
        print(f"Error verifying email: {e}")
        return jsonify({"error": str(e)}), 500


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
def generate_recommendation(groupName):
    global rec_cons
    if groupName not in rec_cons.keys():
        latitude = request.args['lat']
        longitude = request.args['long']
        radius = 500
        group_rec = asyncio.run(searchdb('Groups', 'grp_name', groupName))
        if group_rec != None:
            users = {}
            id = group_rec["_id"]
            for userID in group_rec['users']:
                user_rec = asyncio.run(searchdb('Users', 'Username', userID))
                users[userID] = user_rec

        else:
            users = asyncio.run(searchdb('Users', 'Username', groupName))
            users = {groupName: users}
            id = users[groupName]["_id"]
        group = Group(groupName, users, None, id)
        con = recommendation_controller.RecommendationController(
            group, Location(latitude, longitude), radius)
        rec_cons[groupName] = con
    else:
        con = rec_cons[groupName]
        cuisines = request.args['cuisines'].split(",")
        con._group.Users[request.args['username']]['Preferences'] = {
            "rank1": cuisines[0], "rank2": cuisines[1], "rank3": cuisines[2], }
    return jsonify({"recommendations": con.getRecommendations()})


@app.route('/foodball/<groupName>/vote', methods=['POST'])
def group_voting(groupName):
    global rec_cons
    data = request.get_json()
    username = data.get('username')
    restaurant_id = data.get('restaurant_id', "")
    hunger = data.get('hunger')
    try:
        con = rec_cons[groupName]
        con._group.Users[username]["vote"] = restaurant_id
        con._group.Users[username]["Hunger"] = hunger
        
        all_votes = [user.get("vote") for user in rec_cons[groupName]._group.Users.values()]
        done = all(vote is not None for vote in all_votes)
        
        if done:
            return jsonify({"finalVote": rec_cons[groupName].finishVoting()})
        return jsonify({"recommendations": rec_cons[groupName].getRecommendations()})
    except Exception as e:
        print(f"Vote error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route('/refresh/<groupName>', methods=['GET'])
def refresh(groupName):
    global rec_cons
    if groupName in rec_cons.keys():
        all_votes = [user.get("vote") for user in rec_cons[groupName]._group.Users.values()]
        voted = all(vote is not None for vote in all_votes)
        
        if voted:
            final = rec_cons[groupName].finishVoting()
            return jsonify({"finalVote": final})
        return jsonify({"recommendations": rec_cons[groupName].getRecommendations()})
    else:
        return jsonify({"recommendations": ""})

    
@app.route('/update_prefs', methods=["POST"])
def update():
    groupID = request.args['groupID']
    userID = request.args['user']
    pref = request.args['preferences']
    updatedb("Users", {"_id": userID, "Preferences": pref})
    if groupID in rec_cons.keys():
        rec_cons[groupID].updatePref(userID, pref)
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


# one route just to get everything from user
@app.route('/account/<username>', methods=['GET'])
def get_user_profile(username):
    return user_controller.get_user_profile(username)


@app.route('/api/groups/user/<username>', methods=['GET'])
def get_user_groups(username):
    return group_controller.handle_get_user_groups(username)


@app.route('/api/groups/<grp_id>', methods=['GET'])
def get_group_details(grp_id):
    return group_controller.handle_get_group_details(grp_id)


@app.route('/api/groups/leave', methods=['POST'])
def leave_group():
    return group_controller.handle_leave_group(request.get_json())

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
            "cuisine": restaurant.get('cuisine', []),
            "visited_date": datetime.now().isoformat(),
        }

        user_services.update_foodhistory(username, history_entry)
        group_name = data.get("groupName")
        if group_name and group_name in rec_cons:
            del rec_cons[group_name]
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
    return review_controller.handle_create_review(request.get_json())


@app.route('/api/review/update', methods=['POST'])
def update_review():
    return review_controller.handle_update_review(request.get_json())


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

# Members poll for session status
@app.route('/api/foodball/status/<groupName>', methods=['GET'])
def get_foodball_status(groupName):
    """Check if Foodball session has started and location is set"""
    global rec_cons

    try:
        if groupName in rec_cons:
            con = rec_cons[groupName]

            return jsonify({
                "status": "ready",
                "location": {"latLng":{"lat":con.location.getlatitude(), "lng": con.location.getlongitude()}}
            }), 200

        else:
            return jsonify({
                "status": "not_started"
            }), 200

    except Exception as e:
        print(f"Error checking foodball status: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8080, debug=True)
