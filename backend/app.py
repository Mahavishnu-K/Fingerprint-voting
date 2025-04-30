from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import sqlite3
import os
import shutil
from perlin_noise import PerlinNoise
from werkzeug.utils import secure_filename
import logging

app = Flask(__name__)
CORS(app)  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = "fingerprint_voting.db"
IMAGE_DIR = "fingerprints/"
os.makedirs(IMAGE_DIR, exist_ok=True)

def generate_fingerprint(size=(256, 256)):
    img = np.zeros(size, np.uint8)
    noise_gen = PerlinNoise(octaves=6)

    for x in range(size[0]):
        for y in range(size[1]):
            # Generate Perlin noise value in range [0,1], convert to [-1,1], then to [0,255]
            value = int((noise_gen([x / 100.0, y / 100.0]) * 2 - 1) * 128 + 128)
            img[x, y] = np.clip(value, 0, 255)
    
    return cv2.equalizeHist(img)

# Initialize database
def initialize_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS voters (
            user_id TEXT PRIMARY KEY,
            fingerprint_path TEXT,
            has_voted INTEGER DEFAULT 0
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS votes (
            candidate TEXT PRIMARY KEY,
            vote_count INTEGER DEFAULT 0
        )
    ''')
    for candidate in ["Tamilaga Vettri Kazhagam", "DMK", "NTK", "BJP"]:
        cursor.execute("INSERT OR IGNORE INTO votes (candidate, vote_count) VALUES (?, 0)", (candidate,))
    conn.commit()
    conn.close()

# Match input fingerprint with stored fingerprints
def match_fingerprint(input_img_path):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, fingerprint_path FROM voters")
    stored_fingerprints = cursor.fetchall()
    conn.close()

    input_img = cv2.imread(input_img_path, cv2.IMREAD_GRAYSCALE)
    orb = cv2.ORB_create()
    kp1, des1 = orb.detectAndCompute(input_img, None)

    best_match = None
    max_matches = 0

    for user_id, stored_path in stored_fingerprints:
        stored_img = cv2.imread(stored_path, cv2.IMREAD_GRAYSCALE)
        kp2, des2 = orb.detectAndCompute(stored_img, None)
        if des1 is None or des2 is None:
            continue

        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des1, des2)

        if len(matches) > max_matches:
            max_matches = len(matches)
            best_match = user_id

    return best_match if max_matches > 15 else None

# Initialize database on startup
initialize_db()

@app.route('/api/register', methods=['POST'])
def register_voters():
    try:
        voter_count = int(request.form.get('voter_count', 0))
        if voter_count <= 0:
            return jsonify({"message": "No valid voters to register"}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        registered_count = 0
        for i in range(voter_count):
            name_key = f'name_{i}'
            fingerprint_key = f'fingerprint_{i}'
            
            if name_key not in request.form or fingerprint_key not in request.files:
                continue
                
            name = request.form[name_key]
            fingerprint_file = request.files[fingerprint_key]
            
            if not name or not fingerprint_file:
                continue
                
            # Check if voter already exists
            cursor.execute("SELECT user_id FROM voters WHERE user_id = ?", (name,))
            if cursor.fetchone():
                continue
                
            # Save fingerprint image
            filename = secure_filename(f"fingerprint_{name}.png")
            fingerprint_path = os.path.join(IMAGE_DIR, filename)
            fingerprint_file.save(fingerprint_path)
            
            # Store in database
            cursor.execute("INSERT INTO voters (user_id, fingerprint_path) VALUES (?, ?)", 
                          (name, fingerprint_path))
            registered_count += 1
            
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": f"Successfully registered {registered_count} voters",
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error in register_voters: {str(e)}")
        return jsonify({"message": f"Error registering voters: {str(e)}"}), 500

@app.route('/api/vote', methods=['POST'])
def vote():
    try:
        if 'name' not in request.form or 'fingerprint' not in request.files or 'candidate' not in request.form:
            return jsonify({"message": "Missing required fields"}), 400
            
        name = request.form['name']
        fingerprint_file = request.files['fingerprint']
        candidate = request.form['candidate']
        
        if candidate not in ["Tamilaga Vettri Kazhagam", "DMK", "NTK", "BJP"]:
            return jsonify({"message": "Invalid candidate selection"}), 400
            
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if voter exists and hasn't voted yet
        cursor.execute("SELECT fingerprint_path, has_voted FROM voters WHERE user_id = ?", (name,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return jsonify({"message": "Voter not registered"}), 400
            
        registered_fingerprint_path, has_voted = result
        
        if has_voted:
            conn.close()
            return jsonify({"message": "You have already voted"}), 400
            
        # Save the uploaded fingerprint temporarily for verification
        temp_fingerprint_path = os.path.join(IMAGE_DIR, "temp_verify.png")
        fingerprint_file.save(temp_fingerprint_path)
        
        # Verify fingerprint
        match_result = match_fingerprint(temp_fingerprint_path)
        if match_result != name:
            conn.close()
            return jsonify({"message": "Fingerprint verification failed"}), 401
            
        # Record the vote
        cursor.execute("UPDATE votes SET vote_count = vote_count + 1 WHERE candidate = ?", (candidate,))
        cursor.execute("UPDATE voters SET has_voted = 1 WHERE user_id = ?", (name,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": f"Vote for {candidate} recorded successfully",
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error in vote: {str(e)}")
        return jsonify({"message": f"Error casting vote: {str(e)}"}), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT candidate, vote_count FROM votes")
        results = [{"candidate": candidate, "vote_count": vote_count} for candidate, vote_count in cursor.fetchall()]
        conn.close()
        
        return jsonify({
            "results": results,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error in get_results: {str(e)}")
        return jsonify({"message": f"Error fetching results: {str(e)}"}), 500

@app.route('/api/voters', methods=['GET'])
def get_voters():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, has_voted FROM voters")
        voters = [{"name": user_id, "has_voted": bool(has_voted)} for user_id, has_voted in cursor.fetchall()]
        conn.close()
        
        return jsonify({
            "voters": voters,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error in get_voters: {str(e)}")
        return jsonify({"message": f"Error fetching voters: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)