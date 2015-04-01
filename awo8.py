from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify

import os
import data_parser
import pandas as pd
from pprint import pprint

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/ajax_get_data', methods=["GET", "POST"])
def ajax_get_box_data():
    if request.method == 'POST':
        df = pd.read_json(os.path.join(app.root_path,
                                       './static/data/sample.json'))
        data = data_parser.parse(df)

        res = jsonify(result=data)
        return res


@app.route('/ajax_get_data2', methods=["GET", "POST"])
def ajax_get_box_data2():
    if request.method == 'POST':
        df = pd.read_json(os.path.join(app.root_path,
                                       './static/data/sample.json'))
        data = data_parser.parse2(df)

        print
        res = jsonify(result=data)
        return res


@app.route('/ajax_get_line_data', methods=["GET", "POST"])
def ajax_get_line_data():
    if request.method == 'POST':
        df = pd.read_json(os.path.join(app.root_path,
                                       './static/data/sample.json'))
        data = data_parser.line_nvd3_data(df)
        res = jsonify(result=data)
        return res


app.debug = True

if __name__ == '__main__':
    app.run()
