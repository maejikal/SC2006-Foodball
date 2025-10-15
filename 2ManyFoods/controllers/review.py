from services import review as review_services, user as user_services, eatery as eatery_services
from flask import request, jsonify

def handle_create_review():
    if not request.is_json:
        return jsonify({"error":"Invalid or Missing JSON input"})
    data = request.get_json()
    required_fields = ["Username", "EateryID", "Rating", "Date"] # the rest can be blank
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    user = data["Username"]
    eatery = data["EateryID"]
    rating = data["Rating"]
    comment = data["Comment"]
    date = data["Date"]
    photo = data["Photo"]

    try:
        review = review_services.create_review(user, eatery, rating, comment, date, photo)
        review_id = review.inserted_id
        user_services.store_review(user, review_id)
        eatery_services.store_review(eatery, review_id)
    except ValueError as e:
        return jsonify({"error":str(e)}), 401
    
    return jsonify({
        "message":"Review added successfully.",
        "review_id":str(review_id),
        "username":user
    }),200