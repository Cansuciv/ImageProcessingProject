from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os
import matplotlib.pyplot as plt
import io

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
def adjust_brightness(image, brightness):
    x, y, z = image.shape
    for i in range(x):
        for j in range(y):
            for k in range(z):
                image[i, j, k] = image[i, j, k] + brightness
                if image[i, j, k] > 255: 
                    image[i, j, k] = 255
                elif image[i, j, k] < 0: 
                    image[i, j, k] = 0
    return image

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
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l_equalized = cv2.equalizeHist(l)
    lab_equalized = cv2.merge((l_equalized, a, b))
    color_equalized = cv2.cvtColor(lab_equalized, cv2.COLOR_LAB2BGR)
    colors = ('b', 'g', 'r')

    plt.figure(figsize=(9,4))
    plt.subplot(1, 2, 1)
    plt.title("Orijinal Histogram")
    plt.xlabel("Piksel Değeri")
    plt.ylabel("Frekans")
    for i, col in enumerate(colors):
        hist = cv2.calcHist([image], [i], None, [256], [0, 256])
        plt.plot(hist, color=col)  # Renk kanalına göre çiz
    plt.xlim([0, 256])

    plt.subplot(1, 2, 2)
    plt.title("Eşitlenmiş Histogram")
    plt.xlabel("Piksel Değeri")
    plt.ylabel("Frekans")
    for i, col in enumerate(colors):
        hist_eq = cv2.calcHist([color_equalized], [i], None, [256], [0, 256])
        plt.plot(hist_eq, color=col)
    plt.xlim([0, 256])

     # Histogram grafiğini bir görüntü olarak kaydet
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()
    return buf
   
# Kontrast artırma fonksiyonu
def adjust_contrast(image, contrast):
    return cv2.convertScaleAbs(image, alpha=contrast, beta=0)



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
    elif operation == "contrast" and value is not None:
        return adjust_contrast(image, value)
    else:
        return image


@app.route("/process", methods=["POST"])
def process():
    file = request.files.get("image")
    operation = request.form.get("operation")
    value = request.form.get("value")  # Parlaklık değeri (0-255)

    if value is not None:
        value = int(value)  # String değeri sayıya çevir
        
    img_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(img_path)

    image = open_image(img_path)
    
   
    if operation == "histogram":
        histogram_buf = histogram(image)
        return send_file(histogram_buf, mimetype="image/png")
    elif operation == "histogram_equalization":
        histogram_buf = histogram_equalization(image)
        return send_file(histogram_buf, mimetype="image/png")
    
    processed_img = process_image(image, operation, value)
    processed_path = save_image(processed_img, "processed.jpg")
    return send_file(processed_path, mimetype="image/jpeg")

if __name__ == "__main__":
    app.run(debug=True, port=5000)