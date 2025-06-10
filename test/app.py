from flask import Flask, render_template
import cv2, os
from datetime import datetime
from recognizer import recognize_user

app = Flask(__name__)
PHOTO_DIR = 'static/photos'
CAMERA_RTSP = "rtsp://admin:password@192.168.1.10:554/cam/realmonitor?channel=1&subtype=0"

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/capture')
def capture_and_recognize():
    os.makedirs(PHOTO_DIR, exist_ok=True)
    cap = cv2.VideoCapture(CAMERA_RTSP)
    ret, frame = cap.read()
    cap.release()
    if not ret:
        return "Camera Error"

    filename = datetime.now().strftime("%Y%m%d_%H%M%S.jpg")
    filepath = os.path.join(PHOTO_DIR, filename)
    cv2.imwrite(filepath, frame)

    username = recognize_user(filepath)
    if username:
        return render_template("welcome.html", username=username, photo=filename)
    else:
        return "Accessed: Face not recognized", 403

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
