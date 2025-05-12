import React from 'react';
import Button from '@mui/material/Button';

const GrafikKaydet = ({ grafikImage }) => {
  const handleSave = async () => {
    if (!grafikImage) return;

    try {
      // Grafik resmini blob olarak al
      const response = await fetch(grafikImage);
      const blob = await response.blob();
      
      // Modern tarayıcılar için dosya kaydetme dialogu
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: 'grafik.png',
            types: [{
              description: 'PNG Image',
              accept: { 'image/png': ['.png'] },
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
        a.download = 'grafik.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
    } catch (error) {
      console.error('Grafik kaydedilirken hata oluştu:', error);
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
        margin: 0,
        padding: '6px 16px',
        '&:hover': {
            backgroundColor: "#888888", 
        },
      }}
      onClick={handleSave}
      disabled={!grafikImage}
    >
      Grafik Kaydet
    </Button>
  );
};

export default GrafikKaydet;