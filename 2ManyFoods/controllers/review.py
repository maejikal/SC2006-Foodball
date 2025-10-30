from services import review as review_services, user as user_services, eatery as eatery_services
from flask import request, jsonify

def handle_create_review(data):
    required_fields = ["Username", "Eatery_id", "Rating", "Date"] # the rest can be blank
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    user = data["Username"]
    eatery = data["Eatery_id"]
    rating = data["Rating"]
    comment = data["Comment"]
    date = data["Date"]
    photo = data["Photo"]

    try:
        newid = review_services.create_review(user, eatery, rating, comment, date, photo)
        user_services.store_review(user, newid)
        eatery_services.store_review(eatery, newid)
    except ValueError as e:
        return jsonify({"error":str(e)}), 401
    
    return jsonify({
        "message":"Review added successfully.",
        "review_id":str(),
        "username":user
    }),200

def handle_update_review(data):
    required_fields = ["Username", "Eatery_id", "Rating", "Date"] # the rest can be blank
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    user = data["Username"]
    eatery = data["Eatery_id"]
    rating = data["Rating"]
    comment = data["Comment"]
    date = data["Date"]
    photo = data["Photo"]

    try:
        newid = review_services.update_review(user, eatery, rating, comment, date, photo) # user and eatery only store review id, so updating review content only needs to be done here
    except ValueError as e:
        return jsonify({"error":str(e)}), 401
    
    return jsonify({
        "message":"Review added successfully.",
        "review_id":str(),
        "username":user
    }),200

def handle_delete_review(data):
    required_fields = ["Username", "Eatery_id"] # the rest can be blank
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    user = data["Username"]
    eatery = data["Eatery_id"]

    try:
        review_services.delete_review(user, eatery)
        user_services.delete_review(user, eatery)
        eatery_services.delete_review(eatery, eatery)
    except ValueError as e:
        return jsonify({"error":str(e)}), 401
    
    return jsonify({
        "message":"Review deleted successfully.",
        "username":user
    }),200