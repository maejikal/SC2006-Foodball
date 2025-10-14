import pymongo
import asyncio
client = asyncio.run(pymongo.AsyncMongoClient() )
db = client.get_database("2ManyFoods_db")
user_collection = db.get_collection("Users")
group_collection = db.get_collection("Group")
eatery_collection = db.get_collection("Eateries")
review_collection = db.get_collection("Reviews")



client.close()
