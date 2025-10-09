import pymongo
client = pymongo.MongoClient("127.0.0.1", 27017)
db = client.get_database("2ManyFoods_db")
user_collection = db.get_collection("Users")
