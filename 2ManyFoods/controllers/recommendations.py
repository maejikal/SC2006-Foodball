from models import *
import random
import api
from services import eatery as eatery_services
from controllers import group as group_controller
from services import eatery as eatery_services
from flask import request, jsonify

class RecommendationController:
    def __init__(self, group: Group, location: Location, radius: int = 500):
        self._group = group
        self.location = location
        self.radius = 800
        self.recommendations = self.FilterRecommendations()
        

    def FilterRecommendations(self) -> list[Eatery]:
        query_result = api.search(
            lat_lng={'lat': self.location.getlangitude(), 'long': self.location.getlongitude()},
            radius=self.radius, type=['restaurant'])
        results = query_result['places']
        weights = [user["Hunger"] for user in self._group.Users.values()]
        if len(weights) == 1:
            weights = [1]
        preferences = self._group.getPreferences()
        groupPreferences = {}
        for preference in preferences:
            try:
                groupPreferences[preference["rank1"]] += 0.5
            except:
                groupPreferences[preference["rank1"]] = 0.5
            try:
                groupPreferences[preference["rank2"]] += 0.3
            except:
                groupPreferences[preference["rank2"]] = 0.3
            try:
                groupPreferences[preference["rank3"]] += 0.2
            except:
                groupPreferences[preference["rank3"]] = 0.2

        groupPreferences = list(reversed(sorted(groupPreferences, key=groupPreferences.get)))
        out = []
        for category in groupPreferences:
            for eatery in results:
                if category in eatery['types']:
                    out.append(eatery)
                    results.remove(eatery)
        # https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places
        # https://developers.google.com/maps/documentation/places/web-service/place-types
        self.recommendations = out
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
        self.FilterRecommendations()
        return self.recommendations

    def setRadius(self, rad: int):
        self.radius = rad
        self.recommendations = self.FilterRecommendations(self.location)
    
    def updatePref(self, userID, pref):
        if userID in self._group.Users:
            self._group.Users[userID]["Preferences"].update(pref)
            self.FilterRecommendations()
            return True
        return False
    