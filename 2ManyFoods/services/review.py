from db import searchdb, insertdb, updatedb, deletedb
from services import user as user_services, eatery as eatery_services
from asyncio import run

COL = "Reviews"

def get_user_reviews(username:str):
    cursor = run(searchdb(COL, "Username", username))
    return cursor.to_list(length=100)
    
def create_review(username:str, eatery_id:str, rating:int, comment:str, date:str, photo:str):
    existing_review = run(searchdb(COL, {"Username": username, "Eatery": eatery_id}))
    
    if existing_review:
        raise ValueError("This user already has 1 review for this restaurant. Either edit or delete this review to add a new one.")
    review_doc = {
        "Username": username,
        "Eatery": eatery_id,
        "Rating": rating,
        "Comment": comment,
        "Date": date,
        "Photo": photo
    }
    
    newreviewid = run(insertdb(COL, [review_doc])).inserted_ids[0]
    return newreviewid

def update_review(username:str, eatery_id:str, rating:int, comment:str, date:str, photo:str):
    review = run(searchdb(COL, {"Username": username, "Eatery": eatery_id}))
    
    if not review:
        raise ValueError("No review to edit found")
    review_doc = {
        "Rating": rating,
        "Comment": comment,
        "Date": date,
        "Photo": photo
    }
    for field, data in review_doc.items():
        run(updatedb("Reviews", "_id", review["_id"], field, data))
    
    return ""

def delete_review(username:str, eatery_id:int):
    review = run(searchdb(COL, {"Username": username, "Eatery": eatery_id}))
    if not review:
        raise ValueError("No review to delete")
    run(deletedb(COL, "_id", review["_id"]))
    return