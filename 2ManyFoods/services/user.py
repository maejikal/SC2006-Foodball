from db import user_collection
from models import *
from utils.security import hash_password, verify_password

def get_user_by_email(email:str):
    return user_collection.find_one({"Email":email})

def get_user_by_username(username:str):
    return user_collection.find_one({"Username":username})

def create_user(username:str, password:str, email:str):
    if user_collection.find_one({"Email":email}):
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
    return user_collection.insert_one(user_doc)

def login_user(email:str, password:str):
    user = user_collection.find_one({"Email":email})
    if not user or not verify_password(password, user["Password"]):
        raise ValueError("Invalid Email or Password.")
    return user

def store_past_dietary_requirements(email: str):
    user = user_collection.find_one({"Email": email})
    if not user:
        raise ValueError("User not found.")

    current_diet = user.get("DietaryRequirements", {})
    if not current_diet:
        print("No DietaryRequirements to store.")
        return None
        
    dietary_history = user.get("DietaryHistory", [])
    

    user_collection.update_one(
        {"Email": email},
        {"$set": {"DietaryHistory": dietary_history}}
    )

    return dietary_history

def store_review(username:str, review_id:int):
    return user_collection.update_one({"Username": username}, {"$push": {"Reviews": review_id}})

def delete_review(username:str, review_id:int):
    return user_collection.update_one({"Username": username}, {"$pull": {"Reviews": review_id}})

def join_group(username:str, group_id:int):
    return user_collection.update_one({"Username": username}, {"$push": {"Groups": group_id}})

def leave_group(username:str, group_id:int):
    return user_collection.update_one({"Username": username}, {"$pull": {"Groups": group_id}})


def update_username(user_id, new_username:str):
    return user_collection.update_one({"_id":user_id}, {'$set':{"Username":new_username}})

def update_email(user_id, new_email:str):
    return user_collection.update_one({"_id":user_id}, {'$set':{"Email":new_email}})

def update_password(user_id, new_password:str):
    hashed_password = hash_password(new_password)
    return user_collection.update_one({"_id":user_id}, {'$set':{"Password":hashed_password}}) 

def update_profile_photo(user_id, new_profile_photo:str):
    return user_collection.update_one({"_id":user_id}, {'$set':{"ProfilePhoto":new_profile_photo}})

def update_dietary_preferences(user_id, new_diet_pref:dict):
    return user_collection.update_one({"_id":user_id}, {'$set':{"DietaryRequirements":new_diet_pref}})

def update_cuisine_preferences(user_id, new_preferences:dict):
    return user_collection.update_one({"_id":user_id}, {'$set':{"Preferences":new_preferences}})