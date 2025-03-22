import React from 'react';
import Button from '@mui/material/Button';

const NegativeFilter = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
      onClick={() => processImage("negative")}
    >
      Negatif
    </Button>
  );
};

export default NegativeFilter;