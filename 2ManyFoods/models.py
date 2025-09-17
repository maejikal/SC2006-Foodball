class User:

    def __init__(self, Username:str, Password:str, Email:str, ProfilePhoto, Budget, Hunger):
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

class Group:

    def __init__(self):
        pass


        
