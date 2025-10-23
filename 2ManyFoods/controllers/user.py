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
                if "dietary_preferences" in data:
                    user_services.update_dietary_preferences(username, data["dietary_preferences"])
            case "cuisine":
                if "cuisine_preferences" in data:
                    user_services.update_cuisine_preferences(username, data["cuisine_preferences"])
    except Exception as e:
        return jsonify({"error":f"Failed to update field: {str(e)}"}), 500
    
    return jsonify({"message":f"Profile updated successfully"}), 200
