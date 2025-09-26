Cloud Notes is a CRUD (Create, Read, Update and Delete) web app built using a React frontend and Python backend. It uses FastAPI and SQLAlchemy on the backend to handle API calls and SQL queries. User's can create an account and then create notes on the SQL database. There is also log in persistence so they do not need to log in every time.

SHORT DEMO:
<video src="https://github.com/user-attachments/assets/20504ed7-e49f-4622-ace9-8076bc528d43" controls width="1000"></video>

REMEMBER TO CREATE A .env FILE IN THE BACKEND FOLDER!!!!!!

I added it to .gitignore for this repository for security reasons so if you clone this repository, you'll need to recreate it.

It needs SECRET_KEY and DATABASE_URL. (Used in base.py)

Also a MySQL database is needed for the backend for user log ins and note storage.
The schema database model for these 2 tables can be found in base.py in the backend folder.
