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

def handle_group_search(group_id: str):

    try:
        # 1. Get group data
        group = group_controller.get_group_by_id(group_id)
        if not group:
            raise ValueError("Group not found")
        
        members = group.get('members', [])
        if not members:
            raise ValueError("No members in group")
        
        username = members[0].get('username')
        
        cuisine_scores = {}
        
        for member in members:
            hunger = member.get('hunger_level', 5)
            cuisines = member.get('cuisines', [])
            
            for idx, cuisine in enumerate(cuisines[:3]):
                weight = (3 - idx) * hunger
                cuisine_scores[cuisine] = cuisine_scores.get(cuisine, 0) + weight
        
        sorted_cuisines = sorted(cuisine_scores.items(), key=lambda x: x[1], reverse=True)
        top_cuisines = [c[0] for c in sorted_cuisines[:5]]
        
        total_price = sum(m.get('price_range', 50) for m in members)
        avg_price = total_price // len(members)
        
        places = eatery_services.search_eateries(
            username=username,
            selected_cuisines=top_cuisines,
            price_range=avg_price,
            dietary_filters=[]
        )
        
        if not places:
            raise ValueError("No restaurants found for group preferences")
        
        scored_restaurants = []
        for place in places:
            score = 0
            place_cuisines = place.get('types', [])
            
            for cuisine, cuisine_score in cuisine_scores.items():
                if cuisine.lower() in [str(t).lower() for t in place_cuisines]:
                    score += cuisine_score
            
            scored_restaurants.append({
                'place': place,
                'score': score
            })
        
        scored_restaurants.sort(key=lambda x: x['score'], reverse=True)
        top_3 = scored_restaurants[:3]
        
        formatted_eateries = []
        for item in top_3:
            place = item['place']
            formatted_eateries.append({
                "_id": place.get('id', ''),
                "name": place.get('displayName', {}).get('text', 'Unknown Restaurant'),
                "location": {
                    "address": place.get('formattedAddress', 'Near NTU'),
                    "latitude": place.get('location', {}).get('latitude', 0),
                    "longitude": place.get('location', {}).get('longitude', 0)
                },
                "price_range": avg_price,
                "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
                "cuisine": top_cuisines[0] if top_cuisines else "restaurant",
                "group_score": item['score']
            })
        
        return formatted_eateries
        
    except Exception as e:
        print(f"Group search error: {e}")
        raise