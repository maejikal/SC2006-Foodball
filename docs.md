# 2ManyFoods API Documentation

This document provides comprehensive documentation for all API endpoints in the 2ManyFoods application.

## Table of Contents
- [Authentication Routes](#authentication-routes)
- [Group Management Routes](#group-management-routes)
- [Food Recommendation Routes](#food-recommendation-routes)
- [User Profile Routes](#user-profile-routes)
- [History and Review Routes](#history-and-review-routes)
- [Group Status Routes](#group-status-routes)

## Authentication Routes

### Sign Up
```http
POST /signup
```
**Description**: Register a new user account  
**CORS**: Enabled with OPTIONS preflight support  
**Request Body**: JSON with user registration details  
**Response**: User registration status and details

### Send Verification
```http
POST /send-verification
```
**Description**: Send email verification code to new users  
**Request Body**:
```json
{
  "email": "string"
}
```
**Response**: Success message or error with 200/400/500 status codes  
**Note**: Verification code expires in 10 minutes

### Verify Email
```http
POST /verify-email
```
**Description**: Verify email with provided verification code  
**Request Body**:
```json
{
  "email": "string",
  "code": "string"
}
```
**Response**: Verification status with 200/400/500 status codes

### Login
```http
POST /login
```
**Description**: Authenticate user login  
**Request Body**: JSON with login credentials  
**Response**: Authentication status and user details

## Group Management Routes

### Join Group by ID
```http
GET /joingroup/<groupID>
```
**Description**: Join a group using group ID  
**Parameters**: groupID in URL  
**Response**: Group joining status

### Join Group by Invite Code
```http
POST /api/groups/join
```
**Description**: Join a group using invite code  
**Request Body**: JSON with invite code details  
**Response**: Group joining status

### Create Group
```http
POST /api/groups/create
```
**Description**: Create a new group  
**Request Body**: Group creation details  
**Response**: New group details

### Get User Groups
```http
GET /api/groups/user/<username>
```
**Description**: Get all groups for a specific user  
**Parameters**: username in URL  
**Response**: List of user's groups

### Get Group Details
```http
GET /api/groups/<grp_id>
```
**Description**: Get details of a specific group  
**Parameters**: grp_id in URL  
**Response**: Group details

### Leave Group
```http
POST /api/groups/leave
```
**Description**: Leave a group  
**Request Body**: Group leaving details  
**Response**: Leave status

## Food Recommendation Routes

### Generate Recommendations
```http
GET /foodball/<groupName>
```
**Description**: Generate food recommendations for a group  
**Parameters**:  
- groupName in URL
- lat (latitude)
- long (longitude)
- cuisines (optional)  

**Response**: Restaurant recommendations

### Submit Vote
```http
POST /foodball/<groupName>/vote
```
**Description**: Submit vote for restaurant in group  
**Request Body**:
```json
{
  "username": "string",
  "restaurant_id": "string"
}
```
**Response**: Updated recommendations or final vote result

### Refresh Recommendations
```http
GET /refresh/<groupName>
```
**Description**: Refresh group's recommendation status  
**Parameters**: groupName in URL  
**Response**: Current recommendations or final vote

## User Profile Routes

### Update Security Settings
```http
POST /account/security
```
**Description**: Update user security settings  
**Request Body**: Security update details  
**Response**: Update status

### Update Dietary Preferences
```http
POST /account/dietary
```
**Description**: Update user dietary preferences  
**Request Body**: Dietary preference details  
**Response**: Update status

### Update Cuisine Preferences
```http
POST /account/cuisine
```
**Description**: Update user cuisine preferences  
**Request Body**: Cuisine preference details  
**Response**: Update status

### Get User Profile
```http
GET /account/<username>
```
**Description**: Get complete user profile  
**Parameters**: username in URL  
**Response**: Complete user profile details

## History and Review Routes

### Add to Food History
```http
POST /api/history/add
```
**Description**: Add restaurant to user's food history  
**Request Body**:
```json
{
  "username": "string",
  "restaurant": {
    "id": "string",
    "name": "string",
    "address": "string",
    "cuisine": ["string"]
  }
}
```
**Response**: Confirmation of addition

### Get Food History
```http
GET /api/history/get
```
**Description**: Get user's food history  
**Query Parameters**: username  
**Response**: List of visited restaurants

### Create Review
```http
POST /api/review/create
```
**Description**: Create new restaurant review  
**Request Body**: Review details  
**Response**: Review creation status

### Update Review
```http
POST /api/review/update
```
**Description**: Update existing review  
**Request Body**: Updated review details  
**Response**: Update status

### Get User Review
```http
GET /api/review/get
```
**Description**: Get user's review for specific restaurant  
**Query Parameters**:
- username
- restaurant_id  

**Response**: Review details if exists

### Get Restaurant Reviews
```http
GET /api/review/restaurant/<restaurant_id>
```
**Description**: Get all reviews for a restaurant  
**Parameters**: restaurant_id in URL  
**Response**: List of reviews, average rating, and total review count

## Group Status Routes

### Get Group Status
```http
GET /api/group/<group_id>/status
```
**Description**: Get current group status  
**Parameters**: group_id in URL  
**Response**: Group status including members, readiness, and voting status

### Update Group Preferences
```http
POST /api/group/<group_id>/preferences
```
**Description**: Update member preferences in group  
**Request Body**:
```json
{
  "username": "string",
  "cuisines": ["string"],
  "price_range": number,
  "hunger_level": number
}
```
**Response**: Preference update status

### Get Foodball Session Status
```http
GET /api/foodball/status/<groupName>
```
**Description**: Get Foodball session status  
**Parameters**: groupName in URL  
**Response**: Session status and location details if started