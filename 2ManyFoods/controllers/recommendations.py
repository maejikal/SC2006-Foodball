from models import *
import random
import services.eatery as eatery_services

class RecommendationController:
    def __init__(self, group: Group, location: Location, radius: int = 800):
        self._group = group
        self.location = location
        self.radius = radius
        self.recommendations = self.FilterRecommendations()
        self.done = [user["Username"] for user in self._group.Users.values()]
        self.final = ""

    def FilterRecommendations(self) -> list[Eatery]:
        
        weights = [user["Hunger"] for user in self._group.Users.values()]
        if len(weights) == 1:
            weights = [1]
        preferences = self._group.getPreferences()
        requirements = self._group.getRequirements()

        groupPreferences = {}
        for preference in preferences:
            groupPreferences[preference["rank1"]] = groupPreferences.get(preference["rank1"], 0.5) + 0.5
            groupPreferences[preference["rank2"]] = groupPreferences.get(preference["rank2"], 0.3) + 0.3
            groupPreferences[preference["rank3"]] = groupPreferences.get(preference["rank3"], 0.2) + 0.2
        
        groupHistory = self._group.getHistories()
        groupPreferences = list(reversed(sorted(groupPreferences, key=groupPreferences.get)))
        results, others = eatery_services.search_eateries(location={'lat': self.location.getlatitude(), 'long': self.location.getlongitude()},
                radius=self.radius, selected_cuisines=groupPreferences)
        
        # Filter based on dietary requirements
        for req in requirements:
            for eatery in results:
                if req not in eatery['types']:
                    results.remove(eatery)

        # Rearrange results based on food history and hunger
        for user in groupHistory:
            for place in user:
                for recc in results:
                    if place["restaurant_id"] == recc["id"]:
                        results.remove(recc)
                        results.append(recc)
                        break
        
        # Rearrange the rest
        for user in groupHistory:
            for place in user:
                for recc in others:
                    if place["restaurant_id"] == recc["id"]:
                        others.remove(recc)
                        others.append(recc)
                        break
        results += others[:5]
        # https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places
        # https://developers.google.com/maps/documentation/places/web-service/place-types
        self.recommendations = results
        return results

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