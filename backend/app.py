from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
import os

app = Flask(__name__)
CORS(app)  # Izinkan CORS untuk frontend

# Pastikan folder tmp ada
os.makedirs('tmp', exist_ok=True)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
