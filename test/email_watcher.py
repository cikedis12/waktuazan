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

            # Step 1: Capture snapshot from camera
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

            # Step 2: Load known faces and recognize
            try:
                known_encodings, known_names = load_known_faces(KNOWN_FACES_DIR)
                name = recognize_face(SNAPSHOT_SAVE_PATH, known_encodings, known_names)
                print(f"Recognized: {name}")
            except Exception as e:
                print("Face recognition error:", e)
                name = "Unknown"

            # Step 3: Update welcome page
            try:
                update_welcome_page(name)
                print("Welcome page updated.")
            except Exception as e:
                print("Failed to update welcome page:", e)

            # Step 4: Trigger Flask redirect
            try:
                with open("recognized_flag.txt", "w") as flag:
                    flag.write("1")
                print("Flag created for redirect.")
            except Exception as e:
                print("Failed to create flag:", e)
                return

            # Step 5: Wait and cleanup
            time.sleep(12)
            try:
                if os.path.exists("recognized_flag.txt"):
                    os.remove("recognized_flag.txt")
                    print("Flag removed. Returning to index page.")
            except Exception as e:
                print("Failed to remove flag:", e)

if __name__ == "__main__":
    print("Watching for email notifications in:", EMAIL_WATCH_DIR)
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
