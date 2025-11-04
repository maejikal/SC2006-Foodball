from models import *
import random
import api
from services import eatery as eatery_services
from controllers import group as group_controller
from services import eatery as eatery_services
from flask import request, jsonify

class RecommendationController:
    def __init__(self, group: Group, location: Location, radius: int = 800):
        self._group = group
        self.location = location
        self.radius = radius
        self.recommendations = self.FilterRecommendations()
        self.done = [user["Username"] for user in self._group.Users.values()]
        self.final = ""

    def FilterRecommendations(self) -> list[Eatery]:
        query_result = api.search(
            lat_lng={'lat': self.location.getlatitude(), 'long': self.location.getlongitude()},
            radius=self.radius, type=['restaurant'])
        results = query_result['places']
        weights = [user["Hunger"] for user in self._group.Users.values()]
        if len(weights) == 1:
            weights = [1]
        preferences = self._group.getPreferences()
        requirements = self._group.getRequirements()
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
        groupHistory = self._group.getHistories()
        groupPreferences = list(reversed(sorted(groupPreferences, key=groupPreferences.get)))
        out = []
        for category in groupPreferences:
            for eatery in results:
                if category in eatery['types']:
                    out.append(eatery)
                    results.remove(eatery)

        # Filter based on dietary requirements
        for req in requirements:
            for eatery in out:
                if req not in eatery['types']:
                    out.remove(eatery)

        # Rearrange results based on food history and hunger
        for user in groupHistory:
            for place in user:
                for recc in out:
                    if place["restaurant_id"] == recc["id"]:
                        out.remove(recc)
                        out.append(recc)
                        break
        extra = results[:5]
        for user in groupHistory:
            for place in user:
                for recc in extra:
                    if place["restaurant_id"] == recc["id"]:
                        extra.remove(recc)
                        extra.append(recc)
                        break
        out += extra
        # https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places
        # https://developers.google.com/maps/documentation/places/web-service/place-types
        self.recommendations = out
        return out

    def finishVoting(self) -> int:
        votes = {i['id']: 0 for i in self.recommendations}
        for user, info in self._group.Users.items():
            try:
                votes[info['vote']] += info['Hunger']
            except:
                votes[info['vote']] = info['Hunger']
    
        highest = max(votes.values())
        self.final = random.choice([i for i in votes if votes[i] == highest])
        return self.final

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
    