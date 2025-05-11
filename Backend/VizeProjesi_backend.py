from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os
import matplotlib.pyplot as plt
import io
from io import BytesIO
import json
import zipfile
import base64
from PIL import Image

app = Flask(__name__)
CORS(app)


UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"

# Resmi Açma
def open_image(img_path):
    img_read = cv2.imread(img_path)
    #resize_image = cv2.resize(img_read, (320, 300))
    return img_read 


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


def mirror_image_by_center(image, x0):
    h, w = image.shape[:2]
    mirrored_image = image.copy()
    for y1 in range(h):
        for x1 in range(w):
            x2 = -x1 + 2 * x0
            if 0 <= x2 < w:
                mirrored_image[y1, x2] = image[y1, x1]
    return mirrored_image

def handle_click_to_mirror(image):
    x0 = image.shape[1] // 2 
    
    def click_event(event, x, y, flags, param):
        nonlocal x0
        if event == cv2.EVENT_LBUTTONDOWN:
            x0 = x
            mirrored = mirror_image_by_center(image, x0) 
            cv2.imshow("Aynalanmış", mirrored)

    cv2.imshow("Orijinal", image)
    cv2.setMouseCallback("Orijinal", click_event)  


def mirror_image_horizontal(image):
    h, w = image.shape[:2]
    y0 = h // 2
    mirrored_image = image.copy()

    for y1 in range(h):
        y2 = -y1 + 2 * y0  # Aynalama formülü
        if 0 <= y2 < h:
            mirrored_image[y2, :] = image[y1, :]
    return mirrored_image

def mirror_image_angle(image,theta):
    h, w = image.shape[:2]
    x0, y0 = w // 2, h // 2 
    theta = np.radians(theta)
    mirrored_image = np.zeros_like(image)

    for y1 in range(h):
        for x1 in range(w):
            delta = (x1 - x0) * np.sin(theta) - (y1 - y0) * np.cos(theta)

            x2 = int(x1 + 2 * delta * (-np.sin(theta)))
            y2 = int(y1 + 2 * delta * (np.cos(theta)))

            if 0 <= x2 < w and 0 <= y2 < h:
                mirrored_image[y2, x2] = image[y1, x1]
    return mirrored_image


# Shearing functions
def shear_x(image, sh_x):
    h, w = image.shape[:2]
    S = np.float32([[1, sh_x, 0], [0, 1, 0]])
    new_w = w + int(sh_x * h)
    sheared_image = cv2.warpAffine(image, S, (new_w, h))
    return sheared_image

def shearing_x_manuel(image, sh_x):
    h, w = image.shape[:2]
    new_w = w + int(sh_x * h)
    sheared_image = np.zeros((h, new_w, 3), dtype=np.uint8)
    for y in range(h):
        for x in range(w):
            x2 = int(x + sh_x * y)  
            if 0 <= x2 < new_w:
                sheared_image[y, x2] = image[y, x]
    return sheared_image

def shear_y(image, sh_y):
    h, w = image.shape[:2]
    S = np.float32([[1, 0, 0], [sh_y, 1, 0]])
    new_h = h + int(sh_y * w)
    sheared_image = cv2.warpAffine(image, S, (w, new_h))
    return sheared_image

def shearing_y_manuel(image, sh_y):
    h, w = image.shape[:2]
    new_h = h + int(sh_y * w)
    sheared_image = np.zeros((new_h, w, 3), dtype=np.uint8)
    for y in range(h):
        for x in range(w):
            y2 = int(y + sh_y * x)
            if 0 <= y2 < new_h:
                sheared_image[y2, x] = image[y, x]
    return sheared_image

# Zoom-in / Zoom-out
def zoom_out_pixel_replace(image, scale_factor):
    h, w = image.shape[:2]
    new_h, new_w = h // scale_factor, w // scale_factor
    downsampled_image = np.zeros((new_h, new_w, 3), dtype=np.uint8)
    for y in range(new_h):
        for x in range(new_w):
            downsampled_image[y, x] = image[y * scale_factor, x * scale_factor]
    return downsampled_image

def zoom_out_with_interpolation(image, scale_factor):
    h, w = image.shape[:2]
    new_h, new_w = h // scale_factor, w // scale_factor
    # Bilinear Interpolation ile küçültme
    bilinear_resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
    # Bicubic Interpolation ile küçültme
    bicubic_resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
    # Lanczos Interpolation ile küçültme
    lanczos_resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    return bilinear_resized, bicubic_resized, lanczos_resized

def zoom_in_pixel_replace(image, scale_factor):
    h, w = image.shape[:2]
    new_h, new_w = h * scale_factor, w * scale_factor
    zoomed_image = np.zeros((new_h, new_w, 3), dtype=np.uint8)
    for y in range(h):
        for x in range(w):
            zoomed_image[y * scale_factor: (y + 1) * scale_factor, x * scale_factor: (x + 1) * scale_factor] = image[y, x]
    return zoomed_image

def zoom_in_with_interpolation(image, scale_factor):
    h, w = image.shape[:2]
    new_h, new_w = h * scale_factor, w * scale_factor
    # Bilinear Interpolation ile büyütme
    bilinear_resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
    # Bicubic Interpolation ile büyütme
    bicubic_resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
    # Lanczos Interpolation ile büyütme
    lanczos_resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    return bilinear_resized, bicubic_resized, lanczos_resized


#Rotation
def rotate_image_without_alias(image, angle):
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    # Alias düzeltme olmadan döndürme (NEAREST interpolation)
    rotated_image = cv2.warpAffine(image, rotation_matrix, (w, h), flags=cv2.INTER_NEAREST)
    return rotated_image

def rotate_with_interpolations(image, angle):
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    # Anti-aliasing ile döndürme (bilinear interpolasyon)
    rotated_bilinear = cv2.warpAffine(image, rotation_matrix, (w, h), flags=cv2.INTER_LINEAR)
    # Bicubic interpolasyon ile döndürme
    rotated_bicubic = cv2.warpAffine(image, rotation_matrix, (w, h), flags=cv2.INTER_CUBIC)
    # Lanczos interpolasyon ile döndürme
    rotated_lanczos = cv2.warpAffine(image, rotation_matrix, (w, h), flags=cv2.INTER_LANCZOS4)
    return rotated_bilinear, rotated_bicubic, rotated_lanczos


def crop_image(image, y1, y2, x1, x2):
    cropped_image = image[y1:y2, x1:x2]
    return cropped_image



#perspektif düzeltme
def perspektif_duzeltme(image, pts1, pts2, width, height):
    # Perspektif dönüşüm matrisini hesapla
    matrix = cv2.getPerspectiveTransform(pts1, pts2)
    # Perspektif dönüşümü uygula
    warped_image = cv2.warpPerspective(image, matrix, (width, height))                            
    return warped_image

def interactive_perspective_correction(image, points, width, height):
    try:
        # Noktaları numpy array'e çevir
        pts1 = np.float32(points)
        pts2 = np.float32([[0, 0], [width, 0], [0, height], [width, height]])
        
        # Perspektif dönüşüm matrisini hesapla
        matrix = cv2.getPerspectiveTransform(pts1, pts2)
        
        # Perspektif dönüşümünü uygula
        warped_image = cv2.warpPerspective(image, matrix, (width, height))
        
        return warped_image
    except Exception as e:
        print(f"Perspektif düzeltme hatası: {str(e)}")
        return image


# mean_filter:
def mean_filter(image, kernel_size):
    # Parse the kernel size string (format: "x,y")
    x, y = map(int, kernel_size.split(','))
    mean_filtered = cv2.blur(image, (x,y))
    return mean_filtered

# median_filter 
def median_filter(image, filter_size):
    median_filtered = cv2.medianBlur(image, filter_size )
    return median_filtered

def gaussian_blur_filter(image, kernel_size, sigma):
    x, y = map(int, kernel_size.split(','))
    gaussian_blurred = cv2.GaussianBlur(image, (x,y), sigma)
    return gaussian_blurred

def conservative_smoothing_filter(image):
    filtered_image = image.copy()
    shape = image.shape
    
    if len(shape) == 2:  # Gri tonlamalı görüntü
        rows, cols = shape
        channels = 1
    else:  # Renkli görüntü
        rows, cols, channels = shape

    for i in range(1, rows-1):
        for j in range(1, cols-1):
            if channels == 1:  # Gri tonlamalı görüntü
                region = image[i-1:i+2, j-1:j+2]
                min_val = np.min(region)
                max_val = np.max(region)
                if image[i, j] < min_val:
                    filtered_image[i, j] = min_val
                elif image[i, j] > max_val:
                    filtered_image[i, j] = max_val
            else:  # Renkli görüntü (BGR)
                for c in range(channels):
                    region = image[i-1:i+2, j-1:j+2, c]
                    min_val = np.min(region)
                    max_val = np.max(region)
                    if image[i, j, c] < min_val:
                        filtered_image[i, j, c] = min_val
                    elif image[i, j, c] > max_val:
                        filtered_image[i, j, c] = max_val
                        
    return filtered_image


