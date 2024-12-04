import pandas as pd
from itertools import combinations
from collections import Counter

# 1. 입력 파일 설정
file_path = "html/artifact_list.xlsx"  # 작업 환경에서 사용자가 불러올 파일 경로
sheet_name = "count_combination"  # 데이터가 있는 시트 이름

# 2. 데이터 불러오기
count_combination_data = pd.read_excel(file_path, sheet_name=sheet_name)

# 3. '문양' 열 데이터 전처리
pattern_data = count_combination_data['문양'].dropna()
pattern_combinations = pattern_data.str.split(',').dropna()

# 4. 문양 조합 생성 및 빈도 계산
co_occurrence_pairs = []
for patterns in pattern_combinations:
    trimmed_patterns = [p.strip() for p in patterns if isinstance(p, str)]
    co_occurrence_pairs.extend(combinations(trimmed_patterns, 2))

co_occurrence_counter = Counter(co_occurrence_pairs)

# 5. 중복된 조합 제거 (정렬 기준으로)
unique_co_occurrence_counter = Counter()
for (pattern1, pattern2), freq in co_occurrence_counter.items():
    sorted_pair = tuple(sorted([pattern1, pattern2]))  # 조합 정렬로 중복 제거
    unique_co_occurrence_counter[sorted_pair] += freq

# 6. 전체 문양별 데이터 생성
pattern_frequency = pattern_data.str.split(',').explode().str.strip().value_counts()
all_pattern_data = []

for target_pattern in pattern_frequency.index:
    relevant_pairs = [(pair, freq) for pair, freq in unique_co_occurrence_counter.items() if target_pattern in pair]
    
    # 데이터 정리
    relevant_data = {}
    for pair, freq in relevant_pairs:
        other_pattern = pair[0] if pair[1] == target_pattern else pair[1]
        relevant_data[other_pattern] = freq
    
    # 중심 문양의 전체 빈도 추가
    relevant_data[target_pattern] = sum(freq for _, freq in relevant_pairs)
    
    # 결과 데이터 생성
    for other_pattern, freq in relevant_data.items():
        all_pattern_data.append({
            "중심 문양": target_pattern,
            "연관 문양": other_pattern,
            "빈도수": freq
        })

# 7. DataFrame 생성 및 CSV 파일로 저장
all_pattern_df = pd.DataFrame(all_pattern_data)
output_file_path = "pattern_combination.csv"  # 저장할 파일 경로
all_pattern_df.to_csv(output_file_path, index=False, encoding="utf-8-sig")

print(f"파일이 저장되었습니다: {output_file_path}")
