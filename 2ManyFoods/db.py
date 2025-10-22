import pymongo
import asyncio
async def makedb():                                                                                     #DO NOT RUN UNLESS YOU NEED TO REDO THE DB
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
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
    eatery_collection = db["Eateries"]
    review_collection = db.get_collection("Reviews")
    await client.close()
    return (user_collection, group_collection, eatery_collection, review_collection)

async def insertdb(field: str, data: list):
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
    db = client["2ManyFoods_db"]
    result = "Database successfully updated!"
    for i in data:
        print(i)
    match field:
        case "Users":
            user_collection = db["Users"]
            await user_collection.insert_many(data)
        case "Groups":
            group_collection = db["Groups"]
            await group_collection.insert_many(data)
            pass
        case "Eateries":
            eatery_collection = db["Eateries"]
            # print(data)
            await eatery_collection.insert_many(data)
        case "Reviews":
            review_collection = db["Reviews"]
            await review_collection.insert_many(data)
        case _:
            result = "Failed to update Database!"
    await client.close()
    return result

async def searchdb(collection: str,field: str, data: str):
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
    db = client["2ManyFoods_db"]
    coll = db[collection]
    result = await coll.find_one({field:data})
    return result

async def updatedb(collection: str, identifierfield: str, identifier: str, field: str, data: str):
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
    db = client["2ManyFoods_db"]
    coll = db[collection]
    result = await coll.update_one({identifierfield:identifier},{field:data})
    return result



async def viewdb():
    client = pymongo.AsyncMongoClient('mongodb://localhost:27017')
    db = client["2ManyFoods_db"]
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
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
    db = client["2ManyFoods_db"]                                                

    user_collection = db.get_collection("Users")
    group_collection = db.get_collection("Groups")
    eatery_collection = db.get_collection("Eateries")
    review_collection = db.get_collection("Reviews")
    await client.close()
    return (user_collection, group_collection, eatery_collection, review_collection)

# asyncio.run(viewdb())
user_collection, group_collection, eatery_collection, review_collection = asyncio.run(getdb())   
