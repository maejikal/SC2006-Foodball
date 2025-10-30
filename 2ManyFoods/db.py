import pymongo
import asyncio
client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
db = client["2ManyFoods_db"]

async def makedb():                                                                                     #DO NOT RUN UNLESS YOU NEED TO REDO THE DB
    global client, db                                          
    #clearing database
    print("Dropping all collections...")
    collection_names = await db.list_collection_names()
    for name in collection_names:
        await db.drop_collection(name)
        print(f"Dropped collection: {name}")
    print("All collections dropped.")
    user_collection = db.get_collection("Users")
    group_collection = db.get_collection("Groups")
    eatery_collection = db["Eateries"]
    review_collection = db.get_collection("Reviews")
    return (user_collection, group_collection, eatery_collection, review_collection)

async def insertdb(field: str, data: list):
    global client, db
    result = None
    for i in data:
        print(i)
    match field:
        case "Users":
            user_collection = db["Users"]
            result = await user_collection.insert_many(data)
        case "Groups":
            group_collection = db["Groups"]
            result = await group_collection.insert_many(data)
            pass
        case "Eateries":
            eatery_collection = db["Eateries"]
            result = await eatery_collection.insert_many(data)
        case "Reviews":
            review_collection = db["Reviews"]
            result = await review_collection.insert_many(data)
        case _:
            raise ValueError("Invalid collection name")
   
    return result

async def searchdb(collection: str,field: str, data: str):
    global client, db
    coll = db[collection]
    result = await coll.find_one({field:data})
    return result

async def updatedb(collection: str, identifierfield: str, identifier: str, field: str, data):
    global client, db
    coll = db[collection]
    result = await coll.update_one({identifierfield:identifier},{'$set': {field: data}})
    return result



async def viewdb():
    global client, db
    user_collection = db["Users"]
    group_collection = db["Groups"]
    eatery_collection = db["Eateries"]
    review_collection = db["Reviews"]
    async for i in user_collection.find():
        print(i)
    async for i in group_collection.find():
        print(i)
    async for i in eatery_collection.find():
        print(i)
    async for i in review_collection.find():
        print(i)

async def getdb():
    global client, db                                               

    user_collection = db.get_collection("Users")
    group_collection = db.get_collection("Groups")
    eatery_collection = db.get_collection("Eateries")
    review_collection = db.get_collection("Reviews")
    return (user_collection, group_collection, eatery_collection, review_collection)

async def deletedb(collection: str, identifierfield: str, identifier): #added to do stuff like delete group
    global client, db
    coll = db[collection]
    result = await coll.delete_one({identifierfield: identifier})
    return result


# asyncio.run(viewdb())
user_collection, group_collection, eatery_collection, review_collection = asyncio.run(getdb())   
