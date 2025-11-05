from datetime import datetime
import db

class User:

    def __init__(self, Username: str, Password: str, Email: str, ProfilePhoto: str, 
                 Verified: bool=False, FoodHistory: list=[], Review: list=[], DietaryRequirements: dict={}, 
                 Budget: float=float('inf'), Hunger: int=1, preferences: dict={}):
        self.Username = Username
        self.Password = Password  # hash required
        self.Email = Email
        self.verified = Verified
        self.FoodHistory = FoodHistory
        self.Review = Review
        self.DietaryRequirements = DietaryRequirements
        self.ProfilePhoto = ProfilePhoto
        self.Budget = Budget
        self.Hunger = ['', Hunger]
        self.preferences = preferences
        self.Reviews = []
        self.Groups = []

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

    def setUsername(self, username: str):
        self.Username = username

    def setPassword(self, password: str):
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

    def __init__(self, GroupName: str, users: dict, GroupPhoto: str, GroupID: int):
        self.GroupName = GroupName
        self.Users = users
        self.GroupPhoto = GroupPhoto
        self.NoOfUsers = len(users)
        self.GroupID = GroupID #auto generate by mongo
        for user in users.keys():
            users[user]["vote"] = None

    def getGroupName(self):
        return self.GroupName
    
    def getGroupID(self):
        return self.GroupID
    
    def getUsers(self):
        return self.Users
    
    def getGroupPhoto(self):
        return self.GroupPhoto
    
    def getNoOfUsers(self):
        return self.NoOfUsers
    
    def getPreferences(self):
        return self.Preferences
    
    def updateGroupName(self, groupname: str):
        self.GroupName = groupname

    def addUser(self, userID: int):
        self.Users.append(userID)
        self.NoOfUsers = len(self.Users)

    def updateGroupPhoto(self, photo:str):
        self.GroupPhoto = photo

    def updateUsers(self):
        pass

    def getPreferences(self):
        return [user["Preferences"] for user in self.Users.values()]
    
    def getRequirements(self):
        return []
    
    def getHistories(self):
        hungers = [(user["FoodHistory"], user["Hunger"]) for user in self.Users.values()]
        return [i[0] for i in sorted(hungers, key=lambda x: x[1])]
    
class Location:
    def __init__(self, latitude: float, longitude: float):
        self.latitude = latitude
        self.longitude = longitude
    
    def getlatitude(self):
        return self.latitude
    
    def getlongitude(self):
        return self.longitude
    
    def setlangitude(self, langitude: float):
        self.langitude = langitude

    def setlongitude(self, longitude: float):
        self.longitude = longitude


class Eatery:
    def __init__(self, Name: str, DietaryRequirements: dict, Cuisine: dict, PriceRange: tuple, Location: Location, OpeningHours: datetime):
        self.EateryID = None # autoincrement
        self.Name = Name 
        self.DietaryRequirements = DietaryRequirements  # halal, vegetarian, peanut, shellfish, milk, eggs(idk add more if there are more prevalent ones)
        self.Cuisine = Cuisine  # western, italian, chinese, malay, indian, japanese, korean
        self.PriceRange = PriceRange
        self.Location = Location
        self.OpeningHours = OpeningHours
        self.Reviews = []
        self.AverageRating = 0.0 #no reviews

    def getEateryID(self):
        return self.EateryID
    
    def getName(self):
        return self.Name
    
    def getDietaryRequirements(self):
        return self.DietaryRequirements
    
    def getCuisine(self):
        return self.Cuisine
    
    def getPriceRange(self):
        return self.PriceRange
    
    def getLocation(self):
        return self.Location
    
    def getOpeningHours(self):
        return self.OpeningHours

    def getReviews(self):
        return self.Reviews
    
    def getAverageRating(self):
        return self.AverageRating
    
    def setName(self, Name: str):
        self.Name = Name
    
    def setDietaryRequirements(self, update: dict):
        for key in self.DietaryRequirements.keys():
            if update[key] != None:
                self.DietaryRequirements[key] = update[key]
    
    def setCuisine(self, update: dict):
        for key in self.Cuisine.keys():
            if update[key] != None:
                self.DietaryRequirements[key] = update[key]
    
    def setPriceRange(self, LowerRange = 0, UpperRange = float("inf") ):
        if LowerRange != 0:
            self.PriceRange = (LowerRange, self.PriceRange[1])

        if UpperRange != float("inf"):
            self.PriceRange = (self.PriceRange[0], UpperRange)
    
    def setLocation(self, Location):
        self.Location = Location
    
    def setOpeningHours(self, OpeningHours):
        self.OpeningHours = OpeningHours

    def updateReviews(self, newReview: list):
        for i in newReview:
            self.Reviews.append(i)
    
    def getAverageRating(self):
        total = 0
        for i in self.Reviews:
            total += i.getRating()
        return round(total/len(self.Reviews), 2)