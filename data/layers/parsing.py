import os
import fitz  # PyMuPDF
import pandas as pd

def extract_accident_data(pdf_path):
    """PDF 양식에서 사고 정보를 추출하는 함수"""
    doc = fitz.open(pdf_path)
    form_data = {}

    # PDF의 각 페이지에서 양식 필드(widget) 읽기
    for page in doc:  # 문서 내 모든 페이지 순회
        for widget in page.widgets():  # 각 페이지의 위젯(양식 필드) 읽기
            if widget.field_name:  # 필드명이 있는 경우
                field_name = widget.field_name.strip()
                field_value = widget.field_value.strip() if widget.field_value else "Unknown"
                form_data[field_name] = field_value

    # 필드명 매칭 (PDF 내부 필드명과 CSV 열 이름 연결)
    fields = {
        "Manufacturer's Name": ["MANufACTuRERS NAME", "Manufacturer"],
        "Business Name": ["BuSINESS NAME", "Business"],
        "Date of Accident": ["DATE Of ACCIDENT", "Date"],
        "Time of Accident": ["Time of Accident", "Time"],
        "Vehicle Year": ["VEhICLE YEAR", "Year"],
        "Make": ["MAkE"],
        "Model": ["MODEL"],
        "License Plate Number": ["LICENSE PLATE NuMBER", "Plate"],
        "Address of Accident": ["section 2  accident infoRmation.0", "Address"],
        "City": ["section 2  accident infoRmation.1.0"],
        "County": ["section 2  accident infoRmation.1.1.0"],
        "State": ["section 2  accident infoRmation.1.1.1.0"],
        "Zip Code": ["section 2  accident infoRmation.1.1.1.1", "Zip"],
        "Vehicle was (moving)": ["Moving"],
        "Vehicle was (stopped in traffic)": ["Stopped in Traffic"],
        "Involved in the Accident (pedestrian)": ["Pedestrian"],
        "Involved in the Accident (bicyclist)": ["Bicyclist"],
        "Involved in the Accident (undefined)": ["undefined"],
        "Involved in the Accident (other)": ["Other"],        
        "Number of Vehicles Involved": ["NuMBER Of VEhICLES INVOLVED"]
    }

    data = {}

    # PDF 양식에서 필드 값 찾기
    for key, possible_keys in fields.items():
        for pdf_field in possible_keys:
            if pdf_field in form_data:
                data[key] = form_data[pdf_field]  # 해당 필드의 값 저장
                break
        else:
            data[key] = "Unknown"  # 값이 없는 경우

    return data

def process_pdfs(input_folder, output_csv):
    """폴더 내 모든 PDF 파일을 처리하고 CSV 파일로 저장"""
    all_data = []
    
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".pdf"):
            pdf_path = os.path.join(input_folder, filename)
            print(f"Processing: {filename}")
            data = extract_accident_data(pdf_path)
            data["File Name"] = filename  # 파일 이름을 추가하여 출처 추적
            all_data.append(data)
    
    df = pd.DataFrame(all_data)
    df.to_csv(output_csv, index=False)
    print(f"Data saved to {output_csv}")

# 실행 코드
if __name__ == "__main__":
    input_folder = "./downloaded_pdfs"  # 실제 PDF 폴더 경로로 변경
    output_file = "accident_reports.csv"
    process_pdfs(input_folder, output_file)