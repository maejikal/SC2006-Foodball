import pymongo
import asyncio
async def makedb():                                                                                     #DO NOT RUN UNLESS YOU NEED TO REDO THE DB
    client = pymongo.AsyncMongoClient('mongodb://localhost:27017/') 
    db = client["2ManyFoods_db"]                                                
    #clearing database
    print("Dropping all collections...")
    collection_names = await db.list_collection_names()
    for name in collection_names:
        await db.drop_collection(name)
        print(f"Dropped collection: {name}")
    print("All collections dropped.")
    user_collection = db.get_collection("Users")
    group_collection = db.get_collection("Groups")
    eatery_collection = db.get_collection("Eateries")
    review_collection = db.get_collection("Reviews")
    await client.close()
    return (user_collection, group_collection, eatery_collection, review_collection)

async def mongoupdate(field: str, data: list):
    client = pymongo.AsyncMongoClient('mongodb://localhost:27017/')
    db = client["2ManyFoods_db"]
    result = "Database successfully updated!"
    match field:
        case "Users":
            user_collection = db.get_collection("Users")
            await user_collection.insert_many(data)
        case "Groups":
            group_collection = db.get_collection("Groups")
            await group_collection.insert_many(data)
            pass
        case "Eateries":
            eatery_collection = db.get_collection("Eateries")
            print(data)
            await eatery_collection.insert_many(data)
        case "Reviews":
            review_collection = db.get_collection("Reviews")
            await review_collection.insert_many(data)
        case _:
            result = "Failed to update Database!"
    await client.close()
    return result

async def viewdb():
    client = pymongo.AsyncMongoClient('mongodb://localhost:27017/')
    db = client["2ManyFoods_db"]
    user_collection = db.get_collection("Users")
    group_collection = db.get_collection("Groups")
    eatery_collection = db.get_collection("Eateries")
    review_collection = db.get_collection("Reviews")
    for i in user_collection.find():
        print(i)
    for i in group_collection.find():
        print(i)
    for i in eatery_collection.find():
        print(i)
    for i in review_collection.find():
        print(i)
        
async def getdb():
    client = pymongo.AsyncMongoClient('mongodb://localhost:27017/') 
    db = client["2ManyFoods_db"]                                                

    user_collection = db.get_collection("Users")
    group_collection = db.get_collection("Groups")
    eatery_collection = db.get_collection("Eateries")
    review_collection = db.get_collection("Reviews")
    await client.close()
    return (user_collection, group_collection, eatery_collection, review_collection)

asyncio.run(viewdb())
user_collection, group_collection, eatery_collection, review_collection = asyncio.run(getdb())    