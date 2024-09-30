from flask import Flask
from flask_cors import CORS

api = Flask(__name__)

# Allow localhost and 127.0.0.1 to work with each other in the browser. Otherwise it gets blocked even though they're technically the same thing
CORS(api) 

@api.route('/profile', methods=['GET'])
def my_profile():
    response_body = {
        "name": "Riddh",
        "about": "Hello world! This is the backend!"
    }
    # flask.jsonify automatically creates the correct response object
    return response_body

if __name__ == '__main__':
    api.run(debug=True)