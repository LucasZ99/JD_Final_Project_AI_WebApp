import os

from flask import Flask, jsonify, request, session
from werkzeug.utils import secure_filename

from flask_app.aiEngine import AIEngine

UPLOAD_FOLDER = './testData'
ALLOWED_EXTENSIONS = {'txt'}
QUESTION =("curate a list from 1 to 5 of 5 cold weather items from my inventory to post on my instagram in a "
           "vintage pitt winter clothing drop announcement. Also tell me how to schedule the daily posts i.e. time of "
           "day, what days of the week, and post order for maximum post engagement")


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ai_engine = AIEngine()
ai_engine.compile_model()

@app.route('/api/greeting', methods=['GET'])
def hello_world():
    return jsonify(message='Hello, Sam!')

@app.route('/api/load_data', methods=['POST'])
def load_data():
    target = UPLOAD_FOLDER
    if not os.path.isdir(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)

    file = request.files['file']
    filename = secure_filename(file.filename)
    destination = "/".join([target, filename])
    file.save(destination)


    # embed the data into the rag pipeline
    ai_engine.load_data()

    # session['uploadFilePath'] = destination
    response = "file saved at {destination}".format(destination=destination)
    return response

@app.route('/api/llm/response', methods=['GET'])
def llm_response():
    answer = ai_engine.invoke_model(QUESTION)
    return jsonify(answer)


if __name__ == '__main__':
    app.run(debug=True)
