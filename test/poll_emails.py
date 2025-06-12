import time
import os
import requests
from config import *
from face_recognizer import load_known_faces, recognize_face
from update_welcome import update_welcome_page

PROCESSED = set()

def process_eml_file(eml_path):
    print(f"New email detected: {eml_path}")
    try:
        response = requests.get(CAMERA_SNAPSHOT_URL, auth=(CAMERA_USERNAME, CAMERA_PASSWORD))
        if response.status_code == 200:
            with open(SNAPSHOT_SAVE_PATH, "wb") as f:
                f.write(response.content)
            print("Snapshot saved.")
        else:
            print("Failed to capture snapshot. Status code:", response.status_code)
            return
    except Exception as e:
        print("Error fetching snapshot:", e)
        return

    try:
        known_encodings, known_names = load_known_faces(KNOWN_FACES_DIR)
        name = recognize_face(SNAPSHOT_SAVE_PATH, known_encodings, known_names)
        print(f"Recognized: {name}")
    except Exception as e:
        print("Face recognition error:", e)
        name = "Unknown"

    update_welcome_page(name)

    with open("recognized_flag.txt", "w") as flag:
        flag.write("1")
    print("Flag created for redirect.")
    time.sleep(12)
    if os.path.exists("recognized_flag.txt"):
        os.remove("recognized_flag.txt")
        print("Flag removed. Returning to index page.")

def poll_directory():
    print("Polling for new emails every 3 seconds...")
    while True:
        try:
            files = [f for f in os.listdir(EMAIL_WATCH_DIR) if f.endswith('.eml')]
            for f in files:
                full_path = os.path.join(EMAIL_WATCH_DIR, f)
                if full_path not in PROCESSED:
                    process_eml_file(full_path)
                    PROCESSED.add(full_path)
        except Exception as e:
            print("Error scanning email folder:", e)
        time.sleep(3)

if __name__ == "__main__":
    poll_directory()
