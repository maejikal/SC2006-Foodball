import os
from dotenv import load_dotenv
import db
import json
import requests
import asyncio

load_dotenv()

API_KEY = os.getenv('GMAPS_API_KEY')

def search(lat_lng={"lat": 1.3483,"long": 103.6831}, radius=800, type=['restaurant']):
    data = {'includedTypes': type,
            'maxResultCount': 20,
            'locationRestriction': {
                'circle': {
                    'center': {
                        "latitude" : lat_lng["lat"], 
                        "longitude": lat_lng["long"]}, 
                    'radius': radius}}}
    
    data = json.dumps(data)
    headers = {"Content-Type":"application/json","X-Goog-Api-Key": API_KEY,"X-Goog-FieldMask":"places.id,places.displayName,places.location,places.types"}
    places_response = requests.post("https://places.googleapis.com/v1/places:searchNearby", data=data, headers = headers)
    #return json.loads(data)
    # places_response = requests.get(f"https://places.googleapis.com/v1/places/ChIJ063tHqcP2jERA7izPRRnlAE", headers=headers)
    if places_response.status_code == 200:
        data = places_response.json()
    else:
        print(f"Error: {places_response.status_code}, {places_response.text}")
    return data

testdict = {'places': [{'_id': 'ChIJ063tHqcP2jERA7izPRRnlAE', 'location': {'latitude': 1.3524232, 'longitude': 103.6854716}, 'displayName': {'text': 'Canteen 9', 'languageCode': 'en'}}, {'_id': 'ChIJk2hjGKAP2jERtZYCT0TDDOc', 'location': {'latitude': 1.3470369, 'longitude': 103.68034}, 'displayName': {'text': "McDonald's", 'languageCode': 'en'}}, {'_id': 'ChIJkRifAOAP2jERTwWSiMxIpYg', 'location': {'latitude': 1.3466913, 'longitude': 103.6859655}, 'displayName': {'text': "Domino's Pizza", 'languageCode': 'en'}}, {'_id': 'ChIJMfzHEP8Z2jER47wjTEBYUl8', 'location': {'latitude': 1.34748, 'longitude': 103.6797845}, 'displayName': {'text': 'PEN & INC', 'languageCode': 'en'}}, {'_id': 'ChIJOeo7rRYP2jERfaGpD0hs2vE', 'location': {'latitude': 1.3472899999999999, 'longitude': 103.6807359}, 'displayName': {'text': 'The Crowded Bowl', 'languageCode': 'en'}}, {'_id': 'ChIJd_SfCgAP2jERe8zXEIlzoic', 'location': {'latitude': 1.3424279, 'longitude': 103.6803188}, 'displayName': {'text': 'Quad Cafe @ EEE', 'languageCode': 'en'}}, {'_id': 'ChIJv8e3PQAP2jERGkGOUw8FKfs', 'location': {'latitude': 1.347548, 'longitude': 103.6800954}, 'displayName': {'text': 'Popeyes NTU', 'languageCode': 'en'}}, {'_id': 'ChIJC9GkSwAP2jEROdVM59abOh4', 'location': {'latitude': 1.3470347999999999, 'longitude': 103.67981479999999}, 'displayName': {'text': 'Blue Ocean Kopi & Toast', 'languageCode': 'en'}}, {'_id': 'ChIJlbaBdqAP2jERlLl3ZDlREHY', 'location': {'latitude': 1.3470347999999999, 'longitude': 103.6804971}, 'displayName': {'text': "Paik's Bibim", 'languageCode': 'en'}}, {'_id': 'ChIJAQAA0AoP2jER8DtlIT9tOCc', 'location': {'latitude': 1.3469362999999999, 'longitude': 103.68005389999999}, 'displayName': {'text': 'Subway', 'languageCode': 'en'}}, {'_id': 'ChIJXwluwgoP2jERulXZRFj8fYY', 'location': {'latitude': 1.3472058, 'longitude': 103.6808441}, 'displayName': {'text': 'The Soup Spoon Union', 'languageCode': 'en'}}, {'_id': 'ChIJlfk9iHUP2jER8XOVBgF0FkE', 'location': {'latitude': 1.3430262, 'longitude': 103.6827026}, 'displayName': {'text': 'CO-OP', 'languageCode': 'en'}}, {'_id': 'ChIJYQ95QwAP2jERmvEqJcTsibc', 'location': {'latitude': 1.3475051, 'longitude': 103.68011519999999}, 'displayName': {'text': 'Encik Tan', 'languageCode': 'en'}}, {'_id': 'ChIJHymjsIEP2jER2Op0wt6SpGs', 'location': {'latitude': 1.3481206, 'longitude': 103.68536399999999}, 'displayName': {'text': 'ITSBUBBLIN @ NTU Canteen 2', 'languageCode': 'en'}}, {'_id': 'ChIJv_uiYKQP2jERQjIoxjrUwpg', 'location': {'latitude': 1.3524334999999998, 'longitude': 103.68526630000001}, 'displayName': {'text': 'LanLamian Lanzhou Beef Noodles Halal', 'languageCode': 'en'}}, {'_id': 'ChIJm3ExVFIP2jER3-M1OVngvy0', 'location': {'latitude': 1.3502569, 'longitude': 103.6810514}, 'displayName': {'text': 'Lin Ji Koka Noodles', 'languageCode': 'en'}}, {'_id': 'ChIJA4czoGYP2jER3MGyuh0GcIs', 'location': {'latitude': 1.345229, 'longitude': 103.68116649999999}, 'displayName': {'text': 'Yew Kee Specialities @ NTU North Spine Plaza', 'languageCode': 'en'}}, {'_id': 'ChIJWQuHxu0P2jERG0weFzk3Spc', 'location': {'latitude': 1.3472899999999999, 'longitude': 103.6807359}, 'displayName': {'text': 'Xiao Guan Zi', 'languageCode': 'en'}}, {'_id': 'ChIJ-c0P3AoP2jEREyR7CRoYMHk', 'location': {'latitude': 1.3470585, 'longitude': 103.6800627}, 'displayName': {'text': 'Route 35 Western Food', 'languageCode': 'en'}}, {'_id': 'ChIJFSsc5CEP2jERqI0RVlOVZ1M', 'location': {'latitude': 1.348404, 'longitude': 103.68542989999999}, 'displayName': {'text': 'yihuatminiwok2', 'languageCode': 'en'}}]}

# for i in testdict.values():
#     asyncio.run(db.mongoupdate("Eateries", i))
print(search())
