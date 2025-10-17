from models import *
import os
from dotenv import load_dotenv
import random
import urllib
import json
from decimal import Decimal

load_dotenv()

API_KEY = os.getenv('GMAPS_API_KEY')

def _fetch_remote_json(service_url, params=None):
    encoded_data = {}
    for k, v in params.items():
        v = v.encode('utf-8')
        encoded_data[k] = v
    encoded_data = urllib.parse.urlencode(encoded_data)

    request_url = service_url + encoded_data
    request = urllib.request.Request(request_url, data=encoded_data)

    response = urllib.request.urlopen(request)
    str_response = response.read().decode('utf-8')
    return (request_url, json.loads(str_response, parse_float=Decimal)['places'])

def nearby_search(lat_lng=None, radius=3200, type='restaurant'):
    lat_lng_str = str(lat_lng["lat"]) + "," + str(lat_lng["lng"])
    params = {'location': lat_lng_str,
              'radius': radius,
              'type': type,
              'language': 'en',
              'sensor': 'false',
              'key': API_KEY
              }
    url, places_response = _fetch_remote_json(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?', params)
    return [i for i in places_response["results"]]

class RecommendationController:
    def __init__(self, group: Group, location: Location, radius: int = 500):
        self._group = group
        self.location = location
        self.recommendations = self.FilterRecommendations(location, radius)
        self.radius = radius

    def FilterRecommendations(self, location: Location) -> list[Eatery]:
        query_result = nearby_search(
            lat_lng={'lat': location.getlangitude, 'lng': location.getlongitude},
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

    def GroupVoting(self, votes) -> int:
        votes = {i: 0 for i in self.recommendations}
        highest = max(votes.values())
        return random.choice([i for i in votes if votes[i] == highest]).EateryID

    def getGroup(self):
        return self._group  
    
    def getRecommendations(self):
        return self.recommendations

    def setRadius(self, rad: int):
        self.radius = rad
        self.recommendations = self.FilterRecommendations(self.location)
        
class RecommendationInterface:
    def __init__(self, con: RecommendationController):
        self._con = con

    def GenerateRecommendation(self):
        return self._con.FilterRecommendations()

    def VoteAndDisplay(self) -> int:
        votes = {}
        for user in self._con.getGroup():
            vote = user.getVote()
            for i, j in vote.items():
                if i in votes.keys():
                    votes[i] += j
                else:
                    votes[i] = j
        return self._con.GroupVoting(votes)