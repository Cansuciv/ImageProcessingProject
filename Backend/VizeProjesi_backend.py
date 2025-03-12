from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # React ile bağlantıyı açar

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Resmi Açma
def open_image(img_path):
    img_read = cv2.imread(img_path)
    cv2.imshow("Orijinal resim", img_read)
    return img_read

# Resmi Kaydetme
def save_image(image, filename):
    save_path = os.path.join(PROCESSED_FOLDER, filename)
    cv2.imwrite("Kaydedilen resim.png", save_path)
    return save_path

# Parlaklık artırma fonksiyonu
def adjust_brightness(image, brightness=50):
    # Resmin her pikseline parlaklık ekler
    x, y, z = image.shape
    for i in range(x):
        for j in range(y):
            for k in range(z):
                image[i, j, k] = image[i, j, k] + brightness
                if image[i, j, k] > 255:
                    image[i, j, k] = 255
    return image

# Kontrast artırma fonksiyonu
def adjust_contrast(image, contrast=1.5):
    # Resmin kontrastını artırmak için scale factor uygulama
    image_contrast = cv2.convertScaleAbs(image, alpha=contrast, beta=0)
    return image_contrast

# Resmin Negatifini alma: Her pixelin renginin tersine çevrilmesi ile olur
# Örnek: Kırmızı(255,0,0) -> Cyan(0,255,255)
def negative_image(image):
    image_negative = cv2.bitwise_not(image) #image_negative = 255 - image
    cv2.imshow("Resmin Negatifi", image_negative)
    return image_negative

# Resmi Griye çevirme
def convert_gray(image):
    image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imshow("Gri Resim", image_gray)
    return image_gray

#  Resmi üç renk kanalında ayrı ayrı görüntüleme
#1.Resmi kırmızı yapma (Blue:Green:Red)
def red_image(image):
    red_image = image.copy()
    red_image[:,:,0] = 0 
    red_image[:,:,1] = 0  
    cv2.imshow("Kirmizi Resim ", red_image)
    return red_image

#2.Resmi Mavi yapma (Blue:Green:Red)
def blue_image(image):
    blue_image = image.copy()
    blue_image[:,:,1] = 0 
    blue_image[:,:,2] = 0  
    cv2.imshow("Mavi Resim", blue_image)
    return blue_image

#3.Resmi Yeşil yapma (Blue:Green:Red)
def green_image(image):
    green_image = image.copy()
    green_image[:,:,0] = 0 
    green_image[:,:,2] = 0
    cv2.imshow("Yesil Resim", green_image)
    return green_image

# Dikdörtgen çizme fonksiyonu
def draw_rectangle(image):
    mask = np.zeros_like(image, dtype=np.uint8)
    cv2.rectangle(mask, (50, 50), (200, 200), (255, 255, 255), -1)
    result = cv2.bitwise_and(image, mask)
    cv2.imshow("Dikdörtgen Çizilmiş ve Kırpılmış Resim", result)
    return result

# Daire çizme fonksiyonu
def draw_circle(image):
    mask = np.zeros_like(image, dtype=np.uint8)
    height, width = image.shape[:2]
    cv2.circle(mask, (width//2, height//2), 50, (255, 255, 255), -1)
    result = cv2.bitwise_and(image, mask)
    cv2.imshow("Daire Çizilmiş ve Kırpılmış Resim", result)
    return result

# Elips çizme fonksiyonu
def draw_ellipse(image):
    mask = np.zeros_like(image, dtype=np.uint8)
    height, width = image.shape[:2]
    cv2.ellipse(mask, (width//2, height//2), (100, 50), 0, 0, 360, (255, 255, 255), -1)
    result = cv2.bitwise_and(image, mask)
    cv2.imshow("Elips Çizilmiş ve Kırpılmış Resim", result)
    return result

# Çokgen çizme fonksiyonu
def draw_polygon(image):
    mask = np.zeros_like(image, dtype=np.uint8)
    pts = np.array([[100,50], [200,80], [250,200], [150,250], [50,200]], np.int32)
    pts = pts.reshape((-1,1,2))
    cv2.fillPoly(mask, [pts], (255,255,255))
    result = cv2.bitwise_and(image, mask)
    cv2.imshow("Çokgen Çizilmiş ve Kırpılmış Resim", result)
    return result

# Resmi işleme fonksiyonları
def process_image(image, operation):
    if operation == "negative":
        return negative_image(image)
    elif operation == "grayscale":
        return convert_gray(image)
    elif operation == "brightness":
        return adjust_brightness(image)
    elif operation == "contrast":
        return adjust_contrast(image)
    elif operation == "red":
        return red_image(image)
    elif operation == "blue":
        return blue_image(image)
    elif operation == "green":
        return green_image(image)
    elif operation == "rectangle":
        return draw_rectangle(image)
    elif operation == "circle":
        return draw_circle(image)
    elif operation == "ellipse":
        return draw_ellipse(image)
    elif operation == "polygon":
        return draw_polygon(image)
    return image

@app.route("/process", methods=["POST"])
def process():
    file = request.files["image"]
    operation = request.form["operation"]
    
    img_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(img_path)

    image = open_image(img_path)
    processed_img = process_image(image, operation)

    processed_path = save_image(processed_img, "processed.jpg")

    return send_file(processed_path, mimetype="image/jpeg")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
