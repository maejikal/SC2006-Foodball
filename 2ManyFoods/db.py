import pymongo
import asyncio
async def mongoupdate():
    client = pymongo.AsyncMongoClient('mongodb://localhost:27017/')
    db = client["2ManyFoods_db"]
    user_collection = db.get_collection("Users")
    group_collection = db.get_collection("Group")
    eatery_collection = db.get_collection("Eateries")
    review_collection = db.get_collection("Reviews")

    await client.close()
    return (user_collection, group_collection, eatery_collection, review_collection)
user_collection, group_collection, eatery_collection, review_collection = asyncio.run(mongoupdate())