from db import *
from services import group as group_services, user as user_services
from flask import request, jsonify
from bson.objectid import ObjectId 

def handle_create_group():
    if not request.is_json:
        return jsonify({"error":"Invalid or Missing JSON input"})
    data = request.get_json()
    required_fields = ["GroupName"] # the rest can be blank
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    user = data["Username"]
    grp_name = data["GroupName"]
    photo = data["photo"]

    try:
        group = group_services.create_group(user, grp_name, photo)
        group_id = group.inserted_id
        user_services.join_group(user, group_id)
    except ValueError as e:
        return jsonify({"error":str(e)}), 401
    
    return jsonify({
        "message":"Group created successfully.",
        "group_id":str(group["grp_id"]),
        "username":user # group leader/creator
    }),200

def handle_join_grp(groupID: int=None): #dont quite know how to handle joining by link
    data = request.get_json()
    username = data.get("username")
    grp_id = groupID

    if not username or not grp_id:
        return jsonify({"error": "Missing username or grp_name"}), 401

    try:
        exists = group_services.get_grp_by_id(grp_id) is not None
        if exists and username not in exists["users"]:
            group_services.add_usr(username, grp_id)
            user_services.join_group(username, grp_id)
        else:
            return jsonify({"message": f"Unable to join group."}), 
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": f"User '{username}' successfully joined group '{grp_id}'."}), 200

def handle_leave_group():
    data = request.get_json()
    username = data.get("username")
    grp_id = data.get("grp_id")

    if not username or not grp_id:
        return jsonify({"error": "Missing username or grp_name"}), 400

    try:
        group_services.remove_usr(username, grp_id)
        group_services.get_grp_by_id(grp_id)
        user_services.leave_group(username, grp_id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": f"User '{username}' successfully left group '{grp_id}'."}), 200