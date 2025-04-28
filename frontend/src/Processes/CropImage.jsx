import React from 'react';
import Button from '@mui/material/Button';

const CropImage = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
      onClick={processImage}
    >
      Kırp
    </Button>
  );
};

export default CropImage;