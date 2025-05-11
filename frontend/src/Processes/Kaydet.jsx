import React from 'react';
import Button from '@mui/material/Button';

const Kaydet = ({ processedImage, originalImage }) => {
  const handleSave = async () => {

    try {
      // Kaydedilecek resmi belirle (işlenmiş yoksa orijinal)
      const imageToSave = processedImage || originalImage;
      
      // Resmi blob olarak al
      const response = await fetch(imageToSave);
      const blob = await response.blob();
      
      // Modern tarayıcılar için dosya kaydetme dialogu
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: 'islenmis_resim.jpg',
            types: [{
              description: 'JPEG Image',
              accept: { 'image/jpeg': ['.jpg'] },
            }],
          });
          
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          
        } catch (err) {
          // Kullanıcı dialogu iptal ettiyse hata verme
          if (err.name !== 'AbortError') {
            console.error('Kayıt hatası:', err);
          }
        }
      } 
      // Eski tarayıcılar için fallback yöntemi
      else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'islenmis_resim.jpg';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
    } catch (error) {
      console.error('Resim kaydedilirken hata oluştu:', error);
    }
  };

  return (
    <Button
      variant="contained"
      disableElevation
      sx={{
        backgroundColor: "#A9A9A9", 
        color: "#1C1C1C",           
        mx: "auto",
        textTransform: "none",
        fontSize: 20,
        margin: 0,       // ← margin'i sıfırla
        padding: '6px 16px', // ← padding varsa kontrol et
        '&:hover': {
            backgroundColor: "#888888", 
        },
        }}
      onClick={handleSave}
    >
      Kaydet
    </Button>
  );
};

export default Kaydet;