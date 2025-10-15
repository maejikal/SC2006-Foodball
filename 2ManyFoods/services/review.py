from db import review_collection
from services import user as user_services, eatery as eatery_services

def get_user_reviews(username:str):
    cursor = review_collection.find({"Username": username})
    user_reviews = cursor.to_list(length=100)
    return user_reviews

def create_review(username:str, eatery_id:int, rating:int, comment:str, date:str, photo:str):
    if review_collection.find_one({"Username":username, "EateryID": eatery_id}): 
        raise ValueError("This user already has 1 review for this restaurant. Either edit or delete this review to add a new one.")

    review_doc = {
        "Username": username,
        "EateryID": eatery_id,
        "Rating": rating,
        "Comment": comment,
        "Date": date,
        "Photo": photo
    }
    return review_collection.insert_one(review_doc)

