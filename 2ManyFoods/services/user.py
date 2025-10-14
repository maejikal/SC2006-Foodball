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
