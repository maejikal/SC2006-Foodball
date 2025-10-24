from flask import request, jsonify
from services import user as user_services, group as group_services
from bson import ObjectId


## fetching user's profile, updating settings, getting lists associated with logged in users

def update_user_profile(data, section):
    if not data:
        return jsonify({"error":"Missing or invalid JSON input"}), 400
    
    username = data.get("username")
    try:
        match section:
            case "security":
                if "username" in data:
                    user_services.update_username(username, data["username"])
                if "email" in data:
                    user_services.update_email(username, data["email"])
                if "password" in data:
                    user_services.update_password(username, data["password"])
                if "profile_photo" in data:
                    user_services.update_profile_photo(username, data["profile_photo"])
            case "dietary":
                if "dietary_requirements" in data:
                    user_services.update_dietary_preferences(username, data["dietary_requirements"])
            case "cuisine":
                if "cuisine_preferences" in data:
                    user_services.update_cuisine_preferences(username, data["cuisine_preferences"])
                if "budget" in data:
                    user_services.update_budget(username, data["budget"])
    except Exception as e:
        return jsonify({"error":f"Failed to update field: {str(e)}"}), 500
    
    return jsonify({"message":f"Profile updated successfully"}), 200

def get_account_info(username):

    if not username:
        return jsonify({"error":"Username is required"}), 400
    
    try:
        user = user_services.get_user_by_username(username)
        
        if not user:
            return jsonify({"error":"User not found"}), 404
        
        return jsonify({
            "username": user.get("Username"),
            "email": user.get("Email"),
            "profilePhoto": user.get("ProfilePhoto", "")
        }), 200
    
    except Exception as e:
        return jsonify({"error":f"Failed to get account info: {str(e)}"}), 500


def get_dietary_preferences(username):
    user = user_services.get_user_by_username(username)
    return jsonify({
        "dietaryRequirements": user.get("DietaryRequirements", {})
    }), 200

def get_cuisine_preferences(username):
    user = user_services.get_user_by_username(username)
    return jsonify({
        "preferences": user.get("Preferences", {}),
        "budget": user.get("Budget", 50)
    }), 200

