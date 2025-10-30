from db import insertdb, searchdb, updatedb
from models import *
from utils.security import hash_password, verify_password
from asyncio import run
from services.group import get_user_groups

COL = "Users" # only interacts with User collection

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

def update_user(field: str, username: str, new_data: str):
    current_user = get_user_by_username(username)
    match field:
        case "username":
            existing_user = get_user_by_username(new_data)

            if existing_user and existing_user.get("Username") != username:
                raise ValueError("Username already taken")
            
            if new_data == username:
                return True
            return run(updatedb(COL, "Username", username, "Username", new_data))
        
        case "email":
            if get_user_by_email(new_data):
                raise ValueError("Email already registered")

            return run(updatedb(COL, "Username", username, "Email", new_data))
        
        case "password":
            if not current_user:
                raise ValueError("User not found")

            return run(updatedb(COL, "Username", username, "Password", hash_password(new_data)))

        case "profile_photo":
            return run(updatedb(COL, "Username", username, "ProfilePhoto", new_data))

        case "dietary_requirements":
            return run(updatedb(COL, "Username", username, "DietaryRequirements", new_data))

        case "preferences":
            return run(updatedb(COL, "Username", username, "Preferences", new_data))

        case "budget":
            return run(updatedb(COL, "Username", username, "Budget", new_data))

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


    
