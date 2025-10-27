from db import *
from models import *
import datetime
from services import user as user_services
from asyncio import run

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

def search_eateries(username: str, selected_cuisines: list, price_range: int, dietary_filters: list):
    """
    Search for eateries using Google Places API based on user preferences
    """
    import api
    from services import user as user_services
    
    user = user_services.get_user_by_username(username)
    if not user:
        return []
    
    try:
        ntu_location = {'lat': 1.3483, 'long': 103.6831}
        
        # Search Google Places for restaurants
        query_result = api.search(
            lat_lng=ntu_location,
            radius=2000,
            type=['restaurant']
        )
        
        # Extract and filter places
        if 'places' in query_result:
            places = query_result['places']
            
            # Filter by cuisine if provided
            if selected_cuisines:
                filtered_places = []
                for place in places:
                    if matches_cuisine(place, selected_cuisines):
                        filtered_places.append(place)
                return filtered_places
            
            return places
        return []
        
    except Exception as e:
        print(f"Google Places API error: {e}")
        return []


def matches_cuisine(place: dict, selected_cuisines: list) -> bool:
    """
    Check if a place matches any of the selected cuisines
    Uses both place types and name matching with keywords
    """
    place_types = place.get('types', [])
    place_name = place.get('displayName', {}).get('text', '').lower()
    
    # Cuisine keyword mapping
    cuisine_keywords = {
        'italian': ['pizza', 'pasta', 'italian', "domino's", 'pizzeria'],
        'chinese': ['chinese', 'dim sum', 'noodle', 'canteen', 'wonton', 'dumpling'],
        'japanese': ['sushi', 'ramen', 'japanese', 'izakaya', 'tempura', 'teriyaki', 'udon', 'donburi'],
        'korean': ['korean', 'bbq', 'kimchi', 'bibim', 'paik'],
        'indian': ['indian', 'curry', 'tandoor', 'biryani', 'taj', 'masala'],
        'thai': ['thai', 'tom yum', 'pad thai', 'green curry'],
        'vietnamese': ['vietnamese', 'pho', 'banh mi'],
        'mexican': ['mexican', 'taco', 'burrito', 'quesadilla'],
        'american': ['burger', 'steak', 'american', "mcdonald's", 'texas', 'kfc'],
        'western': ['western', 'grill', 'cafe', 'steakhouse'],
        'fast food': ['fast_food_restaurant', "mcdonald's", 'kfc', 'burger king', 'subway']
    }
    
    for cuisine in selected_cuisines:
        cuisine_lower = cuisine.lower()
        
        # Method 1: Check place types (e.g., "chinese_restaurant")
        cuisine_type = f"{cuisine_lower}_restaurant"
        if cuisine_type in place_types:
            return True
        
        # Method 2: Check name directly for cuisine keyword
        if cuisine_lower in place_name:
            return True
        
        # Method 3: Check for related keywords
        keywords = cuisine_keywords.get(cuisine_lower, [cuisine_lower])
        for keyword in keywords:
            if keyword in place_name:
                return True
            # Also check if keyword is in the types
            if keyword in ' '.join(place_types):
                return True
    
    return False
