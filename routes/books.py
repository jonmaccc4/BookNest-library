from flask import Blueprint, request, jsonify
from models import db, Book

books_bp = Blueprint('books', __name__, url_prefix='/books')

# GET all books
@books_bp.route('/', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'genre': book.genre
    } for book in books]), 200

# POST new book
@books_bp.route('/', methods=['POST'])
def create_book():
    data = request.get_json()
    new_book = Book(
        title=data.get('title'),
        author=data.get('author'),
        genre=data.get('genre')
    )
    db.session.add(new_book)
    db.session.commit()
    return jsonify({'message': 'Book added successfully'}), 201

# DELETE a book
@books_bp.route('/<int:id>', methods=['DELETE'])
def delete_book(id):
    book = Book.query.get_or_404(id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'}), 200
