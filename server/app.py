from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import os
import logging
import easyocr

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Setup folders
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Initialize EasyOCR
reader = easyocr.Reader(['en'])  # Add more languages like ['en', 'hi'] if needed

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Text Extractor API is running'})

@app.route('/extract-text', methods=['POST'])
def extract_text():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Load and save image
        image = Image.open(file.stream).convert('RGB')
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp.jpg')
        image.save(image_path)

        # OCR with EasyOCR
        results = reader.readtext(image_path)
        extracted_text = ' '.join([text for _, text, _ in results])
        confidences = [round(conf * 100, 2) for _, _, conf in results]
        avg_conf = sum(confidences) / len(confidences) if confidences else 0

        logger.info(f"Extracted text with confidence {avg_conf:.2f}%")

        return jsonify({
            'success': True,
            'text': extracted_text.strip(),
            'confidence': round(avg_conf, 2),
            'character_count': len(extracted_text.strip())
        })

    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        return jsonify({'error': f'Failed to extract text: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
