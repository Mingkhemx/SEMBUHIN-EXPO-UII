from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import base64
import numpy as np
import cv2
import os
import csv
import io
import time
import requests
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client
from groq import Groq
try:
    from google.cloud import texttospeech
except ImportError:
    texttospeech = None

# Load environment variables
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'), override=True)
load_dotenv(override=True) # Juga load dari root jika ada

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

# Initialize Groq
groq_api_key = os.getenv('GROQ_API_KEY')
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

# Pastikan folder tmp ada
os.makedirs('tmp', exist_ok=True)

# --- ROUTES ---

# 0. Voice Mode Respond (STT -> LLM -> TTS)
@app.route('/api/voice/respond', methods=['POST'])
def voice_respond():
    try:
        if not groq_client:
            return jsonify({'error': 'Groq API not configured'}), 500

        if 'audio' not in request.files:
            return jsonify({'error': 'Audio file not found'}), 400
        
        audio_file = request.files['audio']
        user_id = request.form.get('user_id')
        
        print(f"🎙 Received voice request from user: {user_id}")
        
        # 1. Transcribe (STT: Groq Whisper)
        print("--- Step 1: Transcribing ---")
        transcription = groq_client.audio.transcriptions.create(
            file=(audio_file.filename, audio_file.read()),
            model="whisper-large-v3-turbo",
            language="id",
            response_format="json"
        )
        user_text = transcription.text
        
        # 2. Get LLM Response (Groq Llama)
        SYSTEM_PROMPT = """
        Kamu adalah Dr. Sembuhin, asisten kesehatan AI dalam Bahasa Indonesia. 
        Kamu BUKAN dokter manusia. Selalu ingatkan pengguna untuk konsultasi 
        ke fasilitas kesehatan untuk kondisi darurat atau diagnosis pasti. 
        Jawab singkat, jelas, dan empatik. Hindari memberikan resep obat spesifik.
        """
        
        print("--- Step 2: Getting LLM Response ---")
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_text}
            ],
            temperature=0.6,
            max_tokens=300
        )
        doctor_reply = completion.choices[0].message.content
        print(f"🤖 Doctor Reply: {doctor_reply}")
        
        # 3. Synthesize Speech (TTS: Google Cloud)
        print("--- Step 3: Synthesizing Audio ---")
        audio_base64 = ""
        gcp_key_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        
        if texttospeech and gcp_key_path and os.path.exists(gcp_key_path):
            try:
                tts_client = texttospeech.TextToSpeechClient.from_service_account_json(gcp_key_path)
                synthesis_input = texttospeech.SynthesisInput(text=doctor_reply)
                
                # Opsi suara Indonesia
                voice = texttospeech.VoiceSelectionParams(
                    language_code="id-ID",
                    name="id-ID-Wavenet-A", # Suara natural ID
                    ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
                )
                
                audio_config = texttospeech.AudioConfig(
                    audio_encoding=texttospeech.AudioEncoding.MP3,
                    speaking_rate=0.95
                )
                
                response = tts_client.synthesize_speech(
                    input=synthesis_input, voice=voice, audio_config=audio_config
                )
                audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
            except Exception as tts_e:
                print('TTS Error:', str(tts_e))
                # Jangan gagalkan seluruh request jika hanya TTS yang error
        
        return jsonify({
            'success': True,
            'transcript': user_text,
            'reply': doctor_reply,
            'audio': audio_base64
        })
        
    except Exception as e:
        print('Voice Respond Error:', str(e))
        return jsonify({'error': str(e)}), 500

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

# 6. Midtrans Payment for Membership
@app.route('/api/payment/membership', methods=['POST'])
def create_membership_payment():
    try:
        # Tambahkan delay sedikit agar terasa seperti "proses real"
        time.sleep(1)
        
        data = request.json
        user_id = data.get('user_id', 'unknown')
        user_email = data.get('email', 'user@example.com')
        user_name = data.get('name', 'User Sembuhin')
        amount = int(data.get('amount', 49000))
        
        server_key = os.getenv('MIDTRANS_SERVER_KEY', '').strip()
        if not server_key:
            # Fallback for demo if no key provided (simulasi sukses langsung)
            return jsonify({
                'success': True,
                'is_mock': True,
                'message': 'Midtrans key not configured, returning mock success.'
            })

        # Midtrans order_id max 50 characters.
        # Use a simpler unique ID to avoid any character length issues.
        order_id = f"MS-{str(uuid.uuid4())[:20]}"
        
        # HARDCODED KEYS FOR DEBUGGING (Bypass .env)
        # Sesuai screenshot dashboard sandbox user
        effective_server_key = "SB-Mid-server-aHxpTPKSbVI5pxObHALxKThU"
        
        # Determine environment
        is_production = False # Force Sandbox
        base_url = "https://app.sandbox.midtrans.com"
        
        print(f"💳 [DEBUG] Requesting Midtrans Token:")
        print(f"   - Order ID: {order_id}")
        print(f"   - Env: Sandbox (Forced)")
        print(f"   - Base URL: {base_url}")
        print(f"   - Key: {effective_server_key[:15]}...")

        auth_str = base64.b64encode(f"{effective_server_key}:".encode()).decode()
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_str}"
        }
        
        payload = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": amount
            },
            "credit_card": {
                "secure": True
            },
            "customer_details": {
                "first_name": user_name,
                "email": user_email
            }
        }
        
        response = requests.post(
            f"{base_url}/snap/v1/transactions", 
            json=payload, 
            headers=headers
        )
        
        if response.status_code != 201:
            error_text = response.text
            print(f"❌ Midtrans API Error ({response.status_code}): {error_text}")
            print(f"   - URL used: {base_url}/snap/v1/transactions")
            print(f"   - Auth Header (first 20 chars): {headers['Authorization'][:20]}...")
            
            # Try to extract a more friendly error message
            try:
                error_json = response.json()
                error_msg = ", ".join(error_json.get('error_messages', [error_text]))
            except:
                error_msg = error_text

            return jsonify({
                'error': f"Midtrans Error: {error_msg}",
                'details': error_text,
                'status_code': response.status_code,
                'debug_info': {
                    'env': 'production' if is_production else 'sandbox',
                    'key_prefix_used': effective_server_key[:7]
                }
            }), 400
            
        token = response.json().get('token')
        print(f"✅ Midtrans Token Created: {token}")
        
        return jsonify({
            'success': True,
            'token': token,
            'order_id': order_id,
            'is_production': is_production
        })
        
    except Exception as e:
        print('🔥 Error creating payment:', str(e))
        return jsonify({'error': str(e)}), 500

