import React from 'react';
import Button from '@mui/material/Button';

const HistogramEqualization = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      onClick={() => processImage("histogram_equalization")}
      sx={{ backgroundColor: "purple", width: "200px", height: "50px", textTransform: "none", fontSize: 18 }}
    >
      Histogram Eşitleme
    </Button>
  );
};

export default HistogramEqualization;