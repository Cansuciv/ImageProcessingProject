import React from 'react';
import Button from '@mui/material/Button';

const BlueFilter = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{
        backgroundColor: "#1f2021",  
        color: "#cccccc",            
        width: "80px",
        height: "30px",
        textTransform: "none",
        fontSize: 17,   
        fontWeight: "bold",             
        '&:hover': {
          backgroundColor: "#2e2f30", 
        },
        mx: 0,
      }}
      onClick={() => processImage("blue")}
    >
      Mavi
    </Button>
  );
};

export default BlueFilter;