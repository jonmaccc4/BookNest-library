from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

from models import db
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.users import users_bp
from routes.books import books_bp
from routes.loans import loans_bp
from routes.reading_list import reading_list_bp


def create_app():
    app = Flask(__name__)

   
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///booknest.db'  # or your PostgreSQL URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # JWT configuration
    app.config["JWT_SECRET_KEY"] = "jonjonjon"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    app.config["JWT_VERIFY_SUB"] = False

  
    db.init_app(app)
    Migrate(app, db)
    CORS(app)
    jwt = JWTManager(app)

    #  Blueprints
    app.register_blueprint(users_bp)
    app.register_blueprint(books_bp)
    app.register_blueprint(loans_bp)
    app.register_blueprint(reading_list_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
