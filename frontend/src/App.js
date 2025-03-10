import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [operation, setOperation] = useState('');

  // Resim yükleme
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setOriginalImage(file); // Orijinal resmi kaydediyoruz
    setImageURL(URL.createObjectURL(file));
  };

  // Resmi işleme
  const handleProcessImage = async (operationType) => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('operation', operationType);

    try {
      const response = await axios.post('http://127.0.0.1:5000/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      setImageURL(url); // İşlenmiş resmin URL'sini güncelle
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  // Orijinal resme geri dönme
  const handleResetImage = () => {
    setImageURL(URL.createObjectURL(originalImage));
  };

  return (
    <div className="App">
      <h1>Görsel İşleme Uygulaması</h1>
      
      <input type="file" onChange={handleImageChange} />
      
      {imageURL && (
        <div>
          <h3>İşlenmiş Resim</h3>
          <img src={imageURL} alt="Processed" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}

      <div>
        <button onClick={() => handleProcessImage('negative')}>Negatif</button>
        <button onClick={() => handleProcessImage('grayscale')}>Grayscale</button>
        <button onClick={() => handleProcessImage('brightness')}>Parlaklık</button>
        <button onClick={() => handleProcessImage('red')}>Kırmızı</button>
        <button onClick={() => handleProcessImage('blue')}>Mavi</button>
        <button onClick={() => handleProcessImage('green')}>Yeşil</button>
        <button onClick={() => handleProcessImage('rectangle')}>Dikdörtgen</button>
        <button onClick={() => handleProcessImage('circle')}>Daire</button>
        <button onClick={() => handleProcessImage('ellipse')}>Elips</button>
        <button onClick={() => handleProcessImage('polygon')}>Çokgen</button>
      </div>

      {image && (
        <button onClick={handleResetImage}>Orijinal Resme Dön</button>
      )}
    </div>
  );
}

export default App;
