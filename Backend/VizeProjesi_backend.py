from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # React ile bağlantıyı açar

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Resmi Açma
def open_image(img_path):
    img_read = cv2.imread(img_path)
    return img_read

# Resmi Kaydetme
def save_image(image, filename):
    save_path = os.path.join(PROCESSED_FOLDER, filename)
    cv2.imwrite(save_path, image)  # Yanlış parametre düzeltildi
    return save_path

# Resmi Griye çevirme
def convert_gray(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Resmi üç renk kanalında ayrı ayrı görüntüleme
# 1. Resmi kırmızı yapma (Blue:Green:Red)
def red_image(image):
    red_image = image.copy()
    red_image[:, :, 0] = 0 
    red_image[:, :, 1] = 0  
    return red_image

# 2. Resmi Yeşil yapma (Blue:Green:Red)
def green_image(image):
    green_image = image.copy()
    green_image[:, :, 0] = 0 
    green_image[:, :, 2] = 0
    return green_image

# 3. Resmi Mavi yapma (Blue:Green:Red)
def blue_image(image):
    blue_image = image.copy()
    blue_image[:, :, 1] = 0 
    blue_image[:, :, 2] = 0  
    return blue_image

# Resmin Negatifini alma
def negative_image(image):
    return cv2.bitwise_not(image)

# Parlaklık artırma/azaltma fonksiyonu
def adjust_brightness(image, brightness=50):
    image_brightness = cv2.add(image, np.full(image.shape, brightness, dtype=np.uint8))  # Daha güvenli yöntem
    return image_brightness

# Kontrast artırma fonksiyonu
def adjust_contrast(image, contrast=1.5):
    return cv2.convertScaleAbs(image, alpha=contrast, beta=0)


# Resmi işleme fonksiyonları
def process_image(image, operation, value=None):
    if operation == "grayscale":
        return convert_gray(image)
    elif operation == "red":
        return red_image(image)
    elif operation == "green":
        return green_image(image)
    elif operation == "blue":
        return blue_image(image)
    elif operation == "negative":
        return negative_image(image)
    elif operation == "brightness":
        return adjust_brightness(image, value)
    elif operation == "contrast":
        return adjust_contrast(image, value)
    else:
        return image  # Tanımsız işlemde orijinal resmi döndür


@app.route("/process", methods=["POST"])
def process():
    file = request.files.get("image")
    operation = request.form.get("operation")
    
    if not file or not operation:
        return jsonify({"error": "Dosya veya işlem belirtilmemiş."}), 400
    
    img_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(img_path)
    
    image = open_image(img_path)
    if image is None:
        return jsonify({"error": "Geçersiz resim formatı."}), 400  # Geçersiz resim dosyası kontrolü
    
    processed_img = process_image(image, operation)
    processed_path = save_image(processed_img, "processed.jpg")

    return send_file(processed_path, mimetype="image/jpeg")

if __name__ == "__main__":
    app.run(debug=True, port=5000)