def crimmins_speckle_filter(image, threshold):
    filtered_image = image.copy()
    rows, cols, channels = image.shape

    for c in range(channels):  # Her bir renk kanalı için
        for i in range(1, rows-1):
            for j in range(1, cols-1):
                center_pixel = image[i, j, c]
                neighbors = [
                    image[i-1, j, c],
                    image[i+1, j, c],
                    image[i, j-1, c],
                    image[i, j+1, c]
                ]
                avg_neighbors = np.mean(neighbors)

                if center_pixel > avg_neighbors + threshold:
                    filtered_image[i, j, c] = avg_neighbors
                elif center_pixel < avg_neighbors - threshold:
                    filtered_image[i, j, c] = avg_neighbors

    cv2.imshow("crimmins_speckle_filter", filtered_image)
    return filtered_image

# Fourier transform LPF HPF - DÜZENLENMİŞ VERSİYON
def fourier_transform(image):
    # Renkli görüntüyü BGR kanallarına ayır
    if len(image.shape) == 3:
        channels = cv2.split(image)
    else:
        channels = [image]
    
    f_transforms = []
    magnitude_spectrums = []
    
    for ch in channels:
        # Fourier dönüşümü uygula
        f_transform = np.fft.fft2(ch)
        f_transform_shifted = np.fft.fftshift(f_transform)
        
        # Magnitude spektrumunu hesapla (log scale)
        magnitude_spectrum = np.log(np.abs(f_transform_shifted) + 1)
        magnitude_spectrum_normalized = cv2.normalize(magnitude_spectrum, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        f_transforms.append(f_transform_shifted)
        magnitude_spectrums.append(magnitude_spectrum_normalized)
    
    # Renkli görüntü için kanalları birleştir
    if len(image.shape) == 3:
        magnitude_spectrum_color = cv2.merge(magnitude_spectrums)
    else:
        magnitude_spectrum_color = magnitude_spectrums[0]
    
    # Magnitude spektrumunu kaydet
    spectrum_path = os.path.join(PROCESSED_FOLDER, "temp_spectrum.png")
    cv2.imwrite(spectrum_path, magnitude_spectrum_color)
    
    return f_transforms, spectrum_path

def fourier_low_pass_filter(f_transforms, radius):
    filtered_channels = []
    
    for f_transform_shifted in f_transforms:
        rows, cols = f_transform_shifted.shape
        mask = np.zeros((rows, cols), np.uint8)
        center = (cols//2, rows//2)
        cv2.circle(mask, center, radius, 1, -1)
        
        # Filtreyi uygula
        filtered = f_transform_shifted * mask
        
        # Ters Fourier dönüşümü
        filtered_image = np.fft.ifft2(np.fft.ifftshift(filtered)).real
        filtered_channels.append(filtered_image)
    
    # Renkli görüntü için kanalları birleştir
    if len(filtered_channels) > 1:
        filtered_image_color = cv2.merge([
            cv2.normalize(ch, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8) 
            for ch in filtered_channels
        ])
    else:
        filtered_image_color = cv2.normalize(filtered_channels[0], None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    filtered_path = os.path.join(PROCESSED_FOLDER, "temp_lpf.png")
    cv2.imwrite(filtered_path, filtered_image_color)
    
    return filtered_path

def fourier_high_pass_filter(f_transforms, radius):
    filtered_channels = []
    
    for f_transform_shifted in f_transforms:
        rows, cols = f_transform_shifted.shape
        mask = np.ones((rows, cols), np.uint8)
        center = (cols//2, rows//2)
        cv2.circle(mask, center, radius, 0, -1)
        
        # Filtreyi uygula
        filtered = f_transform_shifted * mask
        
        # Ters Fourier dönüşümü
        filtered_image = np.fft.ifft2(np.fft.ifftshift(filtered)).real
        filtered_channels.append(filtered_image)
    
    # Renkli görüntü için kanalları birleştir
    if len(filtered_channels) > 1:
        filtered_image_color = cv2.merge([
            cv2.normalize(ch, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8) 
            for ch in filtered_channels
        ])
    else:
        filtered_image_color = cv2.normalize(filtered_channels[0], None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    filtered_path = os.path.join(PROCESSED_FOLDER, "temp_hpf.png")
    cv2.imwrite(filtered_path, filtered_image_color)
    
    return filtered_path

def fourier_filter_plot(image, radius):
    try:
        is_color = len(image.shape) == 3
        channels = cv2.split(image) if is_color else [image]

        lpf_channels = []
        hpf_channels = []
        spectrum_channels = []

        for ch in channels:
            f_transform = np.fft.fft2(ch)
            f_transform_shifted = np.fft.fftshift(f_transform)

            magnitude = 20 * np.log(np.abs(f_transform_shifted) + 1)
            spectrum_channels.append(magnitude)

            rows, cols = ch.shape
            center = (cols // 2, rows // 2)

            mask_lpf = np.zeros((rows, cols), np.float32)
            cv2.circle(mask_lpf, center, int(radius), 1, -1)

            mask_hpf = np.ones((rows, cols), np.float32)
            cv2.circle(mask_hpf, center, int(radius), 0, -1)

            filtered_lpf = f_transform_shifted * mask_lpf
            lpf_result = np.fft.ifft2(np.fft.ifftshift(filtered_lpf)).real

            filtered_hpf = f_transform_shifted * mask_hpf
            hpf_result = np.fft.ifft2(np.fft.ifftshift(filtered_hpf)).real

            lpf_channels.append(lpf_result)
            hpf_channels.append(hpf_result)

        if is_color:
            lpf_image = cv2.merge([cv2.normalize(c, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8) for c in lpf_channels])
            hpf_image = cv2.merge([cv2.normalize(c, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8) for c in hpf_channels])
            magnitude_spectrum = cv2.merge([
                cv2.normalize(c, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8) for c in spectrum_channels
            ])
        else:
            lpf_image = cv2.normalize(lpf_channels[0], None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
            hpf_image = cv2.normalize(hpf_channels[0], None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
            magnitude_spectrum = cv2.normalize(spectrum_channels[0], None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

        plt.figure(figsize=(12, 4))

        # Original Image
        plt.subplot(1, 4, 1)
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB) if is_color else image, cmap='gray')
        plt.title("Original Image")
        plt.axis('off')

        # Spectrum
        plt.subplot(1, 4, 2)
        plt.imshow(cv2.cvtColor(magnitude_spectrum, cv2.COLOR_BGR2RGB) if is_color else magnitude_spectrum, cmap='gray')
        plt.title("Fourier Spectrum")
        plt.axis('off')

        # LPF
        plt.subplot(1, 4, 3)
        plt.imshow(cv2.cvtColor(lpf_image, cv2.COLOR_BGR2RGB) if is_color else lpf_image, cmap='gray')
        plt.title(f"LPF (R={radius})")
        plt.axis('off')

        # HPF
        plt.subplot(1, 4, 4)
        plt.imshow(cv2.cvtColor(hpf_image, cv2.COLOR_BGR2RGB) if is_color else hpf_image, cmap='gray')
        plt.title(f"HPF (R={radius})")
        plt.axis('off')

        plt.tight_layout()
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()

        return buf

    except Exception as e:
        print(f"Fourier filter plot error: {str(e)}")
        raise e

def band_geciren_filtre(image, D1, D2):
    """Renkli görüntüler için band geçiren filtre"""
    if len(image.shape) == 3:
        channels = cv2.split(image)
    else:
        channels = [image]
    
    filtered_channels = []
    
    for ch in channels:
        # Fourier dönüşümü
        f_transform = np.fft.fft2(ch)
        f_shifted = np.fft.fftshift(f_transform)
        
        # Maske oluştur
        rows, cols = ch.shape
        center = (cols//2, rows//2)
        mask = np.zeros((rows, cols), np.uint8)
        
        for u in range(rows):
            for v in range(cols):
                D = np.sqrt((u - center[1])**2 + (v - center[0])**2)
                if D1 <= D <= D2:
                    mask[u, v] = 1
        
        # Filtre uygula
        filtered = f_shifted * mask
        img_back = np.fft.ifft2(np.fft.ifftshift(filtered)).real
        filtered_channels.append(img_back)
    
    # Kanalları birleştir
    if len(filtered_channels) > 1:
        filtered_image = cv2.merge([
            cv2.normalize(ch, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8) 
            for ch in filtered_channels
        ])
    else:
        filtered_image = cv2.normalize(filtered_channels[0], None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    return filtered_image

def band_durduran_filtre(image, D1, D2):
    """Renkli görüntüler için band durduran filtre"""
    if len(image.shape) == 3:
        channels = cv2.split(image)
    else:
        channels = [image]
    
    filtered_channels = []
    
    for ch in channels:
        # Fourier dönüşümü
        f_transform = np.fft.fft2(ch)
        f_shifted = np.fft.fftshift(f_transform)
        
        # Maske oluştur
        rows, cols = ch.shape
        center = (cols//2, rows//2)
        mask = np.ones((rows, cols), np.uint8)
        
        for u in range(rows):
            for v in range(cols):
                D = np.sqrt((u - center[1])**2 + (v - center[0])**2)
                if D1 <= D <= D2:
                    mask[u, v] = 0
        
        # Filtre uygula
        filtered = f_shifted * mask
        img_back = np.fft.ifft2(np.fft.ifftshift(filtered)).real
        filtered_channels.append(img_back)
    
    # Kanalları birleştir
    if len(filtered_channels) > 1:
        filtered_image = cv2.merge([
            cv2.normalize(ch, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8) 
            for ch in filtered_channels
        ])
    else:
        filtered_image = cv2.normalize(filtered_channels[0], None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    return filtered_image

def band_gecirendurduran_plot(image, D1, D2):
    """Band geçiren ve durduran filtrelerin karşılaştırmalı görseli"""
    try:
        is_color = len(image.shape) == 3
        channels = cv2.split(image) if is_color else [image]
        
        # Fourier dönüşümleri ve spektrumlar
        f_transforms = []
        magnitude_spectrums = []
        
        for ch in channels:
            f_transform = np.fft.fft2(ch)
            f_shifted = np.fft.fftshift(f_transform)
            magnitude = 20 * np.log(np.abs(f_shifted) + 1)
            f_transforms.append(f_shifted)
            magnitude_spectrums.append(magnitude)
        
        # Spektrum görüntüsü
        if is_color:
            magnitude_spectrum = cv2.merge([
                cv2.normalize(mag, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8) 
                for mag in magnitude_spectrums
            ])
        else:
            magnitude_spectrum = cv2.normalize(magnitude_spectrums[0], None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        
        # Band geçiren ve durduran filtre sonuçları
        band_pass_result = band_geciren_filtre(image, D1, D2)
        band_stop_result = band_durduran_filtre(image, D1, D2)
        
        # Plot oluştur
        plt.figure(figsize=(12, 4))
        
        # Orijinal görüntü
        plt.subplot(1, 4, 1)
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB) if is_color else image, cmap='gray')
        plt.title("Original Image")
        plt.axis('off')
        
        # Fourier spektrumu
        plt.subplot(1, 4, 2)
        plt.imshow(cv2.cvtColor(magnitude_spectrum, cv2.COLOR_BGR2RGB) if is_color else magnitude_spectrum, cmap='gray')
        plt.title("Fourier Spectrum")
        plt.axis('off')
        
        # Band geçiren sonuç
        plt.subplot(1, 4, 3)
        plt.imshow(cv2.cvtColor(band_pass_result, cv2.COLOR_BGR2RGB) if is_color else band_pass_result, cmap='gray')
        plt.title(f"Band Pass ({D1}-{D2})")
        plt.axis('off')
        
        # Band durduran sonuç
        plt.subplot(1, 4, 4)
        plt.imshow(cv2.cvtColor(band_stop_result, cv2.COLOR_BGR2RGB) if is_color else band_stop_result, cmap='gray')
        plt.title(f"Band Stop ({D1}-{D2})")
        plt.axis('off')
        
        plt.tight_layout()
        
        # Plot'u belleğe kaydet
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        return buf
        
    except Exception as e:
        print(f"Band filter plot error: {str(e)}")
        raise e


def butterworth_filter(image_shape, D0, n, highpass=False):
    rows, cols = image_shape[:2]  # Renkli görüntü için ilk iki boyutu al
    mask = np.zeros((rows, cols), np.float32)
    center = (cols // 2, rows // 2)

    for u in range(rows):
        for v in range(cols):
            D = np.sqrt((u - center[1])**2 + (v - center[0])**2)
            if highpass:
                H = 1 - (1 / (1 + (D / D0)**(2 * n)))
            else:
                H = 1 / (1 + (D / D0)**(2 * n))
            mask[u, v] = H

    return mask

def butterworth_lpf(image, D0, n):
    if len(image.shape) == 3:
        channels = cv2.split(image)
    else:
        channels = [image]
    
    filtered_channels = []
    
    for ch in channels:
        f_transform = np.fft.fft2(ch)
        f_shifted = np.fft.fftshift(f_transform)
        
        mask = butterworth_filter(ch.shape, D0, n, highpass=False)
        filtered = f_shifted * mask
        
        img_back = np.fft.ifft2(np.fft.ifftshift(filtered)).real
        img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        filtered_channels.append(img_back)
        
    
    
    if len(filtered_channels) > 1:
        result = cv2.merge(filtered_channels)
    else:
        result = filtered_channels[0]
    
    cv2.imshow("Butterworth LPF", result)
    return result


def butterworth_hpf(image, D0, n):
    if len(image.shape) == 3:
        channels = cv2.split(image)
    else:
        channels = [image]
    
    filtered_channels = []

    for ch in channels:
        f_transform = np.fft.fft2(ch)
        f_shifted = np.fft.fftshift(f_transform)

        mask = butterworth_filter(ch.shape, D0, n, highpass=True)
        filtered = f_shifted * mask

        img_back = np.fft.ifft2(np.fft.ifftshift(filtered)).real

        img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

        filtered_channels.append(img_back)

    if len(filtered_channels) > 1:
        result = cv2.merge(filtered_channels)
    else:
        result = filtered_channels[0]

    # Bu satırı yoruma alabilirsiniz çünkü dışarıda gösterim yapıyorsunuz
    cv2.imshow("Butterworth HPF", result)
    return result



def butterworth_plot(image, D0, n):
    try:
        # Eğer görüntü gri ise, tek kanal listele
        if len(image.shape) == 2 or image.shape[2] == 1:
            channels = [image]
        else:
            # Renkli ise kanallara ayır (BGR)
            channels = cv2.split(image)

        lpf_channels = []
        hpf_channels = []

        for channel in channels:
            # Fourier dönüşümü
            f_transform = np.fft.fft2(channel)
            f_shifted = np.fft.fftshift(f_transform)

            # Filtreleri oluştur
            lpf_mask = butterworth_filter(channel.shape, D0, n, highpass=False)
            hpf_mask = butterworth_filter(channel.shape, D0, n, highpass=True)

            # Filtreleri uygula
            lpf_filtered = np.fft.ifft2(np.fft.ifftshift(f_shifted * lpf_mask)).real
            hpf_filtered = np.fft.ifft2(np.fft.ifftshift(f_shifted * hpf_mask)).real

            # Normalize
            lpf_filtered = cv2.normalize(lpf_filtered, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
            hpf_filtered = cv2.normalize(hpf_filtered, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

            lpf_channels.append(lpf_filtered)
            hpf_channels.append(hpf_filtered)

        # Renkli görüntüler oluştur
        lpf_result = cv2.merge(lpf_channels) if len(lpf_channels) == 3 else lpf_channels[0]
        hpf_result = cv2.merge(hpf_channels) if len(hpf_channels) == 3 else hpf_channels[0]
        original_display = image if len(image.shape) == 3 else image.copy()

        # Plot
        plt.figure(figsize=(12, 4))
        plt.subplot(1, 3, 1)
        plt.imshow(cv2.cvtColor(original_display, cv2.COLOR_BGR2RGB))
        plt.title("Original")
        plt.axis('off')

        plt.subplot(1, 3, 2)
        plt.imshow(cv2.cvtColor(lpf_result, cv2.COLOR_BGR2RGB) if len(lpf_channels) == 3 else lpf_result, cmap='gray')
        plt.title("Butterworth LPF")
        plt.axis('off')

        plt.subplot(1, 3, 3)
        plt.imshow(cv2.cvtColor(hpf_result, cv2.COLOR_BGR2RGB) if len(hpf_channels) == 3 else hpf_result, cmap='gray')
        plt.title("Butterworth HPF")
        plt.axis('off')

        plt.tight_layout()

        # Save plot to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        return buf

    except Exception as e:
        print(f"Butterworth filter plot error: {str(e)}")
        raise e
    

def gaussian_filter(image_shape, D0, highpass=False):
    rows, cols = image_shape[:2]
    mask = np.zeros((rows, cols), np.float32)
    center = (cols // 2, rows // 2)

    for u in range(rows):
        for v in range(cols):
            D = np.sqrt((u - center[1])**2 + (v - center[0])**2)
            H = np.exp(-(D**2) / (2 * (D0**2))) if not highpass else 1 - np.exp(-(D**2) / (2 * (D0**2)))
            mask[u, v] = H

    return mask

def gaussian_lpf(image, D0):
    channels = cv2.split(image) if len(image.shape) == 3 else [image]
    filtered_channels = []

    for ch in channels:
        f_transform = np.fft.fft2(ch)
        f_shifted = np.fft.fftshift(f_transform)

        mask = gaussian_filter(ch.shape, D0)
        filtered = f_shifted * mask

        img_back = np.fft.ifft2(np.fft.ifftshift(filtered)).real
        img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        filtered_channels.append(img_back)

    result = cv2.merge(filtered_channels) if len(filtered_channels) > 1 else filtered_channels[0]
    cv2.imshow("Gaussian LPF", result)
    return result

def gaussian_hpf(image, D0):
    channels = cv2.split(image) if len(image.shape) == 3 else [image]
    filtered_channels = []

    for ch in channels:
        f_transform = np.fft.fft2(ch)
        f_shifted = np.fft.fftshift(f_transform)

        mask = gaussian_filter(ch.shape, D0, highpass=True)
        filtered = f_shifted * mask

        img_back = np.fft.ifft2(np.fft.ifftshift(filtered)).real
        img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        filtered_channels.append(img_back)

    result = cv2.merge(filtered_channels) if len(filtered_channels) > 1 else filtered_channels[0]
    cv2.imshow("Gaussian HPF", result)
    return result

def gaussian_plot(image, D0):
    try:
        channels = cv2.split(image) if len(image.shape) == 3 else [image]
        lpf_channels = []
        hpf_channels = []

        for channel in channels:
            f_transform = np.fft.fft2(channel)
            f_shifted = np.fft.fftshift(f_transform)

            lpf_mask = gaussian_filter(channel.shape, D0, highpass=False)
            hpf_mask = gaussian_filter(channel.shape, D0, highpass=True)

            lpf_filtered = np.fft.ifft2(np.fft.ifftshift(f_shifted * lpf_mask)).real
            hpf_filtered = np.fft.ifft2(np.fft.ifftshift(f_shifted * hpf_mask)).real

            lpf_filtered = cv2.normalize(lpf_filtered, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
            hpf_filtered = cv2.normalize(hpf_filtered, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

            lpf_channels.append(lpf_filtered)
            hpf_channels.append(hpf_filtered)

        lpf_result = cv2.merge(lpf_channels) if len(lpf_channels) == 3 else lpf_channels[0]
        hpf_result = cv2.merge(hpf_channels) if len(hpf_channels) == 3 else hpf_channels[0]
        original_display = image if len(image.shape) == 3 else image.copy()

        plt.figure(figsize=(12, 4))
        plt.subplot(1, 3, 1)
        plt.imshow(cv2.cvtColor(original_display, cv2.COLOR_BGR2RGB))
        plt.title("Original")
        plt.axis('off')

        plt.subplot(1, 3, 2)
        plt.imshow(cv2.cvtColor(lpf_result, cv2.COLOR_BGR2RGB) if len(lpf_channels) == 3 else lpf_result, cmap='gray')
        plt.title("Gaussian LPF")
        plt.axis('off')

        plt.subplot(1, 3, 3)
        plt.imshow(cv2.cvtColor(hpf_result, cv2.COLOR_BGR2RGB) if len(hpf_channels) == 3 else hpf_result, cmap='gray')
        plt.title("Gaussian HPF")
        plt.axis('off')

        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()
        return buf

    except Exception as e:
        print(f"Gaussian filter plot error: {str(e)}")
        raise e
    

def homomorphic_filter(image, d0, h_l, h_h, c):
    # Görüntüyü gri tona çevir
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Logaritmik dönüşüm
    log_image = np.log1p(np.float32(gray))

    # Fourier dönüşümü
    f_transform = np.fft.fft2(log_image)
    f_transform_shifted = np.fft.fftshift(f_transform)

    # Homomorfik filtre oluştur
    rows, cols = gray.shape
    center = (cols//2, rows//2)
    H = np.zeros((rows, cols), np.float32)

    for u in range(rows):
        for v in range(cols):
            D = np.sqrt((u - center[1])**2 + (v - center[0])**2)
            H[u, v] = (h_h - h_l) * (1 - np.exp(-c * (D**2 / d0**2))) + h_l

    # Filtreyi uygula
    filtered = f_transform_shifted * H
    filtered_image = np.fft.ifft2(np.fft.ifftshift(filtered)).real

   # Üstel dönüşüm
    final_image = np.expm1(filtered_image)
    final_image = cv2.normalize(final_image, None, 0, 255, cv2.NORM_MINMAX)
    final_image = np.uint8(final_image)
    cv2.imshow("homomorphic_filter", final_image)
    return final_image


def sobel_x(image, ksize):
    sobel_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize)
    sobel_x_norm = cv2.normalize(sobel_x, None, 0, 255, cv2.NORM_MINMAX)
    sobel_x_uint8 = sobel_x_norm.astype(np.uint8)
    cv2.imshow("Sobel X", sobel_x_uint8)
    return sobel_x_uint8

def sobel_y(image, ksize):
    sobel_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize)
    sobel_y_norm = cv2.normalize(sobel_y, None, 0, 255, cv2.NORM_MINMAX)
    sobel_y_uint8 = sobel_y_norm.astype(np.uint8)
    cv2.imshow("Sobel Y", sobel_y_uint8)
    return sobel_y_uint8


def sobel_magnitude(image, ksize):
    # Eğer görüntü renkliyse gri tonlamaya çevir
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    
    sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=ksize)
    sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=ksize)
    sobel_magnitude = cv2.magnitude(sobel_x, sobel_y)
    sobel_mag_norm = cv2.normalize(sobel_magnitude, None, 0, 255, cv2.NORM_MINMAX)
    sobel_mag_uint8 = sobel_mag_norm.astype(np.uint8)
    return sobel_mag_uint8
    
def sobel_plot(image, ksize):
    try:
        # Renkli görüntüyü griye çevir
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Sobel işlemleri
        sobel_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=ksize)
        sobel_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=ksize)
        sobel_mag = cv2.magnitude(sobel_x, sobel_y)

        # Görselleri normalize et
        sobel_x_norm = cv2.normalize(sobel_x, None, 0, 255, cv2.NORM_MINMAX)
        sobel_y_norm = cv2.normalize(sobel_y, None, 0, 255, cv2.NORM_MINMAX)
        sobel_mag_norm = cv2.normalize(sobel_mag, None, 0, 255, cv2.NORM_MINMAX)

        # Görselleri çiz
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 3, 1)
        plt.imshow(sobel_x_norm, cmap='gray')
        plt.title("Sobel X")
        plt.axis('off')

        plt.subplot(1, 3, 2)
        plt.imshow(sobel_y_norm, cmap='gray')
        plt.title("Sobel Y")
        plt.axis('off')

        plt.subplot(1, 3, 3)
        plt.imshow(sobel_mag_norm, cmap='gray')
        plt.title("Toplam Kenar (|G|)")
        plt.axis('off')

        plt.tight_layout()
        
        # Plot'u belleğe kaydet
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        plt.close()
        
        return buf

    except Exception as e:
        print(f"Sobel plot error: {str(e)}")
        raise e
    
def prewitt_x(image):
    prewitt_x = cv2.filter2D(image, -1, np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]))
    prewitt_x_norm = cv2.normalize(prewitt_x, None, 0, 255, cv2.NORM_MINMAX)
    prewitt_x_uint8 = prewitt_x_norm.astype(np.uint8)
    cv2.imshow("Prewitt X", prewitt_x_uint8)
    return prewitt_x_uint8

def prewitt_y(image):
    prewitt_y = cv2.filter2D(image, -1, np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]]))
    prewitt_y_norm = cv2.normalize(prewitt_y, None, 0, 255, cv2.NORM_MINMAX)
    prewitt_y_uint8 = prewitt_y_norm.astype(np.uint8)
    cv2.imshow("Prewitt Y", prewitt_y_uint8)
    return prewitt_y_uint8


def prewitt_magnitude(image):
    prewitt_x = cv2.filter2D(image, -1, np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]))
    prewitt_y = cv2.filter2D(image, -1, np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]]))
    
    # Kenar büyüklüğünü hesapla
    prewitt_magnitude = cv2.magnitude(prewitt_x.astype(np.float32), prewitt_y.astype(np.float32))

    prewitt_mag_norm = cv2.normalize(prewitt_magnitude, None, 0, 255, cv2.NORM_MINMAX)
    prewitt_mag_uint8 = prewitt_mag_norm.astype(np.uint8)
    cv2.imshow("Prewitt Toplam (|G|)", prewitt_mag_uint8)
    return prewitt_mag_uint8
    
