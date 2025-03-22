import React from 'react';
import Button from '@mui/material/Button';

const BackToOriginal = ({ backToOriginalImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{ backgroundColor: "purple", mx: "auto", marginTop: 5, textTransform: "none", fontSize: 20 }}
      onClick={backToOriginalImage}
    >
      Orijinal Resme Geri Dön
    </Button>
  );
};

export default BackToOriginal;