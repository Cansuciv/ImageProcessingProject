from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os
import matplotlib.pyplot as plt
import io
import json
import zipfile
import base64


app = Flask(__name__)
CORS(app)


UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"

# Resmi Açma
def open_image(img_path):
    img_read = cv2.imread(img_path)
    resize_image = cv2.resize(img_read, (320, 300))
    return resize_image 


# Resmi Kaydetme
def save_image(image, filename):
    save_path = os.path.join(PROCESSED_FOLDER, filename)
    cv2.imwrite(save_path, image) 
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
def adjust_brightness(img, brightness):
    x, y, z = img.shape
    for i in range(x):
        for j in range(y):
            for k in range(z):
                img[i, j, k] = img[i, j, k] + brightness
                if img[i, j, k] > 255:
                    img[i, j, k] = 255
    return img

def thresholding(image, threshold):
    x,y,z = image.shape
    for i in range(x):
        for j in range(y):
            for k in range(z):
                if image[i,j,k] >= threshold:
                    image[i,j,k] = 255
                else:
                    image[i,j,k] = 0
    return image

def histogram(image):
    colors = ('b', 'g', 'r')  # OpenCV'de BGR sıralaması
    plt.figure(figsize=(6, 4))
    plt.xlabel("Piksel Değeri")
    plt.ylabel("Frekans")
    for i, color in enumerate(colors):
        hist = cv2.calcHist([image], [i], None, [256], [0, 256])
        plt.plot(hist, color=color)
    plt.xlim([0, 256])
    # Histogram grafiğini bir görüntü olarak kaydet
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()
    return buf

def histogram_equalization(image):
    # Convert to LAB color space and equalize the L channel
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l_equalized = cv2.equalizeHist(l)
    lab_equalized = cv2.merge((l_equalized, a, b))
    color_equalized = cv2.cvtColor(lab_equalized, cv2.COLOR_LAB2BGR)
    
    # Save the equalized image temporarily
    equalized_img_path = os.path.join(PROCESSED_FOLDER, "temp_equalized.jpg")
    cv2.imwrite(equalized_img_path, color_equalized)
    
    # Create histogram comparison
    hist_colors = ('b', 'g', 'r')
    
    # Create figure with two subplots
    plt.figure(figsize=(10, 5))
    
    # Original histogram
    plt.subplot(1, 2, 1)
    for i, color in enumerate(hist_colors):
        hist = cv2.calcHist([image], [i], None, [256], [0, 256])
        plt.plot(hist, color=color)
    plt.title("Orijinal Histogram")
    plt.xlim([0, 256])
    
    # Equalized histogram
    plt.subplot(1, 2, 2)
    for i, color in enumerate(hist_colors):
        hist_eq = cv2.calcHist([color_equalized], [i], None, [256], [0, 256])
        plt.plot(hist_eq, color=color)
    plt.title("Eşitlenmiş Histogram")
    plt.xlim([0, 256])
    
    plt.tight_layout()
    
    # Save histogram to buffer
    histogram_buf = io.BytesIO()
    plt.savefig(histogram_buf, format='png')
    histogram_buf.seek(0)
    plt.close()
    
    # Return both the equalized image path and histogram buffer
    return {
        'equalized_image': equalized_img_path,
        'histogram': histogram_buf
    }


def linear_contrast_stretching(image):
    I_min = np.min(image)
    I_max = np.max(image)
    linear_contrast_stretching_image = ((image - I_min) / (I_max - I_min) * 255).astype(np.uint8)
    return linear_contrast_stretching_image

def manual_contrast_stretching(image, in_min, in_max, out_min=0, out_max=255):
    stretched_image = np.clip((image - in_min) / (in_max - in_min) * (out_max - out_min) + out_min, out_min, out_max)
    stretched_image = stretched_image.astype(np.uint8)
    return stretched_image

def multi_linear_contrast(image, ranges):
    stretched_image = np.zeros_like(image, dtype=np.uint8)
    
    for in_min, in_max, out_min, out_max in ranges:
        mask = (image >= in_min) & (image <= in_max)
        stretched_image[mask] = np.clip((image[mask] - in_min) / (in_max - in_min) * (out_max - out_min) + out_min, out_min, out_max)
    
    return stretched_image

