from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/')
def serve_index():
    # index.html을 루트 URL에서 반환
    return send_from_directory('static', '/html/home.html')

if __name__ == '__main__':
    app.run(port=5500)  # Flask 서버를 5500번 포트에서 실행
