from services import review as review_services, eatery as eatery_services
from flask import request, jsonify
from db import searchdb
import asyncio

def get_eatery(EateryID: int):
    eatery = asyncio.run(searchdb("Eateries", "_id", EateryID))
    return eatery