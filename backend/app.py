from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_migrate import Migrate
import os

from models import db, User
from routes.auth import auth_bp
from routes.books import books_bp
from routes.admin import admin_bp
from routes.loans import loans_bp
from routes.reading_list import reading_list_bp

app = Flask(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///booknest.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)


db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app, supports_credentials=True, origins=[
    "https://book-nest-library.vercel.app",
    "https://book-nest-library-4epynwzuc-jonmacs-projects.vercel.app"
])


@jwt.additional_claims_loader
def add_claims_to_access_token(identity):
    user = User.query.get(identity)
    return {
        "is_admin": user.is_admin if user else False
    }


@app.route('/')
def home():
    return jsonify({"message": "Welcome to BookNest API"})


app.register_blueprint(auth_bp)
app.register_blueprint(books_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(loans_bp)
app.register_blueprint(reading_list_bp)


if __name__ == '__main__':
    app.run(debug=True)
