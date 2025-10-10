from datetime import datetime
from random import randint
from hashlib import md5

class User:

    def __init__(self, Username:str, Password:str, Email:str, ProfilePhoto:str):
        self.Username = Username
        self.Password = Password        #hash required
        self.Email = Email
        self.verified = False
        self.FoodHistory = []
        self.Review = []
        self.DietaryRequirements = {}
        self.ProfilePhoto = ProfilePhoto
        self.Budget = float("inf")
        self.Hunger = 1

    def getUsername(self):
        return self.Username
    
    def getPassword(self):
        return self.Password
    
    def getEmail(self):
        return self.Email
    
    def getverified(self):
        return self.verified
    
    def getFoodHistory(self):
        return self.FoodHistory
    
    def getReview(self):
        return self.Review
    
    def getDietaryRequirements(self):
        return self.DietaryRequirements
    
    def getProfilePhoto(self):
        return self.ProfilePhoto
    
    def getBudget(self):
        return self.Budget
    
    def getHunger(self):
        return self.Hunger
    
    def setUsername(self, username:str):
        self.Username = username

    def setPassword(self, password:str):
        self.Password = password

    def setEmail(self, email):
        self.Email = email

    def setverified(self):
        self.verified = True

    def updateFoodHistory(self, Eatery):
        self.FoodHistory.append(Eatery)
        if len(self.FoodHistory) > 10:
            self.FoodHistory = self.FoodHistory[1:]

    def setProfilePhoto(self, photo):
        self.ProfilePhoto = photo

    def setBudget(self, budget):
        self.Budget = budget

    def setHunger(self, hunger):
        self.Hunger = hunger

class Group:

    def __init__(self, GroupName:str, Users:User, GroupPhoto:str):
        self.GroupName = GroupName
        self.Users = [User]
        self.GroupPhoto = ""
        self.NoOfUsers = len(self.Users)
        randomisation = randint(0,122)
        self.GroupID = md5(str(datetime.now()).encode())[randomisation:randomisation+6]
        self.Preferences = {}

class Location:
    def __init__(self):
        self.langitude = None
        self.longitude = None
    pass

class Eatery:
    def __init__(self):
        self.EateryID = None
        
class Review:
    def __init__(self, User:User, Eatery:Eatery, Rating:int, Comment:str, Date:datetime, Photo:str):
        self.ReviewID = None #autoincrement
        self.User = None
        self.Eatery = None
        self.Rating = None #1-5
        self.Comment = None
        self.Date = None
        self.Photo = None #filename/path?
    
    def getReviewID(self):
        return self.ReviewID
    
    def getUser(self):
        return self.User
    
    def getEatery(self):
        return self.Eatery
    
    def getRating(self):
        return self.Rating
    
    def getComment(self):
        return self.Comment
    
    def getDate(self):
        return self.Date
    
    def getPhoto(self):
        return self.Photo
    
    def setUser(self, user:User):
        self.User = user

    def setEatery(self, eatery:Eatery):
        self.Eatery = eatery

    def setRating(self, rating:int):
        self.Rating = rating
    
    def setComment(self, comment:str):
        self.Comment = comment

    def setDate(self, date:datetime):
        self.Date = date

    def setPhoto(self, photo:str):
        self.Photo = photo


        
