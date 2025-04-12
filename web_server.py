from flask import Flask, send_from_directory, render_template
import json

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")  # 自动访问 templates/index.html


if __name__ == '__main__':
    app.run('0.0.0.0', port=8080)
