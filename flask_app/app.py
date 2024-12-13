import logging
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
logger = logging.getLogger(__name__)

try:
    ai_engine = AIEngine()
    ai_engine.compile_model()
except Exception as e:
    logger.error(e)

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
    try:
        ai_engine.load_data()
        # session['uploadFilePath'] = destination
        response = f"file saved at {destination}"
    except Exception as e:
        response = f"file not embedded: {str(e)}"
        logger.log(level=logging.ERROR, msg=response)

    return response

@app.route('/api/llm/response', methods=['GET'])
def llm_response():
    answer = ai_engine.invoke_model(QUESTION)
    return jsonify(answer)


if __name__ == '__main__':
    app.run(debug=True)
