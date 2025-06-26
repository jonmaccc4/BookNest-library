from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Initialize app and extensions
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config['JSON_SORT_KEYS'] = False

# Allow CORS for your Vercel frontend
CORS(app, supports_credentials=True, origins=[
    "https://book-nest-library-4epynwzuc-jonmacs-projects.vercel.app"
])

db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Example route
@app.route('/')
def home():
    return jsonify({"message": "Welcome to BookNest backend!"})

# Example login route
@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Dummy check - replace with actual user lookup and password validation
    if username == "admin" and password == "password":
        return jsonify({"token": "dummy-jwt-token"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

# Run the app
if __name__ == '__main__':
    app.run()
