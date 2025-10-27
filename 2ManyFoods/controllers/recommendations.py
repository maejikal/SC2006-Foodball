from models import *
import random
import api
from services import eatery as eatery_services
from flask import request, jsonify

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
        if len(weights) == 1:
            weights = [1]
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
        out.append(results)
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
        return False
    
def handle_solo_search():
    """Handle solo restaurant search"""
    try:
        username = request.args.get('username')
        selected_cuisines = request.args.getlist('cuisines')
        price_range = request.args.get('price_range', type=int)
        dietary_filters = request.args.getlist('dietary')
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        places = eatery_services.search_eateries(
            username=username,
            selected_cuisines=selected_cuisines,
            price_range=price_range,
            dietary_filters=dietary_filters
        )
        
        formatted_eateries = []
        for place in places:
            
            formatted_eateries.append({
                "_id": place.get('id', ''),
                "name": place.get('displayName', {}).get('text', 'Unknown Restaurant'),
                "location": {
                    "address": "Near NTU",  
                    "latitude": place.get('location', {}).get('latitude', 0),
                    "longitude": place.get('location', {}).get('longitude', 0)
                },
                "price_range": price_range if price_range else 15,
                "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
                "cuisine": selected_cuisines[0] if selected_cuisines else "restaurant"
            })
        
        return jsonify({
            "message": "Search successful",
            "count": len(formatted_eateries),
            "eateries": formatted_eateries
        }), 200
        
    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({"error": f"Search failed: {str(e)}"}), 500