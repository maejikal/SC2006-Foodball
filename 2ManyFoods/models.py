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





        


        
