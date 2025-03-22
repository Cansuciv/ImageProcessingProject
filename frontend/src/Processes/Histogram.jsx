import React from 'react';
import Button from '@mui/material/Button';

const Histogram = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      onClick={() => processImage("histogram")}
      sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
    >
      Histogram
    </Button>
  );
};

export default Histogram;