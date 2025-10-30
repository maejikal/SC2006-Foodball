from db import searchdb, insertdb, updatedb
from services import user as user_services, eatery as eatery_services
from asyncio import run

COL = "Reviews"

def get_user_reviews(username:str):
    cursor = run(searchdb("Users", "Username", username))
    return cursor.to_list(length=100)
    # cursor = review_collection.find({"Username": username})
    # user_reviews = cursor.to_list(length=100)
    # return user_reviews

def create_review(username:str, eatery_id:int, rating:int, comment:str, date:str, photo:str):
    reviews = run(searchdb("Users", "Username", username))['Reviews']
    if eatery_id in reviews:
        raise ValueError("This user already has 1 review for this restaurant. Either edit or delete this review to add a new one.")
    review_doc = {
        "Username": username,
        "Eatery": eatery_id,
        "Rating": rating,
        "Comment": comment,
        "Date": date,
        "Photo": photo
    }
    eateryreviews = run(searchdb("Eateries","_id", eatery_id))
    newreviewid = run(insertdb(COL,[review_doc])).inserted_ids[0]
    run(updatedb("Users", "Username", username, "Reviews", reviews + [newreviewid]))
    if eateryreviews is None:
        eatery = {
            "_id": eatery_id,
            "Reviews": [newreviewid]
        }
        run(insertdb("Eateries",[eatery]))
    else:    
        run(updatedb("Eateries", "EateryID", eatery_id, "Reviews", eateryreviews['Reviews'] + [newreviewid]))
    return newreviewid

def update_review(username:str, eatery_id:int, rating:int, comment:str, date:str, photo:str):
    reviews = run(searchdb("Users", "Username", username))['Reviews']
    if eatery_id not in reviews:
        raise ValueError("No review to edit found")
    review_doc = {
        "Username": username,
        "Rating": rating,
        "Comment": comment,
        "Date": date,
        "Photo": photo
    }
    for field, data in review_doc.items():
        run(updatedb("Reviews","_id", reviews["_id"], field, data))
    return ""