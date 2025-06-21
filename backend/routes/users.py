from flask import Blueprint, request, jsonify
from backend.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from datetime import timedelta

users_bp = Blueprint('users', __name__, url_prefix='/users')

# GET all users (admin only)
@users_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_users():
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    return jsonify([
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_admin': user.is_admin
        } for user in users
    ]), 200

# POST - Register a new user
@users_bp.route('/signup', methods=['POST'])
def signup_user():
    data = request.get_json()
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Username, email, and password are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User signed up successfully'}), 201

# POST - Log in
@users_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(
            identity=user.id,
            additional_claims={"is_admin": user.is_admin},
            expires_delta=timedelta(hours=1)
        )
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin
            }
        }), 200
    return jsonify({'error': 'Invalid email or password'}), 401

# GET - View own profile
@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': user.is_admin
    }), 200

# PATCH - Update own profile
@users_bp.route('/me', methods=['PATCH'])
@jwt_required()
def update_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data:
        user.password_hash = generate_password_hash(data['password'])

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

# DELETE - Delete a user (admin only)
@users_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200

# PATCH - Update user's admin status (admin only)
@users_bp.route('/<int:id>/promote', methods=['PATCH'])
@jwt_required()
def promote_user(id):
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    user.is_admin = data.get('is_admin', user.is_admin)
    db.session.commit()
    return jsonify({'message': f"User admin status updated to {user.is_admin}"}), 200
