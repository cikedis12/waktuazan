import face_recognition
import os

def load_known_faces(known_dir):
    known_encodings = []
    known_names = []
    for file in os.listdir(known_dir):
        path = os.path.join(known_dir, file)
        image = face_recognition.load_image_file(path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_encodings.append(encodings[0])
            known_names.append(os.path.splitext(file)[0])
    return known_encodings, known_names

def recognize_face(image_path, known_encodings, known_names):
    image = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(image)
    face_encodings = face_recognition.face_encodings(image, face_locations)

    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_encodings, face_encoding)
        if True in matches:
            first_match_index = matches.index(True)
            return known_names[first_match_index]
    return "Unknown"
