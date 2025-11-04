from db import insertdb, searchdb, updatedb, deletedb
from models import *
from utils.security import hash_password, verify_password
from asyncio import run

COL = "Users" # only interacts with User collection

def get_user_by_email(email:str):                                        #Find specific user by email
    return run(searchdb(COL, "Email", email))

def get_user_by_username(username:str):                                  #Find specific user by username
    return run(searchdb(COL,"Username",username))

def create_user(username:str, password:str, email:str):                  #Create user in database
    if run(searchdb(COL, "Email", email)):                               #Check if email is already used
        print("This email has already been registered.")
        raise ValueError("This email has already been registered.")
        
    if run(searchdb(COL, "Username", username)):                         #Check if username is taken
        print("This username is already taken.")
        raise ValueError("This username is already taken.")
    
    hashed_password = hash_password(password)                            #Hash password

    user_doc = {
        "Username":username,
        "Password":hashed_password,
        "Email":email,
        "Groups": [],
        "FoodHistory":[],
        "Reviews":[],
        "DietaryRequirements":{},
        "ProfilePhoto":"",
        "Preferences": {},
        "Hunger":1
    }
    return run(insertdb(COL, [user_doc]))

def login_user(email:str, password:str):                                 #Login password
    user = get_user_by_email(email)
    if not user or not verify_password(password, user["Password"]):
        print("Invalid Email or Password.")
        return
    return user

def store_review(username:str, review_id:int):                           #Create new review
    user = get_user_by_username(username)
    reviews = user["Reviews"]
    return run(updatedb(COL, "Username", username, "Reviews", reviews + [review_id]))

def delete_review(username:str, review_id:int):                          #Delete existing review
    user = get_user_by_username(username)
    reviews = user["Reviews"]
    reviews.remove(review_id)
    return run(updatedb(COL, "Username", username, "Reviews", reviews))

def join_group(username:str, group_id:int):                              #Join existing group
    user = get_user_by_username(username)
    groups = user["Groups"]
    return run(updatedb(COL, "Username", username, "Groups", groups + [group_id]))

def leave_group(username:str, group_id:int):                             #Leave group
    user = get_user_by_username(username)
    groups = user["Groups"]
    groups.remove(group_id)
    return run(updatedb(COL, "Username", username, "Groups", groups))

def update_user(field: str, username: str, new_data: str):                          #Update user fields
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
            
            hashed_password = hash_password(new_data)
            
            result = run(updatedb(COL, "Username", username, "Password", hashed_password))
            
            # CRITICAL: Verify the password was actually updated
            # verification_user = get_user_by_username(username)
            # if verification_user:
            #     new_pass_in_db = verification_user.get('Password', '')
                
            #     if new_pass_in_db != hashed_password:
            #         print("❌ ERROR: Password was NOT updated in database!")
            #     else:
            #         print("✓ Password successfully updated in database")
            
            return result

        case "profile_photo":
            return run(updatedb(COL, "Username", username, "ProfilePhoto", new_data))

        case "DietaryRequirements":
            return run(updatedb(COL, "Username", username, "DietaryRequirements", new_data))

        case "preferences":
            return run(updatedb(COL, "Username", username, "Preferences", new_data))

def update_foodhistory(username: str, eatery):                                       #Update food history
    user = get_user_by_username(username)
    if not user:
        print("User not found.")
        return
    
    current_history = user.get("FoodHistory", [])
    
    if len(current_history) >= 10:                                                   #Store up to 10 past eateries
        current_history = current_history[1:]
    
    current_history.append(eatery)
    
    return run(updatedb(COL, "Username", username, "FoodHistory", current_history))

def delete_user(username: str):                                                      #Delete existing user
    return run(deletedb(COL, "Username", username))
    
