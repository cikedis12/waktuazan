from flask import Flask, render_template, redirect
import os

app = Flask(__name__)

@app.route('/')
def index():
    # Check if welcome trigger flag exists
    if os.path.exists('recognized_flag.txt'):
        return redirect('/welcome')
    return render_template('index.html')

@app.route('/welcome')
def welcome():
    return render_template('welcome.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)