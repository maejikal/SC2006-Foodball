from db import group_collection
from services import user as user_services
from bson.objectid import ObjectId 
from pymongo import ReturnDocument

def get_grp_by_id(grp_id:int):
    return group_collection.find_one({"_id": ObjectId(grp_id)})

def create_group(username:str, grp_name:str, photo:str):
    if group_collection.find_one({"owner":username, "grp_name": grp_name}): 
        raise ValueError("Duplicate group name.")
    
    grp_doc = {
        "grp_name": grp_name,
        "owner": username,
        "users": [username],
        "total_users": 1,
        "photo": photo
    }
    return group_collection.insert_one(grp_doc)

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
    return group_collection.update_one({"_id": ObjectId(grp_id)}, {"$push": {"users": username}, "$inc": {"total_users": 1}})
