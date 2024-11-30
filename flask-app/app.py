from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route('/api/greeting', methods=['GET'])
def hello_world():
    return jsonify(message='Hello, Sam!')

@app.route('/api/data', methods=['POST'])
def data():
    req_data = request.get_json()
    return jsonify(received=req_data)


if __name__ == '__main__':
    app.run(debug=True)
