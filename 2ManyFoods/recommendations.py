from models import *
from googleplaces import GooglePlaces, types, lang
import os
from dotenv import load_dotenv
import random

load_dotenv()

API_KEY = os.getenv('GMAPS_API_KEY')

google_places = GooglePlaces(API_KEY)

class RecommendationController:
    def __init__(self, group: Group, location: Location, radius: int=500):
        self.group = group
        self.location = location
        self.recommendations = self.FilterRecommendations(location, radius)

    def FilterRecommendations(self, location: Location, radius: int) -> list[Eatery]:
        query_result = google_places.nearby_search(
            lat_lng={'lat': location.latitude, 'lng': location.longitude},
            radius=radius, types=[types.TYPE_RESTAURANT]).places
        return [Eatery(i) for i in query_result]

    def GroupVoting(self, group: Group) -> int:
        votes = {i: 0 for i in self.recommendations}
        for user in group:
            vote = user.vote(self.recommendations)
            votes[vote[0]] += vote[1]
        highest = max(votes.values())
        return random.choice([i for i in votes if votes[i] == highest]).EateryID
        
class RecommendationInterface:
    def GenerateRecommendation():
        pass

    def VoteAndDisplay():
        pass
