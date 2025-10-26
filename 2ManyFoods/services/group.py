from db import group_collection, searchdb, insertdb, updatedb
from services import user as user_services
from bson.objectid import ObjectId 
from pymongo import ReturnDocument
from asyncio import run
import random
import string

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
    
    while True: # try make the code unique
        invite_code = generate_invite_code()
        if not run(searchdb("Groups", "invite_code", invite_code)):
            break

    grp_doc = {
        "grp_name": grp_name,
        "owner": owner,
        "users": [owner],
        "total_users": 1,
        "photo": photo,
        "invite_code": invite_code
    }

    inserted_docs = run(insertdb("Groups", [grp_doc]))
    return inserted_docs, invite_code

def remove_usr(username:str, grp_id:int):
    group = group_collection.find_one({"_id": ObjectId(grp_id)})
    if not group:
        raise ValueError("Group does not exist.")
    if group.get("owner") == username: #owner is leaving, transfer leadership
        remaining_users = [u for u in group["users"] if u != username]
        if not remaining_users:
            group_collection.delete_one({"_id": group["_id"]})
            return None
        else:
            new_owner = remaining_users[0]
            return group_collection.find_one_and_update(
                {"_id": group["_id"]},
                {
                    "$set": {"owner": new_owner, "users": remaining_users},
                    "$inc": {"total_users": -1}
                },
                return_document=ReturnDocument.AFTER
            )
    else: #regular member is leaving
        return group_collection.find_one_and_update(
            {"_id": group["_id"]},
            {
                "$pull": {"users": username},
                "$inc": {"total_users": -1}
            },
            return_document=ReturnDocument.AFTER
        )

def add_usr(username:str, grp_id:str):
    group = run(searchdb("Groups", "_id", ObjectId(grp_id)))
    if not group:
        raise ValueError("Group does not exist.")
    
    if username in group.get("users", []):
        raise ValueError("User already in group.")
    
    updated_users = group.get("users", []) + [username]
    run(updatedb("Groups", "_id", ObjectId(grp_id), "users", updated_users))
    run(updatedb("Groups", "_id", ObjectId(grp_id), "total_users", len(updated_users)))
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
