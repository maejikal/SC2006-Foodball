from services import review as review_services, eatery as eatery_services
from flask import request, jsonify
from db import eatery_collection
from bson import ObjectId
import asyncio
import pymongo

def get_eatery(EateryID: int):
    eatery = asyncio.run(eatery_collection.find_one({"_id": EateryID}))
    return eatery

def get_eatery_by_id(eatery_id):
    async def _get_async():
        client = pymongo.AsyncMongoClient('127.0.0.1', 27017)
        try:
            db = client["2ManyFoods_db"]
            result = await db["Eateries"].find_one({"_id": ObjectId(eatery_id)})
            return result
        finally:
            await client.close()
    
    from asyncio import run
    return run(_get_async())

