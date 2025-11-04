from db import searchdb
import asyncio

def get_eatery(EateryID: int):
    eatery = asyncio.run(searchdb("Eateries", "_id", EateryID))
    return eatery