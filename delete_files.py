import os

# 삭제 작업을 시작할 최상위 디렉토리 지정
root_dir = "./artwork_images"

for dirpath, dirnames, filenames in os.walk(root_dir):
    for file in filenames:
        # 파일 경로 구성
        file_path = os.path.join(dirpath, file)

        # _0000.jpg로 끝나지 않는 파일만 삭제
        if not file.endswith("_0000.jpg"):
            try:
                os.remove(file_path)
                print(f"Deleted: {file_path}")
            except Exception as e:
                print(f"Failed to delete {file_path}: {e}")
