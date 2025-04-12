import pandas as pd
import re
import json
from shapely.geometry import Polygon, mapping

# Load CSV
df = pd.read_csv("./data/layers/CBG_selected_0327.csv")

# Function to convert the string of coordinates into a valid GeoJSON Polygon
def parse_geometry(geometry_str):
    try:
        # 문자열 안에서 숫자만 추출 (소수 포함 음수 포함)
        numbers = list(map(float, re.findall(r"-?\d+\.\d+", geometry_str)))

        if len(numbers) % 2 != 0:
            print("❗ 경도/위도 개수 불일치:", geometry_str)
            return None

        mid = len(numbers) // 2
        longitudes = numbers[:mid]
        latitudes = numbers[mid:]

        coords = list(zip(longitudes, latitudes))
        polygon = Polygon(coords)
        return mapping(polygon)

    except Exception as e:
        print("⚠️ Error parsing geometry:", e)
        return None

df = df.astype(object).where(pd.notnull(df), None)

# Build GeoJSON FeatureCollection
features = []
for _, row in df.iterrows():
    geom = parse_geometry(row["geometry"])
    if geom:
        properties = row.drop(labels=["geometry"]).to_dict()
        feature = {
            "type": "Feature",
            "geometry": geom,
            "properties": properties
        }
        features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

# Save to file
geojson_path = "./data/layers/cbg_data.geojson"
with open(geojson_path, "w") as f:
    json.dump(geojson, f, indent=2, allow_nan=False)

geojson_path