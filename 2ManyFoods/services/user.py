from db import user_collection
from utils.security import hash_password, verify_password

def get_user_by_email(email:str):
    return user_collection.find_one({"Email":email})

def create_user(username:str, password:str, email:str):
    if user_collection.find_one({"Email":email}):
        raise ValueError("This email has already been registered.")
    
    hashed_password = hash_password(password)

    user_doc = {
        "Username":username,
        "Password":hashed_password,
        "Email":email,
        "verified":False,
        "FoodHistory":[],
        "Review":[],
        "DietaryRequirements":{},
        "ProfilePhoto":"",
        "Budget":float('inf'),
        "Hunger":1
    }
    return user_collection.insert_one(user_doc)

def login_user(email:str, password:str):
    user = user_collection.find_one({"Email":email})
    if not user or not verify_password(password, user["Password"]):
        raise ValueError("Invalid Email or Password.")
    return user