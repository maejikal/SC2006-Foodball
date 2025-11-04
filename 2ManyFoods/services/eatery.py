from db import *
from models import *
import datetime
from services import user as user_services
from asyncio import run
import api
from bson.objectid import ObjectId

COL = "Eateries"

def get_eatery_by_id(eatery_id:int):
    return run(searchdb("COL", "_id", eatery_id))

def store_review(eatery_id:int, review_id:int): # logic needs to be updated. avg rating etc. 
    eatery = run(searchdb(COL, "_id", eatery_id))
    
    if eatery is None:
        eateryreviews = [review_id]
    else:
        eateryreviews = (eatery.get("Reviews") or []) + [review_id]
    
    return run(updatedb(COL, "_id", eatery_id, "Reviews", eateryreviews))
    #return eatery_collection.update_one({"EateryID": eatery_id}, {"$push": {"Reviews": review_id}})

def delete_review(eatery_id:int, review_id:int):
    eateryreviews = run(searchdb(COL, "_id", ObjectId(eatery_id)))["Reviews"] # search for list of reviews in eatery
    eateryreviews.remove(review_id)
    return run(updatedb(COL, "_id", eatery_id, "Reviews", eateryreviews))

def create_eatery(name:str, dietary_req:dict, cuisine:dict, price_range:tuple, location:Location, openingHours: datetime):
    if run(searchdb("Eateries", "name", name)) is not None:
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
    
    return run(insertdb(COL, [eatery_doc]))

def search_eateries(selected_cuisines, location, radius):
   # Search for eateries using Google Places API based on user preferences

    try:
        query_result = api.search(
                lat_lng={'lat': location['lat'], 'long': location['long']},
                radius=radius, type=['restaurant'])
        
        # Extract and filter places
        if 'places' in query_result:
            places = query_result['places']
            
            # Filter by cuisine if provided
            filtered_places = []
            for place in places:
                for cuisine in selected_cuisines:
                    if cuisine in place["types"]:
                        filtered_places.append(place)
                        places.remove(place)
                        break
                    
            return filtered_places, places
        return [], []
        
    except Exception as e:
        print(f"Google Places API error: {e}")
        return [], []
