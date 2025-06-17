from flask import Blueprint, request, jsonify
from models import db, ReadingList, User, Book

reading_list_bp = Blueprint('reading_list', __name__, url_prefix='/reading-list')

# GET all reading list items
@reading_list_bp.route('/', methods=['GET'])
def get_reading_list():
    items = ReadingList.query.all()
    return jsonify([
        {
            'id': item.id,
            'user_id': item.user_id,
            'book_id': item.book_id,
            'note': item.note
        } for item in items
    ]), 200

# POST add book to reading list
@reading_list_bp.route('/', methods=['POST'])
def add_to_reading_list():
    data = request.get_json()
    user_id = data.get('user_id')
    book_id = data.get('book_id')
    note = data.get('note')

    user = User.query.get(user_id)
    book = Book.query.get(book_id)

    if not user or not book:
        return jsonify({'error': 'User or Book not found'}), 404

    new_item = ReadingList(user_id=user_id, book_id=book_id, note=note)
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'message': 'Book added to reading list'}), 201

# DELETE remove from reading list
@reading_list_bp.route('/<int:id>', methods=['DELETE'])
def remove_from_reading_list(id):
    item = ReadingList.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Reading list item deleted'}), 200
