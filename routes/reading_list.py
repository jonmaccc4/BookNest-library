from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, ReadingList, Book

reading_list_bp = Blueprint('reading_list', __name__, url_prefix='/reading-list')

# GET reading list for logged-in user
@reading_list_bp.route('/', methods=['GET'])
@jwt_required()
def get_reading_list():
    current_user_id = get_jwt_identity()
    items = ReadingList.query.filter_by(user_id=current_user_id).all()
    return jsonify([
        {
            'id': item.id,
            'book_id': item.book_id,
            'title': item.book.title,
            'note': item.note
        } for item in items
    ]), 200

# POST add book to reading list
@reading_list_bp.route('/', methods=['POST'])
@jwt_required()
def add_to_reading_list():
    data = request.get_json()
    book_id = data.get('book_id')
    note = data.get('note')

    current_user_id = get_jwt_identity()
    book = Book.query.get(book_id)

    if not book:
        return jsonify({'error': 'Book not found'}), 404

    new_entry = ReadingList(
        user_id=current_user_id,
        book_id=book_id,
        note=note
    )
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({'message': 'Book added to reading list'}), 201

# PATCH update note in reading list
@reading_list_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_note(id):
    item = ReadingList.query.get_or_404(id)
    current_user_id = get_jwt_identity()

    if item.user_id != current_user_id:
        return jsonify({'error': 'Not authorized'}), 403

    data = request.get_json()
    item.note = data.get('note', item.note)
    db.session.commit()
    return jsonify({'message': 'Note updated'}), 200

# DELETE remove from reading list
@reading_list_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_from_reading_list(id):
    item = ReadingList.query.get_or_404(id)
    current_user_id = get_jwt_identity()

    if item.user_id != current_user_id:
        return jsonify({'error': 'Not authorized'}), 403

    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Removed from reading list'}), 200
