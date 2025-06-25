from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Loan, Book
from functools import wraps
from flask_bcrypt import Bcrypt

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
bcrypt = Bcrypt()

# Restrict to admin users only
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user = User.query.get(get_jwt_identity())
        if not current_user or not current_user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

# View all users
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin
        } for u in users
    ]), 200

# Add a new user
@admin_bp.route('/users', methods=['POST'])
@admin_required
def add_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    is_admin = data.get('is_admin', False)

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "Username or email already exists"}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=hashed_pw, is_admin=is_admin)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User added successfully"}), 201

# Delete a user
@admin_bp.route('/users/<int:id>', methods=['DELETE'])
@admin_required
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

# View all loans
@admin_bp.route("/loans", methods=["GET"])
@admin_required
def get_all_loans():
    loans = Loan.query.all()
    return jsonify([
        {
            "id": loan.id,
            "user_email": loan.user.email if loan.user else "Unknown",
            "book_title": loan.book.title if loan.book else "Unknown",
            "borrowed_at": loan.borrowed_at.isoformat() if loan.borrowed_at else None,
            "due_date": loan.due_date.isoformat() if loan.due_date else None,
            "returned_at": loan.returned_at.isoformat() if loan.returned_at else None
        }
        for loan in loans
    ]), 200

# Delete a loan
@admin_bp.route('/loans/<int:id>', methods=['DELETE'])
@admin_required
def delete_loan(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({"error": "Loan not found"}), 404

    db.session.delete(loan)
    db.session.commit()
    return jsonify({"message": "Loan deleted"}), 200

# Add a new book
@admin_bp.route('/books', methods=['POST'])
@admin_required
def add_book():
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    genre = data.get('genre')

    if not title or not author:
        return jsonify({"error": "Title and author are required"}), 400

    new_book = Book(title=title, author=author, genre=genre)
    db.session.add(new_book)
    db.session.commit()

    return jsonify({"message": "Book added successfully"}), 201

# Update a user
@admin_bp.route('/users/<int:id>', methods=['PATCH'])
@admin_required
def update_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)
    user.is_admin = data.get("is_admin", user.is_admin)

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200

# Update a book
@admin_bp.route('/books/<int:id>', methods=['PATCH'])
@admin_required
def update_book(id):
    book = Book.query.get(id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    data = request.get_json()
    book.title = data.get("title", book.title)
    book.author = data.get("author", book.author)
    book.genre = data.get("genre", book.genre)

    db.session.commit()
    return jsonify({"message": "Book updated successfully"}), 200

#  Delete a book
@admin_bp.route('/books/<int:id>', methods=['DELETE'])
@admin_required
def delete_book(id):
    book = Book.query.get(id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book deleted successfully"}), 200

@admin_bp.route('/books', methods=['GET'])
@admin_required
def get_all_books():
    books = Book.query.all()
    return jsonify([{
        "id": b.id,
        "title": b.title,
        "author": b.author,
        "genre": b.genre
    } for b in books]), 200
