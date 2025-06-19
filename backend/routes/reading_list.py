from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, ReadingList, Book

reading_list_bp = Blueprint('reading_list', __name__, url_prefix='/reading-list')

# POST - Add a book to the reading list
@reading_list_bp.route('/', methods=['POST'])
@jwt_required()
def add_to_reading_list():
    data = request.get_json()
    book_id = data.get('book_id')
    note = data.get('note', "")
    user_id = get_jwt_identity()

    reading = ReadingList(user_id=user_id, book_id=book_id, note=note)
    db.session.add(reading)
    db.session.commit()

    return jsonify({'message': 'Book added to reading list'}), 201

# GET - View current user's reading list
@reading_list_bp.route('/', methods=['GET'])
@jwt_required()
def get_reading_list():
    user_id = get_jwt_identity()
    items = ReadingList.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            'id': item.id,
            'book_id': item.book_id,
            'note': item.note,
            'book': {
                'title': item.book.title,
                'author': item.book.author,
                'genre': item.book.genre
            }
        }
        for item in items
    ]), 200

# PATCH - Update note in a reading list entry
@reading_list_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_reading_note(id):
    entry = ReadingList.query.get_or_404(id)
    user_id = get_jwt_identity()

    if entry.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    entry.note = data.get('note', entry.note)
    db.session.commit()

    return jsonify({'message': 'Reading list note updated'}), 200

# DELETE - Remove book from reading list
@reading_list_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def remove_from_reading_list(id):
    entry = ReadingList.query.get_or_404(id)
    user_id = get_jwt_identity()

    if entry.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(entry)
    db.session.commit()

    return jsonify({'message': 'Reading list item deleted'}), 200
