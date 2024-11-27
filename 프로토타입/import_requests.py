import requests
import csv

# GitHub 사용자명, 리포지토리 이름, 브랜치 설정
USERNAME = 'seoyeonIm'  # 본인의 GitHub 사용자명
REPO = 'prototype'      # 리포지토리 이름
BRANCH = 'main'                    # 브랜치 이름

# GitHub API를 통해 파일 목록 가져오기
def get_image_urls():
    url = f'https://api.github.com/repos/{USERNAME}/{REPO}/git/trees/{BRANCH}?recursive=1'
    response = requests.get(url)
    tree = response.json()['tree']
    
    image_urls = []
    for item in tree:
        if item['path'].endswith(('.jpg')):  # 이미지 파일 필터링
            image_url = f'https://raw.githubusercontent.com/{USERNAME}/{REPO}/{BRANCH}/{item["path"]}'
            image_urls.append(image_url)
    
    return image_urls

# CSV 파일로 저장
def save_to_csv(urls):
    with open('image_urls.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Image URL'])
        for url in urls:
            writer.writerow([url])

# 실행
image_urls = get_image_urls()
save_to_csv(image_urls)
