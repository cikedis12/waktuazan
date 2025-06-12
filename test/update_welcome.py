from config import TEMPLATE_PATH
import sys

def update_welcome_page(username):
    with open(TEMPLATE_PATH, "r") as file:
        html = file.read()
    html = html.replace("USERNAME", username)
    with open(TEMPLATE_PATH, "w") as file:
        file.write(html)

if __name__ == "__main__":
    update_welcome_page(sys.argv[1])
