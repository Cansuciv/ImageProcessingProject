import React from 'react';
import Button from '@mui/material/Button';

const ConvertToGray = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{ backgroundColor: "purple", width: "132px", height: "50px", textTransform: "none", fontSize: 18 }}
      onClick={() => processImage("convert_gray")}
    >
      Gri'ye Çevir
    </Button>
  );
};

export default ConvertToGray;