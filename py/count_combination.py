import pandas as pd
from itertools import combinations
from collections import Counter

# 파일 경로를 설정하고 데이터를 불러옵니다.
file_path = "html/artifact_list.xlsx"  # 업로드한 파일 경로로 변경하세요.
sheet_name = "count_combination"

# 데이터 읽기
count_combination_data = pd.read_excel(file_path, sheet_name=sheet_name)

# '문양' 열에서 데이터를 추출합니다.
pattern_data = count_combination_data['문양'].dropna()

# 문양 데이터를 분리하고 평탄화합니다.
split_patterns = pattern_data.str.split(',').explode().str.strip()

# 빈도를 계산합니다.
pattern_frequency = split_patterns.value_counts()

# 패턴 조합의 동시 출현 빈도 계산
pattern_combinations = pattern_data.str.split(',').dropna()
co_occurrence_pairs = []

for patterns in pattern_combinations:
    trimmed_patterns = [p.strip() for p in patterns if isinstance(p, str)]
    co_occurrence_pairs.extend(combinations(trimmed_patterns, 2))

co_occurrence_counter = Counter(co_occurrence_pairs)

# 전체 문양별 연관 데이터를 저장할 리스트
all_pattern_data = []

# 모든 문양에 대해 데이터 추출
for target_pattern in pattern_frequency.index:
    relevant_pairs = [(pair, freq) for pair, freq in co_occurrence_counter.items() if target_pattern in pair]
    
    # 데이터 정리
    relevant_data = {}
    for pair, freq in relevant_pairs:
        other_pattern = pair[0] if pair[1] == target_pattern else pair[1]
        relevant_data[other_pattern] = freq
    
    # 중심 문양의 전체 빈도 추가
    relevant_data[target_pattern] = sum(freq for _, freq in relevant_pairs)
    
    # 결과를 리스트에 추가
    for other_pattern, freq in relevant_data.items():
        all_pattern_data.append({
            "중심 문양": target_pattern,
            "연관 문양": other_pattern,
            "빈도수": freq
        })

# DataFrame으로 변환
all_pattern_df = pd.DataFrame(all_pattern_data)

# CSV 파일로 저장
output_file_path = "전체_문양별_연관_데이터.csv"
all_pattern_df.to_csv(output_file_path, index=False, encoding="utf-8-sig")

print(f"파일이 저장되었습니다: {output_file_path}")
