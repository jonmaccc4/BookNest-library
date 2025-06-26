from app import app, db, User, Book  
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

with app.app_context():
    print("Dropping and recreating tables...")
    db.drop_all()
    db.create_all()

    books = [
        Book(title="1984", author="George Orwell", genre="Dystopian"),
        Book(title="To Kill a Mockingbird", author="Harper Lee", genre="Classic"),
        Book(title="Sapiens", author="Yuval Noah Harari", genre="Non-Fiction")
    ]

    user = User(
        username="admin",
        email="admin@booknest.com",
        password_hash=bcrypt.generate_password_hash("adminpass").decode('utf-8')
    )

    db.session.add_all(books + [user])
    db.session.commit()
    print("Database seeded successfully.")