def prewitt_plot(image):
    try:
        # Convert to grayscale if color image
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Calculate Prewitt components
        prewitt_x = cv2.filter2D(image, -1, np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]))
        prewitt_y = cv2.filter2D(image, -1, np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]]))
        prewitt_magnitude = cv2.magnitude(
            prewitt_x.astype(np.float32), 
            prewitt_y.astype(np.float32)
        )

        # Normalize images for display
        prewitt_x_norm = cv2.normalize(prewitt_x, None, 0, 255, cv2.NORM_MINMAX)
        prewitt_y_norm = cv2.normalize(prewitt_y, None, 0, 255, cv2.NORM_MINMAX)
        prewitt_mag_norm = cv2.normalize(prewitt_magnitude, None, 0, 255, cv2.NORM_MINMAX)

        # Create plot
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 3, 1)
        plt.imshow(prewitt_x_norm, cmap='gray')
        plt.title("Prewitt X")
        plt.axis('off')

        plt.subplot(1, 3, 2)
        plt.imshow(prewitt_y_norm, cmap='gray')
        plt.title("Prewitt Y")
        plt.axis('off')

        plt.subplot(1, 3, 3)
        plt.imshow(prewitt_mag_norm, cmap='gray')
        plt.title("Toplam Kenar (|G|)")
        plt.axis('off')

        plt.tight_layout()
        
        # Save plot to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        plt.close()
        
        return buf

    except Exception as e:
        print(f"Prewitt plot error: {str(e)}")
        raise e


