import os
from app import app
from models import db, User, Book
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv


load_dotenv()

# Example admin credentials
admin_data = {
    "username": "admin",
    "email": "admin@booknest.com",
    "password_hash": generate_password_hash("admin123"),
    "is_admin": True
}

demo_books = [
    Book(title="The Great Gatsby", author="F. Scott Fitzgerald", genre="Fiction"),
    Book(title="1984", author="George Orwell", genre="Dystopian"),
    Book(title="To Kill a Mockingbird", author="Harper Lee", genre="Classic"),
    Book(title="Kino", author="James Clear", genre="Self-help"),
    Book(title="Sapiens", author="Yuval Noah Harari", genre="History")
]

with app.app_context():
    print("Seeding database...")

    # Clear existing data (optional)
    db.session.query(Book).delete()
    db.session.query(User).delete()

    # Create and add admin
    admin_user = User(**admin_data)
    db.session.add(admin_user)

    # Add demo books
    db.session.add_all(demo_books)

    db.session.commit()
    print(" Done seeding.")
