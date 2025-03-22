import React from 'react';
import Button from '@mui/material/Button';

const RedFilter = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
      onClick={() => processImage("red")}
    >
      Kırmızı
    </Button>
  );
};

export default RedFilter;