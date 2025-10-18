from models import *
import random
import api

class RecommendationController:
    def __init__(self, group: Group, location: Location, radius: int = 500):
        self._group = group
        self.location = location
        self.recommendations = self.FilterRecommendations(location, radius)
        self.radius = radius

    def FilterRecommendations(self) -> list[Eatery]:
        query_result = api.search(
            lat_lng={'lat': self.location.getlangitude, 'lng': self.location.getlongitude},
            radius=self.radius, types=['restuarant'])
        results = [Eatery(i) for i in query_result]
        weights = [user.getHunger() for user in self._group.Users]
        preferences = self._group.getPreferences()
        groupPreferences = dict.fromkeys(preferences[0].keys())
        for key in groupPreferences.keys():
            groupPreferences[key] = sum(preferences[i][key]*weights[i] for i in range(len(preferences)))
        groupPreferences = list(reversed(sorted(groupPreferences, key=groupPreferences.get)))
        out = []
        for category in groupPreferences:
            for eatery in results:
                if category in eatery.types:
                    out.append(eatery)
                    results.remove(eatery)
        # https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places
        # https://developers.google.com/maps/documentation/places/web-service/place-types
        return out

    def finishVoting(self) -> int:
        votes = {i: 0 for i in self.recommendations}
        for user in self.Users:
            for eatery, score in user['vote']:
                try:
                    votes[eatery] += score
                except:
                    votes[eatery] = score
       
        highest = max(votes.values())
        return random.choice([i for i in votes if votes[i] == highest]).EateryID

    def getGroup(self) -> dict:
        return self._group  
    
    def getRecommendations(self):
        return self.recommendations

    def setRadius(self, rad: int):
        self.radius = rad
        self.recommendations = self.FilterRecommendations(self.location)
    
    def updatePref(self, userID, pref):
        if userID in self._group.Users:
            self._group.Users[userID]["Preferences"].update(pref)
            self.FilterRecommendations()
            return True