from services import review as review_services, eatery as eatery_services
from flask import request, jsonify
from db import eatery_collection
import asyncio

def get_eatery(EateryID: int):
    eatery = asyncio.run(eatery_collection.find_one({"_id": EateryID}))
    return eatery

