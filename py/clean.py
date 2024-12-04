import json
import re

# JSON 파일 경로 설정
input_file = "py/artwork_link.json"
output_file = "py/cleaned_artwork_link.json"

# 비가시 문자 제거 함수
def remove_invisible_chars(value):
    if isinstance(value, str):
        return re.sub(r'[^\S\n]+', '', value)  # 비가시 문자 제거 (공백 제외)
    elif isinstance(value, dict):
        return {remove_invisible_chars(k): remove_invisible_chars(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [remove_invisible_chars(item) for item in value]
    else:
        return value

# JSON 파일 읽기
with open(input_file, "r", encoding="utf-8") as file:
    data = json.load(file)

# 데이터 정리
cleaned_data = remove_invisible_chars(data)

# 정리된 데이터 저장
with open(output_file, "w", encoding="utf-8") as file:
    json.dump(cleaned_data, file, ensure_ascii=False, indent=2)

print("모든 비가시 문자를 제거하고 JSON 파일 저장 완료!")
