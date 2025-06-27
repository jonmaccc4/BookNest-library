from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt
from datetime import timedelta


from models import db, User, Book


app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)


db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


CORS(app, supports_credentials=True, origins=[
    "https://book-nest-library.vercel.app",
    "https://book-nest-library-4epynwzuc-jonmacs-projects.vercel.app"
])


@jwt.additional_claims_loader
def add_claims_to_access_token(identity):
    user = User.query.get(identity)
    return {
        "is_admin": user.is_admin if user else False
    }


@app.route('/')
def home():
    return jsonify({"message": "Welcome to BookNest API"})



@app.route('/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not all([username, email, password]):
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "Username or email already exists"}), 409

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201


@app.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        token = create_access_token(identity=user.id)
        return jsonify({
            "token": token,
            "username": user.username,
            "is_admin": user.is_admin
        }), 200

    return jsonify({"error": "Invalid username or password"}), 401



from flask import Blueprint

books_bp = Blueprint('books', __name__, url_prefix='/books')

@books_bp.route('/', methods=['GET'])
@jwt_required()
def get_books():
    books = Book.query.all()
    return jsonify([
        {"id": b.id, "title": b.title, "author": b.author, "genre": b.genre}
        for b in books
    ]), 200


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
        {"id": b.id, "title": b.title, "author": b.author, "genre": b.genre}
        for b in books
    ]), 200


@books_bp.route('/', methods=['POST'])
@jwt_required()
def create_book():
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    genre = data.get('genre')

    if not title or not author or not genre:
        return jsonify({'error': 'All fields (title, author, genre) are required'}), 400

    new_book = Book(title=title, author=author, genre=genre)
    db.session.add(new_book)
    db.session.commit()
    return jsonify({'message': 'Book added successfully'}), 201


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



app.register_blueprint(books_bp)


if __name__ == '__main__':
    app.run(debug=True)
