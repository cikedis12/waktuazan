import face_recognition, os

def load_known_faces():
    known_encodings, known_names = [], []
    for file in os.listdir("known_users"):
        path = os.path.join("known_users", file)
        image = face_recognition.load_image_file(path)
        enc = face_recognition.face_encodings(image)
        if enc:
            known_encodings.append(enc[0])
            known_names.append(os.path.splitext(file)[0])
    return known_encodings, known_names

def recognize_user(image_path):
    known_encodings, known_names = load_known_faces()
    unknown_img = face_recognition.load_image_file(image_path)
    unknown_enc = face_recognition.face_encodings(unknown_img)
    if not unknown_enc:
        return None
    for known, name in zip(known_encodings, known_names):
        if face_recognition.compare_faces([known], unknown_enc[0])[0]:
            return name
    return None
