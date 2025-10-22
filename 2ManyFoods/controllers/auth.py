from flask import request, jsonify
from services import user as user_services

def signup(data):
    if not data:
        return jsonify({"error":"Invalid or Missing JSON input"}), 400

    required_fields = ["username", "password", "email"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    username = data["username"]
    password = data["password"]
    email = data["email"]

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

def login(data):
    if not data: 
        return jsonify({"error":"Invalid or Missing JSON input"}), 400

    required_fields = ["email", "password"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error":f"Missing fields:{','.join(missing)}"}), 400
    
    email = data["email"]
    password = data["password"]

    try:
        user = user_services.login_user(email, password) # user successfully set
    except ValueError as e:
        return jsonify({"error":str(e)}), 401
    
    return jsonify({
        "message":"Login successful.",
        "user_id":str(user["_id"]),
        "username":user["Username"]
    }),200
    