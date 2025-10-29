from flask import request, jsonify
from services import user as user_services
from utils import verification

def signup(app, data):
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
        verified = False
        if result is None:
            return jsonify({"error":"Email already registered"}), 400
        while not verified:
            code = verification.send_email(app, email)
            verified = True
    except ValueError as ve:
        return jsonify({"error":str(ve)}), 400
    except Exception as e:
        return jsonify({"error":f"Failed to create user: {str(e)}"}), 500
    
    return jsonify({
        "message":"Signup successful.",
        "username": username,
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

        if user is None:
            return jsonify({"error": "Invalid email or password"}), 401

    except ValueError as e:
        return jsonify({"error":str(e)}), 401
    
    return jsonify({
        "message":"Login successful.",
        "username":user["Username"]
    }),200
    