def roberts_x(image):
    roberts_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
    roberts_x_result = cv2.filter2D(image, -1, roberts_x)
    roberts_x_norm = cv2.normalize(roberts_x_result, None, 0, 255, cv2.NORM_MINMAX)
    roberts_x_uint8 = roberts_x_norm.astype(np.uint8)
    cv2.imshow("Roberts X", roberts_x_uint8)
    return roberts_x_uint8

def roberts_y(image):
    roberts_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
    roberts_y_result = cv2.filter2D(image, -1, roberts_y)
    roberts_y_norm = cv2.normalize(roberts_y_result, None, 0, 255, cv2.NORM_MINMAX)
    roberts_y_uint8 = roberts_y_norm.astype(np.uint8)
    cv2.imshow("Roberts Y", roberts_y_uint8)
    return roberts_y_uint8


def roberts_magnitude(image):
    roberts_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
    roberts_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
    
    # Filtreleri uygula
    roberts_x_result = cv2.filter2D(image, -1, roberts_x)
    roberts_y_result = cv2.filter2D(image, -1, roberts_y)
    
    roberts_magnitude = cv2.magnitude(roberts_x_result.astype(np.float32), roberts_y_result.astype(np.float32))

    roberts_mag_norm = cv2.normalize(roberts_magnitude, None, 0, 255, cv2.NORM_MINMAX)
    roberts_mag_uint8 = roberts_mag_norm.astype(np.uint8)
    cv2.imshow("Roberts Toplam (|G|)", roberts_mag_uint8)
    return roberts_mag_uint8
    
