import pandas as pd

# 파일 경로 지정
file_path = "html/artist_list.xlsx"  # 실제 파일 경로를 여기에 입력하세요

# 1. 'artwork' 시트 데이터 불러오기
artwork_data = pd.read_excel(file_path, sheet_name='artwork')

# 2. 작가와 문양 열을 ',' 기준으로 분리 및 행 확장
artwork_data['artist_list'] = artwork_data['artwork_artist'].str.split(',')
artwork_data['type_list'] = artwork_data['artwork_type'].str.split(',')

# 3. 행 확장
expanded_artwork_data = artwork_data.explode('artist_list').explode('type_list')

# 4. 문자열 정리 (공백 제거)
expanded_artwork_data['artist_list'] = expanded_artwork_data['artist_list'].str.strip()
expanded_artwork_data['type_list'] = expanded_artwork_data['type_list'].str.strip()

# 5. 문양별 작가 빈도 계산
pattern_artist_frequencies = (
    expanded_artwork_data.groupby(['type_list', 'artist_list'])
    .size()
    .reset_index(name='frequency')
    .rename(columns={'type_list': 'type', 'artist_list': 'artist'})
)

# 6. 결과를 CSV 파일로 저장
output_file_path = "html/type_artist_frequencies.csv"  # 저장할 파일 경로
pattern_artist_frequencies.to_csv(output_file_path, index=False, encoding="utf-8-sig")

print(f"파일이 저장되었습니다: {output_file_path}")
