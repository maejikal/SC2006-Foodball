from db import searchdb, insertdb, updatedb
from services import user as user_services
from bson.objectid import ObjectId
from asyncio import run
import random
import string
import pymongo

def generate_invite_code(length=6):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def get_grp_by_id(grp_id: str):
    if not grp_id:
        return None
    try:
        return run(searchdb("Groups", "_id", ObjectId(grp_id)))
    except Exception:
        return None

def get_grp_by_invite_code(invite_code: str):
    if not invite_code:
        return None
    return run(searchdb("Groups", "invite_code", invite_code))

def create_group(owner: str, grp_name: str, photo: str):
    if run(searchdb("Groups", "grp_name", grp_name)):
        raise ValueError("Duplicate group name.")
    
    while True:
        invite_code = generate_invite_code()
        if not run(searchdb("Groups", "invite_code", invite_code)):
            break
    
    grp_doc = {
        "grp_name": grp_name,
        "owner": owner,
        "users": [owner],
        "total_users": 1,
        "photo": photo,
        "invite_code": invite_code,
        "members": [
            {
                "username": owner,
                "is_leader": True,
                "preferences_set": False,
                "cuisines": [],
                "price_range": 50,
                "hunger_level": 5,
                "has_voted": False
            }
        ],
        "voting_started": False,
        "restaurants": [],
        "votes": []
    }
    
    inserted_docs = run(insertdb("Groups", [grp_doc]))
    return inserted_docs, invite_code

def remove_usr(username: str, grp_id: str):
    """Remove user from group. If owner leaves, transfer ownership or delete group."""
    async def _remove_user_async():
        client = pymongo.AsyncMongoClient('127.0.0.1', 27017)
        try:
            db = client["2ManyFoods_db"]
            group_collection = db["Groups"]
            
            group = await group_collection.find_one({"_id": ObjectId(grp_id)})
            
            if not group:
                raise ValueError("Group does not exist.")
            
            if group.get("owner") == username:
                remaining_users = [u for u in group["users"] if u != username]
                
                if not remaining_users:
                    await group_collection.delete_one({"_id": ObjectId(grp_id)})
                    return None
                else:
                    new_owner = remaining_users[0]
                    result = await group_collection.find_one_and_update(
                        {"_id": ObjectId(grp_id)},
                        {
                            "$set": {"owner": new_owner, "users": remaining_users},
                            "$inc": {"total_users": -1},
                            "$pull": {"members": {"username": username}}  # ✅ REMOVE FROM MEMBERS
                        },
                        return_document=pymongo.ReturnDocument.AFTER
                    )
                    # ✅ UPDATE NEW OWNER IN MEMBERS ARRAY
                    await group_collection.update_one(
                        {"_id": ObjectId(grp_id), "members.username": new_owner},
                        {"$set": {"members.$.is_leader": True}}
                    )
                    return result
            else:
                result = await group_collection.find_one_and_update(
                    {"_id": ObjectId(grp_id)},
                    {
                        "$pull": {"users": username, "members": {"username": username}},  # ✅ REMOVE FROM MEMBERS
                        "$inc": {"total_users": -1}
                    },
                    return_document=pymongo.ReturnDocument.AFTER
                )
                return result
        finally:
            await client.close()
    
    return run(_remove_user_async())

def add_usr(username: str, grp_id: str):
    group = run(searchdb("Groups", "_id", ObjectId(grp_id)))
    if not group:
        raise ValueError("Group does not exist.")
    
    if username in group.get("users", []):
        raise ValueError("User already in group.")
    
    updated_users = group.get("users", []) + [username]
    
    run(updatedb("Groups", "_id", ObjectId(grp_id), "users", updated_users))
    run(updatedb("Groups", "_id", ObjectId(grp_id), "total_users", len(updated_users)))
    ''
    async def _add_member_async():
        client = pymongo.AsyncMongoClient('127.0.0.1', 27017)
        try:
            db = client["2ManyFoods_db"]
            await db["Groups"].update_one(
                {"_id": ObjectId(grp_id)},
                {
                    "$push": {
                        "members": {
                            "username": username,
                            "is_leader": False,
                            "preferences_set": False,
                            "cuisines": [],
                            "price_range": 50,
                            "hunger_level": 5,
                            "has_voted": False
                        }
                    }
                }
            )
        finally:
            await client.close()
    
    run(_add_member_async())
    return True

def get_user_groups(username: str):
    user = user_services.get_user_by_username(username)
    if not user:
        return []
    
    groups = []
    for gid in user.get("Groups", []):
        grp = get_grp_by_id(gid)
        if grp:
            groups.append({
                "id": str(grp["_id"]),
                "name": grp["grp_name"],
                "membersText": f"{len(grp['users'])} members",
                "photo": grp.get("photo", "")
            })
    return groups
