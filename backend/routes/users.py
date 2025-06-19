from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from datetime import timedelta

users_bp = Blueprint('users', __name__, url_prefix='/users')


# GET /users/all - Admin: Get all users
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

# POST /users/signup - Register new user
@users_bp.route('/signup', methods=['POST'])
def signup_user():
    data = request.get_json()
    new_user = User(
        username=data.get('username'),
        email=data.get('email'),
        password_hash=generate_password_hash(data.get('password'))
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User signed up successfully'}), 201


# POST /users/login - Log in user
@users_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

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


# GET /users/me - Get current user profile
@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': user.is_admin
    }), 200


# PATCH /users/me - Update current user profile
@users_bp.route('/me', methods=['PATCH'])
@jwt_required()
def update_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data:
        user.password_hash = generate_password_hash(data['password'])

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

# DELETE /users/<id> - Admin: Delete user by ID
@users_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200

# PATCH /users/<id>/promote - Admin: Promote or demote a user

@users_bp.route('/<int:id>/promote', methods=['PATCH'])
@jwt_required()
def promote_user(id):
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(id)
    data = request.get_json()
    user.is_admin = data.get('is_admin', user.is_admin)
    db.session.commit()
    return jsonify({'message': f"User admin status updated to {user.is_admin}"}), 200
