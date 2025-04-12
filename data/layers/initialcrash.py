import pandas as pd
from google.cloud import firestore
from datetime import datetime
import json
import os

# 🔐 Authentication
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./robotaxi-incidents-mgmt-sys-14dc5a9a79fa.json"

# 📁 Open GeoJSON
with open("./AVcrash3.geojson", "r", encoding="utf-8") as f:
    geojson_data = json.load(f)

# Initialize Firestore Client
db = firestore.Client()

# Collection name
collection_name = "av_crash_data"

# Save each incident feature as a document
for index, feature in enumerate(geojson_data["features"]):
    doc_id = f"record_{index+1}"
    
    properties = feature["properties"]
    geometry = feature["geometry"]
    coordinates = geometry.get("coordinates", [None, None])
    
    # Extract longitude and latitude
    longitude, latitude = coordinates  # GeoJSON [lon, lat] order

    # Convert Accident_Date_Time text to datetime
    if "Accident_Date_Time" in properties and properties["Accident_Date_Time"]:
        try:
            properties["Accident_Date_Time"] = datetime.strptime(
                properties["Accident_Date_Time"],
                "%Y-%m-%dT%H:%M:%SZ"  
            )
        except Exception as e:
            print(f"Failed to convert (record {doc_id}): {e}")
            properties["Accident_Date_Time"] = None  

    # Firestore에 저장할 dict 구조
    data = {
        **properties,
        "geometry": {
            "latitude": latitude,
            "longitude": longitude
        }
    }

    db.collection(collection_name).document(doc_id).set(data)

print("✅ GeoJSON 데이터 업로드 완료!")