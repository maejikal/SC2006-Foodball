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
    result = None
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
   
    await client.close()
    return result

async def searchdb(collection: str,field: str, data=None):
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
    db = client["2ManyFoods_db"]
    coll = db[collection]
    # If a dict is passed, use it directly
    if isinstance(field, dict): # for searching with multiple fields aka using 2 fields as pk, like in review
        query = field
    else:
        query = {field: data}
    result = await coll.find_one(query)
    return result

async def searchdb_all(collection: str, field: str, data=None):
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
    db = client["2ManyFoods_db"]
    coll = db[collection]
    if isinstance(field, dict):
        query = field
    else:
        query = {field: data}
    result = await coll.find(query).to_list(None)  # Returns ALL documents
    return result

# async def searchdb_dict(collection: str,field: str, data: dict):
#     client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
#     db = client["2ManyFoods_db"]
#     coll = db[collection]
#     result = await coll.find_one({field:data})
#     return result
'''
async def updatedb(collection: str, identifierfield: str, identifier: str, field: str, data):
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
    db = client["2ManyFoods_db"]
    coll = db[collection]
    result = await coll.update_one({identifierfield:identifier},{'$set': {field: data}})
    await client.close()
    return result
'''
async def updatedb(collection: str, identifierfield: str, identifier: str, field: str, data):
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
    db = client["2ManyFoods_db"]
    coll = db[collection]
    
    print(f"\n=== UPDATEDB DEBUG ===")
    print(f"Collection: {collection}")
    print(f"Identifier field: {identifierfield}")
    print(f"Identifier value: {identifier}")
    print(f"Field to update: {field}")
    print(f"New data (first 50 chars): {str(data)[:50]}...")
    
    # Check if document exists before update
    existing = await coll.find_one({identifierfield: identifier})
    print(f"Document exists: {existing is not None}")
    if existing:
        print(f"Current value of {field}: {str(existing.get(field, 'N/A'))[:50]}...")
    
    # Perform update
    result = await coll.update_one(
        {identifierfield: identifier},
        {'$set': {field: data}}
    )
    
    print(f"Matched count: {result.matched_count}")
    print(f"Modified count: {result.modified_count}")
    
    # Verify update
    updated = await coll.find_one({identifierfield: identifier})
    if updated:
        print(f"New value of {field}: {str(updated.get(field, 'N/A'))[:50]}...")
    
    await client.close()
    print(f"=== END UPDATEDB DEBUG ===\n")
    
    return result

async def viewdb():
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017) 
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
    return (user_collection, group_collection, eatery_collection, review_collection)

async def deletedb(collection: str, identifierfield: str, identifier): #added to do stuff like delete group, user, review directly from collection
    client = pymongo.AsyncMongoClient('127.0.0.1', 27017)              # not for removing from lists inside documents. e.g. removing review id from user reviews list
    db = client["2ManyFoods_db"]
    coll = db[collection]
    result = await coll.delete_one({identifierfield: identifier})
    await client.close()
    return result


# asyncio.run(viewdb())
user_collection, group_collection, eatery_collection, review_collection = asyncio.run(getdb())   
