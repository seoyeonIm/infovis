import pandas as pd
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from random import randint
import os

# 1. 파스텔 톤 색상 함수
def custom_color_func(word, font_size, position, orientation, random_state=None, **kwargs):
    hue = randint(0, 360)  # 색상 (0-360 범위)
    saturation = randint(60, 80)  # 채도: 낮아야 부드러운 파스텔 느낌
    lightness = randint(50, 70)  # 밝기: 높아야 밝은 톤
    return f"hsl({hue}, {saturation}%, {lightness}%)"

# 1. 데이터 불러오기
file_path = "html/csv/filtered_pattern_combination.csv"  # 데이터 파일 경로
data = pd.read_csv(file_path, encoding="utf-8-sig").dropna(subset=['중심 문양', '연관 문양', '빈도수'])

# 2. 저장할 디렉터리 생성
output_dir = "html/pattern_combi_wordcloud"
os.makedirs(output_dir, exist_ok=True)

# 3. 중심 문양별 워드클라우드 생성
center_patterns = data['중심 문양'].unique()  # 중심 문양 목록 가져오기

for center_pattern in center_patterns:
    try:
        # 중심 문양별 데이터 필터링
        filtered_data = data[data['중심 문양'] == center_pattern]
        word_frequencies = dict(zip(filtered_data['연관 문양'], filtered_data['빈도수']))

        # 워드클라우드 생성 (파스텔 톤 적용)
        wc = WordCloud(
            width=800,
            height=800,
            background_color=None,  # 배경 투명
            mode="RGBA",            # 알파 채널 활성화
            font_path='html/font/NanumSquareNeo-eHv.ttf',  # 폰트 경로
            contour_width=0,        # 외곽선 없음
            color_func=custom_color_func  # 사용자 정의 파스텔 톤 색상 함수
        ).generate_from_frequencies(word_frequencies)

        # 저장
        output_file = os.path.join(output_dir, f"{center_pattern}_wordcloud.png")
        plt.figure(figsize=(8, 8))
        plt.imshow(wc, interpolation="bilinear")
        plt.axis("off")
        plt.savefig(output_file, format="png", dpi=300, transparent=True)
        plt.close()
    except Exception as e:
        print(f"'{center_pattern}' 워드클라우드 생성 중 오류 발생: {e}")

print(f"모든 워드클라우드가 {output_dir} 디렉터리에 저장되었습니다.")
