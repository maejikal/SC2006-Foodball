import os
from dotenv import load_dotenv
import db
import json
import requests
import asyncio

load_dotenv()

API_KEY = os.getenv('GMAPS_API_KEY')                                                            #load api key from dot env file

def search(lat_lng={"lat": 1.3483,"long": 103.6831}, radius=800, type=['restaurant']):          #input latitude and longitude of pin, default is NTU
    data = {'includedTypes': type,                                                              #required data field to pass to Places object
            'maxResultCount': 20,
            'locationRestriction': {
                'circle': {
                    'center': {
                        "latitude" : lat_lng["lat"], 
                        "longitude": lat_lng["long"]}, 
                    'radius': radius}}}
    # print(data)
    data = json.dumps(data)                                                                     #convert to txt
    headers = {"Content-Type":"application/json","X-Goog-Api-Key": API_KEY,"X-Goog-FieldMask":"places.id,places.displayName,places.location,places.types,places.shortFormattedAddress"} 
    places_response = requests.post("https://places.googleapis.com/v1/places:searchNearby", data=data, headers = headers)   #send request to Places API, retrieve eateries within radius of coordinate
    if places_response.status_code == 200:
        data = places_response.json()                                                           #convert data received into dictionary
    else:
        print(f"Error: {places_response.status_code}, {places_response.text}")
    return data


