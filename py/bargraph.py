import pandas as pd
import matplotlib.pyplot as plt
from matplotlib import rc
from matplotlib.font_manager import FontProperties
import os

# 1. 폰트 설정
font_path = "html/font/NanumSquareNeo-eHv.ttf"
font_prop = FontProperties(fname=font_path)

# 전역 폰트 설정
rc('font', family=font_prop.get_name())

# 2. CSV 파일 경로 및 출력 폴더 설정
file_path = "html/csv/pattern_artist_frequencies.csv"  # CSV 파일 경로
output_folder = "html/pattern_bar_graph"  # 그래프 저장 폴더
os.makedirs(output_folder, exist_ok=True)  # 폴더가 없으면 생성

# 3. 데이터 로드
try:
    data = pd.read_csv(file_path)
except FileNotFoundError:
    raise FileNotFoundError(f"CSV 파일을 찾을 수 없습니다: {file_path}")

# 데이터 유효성 검사
if 'pattern' not in data.columns or 'frequency' not in data.columns or 'artist' not in data.columns:
    raise ValueError("CSV 파일에 'pattern', 'artist', 'frequency' 열이 포함되어 있어야 합니다.")

# 4. 상위 5명의 작가를 문양별로 필터링
top_artists_by_pattern = data.groupby('pattern').apply(
    lambda x: x.nlargest(5, 'frequency')  # frequency 기준 상위 5명 선택
).reset_index(drop=True)

# 5. 문양별 막대 그래프 생성
patterns = top_artists_by_pattern['pattern'].unique()

for pattern in patterns:
    subset = top_artists_by_pattern[top_artists_by_pattern['pattern'] == pattern]
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # 폰트 설정
    ax.set_title(f"{pattern}을/를 그린 작가", fontproperties=font_prop, fontsize=24)
    
    # X축 라벨과 눈금 제거
    ax.set_xlabel("")  # X축 라벨 제거
    ax.set_xticks([])  # X축 눈금 제거
    
        # 테두리 제거
    for spine in ax.spines.values():
        spine.set_visible(False)  # 모든 테두리 비활성화
    
    
    # 고정된 막대 간격 계산
    max_bars = 5  # 고정 막대 개수
    y_positions = range(max_bars)  # 항상 5개로 고정
    frequencies = subset['frequency'].tolist()
    artists = subset['artist'].tolist()

    # 부족한 데이터를 채우기
    while len(frequencies) < max_bars:
        frequencies.append(0)  # 빈 데이터를 0으로 채우기
        artists.append("")  # 빈 이름 추가
    
    ax.barh(
        y=y_positions, width=frequencies, height=0.8, color="skyblue", edgecolor="black"
    )
    
    # 막대 끝에 빈도수 표시
    for i, freq in enumerate(frequencies):
        ax.text(freq + 0.2, i, f'{int(freq)}', va='center', fontproperties=font_prop, fontsize=18)
    
    # y축 설정
    ax.set_yticks(y_positions)
    ax.set_yticklabels(artists, fontproperties=font_prop, fontsize=20)
    ax.set_xlim(0, max(frequencies) + 2)
    ax.invert_yaxis()  # y축을 위에서 아래로 정렬
    plt.tight_layout()
    
    # 그래프 저장
    output_file = os.path.join(output_folder, f"{pattern}_bar_graph.png")
    plt.savefig(output_file, transparent=True, dpi=300, bbox_inches='tight')  # PNG 파일로 저장
    plt.close()

print(f"그래프가 '{output_folder}'에 저장되었습니다.")
