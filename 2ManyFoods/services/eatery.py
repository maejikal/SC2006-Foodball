from db import *
from models import *
import datetime
from services import user as user_services
from asyncio import run
import api

COL = "Eateries"

def get_eatery_by_id(eatery_id:int):
    return run(searchdb("COL", "_id", eatery_id))

def store_review(eatery_id:int, review_id:int): # logic needs to be updated. avg rating etc. 
    eateryreviews = run(searchdb(COL, "_id ", eatery_id))
    return run(updatedb(COL, "_id", eatery_id, "Reviews", eateryreviews + [review_id]))
    #return eatery_collection.update_one({"EateryID": eatery_id}, {"$push": {"Reviews": review_id}})

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
    #return user_collection.insert_one(eatery_doc)

def search_eateries(username: str, selected_cuisines: list, price_range: int, dietary_filters: list):
    """
    Search for eateries using Google Places API based on user preferences
    """
    user = user_services.get_user_by_username(username)
    if not user:
        return []
    
    try:
        ntu_location = {'lat': 1.3483, 'long': 103.6831}
        
        # Search Google Places for restaurants
        query_result = api.search(
            lat_lng=ntu_location,
            type=['restaurant']
        )
        
        # Extract and filter places
        if 'places' in query_result:
            places = query_result['places']
            
            # Filter by cuisine if provided
            if selected_cuisines:
                filtered_places = []
                for place in places:
                    for cuisine in selected_cuisines:
                        if cuisine in places["types"]:
                            filtered_places.append(place)
                            break
                        
                return filtered_places
            
            return places
        return []
        
    except Exception as e:
        print(f"Google Places API error: {e}")
        return []
