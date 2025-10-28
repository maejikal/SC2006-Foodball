from db import *
from services import group as group_services, user as user_services
from flask import request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
import pymongo

def handle_create_group(data):
    if not data:
        return jsonify({"error": "Missing input"}), 400

    owner = data.get("Username")
    grp_name = data.get("GroupName")
    photo = data.get("photo", "")

    if not owner or not grp_name:
        return jsonify({"error": "Username and GroupName required"}), 400

    try:
        result, invite_code = group_services.create_group(owner, grp_name, photo)
        group_id = str(result.inserted_ids[0])
        user_services.join_group(owner, group_id)

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    return jsonify({
        "message": "Group created successfully.",
        "group_id": group_id,
        "username": owner,
        "invite_code": invite_code
    }), 200

def handle_join_by_invite_code(data):
    if not data:
        return jsonify({"error": "Missing input"}), 400
    
    username = data.get("username")
    invite_code = data.get("inviteCode")
    
    if not username or not invite_code:
        return jsonify({"error": "Username and invite code required"}), 400
    
    try:
        group = group_services.get_grp_by_invite_code(invite_code)
        
        if not group:
            return jsonify({"error": "Invalid invite code"}), 404
        
        group_id = str(group["_id"])
        
        if username in group.get("users", []):
            return jsonify({"error": "You are already a member of this group"}), 400
        
        group_services.add_usr(username, group_id)
        user_services.join_group(username, group_id)
        
        updated_group = group_services.get_grp_by_id(group_id)
        member_count = updated_group.get('total_users', len(updated_group.get('users', [])))
        
        return jsonify({
            "message": f"Successfully joined {group['grp_name']}",
            "group": {
                "id": group_id,
                "name": group["grp_name"],
                "photo": group.get("photo", ""),
                "membersText": f"{member_count} members"
            }
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error in handle_join_by_invite_code: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


def handle_join_grp(data: dict, groupID: int=None): #dont quite know how to handle joining by link

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

def handle_leave_group(data: dict):
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

def handle_get_user_groups(username):
    if not username:
        return jsonify({"error": "Username required"}), 400
    try:
        groups = group_services.get_user_groups(username)
        return jsonify(groups), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def handle_get_group_details(grp_id):
    try:
        group = group_services.get_grp_by_id(grp_id)
        if not group:
            return jsonify({"error": "Group not found"}), 404
        
        members = []
        for username in group.get("users", []):
            user = user_services.get_user_by_username(username)
            if user:
                prefs_dict = user.get("Preferences", {})
                prefs_list = list(prefs_dict.values())
                
                members.append({
                    "id": username,
                    "name": user.get("name", user.get("Username", username)),
                    "preferences": prefs_list,
                    "avatar": user.get("ProfilePhoto", "")  
                })
        
        return jsonify({
            "id": str(group["_id"]),
            "name": group["grp_name"],
            "photo": group.get("photo", ""),
            "members": members,
            "owner": group.get("owner"),
            "total_users": group.get("total_users", len(members)),
            "invite_code": group.get("invite_code", "")
        }), 200
    except Exception as e:
        print(f"Error in handle_get_group_details: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_group_by_id(group_id):
    """Get group using async pattern"""
    async def _get_async():
        client = pymongo.AsyncMongoClient('127.0.0.1', 27017)
        try:
            db = client["2ManyFoods_db"]
            result = await db["Groups"].find_one({"_id": ObjectId(group_id)})
            return result
        finally:
            await client.close()
    
    from asyncio import run
    return run(_get_async())

def update_member_preferences(group_id, username, cuisines, price_range, hunger_level):
    """Update member preferences using async pattern"""
    async def _update_async():
        client = pymongo.AsyncMongoClient('127.0.0.1', 27017)
        try:
            db = client["2ManyFoods_db"]
            await db["Groups"].update_one(
                {"_id": ObjectId(group_id), "members.username": username},
                {"$set": {
                    "members.$.cuisines": cuisines,
                    "members.$.price_range": price_range,
                    "members.$.hunger_level": hunger_level,
                    "members.$.preferences_set": True
                }}
            )
        finally:
            await client.close()
    
    from asyncio import run
    return run(_update_async())

def start_voting(group_id, restaurants):
    """Start voting using async pattern"""
    async def _start_async():
        client = pymongo.AsyncMongoClient('127.0.0.1', 27017)
        try:
            db = client["2ManyFoods_db"]
            await db["Groups"].update_one(
                {"_id": ObjectId(group_id)},
                {"$set": {"voting_started": True, "restaurants": restaurants}}
            )
        finally:
            await client.close()
    
    from asyncio import run
    return run(_start_async())

def add_vote(group_id, username, restaurant_ids):
    """Add vote using async pattern"""
    async def _vote_async():
        client = pymongo.AsyncMongoClient('127.0.0.1', 27017)
        try:
            db = client["2ManyFoods_db"]
            await db["Groups"].update_one(
                {"_id": ObjectId(group_id), "members.username": username},
                {"$set": {"members.$.has_voted": True}}
            )
            await db["Groups"].update_one(
                {"_id": ObjectId(group_id)},
                {"$push": {"votes": {"username": username, "restaurant_ids": restaurant_ids}}}
            )
        finally:
            await client.close()
    
    from asyncio import run
    return run(_vote_async())

def calculate_winner(group_id):
    """Calculate winner and return FULL restaurant object"""
    async def calc_async():
        client = pymongo.AsyncMongoClient('127.0.0.1', 27017)
        try:
            db = client["2ManyFoods_db"]
            group = await db["Groups"].find_one({"_id": ObjectId(group_id)})
            
            print(f"🔍 Group: {group.get('grp_name')}")
            
            if not group:
                print("Group not found")
                return None
            
            votes = group.get('votes', [])
            restaurants = group.get('restaurants', [])
            
            if not votes or not restaurants:
                print("No votes or no restaurants")
                return None
            
            # Count votes for each restaurant ID
            vote_counts = {}
            for vote in votes:
                restaurant_ids = vote.get('restaurant_ids', [])
                for rid in restaurant_ids:
                    vote_counts[rid] = vote_counts.get(rid, 0) + 1
            
            if not vote_counts:
                print("No valid votes cast")
                return None
            
            # Find the restaurant ID with most votes
            winner_id = max(vote_counts, key=vote_counts.get)
            
            # Find the restaurant with matching _id
            for restaurant in restaurants:
                restaurant_id = str(restaurant.get('_id'))  # Convert ObjectId to string
                if restaurant_id == winner_id:
                    return restaurant
            
            print("Winner not found in restaurants!")
            return None
            
        finally:
            await client.close()
    
    from asyncio import run
    return run(calc_async())



