from flask import request, jsonify
from services import user as user_services

def signup():
    if not request.is_json:
        return jsonify({"error":"Invalid or Missing JSON input"})
    data = request.get_json()

    required_fields = ["Username", "Password", "Email"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    username = data["Username"]
    password = data["Password"]
    email = data["Email"]

    try:
        result = user_services.create_user(username, password, email)
    except ValueError as ve:
        return jsonify({"error":str(ve)}), 400
    except Exception as e:
        return jsonify({"error":f"Failed to create user: {str(e)}"}), 500
    
    return jsonify({
        "message":"Signup successful.",
        "user_id":str(result.inserted_id)
    }), 201

def login():
    if not request.is_json:
        return jsonify({"error":"Invalid or Missing JSON input"})
    data = request.get_json()

    required_fields = ["Email", "Password"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    email = data["Email"]
    password = data["Password"]

    try:
        user = user_services.login_user(email, password)
    except ValueError as e:
        return jsonify({"error":str(e)}), 401
    
    return jsonify({
        "message":"Login successful.",
        "user_id":str(user["_id"]),
        "username":user["Username"]
    }),200
    