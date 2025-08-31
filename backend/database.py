from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

# Force load the .env file from the same folder as this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

# Read MongoDB URL from .env
MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("⚠️ MONGO_URL is missing from .env")

print(f"Connecting to MongoDB...")

# Initialize MongoDB client
client = AsyncIOMotorClient(MONGO_URL)
db = client["notes_app"]

# Convert ObjectId to string
def serialize_dict(doc):
    return {
        i: str(doc[i]) if isinstance(doc[i], ObjectId) else doc[i] for i in doc
    }
