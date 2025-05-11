import React from 'react';
import Button from '@mui/material/Button';

const HistogramEqualization = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{
        backgroundColor: "#1f2021",  
        color: "#cccccc",            
        width: "200px",
        height: "30px",
        textTransform: "none",
        fontSize: 17,   
        fontWeight: "bold",             
        '&:hover': {
          backgroundColor: "#2e2f30", 
        },
        mx: 0,
      }}
    onClick={() => processImage("histogram_equalization")}
  >
      Histogram Eşitleme
    </Button>
  );
};

export default HistogramEqualization;