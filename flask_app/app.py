import logging
import os

from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename

from flask_app import CONSTANTS
from flask_app.aiEngine import AIEngine

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = CONSTANTS.UPLOAD_FOLDER
logger = logging.getLogger(__name__)

try:
    ai_engine = AIEngine()
    ai_engine.compile_model()
except Exception as ex:
    logger.error(ex)

@app.route('/api/load_data', methods=['POST'])
def load_data():
    target = CONSTANTS.UPLOAD_FOLDER
    if not os.path.isdir(CONSTANTS.UPLOAD_FOLDER):
        os.mkdir(CONSTANTS.UPLOAD_FOLDER)

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
    answer = ai_engine.invoke_model(CONSTANTS.QUESTION)
    return jsonify(answer)


if __name__ == '__main__':
    app.run(debug=True)
