import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib import font_manager
from xml.etree.ElementTree import parse, Element, SubElement, ElementTree

# 폰트 파일 경로 지정
font_path = "/mnt/c/Users/admin/Desktop/프로토타입/prototype/html/font/NanumSquareNeo-cBd.ttf"  # 여기에 실제 폰트 파일 경로를 입력하세요
font_prop = font_manager.FontProperties(fname=font_path)

# 데이터 생성 및 처리
data = {
    "person_name": ["이명기", "김홍도", "정홍래", "조속", "신명연", "강세황", "이인문", "한용간", "조영석", "안중식", "이인상", 
                    "유숙", "신윤복", "최석환", "윤두서", "김득신", "김후신", "윤덕희", "남계우", "정선", "심사정", "김익주", 
                    "이하곤", "신위", "장승업", "전기", "정조", "서병건", "허련", "허백련", "김수철", "조중묵", "최북", 
                    "조석진", "허필", "허형", "백은배", "김응환", "이재관", "김석신", "김정희", "정수영", "이방운", 
                    "윤제홍", "조희룡", "신익성", "허목", "이우", "김유성", "이유신", "유재소"],
    "person_dateofbirth": ["1756-01-01", "1745-01-01", "1720-01-01", "1595-01-01", "1808-01-01", "1713-01-01", 
                           "1745-01-01", "1783-01-01", "1686-01-01", "1861-01-01", "1710-01-01", "1827-01-01", 
                           "1758-01-01", "1808-01-01", "1668-01-01", "1754-01-01", "1735-01-01", "1685-01-01", 
                           "1811-01-01", "1676-01-01", "1707-01-01", "1684-01-01", "1677-01-01", "1769-01-01", 
                           "1843-01-01", "1825-01-01", "1776-01-01", "1850-01-01", "1808-01-01", "1891-01-01", 
                           "1829-01-01", "1820-01-01", "1712-01-01", "1853-01-01", "1709-01-01", "1862-01-01", 
                           "1820-01-01", "1742-01-01", "1783-01-01", "1758-01-01", "1786-01-01", "1743-01-01", 
                           "1761-01-01", "1764-01-01", "1789-01-01", "1588-01-01", None, "1637-01-01", 
                           "1725-01-01", None, "1829-01-01"],
    "person_dateofdeath": ["1813-01-01", "1806-01-01", "1760-01-01", "1668-01-01", "1886-01-01", "1791-01-01", 
                           "1824-01-01", "1829-01-01", "1761-01-01", "1919-01-01", "1760-01-01", "1873-01-01", 
                           "1798-01-01", "1848-01-01", "1715-01-01", "1822-01-01", "1775-01-01", "1776-01-01", 
                           "1888-01-01", "1759-01-01", "1769-01-01", "1724-01-01", "1724-01-01", "1845-01-01", 
                           "1897-01-01", "1854-01-01", "1800-01-01", "1890-01-01", "1983-01-01", "1977-01-01", 
                           "1862-01-01", "1888-01-01", "1786-01-01", "1920-01-01", "1761-01-01", "1938-01-01", 
                           "1901-01-01", "1789-01-01", "1849-01-01", "1798-01-01", "1856-01-01", "1831-01-01", 
                           "1815-01-01", "1840-01-01", "1866-01-01", "1644-01-01", None, "1693-01-01", 
                           "1765-01-01", None, "1911-01-01"]
}

# DataFrame 생성 및 날짜 변환
artist_data = pd.DataFrame(data)
artist_data['person_dateofbirth'] = pd.to_datetime(artist_data['person_dateofbirth'], errors='coerce')
artist_data['person_dateofdeath'] = pd.to_datetime(artist_data['person_dateofdeath'], errors='coerce')

# 타임라인 그래프 생성 및 저장
fig, ax = plt.subplots(figsize=(24, 36))

# 막대 간 간격을 늘리기 위해 배수 조정
spacing_factor = 10  # 막대 간 간격 조절을 위한 배수
lines = []  # line 정보를 저장할 리스트

for idx, row in artist_data.dropna(subset=['person_dateofbirth', 'person_dateofdeath']).iterrows():
    x_position = idx * spacing_factor  # 인덱스를 배수로 곱하여 간격 늘림
    y1 = row['person_dateofbirth']
    y2 = row['person_dateofdeath']
    name = row['person_name']
    
    # 선 그리기
    ax.plot([x_position, x_position], [y1, y2], marker='o', color='#28B36A', linewidth=3)  # 막대 굵기 조정
    ax.text(x_position, y1, name, ha='center', fontsize=14, fontproperties=font_prop, color='black')  # 텍스트 크기

    # <line> 요소로 변환하기 위해 저장
    lines.append({'x1': x_position, 'y1': y1, 'x2': x_position, 'y2': y2, 'name': name})

# Y축 설정
ax.yaxis.set_major_locator(mdates.YearLocator(20))  # 20년 간격으로 설정
ax.yaxis.set_major_formatter(mdates.DateFormatter('%Y'))
ax.set_ylabel("Year", fontproperties=font_prop, color='#28B36A', fontsize=13.5)

# X축 숨기기 및 Y축 역방향 설정
ax.xaxis.set_visible(False)
plt.gca().invert_yaxis()

# 그래프를 SVG로 저장
svg_filename = "artist_timeline_adjusted.svg"
plt.savefig(svg_filename, format='svg', bbox_inches='tight', transparent=True)

# SVG 파일에 <line> 요소 추가
tree = parse(svg_filename)
root = tree.getroot()

# SVG 네임스페이스 지정
namespace = {'svg': 'http://www.w3.org/2000/svg'}

# <line> 요소를 추가할 그룹 생성
group = Element('g', {'id': 'interactive-lines'})

for line in lines:
    line_element = SubElement(group, 'line', {
        'x1': str(line['x1']),
        'y1': str(line['y1'].year),  # 연도로 변환
        'x2': str(line['x2']),
        'y2': str(line['y2'].year),  # 연도로 변환
        'stroke': '#28B36A',
        'stroke-width': '2',
        'data-name': line['name']
    })

# 기존 SVG의 <svg> 태그에 <g> 추가
svg_root = root.find('.//svg:g', namespace)
svg_root.append(group)

# 수정된 SVG 저장
tree.write(svg_filename)

print(f"SVG 파일이 성공적으로 저장되었습니다: {svg_filename}")
