from db import *
from models import *
import datetime

def get_eatery_by_id(eatery_id:int):
    return eatery_collection.find_one({"EateryID":eatery_id})

def store_review(eatery_id:int, review_id:int): # logic needs to be updated. avg rating etc. 
    return eatery_collection.update_one({"EateryID": eatery_id}, {"$push": {"Reviews": review_id}})

def create_eatery(name:str, dietary_req:dict, cuisine:dict, price_range:tuple, location:Location, openingHours: datetime):
    if eatery_collection.find_one({"name":name}):
        raise ValueError("Duplicate name.")

    eatery_doc = {
        "name":name,
        "dietary_req":dietary_req,
        "cuisine":cuisine,
        "price_range":False,
        "location": location,
        "openingHours": openingHours,
        "reviews" : [],
        "averageRating": 0.0
        }
    return user_collection.insert_one(eatery_doc)