def roberts_plot(image):
    try:
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        roberts_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
        roberts_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
        
        # Filtreleri uygula
        roberts_x_result = cv2.filter2D(image, -1, roberts_x)
        roberts_y_result = cv2.filter2D(image, -1, roberts_y)
        
        roberts_magnitude = cv2.magnitude(roberts_x_result.astype(np.float32), roberts_y_result.astype(np.float32))

        # Görselleri çiz
        plt.figure(figsize=(12, 4))
        plt.subplot(1, 3, 1)
        plt.imshow(roberts_x_result, cmap='gray')
        plt.title("Roberts X")
        plt.axis('off')

        plt.subplot(1, 3, 2)
        plt.imshow(roberts_y_result, cmap='gray')
        plt.title("Roberts Y")
        plt.axis('off')

        plt.subplot(1, 3, 3)
        plt.imshow(roberts_magnitude, cmap='gray')
        plt.title("Toplam Kenar (|G|)")
        plt.axis('off')

        plt.tight_layout()
        
        # Save plot to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        plt.close()
        
        return buf

    except Exception as e:
        print(f"Roberts plot error: {str(e)}")
        raise e
        
def compass_edge_detection(image, compass_matrices):
    try:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        compass_kernels = [
            np.array(compass_matrices["E"], dtype=np.float32),
            np.array(compass_matrices["W"], dtype=np.float32),
            np.array(compass_matrices["N"], dtype=np.float32),
            np.array(compass_matrices["S"], dtype=np.float32)
        ]

        edges = np.zeros_like(image, dtype=np.float32)

        for kernel in compass_kernels:
            edge = cv2.filter2D(image, -1, kernel)
            edges = np.maximum(edges, edge)

        # Normalize the edges to 0-255 range
        edges_normalized = cv2.normalize(edges, None, 0, 255, cv2.NORM_MINMAX)
        edges_uint8 = edges_normalized.astype(np.uint8)

        # If original was color, convert back to color (optional)
        if len(image.shape) == 3:
            edges_uint8 = cv2.cvtColor(edges_uint8, cv2.COLOR_GRAY2BGR)

        return edges_uint8

    except Exception as e:
        print(f"Compass Edge Detection Error: {str(e)}")
        raise e

def canny(image, threshold1, threshold2):
    try:
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # Apply Canny edge detection
        edges = cv2.Canny(gray, threshold1, threshold2)
       
        return edges

    except Exception as e:
        print(f"Canny edge detection error: {str(e)}")
        raise e

def laplace_edge_detection(image):
    try:
        # Convert to grayscale if color image
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # Apply Laplace filter
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)

        # Take absolute and convert to uint8
        laplacian_abs = np.uint8(np.absolute(laplacian))

        # Optional: Convert to 3-channel for color consistency
        if len(image.shape) == 3:
            laplacian_abs = cv2.cvtColor(laplacian_abs, cv2.COLOR_GRAY2BGR)

        return laplacian_abs

    except Exception as e:
        print(f"Laplace Edge Detection Error: {str(e)}")
        raise e
    
def gabor_filter(image, ksize, sigma, pi, lambd, gamma, psi):
    try:
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # Gabor kernel oluştur
        gabor_kernel = cv2.getGaborKernel((ksize, ksize), sigma, np.pi/pi, lambd, gamma, psi, ktype=cv2.CV_32F)
        
        # Filtreyi uygula
        filtered = cv2.filter2D(gray, cv2.CV_8UC3, gabor_kernel)
        
        # Eğer orijinal renkliyse, gri görüntüyü BGR'ye çevir
        if len(image.shape) == 3:
            filtered = cv2.cvtColor(filtered, cv2.COLOR_GRAY2BGR)
        
        return filtered

    except Exception as e:
        print(f"Gabor Filter Error: {str(e)}")
        raise e
    
def hough_line_detection(image, threshold, angle_resolution, canny_threshold1, canny_threshold2):
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        edges = cv2.Canny(gray, canny_threshold1, canny_threshold2)

        lines = cv2.HoughLines(edges, 1, np.pi / angle_resolution, threshold)
        output = image.copy()

        if lines is not None:
            for line in lines:
                rho, theta = line[0]
                a, b = np.cos(theta), np.sin(theta)
                x0, y0 = a * rho, b * rho
                x1, y1 = int(x0 + 1000 * (-b)), int(y0 + 1000 * (a))
                x2, y2 = int(x0 - 1000 * (-b)), int(y0 - 1000 * (a))
                cv2.line(output, (x1, y1), (x2, y2), (0, 255, 0), 2)
        else:
            print("Doğru bulunamadı.")

        return output

    except Exception as e:
        print(f"Hough Line Detection Error: {str(e)}")
        raise e


def hough_circle_detection(image, dp, minDist, param1, param2, minRadius, maxRadius,blur_ksize, blur_sigma):
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        blurred = cv2.GaussianBlur(gray, blur_ksize, blur_sigma)

        circles = cv2.HoughCircles(blurred, cv2.HOUGH_GRADIENT, dp, minDist,
                                   param1=param1, param2=param2,
                                   minRadius=minRadius, maxRadius=maxRadius)

        output = image.copy()
        if circles is not None:
            circles = np.uint16(np.around(circles))
            for i in circles[0, :]:
                cv2.circle(output, (i[0], i[1]), i[2], (0, 255, 0), 2)
                cv2.circle(output, (i[0], i[1]), 2, (255, 0, 0), 3)
        else:
            print("Çember bulunamadı.")

        return output

    except Exception as e:
        print(f"Hough Circle Detection Error: {str(e)}")
        raise e
    

