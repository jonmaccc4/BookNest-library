from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, Loan, User, Book
from datetime import datetime, timedelta

loans_bp = Blueprint('loans', __name__, url_prefix='/loans')

# GET all loans (admin only)
@loans_bp.route('/', methods=['GET'])
@jwt_required()
def get_loans():
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    loans = Loan.query.all()
    return jsonify([
        {
            'id': loan.id,
            'user_id': loan.user_id,
            'book_id': loan.book_id,
            'borrowed_at': loan.borrowed_at,
            'returned_at': loan.returned_at,
            'due_date': loan.due_date
        } for loan in loans
    ]), 200

# GET current user's own loans
@loans_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_loans():
    user_id = get_jwt_identity()
    my_loans = Loan.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            'id': loan.id,
            'book_id': loan.book_id,
            'borrowed_at': loan.borrowed_at,
            'returned_at': loan.returned_at,
            'book': {
                'title': loan.book.title,
                'author': loan.book.author,
                'genre': loan.book.genre
            }
        } for loan in my_loans
    ]), 200


# POST user borrows a book
@loans_bp.route('/', methods=['POST'])
@jwt_required()
def create_loan():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON payload'}), 400

    book_id = data.get('book_id')
    if not book_id:
        return jsonify({'error': 'book_id is required'}), 400

    current_user_id = get_jwt_identity()

    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    existing_loan = Loan.query.filter_by(user_id=current_user_id, book_id=book_id, returned_at=None).first()
    if existing_loan:
        return jsonify({'error': 'You already borrowed this book'}), 400

    new_loan = Loan(
        user_id=current_user_id,
        book_id=book_id,
        borrowed_at=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=14),
        returned_at=None
    )
    db.session.add(new_loan)
    db.session.commit()
    return jsonify({'message': 'Book borrowed successfully'}), 201


# PATCH user returns a book
@loans_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def return_book(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404

    current_user_id = get_jwt_identity()
    if loan.user_id != current_user_id:
        return jsonify({'error': 'Not authorized to return this book'}), 403

    if loan.returned_at:
        return jsonify({'error': 'Book already returned'}), 400

    loan.returned_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Book returned successfully'}), 200


# DELETE a loan
@loans_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_loan(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404

    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if loan.user_id != current_user_id and not claims.get("is_admin"):
        return jsonify({'error': 'Not authorized to delete this loan'}), 403

    db.session.delete(loan)
    db.session.commit()
    return jsonify({'message': 'Loan deleted successfully'}), 200
