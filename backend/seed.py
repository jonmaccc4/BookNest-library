from app import app
from models import db, User, Book
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

admin_data = {
    "username": "admin",
    "email": "admin@booknest.com",
    "password": "admin123",  
    "is_admin": True
}

demo_books = [
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Fiction"},
    {"title": "1984", "author": "George Orwell", "genre": "Dystopian"},
    {"title": "To Kill a Mockingbird", "author": "Harper Lee", "genre": "Historical"},
    {"title": "The Hobbit", "author": "J.R.R. Tolkien", "genre": "Fantasy"},
    {"title": "Atomic Habits", "author": "James Clear", "genre": "Self-help"},
]

with app.app_context():
    print(" Dropping and recreating tables...")
    db.drop_all()
    db.create_all()

    # Hash password
    hashed_pw = bcrypt.generate_password_hash(admin_data["password"]).decode("utf-8")

    # Create admin user
    admin_user = User(
        username=admin_data["username"],
        email=admin_data["email"],
        password_hash=hashed_pw,
        is_admin=admin_data["is_admin"]
    )
    db.session.add(admin_user)

    # Create demo books
    for b in demo_books:
        book = Book(title=b["title"], author=b["author"], genre=b["genre"])
        db.session.add(book)

    db.session.commit()
    print(" Database seeded with admin user and demo books.")
