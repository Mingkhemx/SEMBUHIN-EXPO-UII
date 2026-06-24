from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Izinkan CORS untuk frontend

# Initialize Supabase
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
supabase: Client = None
if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        print('✅ Connected to Supabase successfully')
    except Exception as e:
        print(f'❌ Failed to connect to Supabase: {e}')

# Pastikan folder tmp ada
os.makedirs('tmp', exist_ok=True)

# --- ROUTES ---

# 1. Existing analyze face route
@app.route('/analyze', methods=['POST'])
def analyze_face():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'Gambar tidak ditemukan'}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'].split(',')[1])
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Simpan gambar sementara
        temp_path = 'tmp/temp_face.jpg'
        cv2.imwrite(temp_path, img)
        
        # Analisis dengan DeepFace
        from deepface import DeepFace
        result = DeepFace.analyze(
            img_path=temp_path,
            actions=['emotion'],
            enforce_detection=False,
            silent=True
        )
        
        # Hapus file temporary
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return jsonify({
            'emotions': result[0]['emotion'],
            'dominant_emotion': result[0]['dominant_emotion']
        })
        
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': str(e)}), 500

# 2. Doctor Registration Form Submission
@app.route('/api/doctor-registration', methods=['POST'])
def submit_doctor_registration():
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Insert into database
        registration = {
            'name': data.get('name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'specialty': data.get('specialty'),
            'license_number': data.get('license'),
            'hospital': data.get('hospital'),
            'experience_years': data.get('experience'),
            'status': 'pending',  # default status
            'created_at': 'now()'
        }

        result = supabase.table('doctor_registrations').insert(registration).execute()

        return jsonify({
            'success': True,
            'message': 'Pendaftaran berhasil dikirim!',
            'data': result.data[0] if result.data else None
        }), 201
        
    except Exception as e:
        print('Error submitting registration:', str(e))
        return jsonify({'error': str(e)}), 500

# 3. Admin: Get All Doctor Registrations
@app.route('/api/admin/doctor-registrations', methods=['GET'])
def get_doctor_registrations():
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        result = supabase.table('doctor_registrations').select('*').order('created_at', desc=True).execute()
        
        return jsonify({
            'success': True,
            'data': result.data
        })
        
    except Exception as e:
        print('Error fetching registrations:', str(e))
        return jsonify({'error': str(e)}), 500

# 4. Admin: Update Registration Status
@app.route('/api/admin/doctor-registrations/<id>', methods=['PUT'])
def update_registration_status(id):
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        data = request.json
        status = data.get('status')

        if not status or status not in ['pending', 'approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400

        result = supabase.table('doctor_registrations').update({'status': status}).eq('id', id).execute()
        
        return jsonify({
            'success': True,
            'message': 'Status berhasil diperbarui!',
            'data': result.data[0] if result.data else None
        })
        
    except Exception as e:
        print('Error updating registration:', str(e))
        return jsonify({'error': str(e)}), 500

# 5. Admin SQL Editor - Execute SQL
@app.route('/api/admin/sql', methods=['POST'])
def execute_sql():
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        data = request.json
        sql = data.get('sql')

        if not sql:
            return jsonify({'error': 'SQL query is required'}), 400

        # Use Supabase RPC or direct SQL execution
        # Note: For security, this should be restricted to admin only
        result = supabase.rpc('execute_sql', {'sql_query': sql}).execute()
        
        return jsonify({
            'success': True,
            'data': result.data
        })
        
    except Exception as e:
        print('Error executing SQL:', str(e))
        return jsonify({'error': str(e)}), 500

# --- Health Check ---
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'supabase_connected': supabase is not None
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

