from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from routes.auth import auth_bp

from backend.models import db  


from routes.users import users_bp
from routes.books import books_bp
from routes.loans import loans_bp
from routes.reading_list import reading_list_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    Migrate(app, db)
    CORS(app)
    
    #jwt 
    app.config["JWT_SECRET_KEY"] = "jonjonjon" 
    jwt = JWTManager(app) 
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    jwt.init_app(app)
    app.config["JWT_VERIFY_SUB"] = False

    app.register_blueprint(users_bp)
    app.register_blueprint(books_bp)
    app.register_blueprint(loans_bp)
    app.register_blueprint(reading_list_bp)
    app.register_blueprint(auth_bp)
    
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
