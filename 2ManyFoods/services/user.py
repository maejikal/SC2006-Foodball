from db import insertdb, searchdb, updatedb
from models import *
from utils.security import hash_password, verify_password

COL = "User"

def get_user_by_email(email:str):
    return searchdb(COL, "Email", email)

def get_user_by_username(username:str):
    return searchdb(COL,"Username",username)

def create_user(username:str, password:str, email:str):
    if searchdb(COL, "Email", email):
        raise ValueError("This email has already been registered.")
    
    hashed_password = hash_password(password)

    user_doc = {
        "Username":username,
        "Password":hashed_password,
        "Email":email,
        "Verified":False,
        "Groups": [],
        "FoodHistory":[],
        "Reviews":[],
        "DietaryRequirements":{},
        "ProfilePhoto":"",
        "Budget":float('inf'),
        "Preferences": {},
        "Hunger":1
    }
    return insertdb(COL, [user_doc])

def login_user(email:str, password:str):
    user = get_user_by_email(email)
    if not user or not verify_password(password, user["Password"]):
        print("Invalid Email or Password.")
        return
    return user

def update_foodhistory(username: str, eatery: str):
    user = get_user_by_username(username)
    if not user:
        print("User not found.")
        return

    current_history= user["FoodHistory"]
    if len(current_history) >= 10:
        current_history = current_history[1:]
    current_history.append(eatery)
    
    return updatedb(COL, "Username", username, "FoodHistory", current_history)

def store_review(username:str, review_id:int):
    user = get_user_by_username(username)
    reviews = user["Reviews"]
    return updatedb(COL, "Username", username, "Reviews", reviews + [review_id])
    #return user_collection.update_one({"Username": username}, {"$push": {"Reviews": review_id}})

def delete_review(username:str, review_id:int):
    return user_collection.update_one({"Username": username}, {"$pull": {"Reviews": review_id}})

def join_group(username:str, group_id:int):
    user = get_user_by_username(username)
    groups = user["Groups"]
    return updatedb(User, "Username", username, "Groups", groups + [group_id])
    #return user_collection.update_one({"Username": username}, {"$push": {"Groups": group_id}})

def leave_group(username:str, group_id:int):
    user = get_user_by_username(username)
    groups = user["Groups"]
    groups.remove(group_id)
    return updatedb(COL, "Username", username, "Groups", groups)
    #return user_collection.update_one({"Username": username}, {"$pull": {"Groups": group_id}})


def update_username(username: str, new_username:str):
    return updatedb(COL, "Username", username, "Username", new_username)
    #return user_collection.update_one({"_id":user_id}, {'$set':{"Username":new_username}})

def update_email(username: str, new_email:str):
    return updatedb(COL, "Username", username, "Email", new_email)
    #return user_collection.update_one({"_id":user_id}, {'$set':{"Email":new_email}})

def update_password(username: str, new_password:str):
    return updatedb(COL, "Username", username, "Password", hash_password(new_password))
    #return user_collection.update_one({"_id":user_id}, {'$set':{"Password":hashed_password}}) 

def update_profile_photo(username: str, new_profile_photo:str):
    return updatedb(COL, "Username", username, "ProfilePhoto", new_profile_photo)
    #return user_collection.update_one({"_id":user_id}, {'$set':{"ProfilePhoto":new_profile_photo}})

def update_dietary_preferences(username: str, new_diet_pref:dict):
    return updatedb(COL, "Username", username, "DietaryRequirements", new_diet_pref)
    #return user_collection.update_one({"_id":user_id}, {'$set':{"DietaryRequirements":new_diet_pref}})

def update_cuisine_preferences(username: str, new_preferences:dict):
    return updatedb(COL, "Username", username, "Preferences", new_preferences)
    #return user_collection.update_one({"_id":user_id}, {'$set':{"Preferences":new_preferences}})
    
