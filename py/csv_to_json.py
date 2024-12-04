import csv
import json

# CSV 파일 경로와 JSON 파일 경로
csv_file_path = "artist.csv"
json_file_path = "artist.json"

# CSV를 JSON으로 변환
with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    data = [row for row in csv_reader]

with open(json_file_path, mode='w', encoding='utf-8') as json_file:
    json.dump(data, json_file, indent=4, ensure_ascii=False)  # ensure_ascii=False로 한글 지원
