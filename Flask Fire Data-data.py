from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3


app = Flask(__name__)
CORS(app)

@app.route('/data')
def get_data():
    # Connect to SQLite database
    conn = sqlite3.connect('fire_db')
    cursor = conn.cursor()
    
    # Execute SQL query
    cursor.execute('SELECT * FROM lit_fire_data')
    data = cursor.fetchall()
    
    conn.close()

    return jsonify(data)
    
if __name__ == '__main__':
    app.run(debug=True)