def manual_translate(image, dx, dy):
    h, w = image.shape[:2]
    moved_image = np.zeros_like(image)
    
    # Calculate new positions
    x_start = max(dx, 0)
    y_start = max(dy, 0)
    x_end = min(w, w + dx)
    y_end = min(h, h + dy)
    
    # Original positions
    orig_x_start = max(-dx, 0)
    orig_y_start = max(-dy, 0)
    orig_x_end = min(w, w - dx)
    orig_y_end = min(h, h - dy)
    
    moved_image[y_start:y_end, x_start:x_end] = image[orig_y_start:orig_y_end, orig_x_start:orig_x_end]
    return moved_image

def functional_translate(image, dx, dy):
    h, w = image.shape[:2]
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    translated = cv2.warpAffine(image, M, (w, h))
    return translated



def rectangle(image):
    frame_width = 10
    color = (0,0,255) 
    image[:, 0:frame_width] = color # Sol kenar    
    image[:, -frame_width:] = color # Sağ kenar   
    image[0:frame_width, :] = color # Üst kenar 
    image[-frame_width:, :] = color # Alt kenar 
    return image

def circle(image):
    height, width = image.shape[:2]
    center = (width // 2, height // 2) 
    radius = min(width, height) // 2 - 10 
    mask = np.zeros((height, width), dtype=np.uint8)
    cv2.circle(mask, center, radius, 255, -1) 
    result = cv2.bitwise_and(image, image, mask=mask)
    background = np.full_like(image, (0,0,255) )
    result = cv2.bitwise_or(result, cv2.bitwise_and(background, background, mask=~mask))
    return result

def ellipse(image):
    height, width = image.shape[:2]
    center = (width // 2, height // 2)
    axes = (width // 2 - 10, height // 2 - 80)
    angle = 0 
    start_angle = 0  
    end_angle = 360  
    mask = np.zeros((height, width), dtype=np.uint8)
    cv2.ellipse(mask, center, axes, angle, start_angle, end_angle, 255, -1)
    result = cv2.bitwise_and(image, image, mask=mask)
    background = np.full_like(image, (0,0,255) ) 
    result = cv2.bitwise_or(result, cv2.bitwise_and(background, background, mask=~mask))
    return result

def polygon(image):
    height, width = image.shape[:2]
    points = np.array([
        [width // 2, height // 4],  # Üst orta
        [width // 4 * 3, height // 4 * 3],  # Sağ alt
        [width // 2, height - height // 4],  # Alt orta
        [width // 4, height // 4 * 3],  # Sol alt
        [width // 4, height // 4],  # Sol üst
        [width // 3, height // 6],
        [width // 7, height // 13],
        [width // 5, height // 5],
        [width // 6, height // 7],
        [width // 4, height // 7],
        [width // 3, height // 5],
    ], dtype=np.int32)
    mask = np.zeros((height, width), dtype=np.uint8)
    cv2.fillPoly(mask, [points], 255)
    result = cv2.bitwise_and(image, image, mask=mask)
    background = np.full_like(image, (0,0,255) ) 
    result = cv2.bitwise_or(result, cv2.bitwise_and(background, background, mask=~mask))
    return result

def crop_image(image, shape):
    height, width = image.shape[:2]
    
    # Çerçeve rengi (BGR formatında)
    frame_color = np.array([0, 0, 255])

    # Renk eşik değerleri (renk toleransı)
    lower_bound = frame_color - 10  # Alt sınır
    upper_bound = frame_color + 10  # Üst sınır
    # Renk maskesi oluştur
    mask = cv2.inRange(image, lower_bound, upper_bound)
    # Maskeyi kullanarak çerçeve piksellerini bul
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return image  # Eğer çerçeve bulunamazsa orijinal görüntüyü döndür
    # En büyük konturu bul (çerçeve)
    largest_contour = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest_contour)
    # Kırpma işlemi
    cropped_image = image[y:y+h, x:x+w]
    return cropped_image

# Resmi işleme fonksiyonları
def process_image(image, operation, value=None):
    if operation == "convert_gray":
        return convert_gray(image)
    elif operation == "red":
        return red_image(image)
    elif operation == "green":
        return green_image(image)
    elif operation == "blue":
        return blue_image(image)
    elif operation == "negative":
        return negative_image(image)
    elif operation == "brightness" and value is not None:
        return adjust_brightness(image, value)
    elif operation == "thresholding" and value is not None:
        return thresholding(image, value)
    elif operation == "histogram":
        return histogram(image)
    elif operation == "histogram_equalization":
        return histogram_equalization(image)
    elif operation == "linear_contrast_stretching": 
        return linear_contrast_stretching(image)
    elif operation == "manual_contrast_stretching": 
        in_min = int(request.form.get("in_min", 50))
        in_max = int(request.form.get("in_max", 200))
        return manual_contrast_stretching(image, in_min, in_max)
    elif operation == "multi_linear_contrast": 
        return multi_linear_contrast(image)
    elif operation == "manual_translate": 
        return manual_translate(image, dx, dy)
    elif operation == "functional_translate": 
        return functional_translate((image, dx, dy))
    elif operation == "rectangle":
        return rectangle(image)
    elif operation == "circle":
        return circle(image)
    elif operation == "ellipse":
        return ellipse(image)
    elif operation == "polygon":
        return polygon(image)
    elif operation == "crop":
        return crop_image(image, value)
    else:
        return image


@app.route("/process", methods=["POST"])
def process():
    file = request.files.get("image")
    operation = request.form.get("operation")
    
    # Handle manual contrast stretching
    if operation == "manual_contrast_stretching":
        try:
            # Get parameters from form data
            in_min = int(request.form.get("in_min", 50))
            in_max = int(request.form.get("in_max", 200))
            out_min = int(request.form.get("out_min", 0))
            out_max = int(request.form.get("out_max", 255))
            
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Process image
            processed_img = manual_contrast_stretching(image, in_min, in_max, out_min, out_max)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()), 
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # Handle multi-linear contrast
    if operation == "multi_linear_contrast":
        try:
            ranges_json = request.form.get("ranges")
            ranges = json.loads(ranges_json)
            
            # Aralıkları kontrol et
            if not all(len(r) == 4 for r in ranges):
                return jsonify({"error": "Her aralık 4 değer içermeli"}), 400
                
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            processed_img = multi_linear_contrast(image, ranges)
            
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()), 
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # Handle translate operations
    if operation in ["manual_translate", "functional_translate"]:
        try:
            dx = int(request.form.get("dx", 0))
            dy = int(request.form.get("dy", 0))
            
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            if operation == "manual_translate":
                processed_img = manual_translate(image, dx, dy)
            else:
                processed_img = functional_translate(image, dx, dy)
                
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # Rest of your existing process function...
    value = request.form.get("value")
    if value is not None:
        value = int(value)
        
    img_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(img_path)
    image = open_image(img_path)
    
    if operation == "histogram":
        histogram_buf = histogram(image)
        return send_file(histogram_buf, mimetype="image/png")
    
    elif operation == "histogram_equalization":
        result = histogram_equalization(image)
        
        # Read the equalized image
        with open(result['equalized_image'], 'rb') as f:
            equalized_img_bytes = f.read()
        
        # Get histogram image bytes
        histogram_bytes = result['histogram'].getvalue()
        
        # Prepare response
        response = {
            'equalized_image': base64.b64encode(equalized_img_bytes).decode('utf-8'),
            'histogram_image': base64.b64encode(histogram_bytes).decode('utf-8')
        }
        
        return jsonify(response)
    
    # Process other operations
    processed_img = process_image(image, operation, value)
    _, img_buffer = cv2.imencode('.jpg', processed_img)
    return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")

@app.route("/get_equalized_image")
def get_equalized_image():
    return send_file(os.path.join(PROCESSED_FOLDER, "temp_equalized.jpg"), mimetype="image/jpeg")

@app.route("/get_histogram_image")
def get_histogram_image():
    with open(os.path.join(PROCESSED_FOLDER, "temp_histogram.png"), "rb") as f:
        return send_file(io.BytesIO(f.read()), mimetype="image/png")

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

if __name__ == "__main__":
    app.run(debug=True, port=5000)