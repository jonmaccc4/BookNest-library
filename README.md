## BookNest online library
  
BookNest is a full-stack web application designed to create a shared reading ecosystem. It allows users to borrow books, manage personal reading lists, and for admins to oversee books, loans, and user accounts.

## FEATURES 
 
 ### User functionality
- Register an account with username, email, and password
-  Login/logout securely using JWT authentication
-  Update profile details (username, email, password)
-  View all available books
-  Search for books by title, author, or genre
-  Borrow and return books
-  Create and manage a personal reading list (add/edit/remove)
-  View profile with borrowed books and saved reading list

  ### Admin Functionality
  
-  Login as admin
-  Access the admin dashboard
-  View all registered users
-  Add, update, or delete books
-  View and manage all loans
-  Update or remove any reading list entry or user note
-  Deactivate or remove inappropriate users

## Database Schema

### Relationship


- **User ↔ Loan**: One-to-Many  
- **User ↔ ReadingList**: One-to-Many  
- **Book ↔ Loan**: One-to-Many  
- **Book ↔ ReadingList**: One-to-Many  
- **User ↔ Book (via ReadingList)**: Many-to-Many

## Tech Stack

### Backend (flask)

- Flask + SQLAlchemy
- JWT Authentication
- Bcrypt for password hashing
- Flask-CORS

### Frontend (React)

- React + Vite
- Tailwind CSS (or manual CSS)
- React Router
- React Toastify for notifications

## How to setup

### 1. Clone the repo
git clone https://github.com/jonmaccc4/booknest.git
cd booknest

### 2. Backend Setup
- cd backend
- pipenv shell
- pip install -r - requirements.txt
- flask db init
- flask db migrate
- flask db upgrade
- flask run
 ### 3. Frontend setup
 - cd frontend
- npm install
- npm run dev

## known bugs 
There are no bugs and the application works perfectly
 
## Technologies used
- React Toastify
- Tailwind CSS
- React
- Flaticon icons
- Flask
- Python
- Flask JWT Extended

## Support and contact details
email: jonmac2454@gmail.com

## license
MIT License © 2025 jondevv