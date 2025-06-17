from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Loan, User, Book
from datetime import datetime

loans_bp = Blueprint('loans', __name__, url_prefix='/loans')

# GET all loans
@loans_bp.route('/', methods=['GET'])
@jwt_required()
def get_loans():
    loans = Loan.query.all()
    return jsonify([
        {
            'id': loan.id,
            'user_id': loan.user_id,
            'book_id': loan.book_id,
            'borrowed_at': loan.borrowed_at,
            'returned_at': loan.returned_at
        } for loan in loans
    ]), 200

# POST create loan
@loans_bp.route('/', methods=['POST'])
@jwt_required()
def create_loan():
    data = request.get_json()
    user_id = data.get('user_id')
    book_id = data.get('book_id')

    # Optional: validate user/book existence
    user = User.query.get(user_id)
    book = Book.query.get(book_id)

    if not user or not book:
        return jsonify({'error': 'User or Book not found'}), 404

    new_loan = Loan(
        user_id=user_id,
        book_id=book_id,
        borrowed_at=datetime.utcnow()
    )
    db.session.add(new_loan)
    db.session.commit()
    return jsonify({'message': 'Loan created successfully'}), 201

# PATCH mark as returned
@loans_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def return_book(id):
    loan = Loan.query.get_or_404(id)
    loan.returned_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Book returned successfully'}), 200

# DELETE loan
@loans_bp.route('/<int:id>', methods=['DELETE'])
def delete_loan(id):
    loan = Loan.query.get_or_404(id)
    db.session.delete(loan)
    db.session.commit()
    return jsonify({'message': 'Loan deleted successfully'}), 200