# --- Admin User Management ---

@app.route('/api/admin/users', methods=['GET'])
def get_admin_users():
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        # Pagination & Filter params
        search = request.args.get('search', '')
        status_filter = request.args.get('status', 'Semua')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        query = supabase.table('profiles').select('*', count='exact')

        if search:
            query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%")

        # Cek kolom yang tersedia untuk menghindari error jika kolom belum ada di DB
        # Ini hanya untuk sementara sebelum user menjalankan SQL fix
        try:
            if status_filter == 'Aktif':
                query = query.eq('is_active', True)
            elif status_filter == 'Banned':
                query = query.eq('status', 'banned')
            elif status_filter == 'Premium':
                query = query.eq('is_premium', True)
        except:
            pass # Kolom mungkin belum ada, abaikan filter

        start = (page - 1) * per_page
        end = start + per_page - 1

        result = query.order('created_at', desc=True).range(start, end).execute()
        
        users_data = result.data
        
        # Cek apakah user juga ada di tabel doctors
        # Ambil semua email dari hasil query untuk dicek sekaligus
        emails = [u.get('email') for u in users_data if u.get('email')]
        if emails:
            try:
                # Ambil email dan avatar_url dari tabel doctors
                doctors_res = supabase.table('doctors').select('email, avatar_url').in_('email', emails).execute()
                doctor_info = {d['email']: d.get('avatar_url') for d in doctors_res.data}
                
                for u in users_data:
                    email = u.get('email')
                    current_role = u.get('role', 'user')
                    
                    # Jika email ada di tabel doctors
                    if email in doctor_info:
                        # Update role
                        if current_role == 'user':
                            u['role'] = 'doctor'
                        elif 'doctor' not in current_role:
                            u['role'] = f"{current_role},doctor"
                        
                        # Tambahkan avatar_url dari tabel doctors
                        if doctor_info[email]:
                            u['avatar_url'] = doctor_info[email]
            except Exception as dr_e:
                print(f"Error checking doctor roles/avatars: {dr_e}")

        return jsonify({
            'success': True,
            'data': users_data,
            'total': result.count,
            'page': page,
            'per_page': per_page
        })
        
    except Exception as e:
        print('Error fetching admin users:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/stats', methods=['GET'])
def get_user_stats():
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        # Get counts dengan fallback jika kolom belum ada
        stats = {'total': 0, 'active': 0, 'banned': 0}
        
        try:
            total = supabase.table('profiles').select('*', count='exact', head=True).execute()
            stats['total'] = total.count or 0
        except: pass

        try:
            active = supabase.table('profiles').select('*', count='exact', head=True).eq('is_active', True).execute()
            stats['active'] = active.count or 0
        except: pass

        try:
            banned = supabase.table('profiles').select('*', count='exact', head=True).eq('status', 'banned').execute()
            stats['banned'] = banned.count or 0
        except: pass

        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        print('Error fetching user stats:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<id>/status', methods=['PUT'])
def update_user_status(id):
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        data = request.json
        new_status = data.get('status') # 'active', 'inactive', 'banned'
        is_active = data.get('is_active') # boolean
        reason = data.get('reason')
        ban_until = data.get('ban_until') # ISO string

        update_data = {}
        if new_status is not None:
            update_data['status'] = new_status
        if is_active is not None:
            update_data['is_active'] = is_active
        
        # Selalu update reason dan ban_until jika dikirim (bisa null untuk reset)
        update_data['status_reason'] = reason
        update_data['ban_until'] = ban_until

        result = supabase.table('profiles').update(update_data).eq('id', id).execute()
        
        return jsonify({
            'success': True,
            'message': f'Status user berhasil diperbarui menjadi {new_status}!',
            'data': result.data[0] if result.data else None
        })
        
    except Exception as e:
        print('Error updating user status:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/export', methods=['GET'])
def export_users_csv():
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        # Fetch all users (you might want to limit this or use a stream for huge datasets)
        result = supabase.table('profiles').select('*').order('created_at', desc=True).execute()
        
        if not result.data:
            return jsonify({'error': 'No users to export'}), 404

        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['ID', 'Full Name', 'Email', 'Status', 'Is Active', 'Is Premium', 'Created At'])
        
        # Data
        for user in result.data:
            writer.writerow([
                user.get('id'),
                user.get('full_name'),
                user.get('email'),
                user.get('status'),
                user.get('is_active'),
                user.get('is_premium'),
                user.get('created_at')
            ])
        
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=users_export.csv"
        response.headers["Content-type"] = "text/csv"
        return response

    except Exception as e:
        print('Error exporting users:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<id>', methods=['GET'])
def get_user_detail(id):
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        result = supabase.table('profiles').select('*').eq('id', id).single().execute()
        
        return jsonify({
            'success': True,
            'data': result.data
        })
        
    except Exception as e:
        print('Error fetching user detail:', str(e))
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

