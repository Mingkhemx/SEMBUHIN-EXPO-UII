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

# Health check
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'Sembuhin Backend API'})

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
        
        # Ambil semua email dokter untuk filter/labeling
        try:
            doctors_res = supabase.table('doctors').select('email, avatar_url').execute()
            doctor_emails = {d['email']: d.get('avatar_url') for d in doctors_res.data}
        except:
            doctor_emails = {}
        
        for u in users_data:
            email = u.get('email')
            current_role = u.get('role', 'user')
            
            # Jika email ada di tabel doctors, tambahkan role doctor
            if email in doctor_emails:
                if current_role == 'user':
                    u['role'] = 'doctor'
                elif 'doctor' not in current_role:
                    u['role'] = f"{current_role},doctor"
                
                if doctor_emails[email]:
                    u['avatar_url'] = doctor_emails[email]

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

@app.route('/api/doctor/patients', methods=['GET'])
def get_doctor_patients():
    """
    Mengambil daftar pasien yang PERNAH KONSULTASI dengan dokter ini
    """
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500

        doctor_id = request.args.get('doctor_id')
        if not doctor_id:
            return jsonify({'error': 'Doctor ID is required'}), 400

        search = request.args.get('search', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        # 1. Ambil unique patient_id dari tabel consultations untuk doctor_id ini
        cons_res = supabase.table('consultations').select('patient_id').eq('doctor_id', doctor_id).execute()
        patient_ids = list(set([c['patient_id'] for c in cons_res.data if c.get('patient_id')]))

        if not patient_ids:
            return jsonify({
                'success': True,
                'data': [],
                'total': 0,
                'page': page,
                'per_page': per_page
            })

        # 2. Query profiles untuk patient_ids tersebut
        query = supabase.table('profiles').select('*', count='exact').in_('id', patient_ids)

        if search:
            query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%")

        start = (page - 1) * per_page
        end = start + per_page - 1

        result = query.order('created_at', desc=True).range(start, end).execute()
        
        return jsonify({
            'success': True,
            'data': result.data,
            'total': result.count,
            'page': page,
            'per_page': per_page
        })

    except Exception as e:
        print('Error fetching doctor patients:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctor/stats', methods=['GET'])
def get_doctor_stats():
    """
    Mengambil statistik untuk dashboard dokter (terkait pasiennya sendiri)
    """
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500
        
        doctor_id = request.args.get('doctor_id')
        if not doctor_id:
            return jsonify({'error': 'Doctor ID is required'}), 400

        # 1. Ambil unique patient_id dari tabel consultations untuk doctor_id ini
        cons_res = supabase.table('consultations').select('patient_id, created_at').eq('doctor_id', doctor_id).execute()
        patient_data = cons_res.data or []
        patient_ids = list(set([c['patient_id'] for c in patient_data if c.get('patient_id')]))
        
        total_patients = len(patient_ids)
        
        # 2. Pasien Baru Bulan Ini (untuk dokter ini)
        from datetime import datetime
        now = datetime.now()
        start_of_month = datetime(now.year, now.month, 1).isoformat()
        
        # Filter konsultasi pertama kali di bulan ini untuk dokter ini
        new_patients_this_month = 0
        if patient_ids:
            # Cari pasien yang konsultasi pertamanya dengan dokter ini adalah di bulan ini
            # Sederhananya: hitung berapa banyak patient_id unik yang ada di data bulan ini tapi belum pernah ada sebelumnya
            # Tapi untuk kemudahan: hitung saja pasien unik yang ada di consultations bulan ini
            current_month_cons = [c['patient_id'] for c in patient_data if c['created_at'] >= start_of_month]
            new_patients_this_month = len(set(current_month_cons))
        
        return jsonify({
            'success': True,
            'stats': {
                'total_patients': total_patients,
                'new_this_month': new_patients_this_month,
                'active_patients': total_patients,
                'avg_age': 35
            }
        })
    except Exception as e:
        print('Error fetching doctor stats:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctor/dashboard-stats', methods=['GET'])
def get_doctor_dashboard_stats():
    """
    Statistik untuk dashboard utama dokter
    """
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500
        
        doctor_id = request.args.get('doctor_id')
        if not doctor_id:
            return jsonify({'error': 'Doctor ID is required'}), 400
            
        today = datetime.now().date().isoformat()
        
        # 1. Konsultasi hari ini
        cons_res = supabase.table('consultations').select('id, consultation_status').eq('doctor_id', doctor_id).eq('appointment_date', today).execute()
        today_cons = cons_res.data or []
        
        today_count = len(today_cons)
        completed_today = len([c for c in today_cons if c.get('consultation_status') == 'completed'])
        
        # 2. Total pasien (yang pernah konsultasi dengan dokter ini)
        cons_all_res = supabase.table('consultations').select('patient_id').eq('doctor_id', doctor_id).execute()
        total_patients = len(set([c['patient_id'] for c in cons_all_res.data if c.get('patient_id')]))
        
        # 3. Pesan belum dibaca
        # Ini agak kompleks karena butuh join atau subquery. Untuk sekarang mock atau query sederhana.
        unread_count = 0
        try:
            # Ambil semua ID konsultasi dokter ini
            my_cons = supabase.table('consultations').select('id').eq('doctor_id', doctor_id).execute()
            cons_ids = [c['id'] for c in my_cons.data]
            if cons_ids:
                unread_res = supabase.table('consultation_messages').select('id', count='exact').eq('sender_type', 'patient').is_('read_at', 'null').in_('consultation_id', cons_ids).execute()
                unread_count = unread_res.count or 0
        except: pass

        return jsonify({
            'success': True,
            'stats': {
                'todayConsultations': today_count,
                'totalPatients': total_patients,
                'completedToday': completed_today,
                'unreadMessages': unread_count
            }
        })
    except Exception as e:
        print('Error fetching dashboard stats:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctor/consultations', methods=['GET'])
def get_doctor_consultations():
    """
    Daftar konsultasi untuk dokter tertentu
    """
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500
            
        doctor_id = request.args.get('doctor_id')
        if not doctor_id:
            return jsonify({'error': 'Doctor ID is required'}), 400
            
        status = request.args.get('status', 'All')
        
        query = supabase.table('consultations').select('*').eq('doctor_id', doctor_id)
        
        if status != 'All':
            query = query.eq('consultation_status', status)
            
        result = query.order('created_at', desc=True).execute()
        
        return jsonify({
            'success': True,
            'data': result.data
        })
    except Exception as e:
        print('Error fetching doctor consultations:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctor/analytics', methods=['GET'])
def get_doctor_analytics():
    """
    Data analitik untuk panel dokter
    """
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500
        
        doctor_id = request.args.get('doctor_id')
        if not doctor_id:
            return jsonify({'error': 'Doctor ID is required'}), 400
            
        from datetime import datetime, timedelta
        now = datetime.now()
        thirty_days_ago = (now - timedelta(days=30)).isoformat()
        seven_days_ago = (now - timedelta(days=7)).date()
        
        # 1. Stats Utama
        # Total Konsultasi
        total_res = supabase.table('consultations').select('id', count='exact').eq('doctor_id', doctor_id).execute()
        total_cons = total_res.count or 0
        
        # Rating & Pasien Baru
        doc_res = supabase.table('doctors').select('rating').eq('id', doctor_id).single().execute()
        rating = doc_res.data.get('rating', 0) if doc_res.data else 0
        
        new_patients_res = supabase.table('consultations').select('patient_id').eq('doctor_id', doctor_id).gte('created_at', thirty_days_ago).execute()
        new_patients = len(set([c['patient_id'] for c in new_patients_res.data]))
        
        # 2. Grafik Mingguan (7 hari terakhir)
        id_days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
        weekly_data = []
        
        # Ambil konsultasi 7 hari terakhir
        cons_weekly = supabase.table('consultations').select('appointment_date').eq('doctor_id', doctor_id).gte('appointment_date', seven_days_ago.isoformat()).execute()
        
        # Hitung per hari
        day_counts = {}
        for i in range(7):
            d = (now - timedelta(days=6-i)).date()
            day_counts[d.isoformat()] = 0
            
        for c in cons_weekly.data:
            d_str = c['appointment_date']
            if d_str in day_counts:
                day_counts[d_str] += 1
        
        for i in range(7):
            d = (now - timedelta(days=6-i)).date()
            count = day_counts.get(d.isoformat(), 0)
            weekly_data.append({
                'day': id_days[d.weekday()],
                'value': count,
                'max': 15
            })

        # 3. Top Diagnosis (berdasarkan keluhan)
        all_complaints = supabase.table('consultations').select('complaint').eq('doctor_id', doctor_id).execute()
        complaint_counts = {}
        for c in all_complaints.data:
            complaint = c.get('complaint') or "Konsultasi Umum"
            # Sederhanakan keluhan (ambil kata kunci pertama atau normalisasi)
            key = complaint.split(',')[0].split('\n')[0].strip()
            complaint_counts[key] = complaint_counts.get(key, 0) + 1
            
        top_diagnoses = []
        sorted_complaints = sorted(complaint_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        max_count = sorted_complaints[0][1] if sorted_complaints else 1
        
        for name, count in sorted_complaints:
            top_diagnoses.append({
                'name': name,
                'count': count,
                'pct': int((count / max_count) * 100)
            })

        # 4. Aktivitas Terbaru
        recent_res = supabase.table('consultations').select('id, patient_name, created_at, consultation_status').eq('doctor_id', doctor_id).order('created_at', desc=True).limit(5).execute()
        activities = []
        for r in recent_res.data:
            # Format waktu relatif (mock sederhana)
            activities.append({
                'id': r['id'],
                'type': 'consultation',
                'title': f"Konsultasi dengan {r['patient_name']} {r['consultation_status']}",
                'time': r['created_at']
            })

        return jsonify({
            'success': True,
            'analytics': {
                'stats': [
                    {
                        'label': "Total Konsultasi",
                        'value': str(total_cons),
                        'trend': "+0% dari bulan lalu", # Mock trend
                        'trendUp': True
                    },
                    {
                        'label': "Tingkat Kepuasan",
                        'value': f"{rating}/5",
                        'trend': "+0 dari bulan lalu",
                        'trendUp': True
                    },
                    {
                        'label': "Rata-rata Durasi",
                        'value': "20 mnt", # Mock durasi
                        'trend': "-0 mnt dari bulan lalu",
                        'trendUp': False
                    },
                    {
                        'label': "Pasien Baru",
                        'value': str(new_patients),
                        'trend': f"+{new_patients} dari bulan lalu",
                        'trendUp': True
                    }
                ],
                'weekly_data': weekly_data,
                'top_diagnoses': top_diagnoses,
                'activities': activities
            }
        })
    except Exception as e:
        print('Error fetching doctor analytics:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctor/prescriptions', methods=['GET', 'POST'])
def handle_doctor_prescriptions():
    """
    GET: Ambil daftar resep yang dibuat dokter
    POST: Buat resep baru
    """
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500
            
        if request.method == 'GET':
            doctor_id = request.args.get('doctor_id')
            if not doctor_id:
                return jsonify({'error': 'Doctor ID is required'}), 400
                
            # Ambil resep tanpa join — hindari dependency FK PostgREST
            res = supabase.table('prescriptions').select('*').eq('doctor_id', doctor_id).order('created_at', desc=True).execute()
            
            # Kumpulkan patient_id unik, lalu fetch nama sekaligus
            patient_ids = list(set([p['patient_id'] for p in res.data if p.get('patient_id')]))
            name_map = {}
            if patient_ids:
                prof_res = supabase.table('profiles').select('id, full_name').in_('id', patient_ids).execute()
                name_map = {p['id']: p.get('full_name', 'Pasien') for p in (prof_res.data or [])}
            
            formatted = []
            for p in res.data:
                formatted.append({
                    'id': p['id'],
                    'patient_id': p['patient_id'],
                    'patient': name_map.get(p.get('patient_id', ''), 'Pasien'),
                    'date': p['created_at'],
                    'status': p['status'],
                    'medicines': p.get('medicines', []),
                    'notes': p.get('notes', '')
                })
                
            return jsonify({
                'success': True,
                'data': formatted
            })
            
        elif request.method == 'POST':
            data = request.json
            new_presc = {
                'doctor_id': data.get('doctor_id'),
                'patient_id': data.get('patient_id'),
                'medicines': data.get('medicines', []),
                'status': 'Pending',
                'notes': data.get('notes', '')
            }
            
            res = supabase.table('prescriptions').insert(new_presc).execute()
            return jsonify({
                'success': True,
                'data': res.data[0] if res.data else None
            })

    except Exception as e:
        print('Error handling doctor prescriptions:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctor/prescriptions/single', methods=['GET'])
def get_single_prescription():
    """
    Ambil data detail satu resep untuk tampilan hologram
    """
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500
            
        presc_id = request.args.get('id')
        if not presc_id:
            return jsonify({'error': 'Prescription ID is required'}), 400
            
        # Ambil resep tanpa auto-join
        res = supabase.table('prescriptions').select('*').eq('id', presc_id).single().execute()
        
        if not res.data:
            return jsonify({'error': 'Resep tidak ditemukan'}), 404
            
        p = res.data
        
        # Ambil nama pasien dari profiles secara terpisah
        patient_name = 'Pasien'
        patient_age = 25
        if p.get('patient_id'):
            prof_res = supabase.table('profiles').select('full_name, date_of_birth').eq('id', p['patient_id']).maybe_single().execute()
            if prof_res.data:
                patient_name = prof_res.data.get('full_name', 'Pasien')
                if prof_res.data.get('date_of_birth'):
                    from datetime import datetime
                    dob = datetime.fromisoformat(prof_res.data['date_of_birth'])
                    patient_age = (datetime.now() - dob).days // 365

        # Ambil info dokter secara terpisah
        doctor_name = 'Dokter Sembuhin'
        doctor_str = '-'
        if p.get('doctor_id'):
            doc_res = supabase.table('doctors').select('name, license_number').eq('id', p['doctor_id']).maybe_single().execute()
            if doc_res.data:
                doctor_name = doc_res.data.get('name', doctor_name)
                doctor_str = doc_res.data.get('license_number', doctor_str)

        formatted = {
            'id': p['id'],
            'patient_name': patient_name,
            'patient_age': patient_age,
            'doctor_name': doctor_name,
            'doctor_str': doctor_str,
            'created_at': p['created_at'],
            'medicines': p.get('medicines', []),
            'status': p['status']
        }
        
        return jsonify({
            'success': True,
            'data': formatted
        })

    except Exception as e:
        print('Error fetching single prescription:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/patient/medical-records', methods=['GET'])
def get_patient_medical_records():
    """
    Ambil semua rekam medis pasien (Konsultasi, Lab, Resep)
    """
    try:
        if not supabase:
            return jsonify({'error': 'Supabase not configured'}), 500
            
        patient_id = request.args.get('patient_id')
        if not patient_id:
            return jsonify({'error': 'Patient ID is required'}), 400

        # 1. Konsultasi
        cons_res = supabase.table('consultations').select('*').eq('patient_id', patient_id).order('created_at', desc=True).execute()
        
        # 2. Resep
        presc_res = supabase.table('prescriptions').select('*').eq('patient_id', patient_id).order('created_at', desc=True).execute()
        
        # 3. Lab (mungkin masih kosong/dummy di DB, kita buat endpointnya dulu)
        lab_res = supabase.table('lab_results').select('*').eq('patient_id', patient_id).order('created_at', desc=True).execute()
        
        records = []
        
        # Format Konsultasi
        for c in cons_res.data:
            records.append({
                'id': c['id'],
                'type': 'konsultasi',
                'title': f"Konsultasi {c.get('consultation_type', 'Umum')}",
                'date': c['created_at'],
                'doctor': c.get('doctor_name', 'Dokter Sembuhin'),
                'facility': c.get('doctor_hospital', 'RS Sembuhin'),
                'status': 'selesai' if c.get('consultation_status') == 'completed' else 'diproses',
                'summary': c.get('complaint', ''),
                'details': {
                    'Diagnosis': 'Terkonfirmasi',
                    'Catatan': c.get('notes', '-')
                }
            })
            
        # Format Resep
        for p in presc_res.data:
            med_summary = ", ".join([m['name'] for m in p.get('medicines', [])])
            details = {}
            for i, m in enumerate(p.get('medicines', [])):
                details[f"Obat {i+1}"] = f"{m['name']} ({m['dose']}) - {m['days']} hari"

            records.append({
                'id': p['id'],
                'type': 'resep',
                'title': f"Resep Obat",
                'date': p['created_at'],
                'doctor': 'Dokter Spesialis', # Bisa join ke tabel doctors jika perlu
                'status': 'selesai' if p['status'] == 'Dispensed' else 'pending',
                'summary': med_summary,
                'details': details
            })
            
        # Format Lab
        for l in lab_res.data:
            records.append({
                'id': l['id'],
                'type': 'lab',
                'title': l.get('title', 'Hasil Laboratorium'),
                'date': l['created_at'],
                'facility': l.get('facility', 'Lab Sembuhin'),
                'status': 'selesai',
                'summary': l.get('summary', ''),
                'details': l.get('details', {})
            })

        # Urutkan berdasarkan tanggal terbaru
        records.sort(key=lambda x: x['date'], reverse=True)

        return jsonify({
            'success': True,
            'data': records,
            'stats': {
                'total': len(records),
                'konsultasi': len(cons_res.data),
                'lab': len(lab_res.data),
                'resep': len(presc_res.data)
            }
        })
    except Exception as e:
        print('Error fetching medical records:', str(e))
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
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

