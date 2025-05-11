import React from 'react';
import Button from '@mui/material/Button';

const BackToOriginal = ({ backToOriginalImage }) => {
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
      onClick={backToOriginalImage}
    >
      Orijinal Resim
    </Button>

  );
};

export default BackToOriginal;