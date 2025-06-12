import time
import os
import requests
from config import *
from face_recognizer import load_known_faces, recognize_face
from update_welcome import update_welcome_page
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class EmailHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.src_path.endswith(".eml"):
            print("New email received, processing...")
            response = requests.get(CAMERA_SNAPSHOT_URL, auth=(CAMERA_USERNAME, CAMERA_PASSWORD))
            if response.status_code == 200:
                with open(SNAPSHOT_SAVE_PATH, "wb") as f:
                    f.write(response.content)
                print("Snapshot saved.")
                known_encodings, known_names = load_known_faces(KNOWN_FACES_DIR)
                name = recognize_face(SNAPSHOT_SAVE_PATH, known_encodings, known_names)
                print(f"Recognized: {name}")
                update_welcome_page(name)

if __name__ == "__main__":
    print("Watching for email notifications...")
    event_handler = EmailHandler()
    observer = Observer()
    observer.schedule(event_handler, EMAIL_WATCH_DIR, recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
