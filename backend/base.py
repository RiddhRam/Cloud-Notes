import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

# This is for the .env in this folder
load_dotenv()

# Initialization and configuration
api = Flask(__name__)
api.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
api.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
api.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# The frontend is on localhost, but the backend is on 127.0.0.1 so we need CORS
# and also we need to support credentials so the user stays logged in
CORS(api, supports_credentials=True)

# Extensions
db = SQLAlchemy(api)
bcrypt = Bcrypt(api)
login_manager = LoginManager()
login_manager.init_app(api)

# Database Model
class User(db.Model, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'
    
# Database Model for User Notes
class UserNotes(db.Model):
    __tablename__ = 'user_notes'

    save_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    save_data = db.Column(db.JSON, nullable=False)

    def __repr__(self):
        return f'<UserNotes {self.save_id} for User {self.user_id}>'

# Flask-Login User Loader
# This function is used by Flask-Login to load the user from the user ID stored in the session
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# API Routes
@api.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"

    if not re.fullmatch(pattern, email):
        return jsonify({"message": "Please enter a valid email address."}), 400

    if (len(password) < 6):
        return jsonify({"message": "Password needs to be at least 6 characters!"}), 400

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email address already in use"}), 409

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create new user
    new_user = User(
        email=email,
        password_hash=hashed_password,
    )
    db.session.add(new_user)
    db.session.commit()

    # Log the user in automatically after signup
    login_user(new_user)

    return jsonify({
        "email": new_user.email
    }), 201


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    # Check if user exists and password is correct
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password"}), 401

    # Log the user in
    login_user(user)

    return jsonify({
        "email": user.email
    }), 200


@api.route('/logout', methods=['POST'])
# Because of @login_required, only logged in users can access this
@login_required 
def logout():
    logout_user()
    return jsonify({"message": "Successfully logged out"}), 200

@api.route('/createNewNote', methods=['POST'])
@login_required 
def create_new_note():
    data = request.get_json()
    note_data = data.get('note')

    # Write the note
    new_note = UserNotes(
        user_id = current_user.id,
        save_data = note_data
    )
    db.session.add(new_note)
    db.session.commit()

    # Return saveId
    return jsonify({"id": new_note.save_id}), 200

@api.route('/api/profile', methods=['GET'])
@login_required
def my_profile():
    # current_user is automatically populated by Flask-Login with the user's data
    return jsonify({
        "email": current_user.email,
        "id": current_user.id
    }), 200

@api.route('/api/notes', methods=['GET'])
@login_required
def get_user_notes():
    notes = UserNotes.query.filter_by(user_id=current_user.id).all()
    
    # extract JSON from each note
    notes_data = [{"saveId": note.save_id, "note": note.save_data} for note in notes] 
    
    return jsonify({"notes": notes_data}), 200

if __name__ == '__main__':
    # This context is needed to create the database tables
    with api.app_context():
        db.create_all()
    api.run(debug=True)