from db import insertdb, searchdb, updatedb
from models import *
from utils.security import hash_password, verify_password
from asyncio import run

COL = "Users"

def get_user_by_email(email:str):
    return run(searchdb(COL, "Email", email))

def get_user_by_username(username:str):
    return run(searchdb(COL,"Username",username))

def create_user(username:str, password:str, email:str):
    if run(searchdb(COL, "Email", email)):
        print("This email has already been registered.")
        raise ValueError("This email has already been registered.")
        
    if run(searchdb(COL, "Username", username)):
        print("This username is already taken.")
        raise ValueError("This username is already taken.")
    
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
    return run(insertdb(COL, [user_doc]))

def login_user(email:str, password:str):
    user = get_user_by_email(email)
    if not user or not verify_password(password, user["Password"]):
        print("Invalid Email or Password.")
        return
    return user

def store_review(username:str, review_id:int):
    user = get_user_by_username(username)
    reviews = user["Reviews"]
    return run(updatedb(COL, "Username", username, "Reviews", reviews + [review_id]))
    #return user_collection.update_one({"Username": username}, {"$push": {"Reviews": review_id}})

def delete_review(username:str, review_id:int):
    user = get_user_by_username(username)
    reviews = user["Reviews"]
    reviews.remove(review_id)
    return run(updatedb(COL, "Username", username, "Reviews", reviews))

def join_group(username:str, group_id:int):
    user = get_user_by_username(username)
    groups = user["Groups"]
    return run(updatedb(COL, "Username", username, "Groups", groups + [group_id]))
    #return user_collection.update_one({"Username": username}, {"$push": {"Groups": group_id}})

def leave_group(username:str, group_id:int):
    user = get_user_by_username(username)
    groups = user["Groups"]
    groups.remove(group_id)
    return run(updatedb(COL, "Username", username, "Groups", groups))
    #return user_collection.update_one({"Username": username}, {"$pull": {"Groups": group_id}})


def update_username(username: str, new_username:str):

    existing_user = get_user_by_username(new_username)
    
    if existing_user and existing_user.get("Username") != username:
        raise ValueError("Username already taken")
    
    if new_username == username:
        return True

    return run(updatedb(COL, "Username", username, "Username", new_username))
    #return user_collection.update_one({"_id":user_id}, {'$set':{"Username":new_username}})

def update_email(username: str, new_email:str):

    if get_user_by_email(new_email):
        raise ValueError("Email already registered")

    return run(updatedb(COL, "Username", username, "Email", new_email))
    #return user_collection.update_one({"_id":user_id}, {'$set':{"Email":new_email}})

def update_password(username: str, new_password:str, current_password: str = None):
    if current_password:
        user = get_user_by_username(username)
        
        if not user:
            raise ValueError("User not found")
        
        from utils.security import verify_password
        if not verify_password(current_password, user.get("Password")):
            raise ValueError("Current password is incorrect")
    
    from utils.security import hash_password
    hashed_password = hash_password(new_password)

    return run(updatedb(COL, "Username", username, "Password", hash_password(new_password)))
    #return user_collection.update_one({"_id":user_id}, {'$set':{"Password":hashed_password}}) 

def update_profile_photo(username: str, new_profile_photo:str):
    return run(updatedb(COL, "Username", username, "ProfilePhoto", new_profile_photo))
    #return user_collection.update_one({"_id":user_id}, {'$set':{"ProfilePhoto":new_profile_photo}})

def update_dietary_preferences(username: str, new_diet_pref:dict):
    return run(updatedb(COL, "Username", username, "DietaryRequirements", new_diet_pref))
    #return user_collection.update_one({"_id":user_id}, {'$set':{"DietaryRequirements":new_diet_pref}})

def update_cuisine_preferences(username: str, new_preferences:dict):
    return run(updatedb(COL, "Username", username, "Preferences", new_preferences))
    #return user_collection.update_one({"_id":user_id}, {'$set':{"Preferences":new_preferences}})

def update_budget(username: str, new_budget: float):
    return run(updatedb(COL, "Username", username, "Budget", new_budget))

def update_foodhistory(username: str, eatery):
    user = get_user_by_username(username)
    if not user:
        print("User not found.")
        return
    
    current_history = user.get("FoodHistory", [])
    
    if len(current_history) >= 10:
        current_history = current_history[1:]
    
    current_history.append(eatery)
    
    return run(updatedb(COL, "Username", username, "FoodHistory", current_history))


    
