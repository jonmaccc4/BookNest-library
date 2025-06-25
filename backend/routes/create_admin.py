from app import app, db
from models import User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

with app.app_context():
    
    existing = User.query.filter_by(email="admin@booknest.com").first()
    if existing:
        db.session.delete(existing)
        db.session.commit()

    # Create new admin
    admin = User(
        username="admin",
        email="admin@booknest.com",
        password_hash=bcrypt.generate_password_hash("admin123").decode('utf-8'),
        is_admin=True
    )
    db.session.add(admin)
    db.session.commit()
    print(" Admin created with bcrypt hash")
