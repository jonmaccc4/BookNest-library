from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Book

books_bp = Blueprint('books', __name__, url_prefix='/books')

# GET all books (any logged-in user)
@books_bp.route('/', methods=['GET'])
@jwt_required()
def get_books():
    books = Book.query.all()
    return jsonify([
        {
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'genre': book.genre
        } for book in books
    ]), 200

# GET books with optional search filters
@books_bp.route('/search', methods=['GET'])
@jwt_required()
def search_books():
    title = request.args.get('title', '').lower()
    author = request.args.get('author', '').lower()
    genre = request.args.get('genre', '').lower()

    query = Book.query
    if title:
        query = query.filter(Book.title.ilike(f'%{title}%'))
    if author:
        query = query.filter(Book.author.ilike(f'%{author}%'))
    if genre:
        query = query.filter(Book.genre.ilike(f'%{genre}%'))

    books = query.all()

    return jsonify([
        {
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'genre': book.genre
        } for book in books
    ]), 200

# POST new book (admin only)
@books_bp.route('/', methods=['POST'])
@jwt_required()
def create_book():
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON payload'}), 400

    title = data.get('title')
    author = data.get('author')
    genre = data.get('genre')

    if not title or not author or not genre:
        return jsonify({'error': 'All fields (title, author, genre) are required'}), 400

    new_book = Book(title=title, author=author, genre=genre)
    db.session.add(new_book)
    db.session.commit()
    return jsonify({'message': 'Book added successfully'}), 201

# DELETE a book (admin only)
@books_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_book(id):
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    book = Book.query.get(id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'}), 200
