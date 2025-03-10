import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

// Görsel yükleme için görünmeyen input alanı
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)', // Görünmez yapmak için gerekli stil
  clipPath: 'inset(50%)', // Görünmez yapmak için gerekli stil
  height: 1, // Yükseklik 1 piksel
  overflow: 'hidden', // Taşan öğeler gizlenir
  position: 'absolute', // Konumu mutlak
  bottom: 0, // Alt sınır
  left: 0, // Sol sınır
  whiteSpace: 'nowrap', // Satır sonu yok
  width: 1, // Genişlik 1 piksel
});

// Ana bileşen
export default function InputFileUpload() {
  const [fileNames, setFileNames] = useState([]); // Yüklenen dosya isimlerini tutan durum
  const [imageSrc, setImageSrc] = useState(null); // Yüklenen resmin URL'sini tutan durum

  // Dosya değişimi işlevi
  const handleFileChange = (event) => {
    const files = event.target.files; // Yüklenen dosyaları al
    const fileNamesArray = Array.from(files).map(file => file.name); // Dosya isimlerini al
    setFileNames(fileNamesArray); // Dosya isimlerini duruma kaydet

    // Yüklenen ilk resmi ekranda göstermek için
    const file = files[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file)); // Resmi geçici URL'ye dönüştür
    }
  };

  return (
    <Box sx={{ textAlign: 'center', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Görsel İşleme Uygulaması {/* Başlık */}
      </Typography>
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        sx={{ marginBottom: 2 }} // Buton altına boşluk ekle
      >
        Upload files {/* Yükleme butonu */}
        <VisuallyHiddenInput
          type="file" // Dosya yükleme tipi
          onChange={handleFileChange} // Dosya değişimi olduğunda tetiklenir
          multiple // Birden fazla dosya yüklemeye izin verir
        />
      </Button>

      {/* Yüklenen dosya isimlerini göster */}
      {fileNames.length > 0 && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body1" color="textSecondary">
            Yüklenen dosyalar: {/* Dosya isimlerinin başlığı */}
          </Typography>
          <ul>
            {fileNames.map((fileName, index) => (
              <li key={index}>{fileName}</li> // Her bir dosya ismini liste olarak göster
            ))}
          </ul>
        </Box>
      )}

      {/* Yüklenen resmi ekranda göster */}
      {imageSrc && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body1" color="textSecondary">
            Yüklenen Resim:
          </Typography>
          <img
            src={imageSrc} // Resmin geçici URL'si
            alt="Uploaded"
            style={{ maxWidth: '100%', maxHeight: '400px', marginTop: 2 }} // Resmi boyutlandırma
          />
        </Box>
      )}

    </Box>
  );
}