def kmeans_segmentation(image, k, max_iter, epsilon):
    try:
        # Reshape the image to 2D array (pixels)
        pixel_values = image.reshape((-1, 3))
        pixel_values = np.float32(pixel_values)

        # K-Means algorithm
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, max_iter, epsilon)
        _, labels, centers = cv2.kmeans(pixel_values, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

        # Convert the centers to uint8
        centers = np.uint8(centers)
        segmented_image = centers[labels.flatten()].reshape(image.shape)

        return segmented_image

    except Exception as e:
        print(f"K-Means Error: {str(e)}")
        raise e
    

def erode(image, kernel_size, iterations):
    try:
        # Kernel boyutunu "x,y" formatında al ve tuple'a çevir
        if isinstance(kernel_size, str):
            kx, ky = map(int, kernel_size.split(','))
        else:
            kx, ky = kernel_size, kernel_size  # Geriye uyumluluk
        
        # Kernel oluştur
        kernel = np.ones((kx, ky), np.uint8)
        
        # Erozyon uygula
        eroded = cv2.erode(image, kernel, iterations=iterations)
        
        return eroded
    except Exception as e:
        print(f"Erosion error: {str(e)}")
        raise e
    
def dilate(image, kernel_size, iterations):
    try:
        # Parse kernel size (format: "x,y")
        kx, ky = map(int, kernel_size.split(','))
        
        # Create kernel
        kernel = np.ones((kx, ky), np.uint8)
        
        # Apply dilation
        dilated = cv2.dilate(image, kernel, iterations=iterations)
        
        return dilated
    except Exception as e:
        print(f"Dilation error: {str(e)}")
        raise e

    
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
    elif operation == "manual_translate"and value is not None:
        return manual_translate(image, value, value)
    elif operation == "functional_translate" and value is not None:
        return functional_translate((image, value, value))
    elif operation == "mirror_image_by_center":
        return mirror_image_by_center(image, image.shape[1] // 2)
    elif operation == "handle_click_to_mirror":
        return handle_click_to_mirror(image, image.shape[1] // 2) 
    elif operation == "mirror_image_horizontal":
        return mirror_image_horizontal(image)
    elif operation == "mirror_image_angle" and value is not None:
        return mirror_image_angle(image, value)
    elif operation == "shear_x" and value is not None:
        return shear_x(image, value)
    elif operation == "shearing_x_manuel" and value is not None:
        return shearing_x_manuel(image, value)
    elif operation == "shear_y" and value is not None:
        return shear_y(image, value)
    elif operation == "shearing_y_manuel" and value is not None:
        return shearing_y_manuel(image, value)
    elif operation == "zoom_out_pixel_replace" and value is not None:
        return zoom_out_pixel_replace(image, value)
    elif operation == "zoom_out_with_interpolation" and value is not None:
        return zoom_out_with_interpolation(image, value)
    elif operation == "zoom_in_pixel_replace" and value is not None:
        return zoom_in_pixel_replace(image, value)
    elif operation == "zoom_in_with_interpolation" and value is not None:
        return zoom_in_with_interpolation(image, value)
    elif operation == "rotate_image_without_alias" and value is not None:
        return rotate_image_without_alias(image, value)
    elif operation == "rotate_with_interpolations" and value is not None:
        return rotate_with_interpolations(image, value)
    elif operation == "crop_image" and value is not None:
        return crop_image(image, value, value, value, value)
    elif operation == "perspektif_duzeltme" and value is not None:
        return perspektif_duzeltme(image, value, value, value, value)
    elif operation == "interactive_perspective_correction" and value is not None:
        return interactive_perspective_correction(image, value, value)
    elif operation == "mean_filter" and value is not None:
        return mean_filter(image, (value, value))
    elif operation == "median_filter" and value is not None:
        return median_filter(image, value)
    elif operation == "gaussian_blur_filter" and value is not None:
        return gaussian_blur_filter(image, (value, value), value)
    elif operation == "conservative_smoothing_filter":
        return conservative_smoothing_filter(image)
    elif operation == "crimmins_speckle_filter" and value is not None:
        return crimmins_speckle_filter(image, value)
    elif operation == "fourier_transform":
        fourier_transform(image)
        return image
    elif operation == "fourier_low_pass_filter" and value is not None:
        f_transform_shifted, _ = fourier_transform(image)
        return fourier_low_pass_filter(f_transform_shifted, value)
    elif operation == "fourier_high_pass_filter" and value is not None:
        f_transform_shifted, _ = fourier_transform(image)
        return fourier_high_pass_filter(f_transform_shifted, value)
    elif operation == "fourier_filter_plot" and value is not None:
        f_transform_shifted, _ = fourier_transform(image)
        return fourier_filter_plot(f_transform_shifted, value)
    elif operation == "band_geciren_filtre" and value is not None:
        D1, D2 = map(int, value.split(','))
        f_transform_shifted, _ = fourier_transform(image)
        return band_geciren_filtre(f_transform_shifted, D1, D2)
    elif operation == "band_durduran_filtre" and value is not None:
        D1, D2 = map(int, value.split(','))
        f_transform_shifted, _ = fourier_transform(image)
        return band_durduran_filtre(f_transform_shifted, D1, D2)
    elif operation == "band_gecirendurduran_plot" and value is not None:
        D1, D2 = map(int, value.split(','))
        f_transform_shifted, spectrum_path = fourier_transform(image)
        magnitude_spectrum = cv2.imread(spectrum_path, cv2.IMREAD_GRAYSCALE)
        band_pass = band_geciren_filtre(f_transform_shifted, D1, D2)
        band_stop = band_durduran_filtre(f_transform_shifted, D1, D2)
        return band_gecirendurduran_plot(image, magnitude_spectrum, band_pass, band_stop)
    elif operation == "butterworth_lpf":
        D0, n = map(int, value.split(','))
        return butterworth_lpf(image, D0, n)
    elif operation == "butterworth_hpf":
        D0, n = map(int, value.split(','))
        return butterworth_hpf(image, D0, n)
    elif operation == "butterworth_plot":
        D0, n = map(int, value.split(','))
        return butterworth_plot(image, D0, n)
    elif operation == "gaussian_lpf":
        D0 = int(value)
        return gaussian_lpf(image, D0)
    elif operation == "gaussian_hpf":
        D0 = int(value)
        return gaussian_hpf(image, D0)
    elif operation == "gaussian_plot":
        D0 = int(value)
        return gaussian_plot(image, D0)
    elif operation == "homomorphic_filter" and value is not None:
        return homomorphic_filter(image, value, value, value, value)
    elif operation == "sobel_x" and value is not None:
        ksize = int(value)
        return sobel_x(image, ksize)
    elif operation == "sobel_y" and value is not None:
        ksize = int(value)
        return sobel_y(image, ksize)
    elif operation == "sobel_magnitude" and value is not None:
        ksize = int(value)
        return sobel_magnitude(image, ksize)
    elif operation == "sobel_plot" and value is not None:
        ksize = int(value)
        return sobel_plot(image, ksize)
    elif operation == "prewitt_x":
        return prewitt_x(image)
    elif operation == "prewitt_y":
        return prewitt_y(image)
    elif operation == "prewitt_magnitude":
        return prewitt_magnitude(image)
    elif operation == "prewitt_plot":
        return prewitt_plot(image)
    elif operation == "roberts_x":
        return roberts_x(image)
    elif operation == "roberts_y":
        return roberts_y(image)
    elif operation == "roberts_magnitude":
        return roberts_magnitude(image)
    elif operation == "roberts_plot":
        return roberts_plot(image)
    elif operation == "compass_edge_detection" and value is not None:
        compass_matrices = json.loads(value)
        return compass_edge_detection(image, compass_matrices)
    elif operation == "canny":
        threshold1 = int(request.form.get("threshold1"))
        threshold2 = int(request.form.get("threshold2", 150))
        return canny(image, threshold1, threshold2)
    elif operation == "laplace_edge_detection":
        return laplace_edge_detection(image)
    elif operation == "gabor_filter":
        ksize = int(value.get("ksize", 21))
        sigma = float(value.get("sigma", 5))
        pi = float(value.get("pi", 4))
        lambd = float(value.get("lambd", 10))
        gamma = float(value.get("gamma", 0.5))
        psi = float(value.get("psi", 0))
        return gabor_filter(image, ksize, sigma, pi, lambd, gamma, psi)
    elif operation == "hough_line_detection" and value is not None:
        threshold = int(value.get("threshold", 150))
        angle_resolution = int(value.get("angle_resolution", 180))
        canny_threshold1 = int(value.get("canny_threshold1", 50))
        canny_threshold2 = int(value.get("canny_threshold2", 150))
        return hough_line_detection(image, threshold, angle_resolution, canny_threshold1, canny_threshold2)
    elif operation == "hough_circle_detection" and value is not None:
        dp = float(value.get("dp", 1))
        minDist = int(value.get("minDist", 30))
        param1 = int(value.get("param1", 50))
        param2 = int(value.get("param2", 30))
        minRadius = int(value.get("minRadius", 10))
        maxRadius = int(value.get("maxRadius", 100))
        blur_ksize = int(value.get("blur_ksize", 9))
        blur_sigma = int(value.get("blur_sigma", 2))
        return hough_circle_detection(image, dp, minDist, param1, param2, minRadius, maxRadius, blur_ksize, blur_sigma)
    elif operation == "kmeans_segmentation" and value is not None:
        k = int(value.get("k", 3))
        max_iter = int(value.get("max_iter", 100))
        epsilon = float(value.get("epsilon", 0.2))
        return kmeans_segmentation(image, k, max_iter, epsilon)
    elif operation == "erode":
        kernel_size = int(request.form.get("kernel_size",   "3,3"))
        iterations = int(request.form.get("iterations", 1))
        return erode(image, (kernel_size, kernel_size), iterations)
    elif operation == "dilate":
        kernel_size = request.form.get("kernel_size", "3,3")
        iterations = int(request.form.get("iterations", 1))
        return dilate(image, kernel_size, iterations)
    
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
        
    if operation in ["mirror_image_by_center", "mirror_image_horizontal", "mirror_image_angle"]:
        try:
            # Resmi bellekte işle
            img_bytes = request.files['image'].read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            if operation == "mirror_image_by_center":
                x0 = int(request.form.get("x0", image.shape[1] // 2))
                processed_img = mirror_image_by_center(image, x0)
            elif operation == "mirror_image_horizontal":
                processed_img = mirror_image_horizontal(image)
            elif operation == "mirror_image_angle":
                angle = int(request.form.get("angle", 45))
                processed_img = mirror_image_angle(image, angle)
            
            # İşlenmiş görüntüyü döndür
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    
    # Handle shearing operations
    if operation in ["shear_x", "shearing_x_manuel", "shear_y", "shearing_y_manuel"]:
        try:
            value = float(request.form.get("value", 0))
            
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Process based on operation type
            if operation == "shear_x":
                processed_img = shear_x(image, value)
            elif operation == "shearing_x_manuel":
                processed_img = shearing_x_manuel(image, value)
            elif operation == "shear_y":
                processed_img = shear_y(image, value)
            elif operation == "shearing_y_manuel":
                processed_img = shearing_y_manuel(image, value)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    #Zoom Out / Zoom In
    if operation in ["zoom_out_pixel_replace", "zoom_out_with_interpolation", "zoom_in_pixel_replace", "zoom_in_with_interpolation"]:
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get scale factor
            if operation in ["zoom_out_with_interpolation", "zoom_in_with_interpolation"]:
                # For interpolation operations, we expect JSON data
                data = json.loads(request.form.get("value", "{}"))
                scale_factor = float(data.get("scale", 2))
                interpolation_type = data.get("type", "bilinear")
                
                # Map interpolation type to OpenCV constant
                interpolation_map = {
                    "bilinear": cv2.INTER_LINEAR,
                    "bicubic": cv2.INTER_CUBIC,
                    "lanczos": cv2.INTER_LANCZOS4
                }
                interpolation = interpolation_map.get(interpolation_type, cv2.INTER_LINEAR)
            else:
                # For pixel replacement operations, just get the scale factor as a number
                try:
                    scale_factor = float(request.form.get("value", 2))
                except:
                    # If value is JSON (shouldn't happen for pixel replace), try to parse
                    data = json.loads(request.form.get("value", "{}"))
                    scale_factor = float(data.get("scale", 2))
            
            # Process based on operation type
            if operation == "zoom_out_pixel_replace":
                # Use nearest neighbor interpolation for pixel replacement
                processed_img = cv2.resize(image, None, fx=1/scale_factor, fy=1/scale_factor, 
                                        interpolation=cv2.INTER_NEAREST)
            elif operation == "zoom_out_with_interpolation":
                processed_img = cv2.resize(image, None, fx=1/scale_factor, fy=1/scale_factor, 
                                        interpolation=interpolation)
            elif operation == "zoom_in_pixel_replace":
                # Use nearest neighbor interpolation for pixel replacement
                processed_img = cv2.resize(image, None, fx=scale_factor, fy=scale_factor, 
                                        interpolation=cv2.INTER_NEAREST)
            elif operation == "zoom_in_with_interpolation":
                processed_img = cv2.resize(image, None, fx=scale_factor, fy=scale_factor, 
                                        interpolation=interpolation)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Rotation
    if operation in ["rotate_image_without_alias", "rotate_with_interpolations"]:
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get rotation parameters
            if operation == "rotate_with_interpolations":
                # For interpolation operations, we expect JSON data
                try:
                    data = json.loads(request.form.get("value", "{}"))
                    angle = float(data.get("angle", 45))
                    interpolation_type = data.get("type", "bilinear")
                    
                    # Map interpolation type to OpenCV constant
                    interpolation_map = {
                        "bilinear": cv2.INTER_LINEAR,
                        "bicubic": cv2.INTER_CUBIC,
                        "lanczos": cv2.INTER_LANCZOS4
                    }
                    interpolation = interpolation_map.get(interpolation_type, cv2.INTER_LINEAR)
                    
                    # Process with interpolation
                    height, width = image.shape[:2]
                    center = (width // 2, height // 2)
                    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
                    processed_img = cv2.warpAffine(image, rotation_matrix, (width, height), flags=interpolation)
                    
                except json.JSONDecodeError:
                    # Fallback if value isn't JSON
                    angle = float(request.form.get("value", 45))
                    processed_img = rotate_image_without_alias(image, angle)
            else:
                # For simple rotation without anti-aliasing
                angle = float(request.form.get("value", 45))
                processed_img = rotate_image_without_alias(image, angle)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # Handle crop operation
    if operation == "crop_image":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get crop parameters
            y1 = int(request.form.get("y1", 0))
            y2 = int(request.form.get("y2", image.shape[0]))
            x1 = int(request.form.get("x1", 0))
            x2 = int(request.form.get("x2", image.shape[1]))
            
            # Ensure coordinates are within bounds
            height, width = image.shape[:2]
            y1 = max(0, min(y1, height))
            y2 = max(0, min(y2, height))
            x1 = max(0, min(x1, width))
            x2 = max(0, min(x2, width))
            
            # Ensure y1 < y2 and x1 < x2
            y1, y2 = min(y1, y2), max(y1, y2)
            x1, x2 = min(x1, x2), max(x1, x2)
            
            # Perform cropping
            processed_img = image[y1:y2, x1:x2]
            
            # Return cropped image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # Handle perspective correction
    if operation in ["perspektif_duzeltme", "interactive_perspective_correction"]:
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            if operation == "perspektif_duzeltme":
                # Get parameters from form data
                data = json.loads(request.form.get("value", "{}"))
                pts1 = np.float32(data.get("pts1"))
                pts2 = np.float32(data.get("pts2"))
                width = int(data.get("width"))
                height = int(data.get("height"))
                
                # Validate points
                if len(pts1) != 4 or len(pts2) != 4:
                    return jsonify({"error": "Exactly 4 points required for both source and destination"}), 400
                    
                processed_img = perspektif_duzeltme(image, pts1, pts2, width, height)
                
            elif operation == "interactive_perspective_correction":
                data = json.loads(request.form.get("value", "{}"))
                points = data.get("points", [])
                width = int(data.get("width", 500))
                height = int(data.get("height", 500))
                
                if len(points) != 4:
                    return jsonify({"error": "Exactly 4 points required"}), 400
                    
                pts1 = np.float32(points)
                pts2 = np.float32([[0, 0], [width, 0], [0, height], [width, height]])
                
                processed_img = cv2.warpPerspective(image, 
                    cv2.getPerspectiveTransform(pts1, pts2), 
                    (width, height))
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # Handle Mean/Median Filter correction
    if operation in ["mean_filter", "median_filter"]:
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            if operation == "mean_filter":
                # Get kernel size as "x,y" string from form data
                kernel_size = request.form.get("kernel_size", "5,5")
                processed_img = mean_filter(image, kernel_size)
            elif operation == "median_filter":
                # Get filter size as integer from form data
                try:
                    filter_size = int(request.form.get("filter_size", 5))
                except:
                    filter_size = 5
                processed_img = median_filter(image, filter_size)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # Handle Gaussian Blur Filter correction
    if operation == "gaussian_blur_filter":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Get kernel size as "x,y" string from form data
            kernel_size = request.form.get("kernel_size", "5,5")
            sigma = float(request.form.get("sigma", 1.0))
            processed_img = gaussian_blur_filter(image, kernel_size, sigma)

            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # Handle Conservative Smoothing Filter
    if operation == "conservative_smoothing_filter":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            processed_img = conservative_smoothing_filter(image)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # Handle Crimmins Speckle Filter
    if operation == "crimmins_speckle_filter":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get threshold value from form data
            try:
                threshold = int(request.form.get("value", 10))
            except:
                threshold = 10
                
            processed_img = crimmins_speckle_filter(image, threshold)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # Handle Fourier operations
    if operation in ["fourier_transform", "fourier_low_pass_filter", "fourier_high_pass_filter"]:
        try:
            # Resmi oku
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Fourier dönüşümünü uygula (artık renkli destekliyor)
            f_transforms, spectrum_path = fourier_transform(image)
            
            if operation == "fourier_transform":
                # Spektrum görüntüsünü döndür
                return send_file(spectrum_path, mimetype="image/png")
                
            elif operation in ["fourier_low_pass_filter", "fourier_high_pass_filter"]:
                # Yarıçap parametresini al
                radius = int(request.form.get("value", 30))
                
                # Filtreyi uygula
                if operation == "fourier_low_pass_filter":
                    filtered_path = fourier_low_pass_filter(f_transforms, radius)
                else:
                    filtered_path = fourier_high_pass_filter(f_transforms, radius)
                
                # Filtrelenmiş görüntüyü döndür
                return send_file(filtered_path, mimetype="image/png")
                
        except Exception as e:
            return jsonify({"error": str(e)}), 50
        
    # Handle Fourier operations
    if operation == "fourier_filter_plot":
        try:
            # Get radius parameter
            radius = int(request.form.get("value", 30))
            
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Create the plot
            plot_buffer = fourier_filter_plot(image, radius)
            
            # Return the image directly
            return send_file(
                plot_buffer,
                mimetype="image/png"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
                    

    # Add this to the /process route, before the "Rest of your existing process function..." part
    if operation in ["band_geciren_filtre", "band_durduran_filtre", "band_gecirendurduran_plot"]:
        try:
            # Resmi oku
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Parametreleri al
            value = request.form.get("value", "20,50")
            D1, D2 = map(int, value.split(','))
            
            if operation == "band_geciren_filtre":
                processed_img = band_geciren_filtre(image, D1, D2)
            elif operation == "band_durduran_filtre":
                processed_img = band_durduran_filtre(image, D1, D2)
            elif operation == "band_gecirendurduran_plot":
                plot_buffer = band_gecirendurduran_plot(image, D1, D2)
                return send_file(plot_buffer, mimetype="image/png")
            
            # Görüntüyü döndür
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    if operation == "band_gecirendurduran_plot":
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Get D1 and D2 values
            value = request.form.get("value", "20,50")
            D1, D2 = map(int, value.split(','))
            
            # Create the plot
            buf = band_gecirendurduran_plot(image, D1, D2)
            
            return send_file(
                buf,
                mimetype="image/png"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    if operation in ["butterworth_lpf", "butterworth_hpf", "butterworth_plot"]:
        try:
            # Resmi oku
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Parametreleri al
            value = request.form.get("value", "30,2")
            D0, n = map(float, value.split(','))
            
            if operation == "butterworth_lpf":
                processed_img = butterworth_lpf(image, D0, n)
            elif operation == "butterworth_hpf":
                processed_img = butterworth_hpf(image, D0, n)
            elif operation == "butterworth_plot":
                plot_buffer = butterworth_plot(image, D0, n)
                return send_file(plot_buffer, mimetype="image/png")
            
            # Görüntüyü döndür
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    if operation in ["gaussian_lpf", "gaussian_hpf", "gaussian_plot"]:
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Get D0 value
            D0 = int(request.form.get("value", 30))
            
            if operation == "gaussian_lpf":
                processed_img = gaussian_lpf(image, D0)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")
            elif operation == "gaussian_hpf":
                processed_img = gaussian_hpf(image, D0)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")
            elif operation == "gaussian_plot":
                plot_buffer = gaussian_plot(image, D0)
                return send_file(plot_buffer, mimetype="image/png")
                
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        

    # Handle homomorphic filter
    if operation == "homomorphic_filter":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get parameters
            d0 = float(request.form.get("d0", 30))
            h_l = float(request.form.get("h_l", 0.5))
            h_h = float(request.form.get("h_h", 2.0))
            c = float(request.form.get("c", 1.0))
            
            # Process image
            processed_img = homomorphic_filter(image, d0, h_l, h_h, c)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    if operation in ["sobel_x", "sobel_y", "sobel_magnitude", "sobel_plot"]:
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Get D0 value
            ksize = int(request.form.get("value", 3))
            
            if operation == "sobel_x":
                processed_img = sobel_x(image, ksize)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")
            elif operation == "sobel_y":
                processed_img = sobel_y(image, ksize)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")
            elif operation == "sobel_magnitude":
                processed_img = sobel_magnitude(image, ksize)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(
                    io.BytesIO(img_buffer.tobytes()),
                    mimetype="image/jpeg"
                )
            elif operation == "sobel_plot":
                plot_buffer = sobel_plot(image, ksize)
                return send_file(plot_buffer, mimetype="image/png")
                
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    

    if operation in ["prewitt_x", "prewitt_y", "prewitt_magnitude"]:
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            if operation == "prewitt_x":
                processed_img = prewitt_x(image)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")
            elif operation == "prewitt_y":
                processed_img = prewitt_y(image)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")
            elif operation == "prewitt_magnitude":
                processed_img = prewitt_magnitude(image)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(
                    io.BytesIO(img_buffer.tobytes()),
                    mimetype="image/jpeg"
                )
                     
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    if operation == "prewitt_plot":
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Create the plot
            plot_buffer = prewitt_plot(image)
            return send_file(
                plot_buffer,
                mimetype="image/png"
            )
                
        except Exception as e:
            return jsonify({"error": str(e)}), 500


    if operation in ["roberts_x", "roberts_y", "roberts_magnitude"]:
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            if operation == "roberts_x":
                processed_img = roberts_x(image)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")
            elif operation == "roberts_y":
                processed_img = roberts_y(image)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(io.BytesIO(img_buffer.tobytes()), mimetype="image/jpeg")
            elif operation == "roberts_magnitude":
                processed_img = roberts_magnitude(image)
                _, img_buffer = cv2.imencode('.jpg', processed_img)
                return send_file(
                    io.BytesIO(img_buffer.tobytes()),
                    mimetype="image/jpeg"
                )
                     
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    if operation == "roberts_plot":
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Create the plot
            plot_buffer = roberts_plot(image)
            return send_file(
                plot_buffer,
                mimetype="image/png"
            )
                
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        

        
    if operation == "compass_edge_detection":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get compass matrices data from form data
            compass_data = request.form.get("compass_matrices")
            
            if not compass_data:
                return jsonify({"error": "No compass data provided"}), 400
                
            try:
                compass_matrices = json.loads(compass_data)
            except json.JSONDecodeError as e:
                return jsonify({"error": f"Invalid compass data format: {str(e)}"}), 400
            
            # Process the image
            processed_img = compass_edge_detection(image, compass_matrices)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            print(f"Compass edge detection error: {str(e)}")
            return jsonify({"error": str(e)}), 500
        
    # Handle canny Filter correction
    if operation == "canny":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Get thresholds
            threshold1 = int(request.form.get("threshold1", 50))
            threshold2 = int(request.form.get("threshold2", 150))
            
            # Process image
            processed_img = canny(image, threshold1, threshold2)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    

    if operation == "laplace_edge_detection":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Process image
            processed_img = laplace_edge_detection(image)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
                
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        
    if operation.startswith("gabor_filter"):
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
            
            # Get parameters
            params = {
                "ksize": int(request.form.get("ksize", 21)),
                "sigma": float(request.form.get("sigma", 5)),
                "pi": float(request.form.get("pi", 4)),
                "lambd": float(request.form.get("lambd", 10)),
                "gamma": float(request.form.get("gamma", 0.5)),
                "psi": float(request.form.get("psi", 0))
            }
            
            # Process image
            processed_img = gabor_filter(
                image,
                ksize=params["ksize"],
                sigma=params["sigma"],
                pi=params["pi"],
                lambd=params["lambd"],
                gamma=params["gamma"],
                psi=params["psi"]
            )
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    

    # Handle Hough Line Detection
    if operation == "hough_line_detection":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get parameters
            threshold = int(request.form.get("threshold", 150))
            angle_resolution = int(request.form.get("angle_resolution", 180))
            canny_threshold1 = int(request.form.get("canny_threshold1", 50))
            canny_threshold2 = int(request.form.get("canny_threshold2", 150))
            
            # Process image
            processed_img = hough_line_detection(
                image, 
                threshold=threshold,
                angle_resolution=angle_resolution,
                canny_threshold1=canny_threshold1,
                canny_threshold2=canny_threshold2
            )
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Handle Hough Circle Detection
    if operation == "hough_circle_detection":
        try:
            # Read image directly from memory
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get parameters
            dp = float(request.form.get("dp", 1))
            minDist = int(request.form.get("minDist", 30))
            param1 = int(request.form.get("param1", 50))
            param2 = int(request.form.get("param2", 30))
            minRadius = int(request.form.get("minRadius", 10))
            maxRadius = int(request.form.get("maxRadius", 100))
            blur_ksize = int(request.form.get("blur_ksize", 9))
            blur_sigma = int(request.form.get("blur_sigma", 2))
            
            # Process image
            processed_img = hough_circle_detection(
                image,
                dp=dp,
                minDist=minDist,
                param1=param1,
                param2=param2,
                minRadius=minRadius,
                maxRadius=maxRadius,
                blur_ksize=(blur_ksize, blur_ksize),
                blur_sigma=blur_sigma
            )
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # Handle K-means segmentation
    if operation == "kmeans_segmentation":
        try:
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Get parameters
            k = int(request.form.get("k", 3))
            max_iter = int(request.form.get("max_iter", 100))
            epsilon = float(request.form.get("epsilon", 0.2))
            
            # Process image
            processed_img = kmeans_segmentation(image, k, max_iter, epsilon)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        


    # Handle erosion
    if operation == "erode":
        try:
            kernel_size = request.form.get("kernel_size", "3,3")
            iterations = int(request.form.get("iterations", 1))
            
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Process image
            processed_img = erode(image, kernel_size, iterations)
            
            # Encode and return image
            _, img_buffer = cv2.imencode('.jpg', processed_img)
            return send_file(
                io.BytesIO(img_buffer.tobytes()),
                mimetype="image/jpeg"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    if operation == "dilate":
        try:
            kernel_size = request.form.get("kernel_size", "3,3")
            iterations = int(request.form.get("iterations", 1))
            
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({"error": "Invalid image"}), 400
                
            # Process image
            processed_img = dilate(image, kernel_size, iterations)
            
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
    response.headers.add('Access-Control-Allow-Origin', '*')  
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

if __name__ == "__main__":
    app.run(debug=True, port=5000)