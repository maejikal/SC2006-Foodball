from flask import request, jsonify
from services import user as user_services, group as group_services

## fetching user's profile, updating settings, getting lists associated with logged in users

def update_user_profile(data):                                                            #Call front end if error, else call user_service to update
    if not data:
        return jsonify({"error":"Missing or invalid JSON input"}), 400
    
    username = data.get("username")
    try:
        user_services.update_user(data['field'],data['username'],data['newValue'])
    except Exception as e:
        return jsonify({"error":f"Failed to update field: {str(e)}"}), 500
    
    return jsonify({"message":f"Profile updated successfully"}), 200

def get_user_profile(username):                                                            #Same as above, but for getting user data instead
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    try:
        user = user_services.get_user_by_username(username)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "username": user.get("Username"),
            "email": user.get("Email"),
            "profilePhoto": user.get("ProfilePhoto", ""),
            "dietaryRequirements": user.get("DietaryRequirements", {}),
            "preferences": user.get("Preferences", {}),
            "groups": user.get("Groups", []),
            "foodHistory": user.get("FoodHistory", [])
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": f"Failed to get user profile: {str(e)}"}), 500
