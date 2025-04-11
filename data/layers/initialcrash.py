import pandas as pd
from google.cloud import firestore
from datetime import datetime
import json
import os

# 🔐 인증
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/yjmark/Documents/Practicum_Robotaxi/robotaxi-incident-webapp/robotaxi-webapp/data/layers/robotaxi-incidents-mgmt-sys-14dc5a9a79fa.json"

# 📁 GeoJSON 파일 열기
with open("/Users/yjmark/Documents/Practicum_Robotaxi/robotaxi-webapp/data/layers/AVcrash3.geojson", "r", encoding="utf-8") as f:
    geojson_data = json.load(f)

# 🔥 Firestore 클라이언트 초기화
db = firestore.Client()

# 📂 저장할 컬렉션 이름
collection_name = "av_crash_data"

# 📝 각 Feature를 문서로 저장
for index, feature in enumerate(geojson_data["features"]):
    doc_id = f"record_{index+1}"
    
    properties = feature["properties"]
    geometry = feature["geometry"]
    coordinates = geometry.get("coordinates", [None, None])
    
    # longitude, latitude 추출
    longitude, latitude = coordinates  # GeoJSON은 [lon, lat] 순서임

    # Accident_Date_Time 문자열이 있다면 datetime으로 변환
    if "Accident_Date_Time" in properties and properties["Accident_Date_Time"]:
        try:
            properties["Accident_Date_Time"] = datetime.strptime(
                properties["Accident_Date_Time"],
                "%Y-%m-%dT%H:%M:%SZ"  # ← 여기에 실제 포맷 맞게 입력
            )
        except Exception as e:
            print(f"⚠️ 날짜 변환 실패 (record {doc_id}): {e}")
            properties["Accident_Date_Time"] = None  # 또는 원래 문자열 유지해도 OK

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