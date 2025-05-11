import React from 'react';
import Button from '@mui/material/Button';

const Laplace = ({ processImage }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{
        backgroundColor: "#1f2021",  
        color: "#cccccc",            
        width: "90px",
        height: "30px",
        textTransform: "none",
        fontSize: 17,   
        fontWeight: "bold",   
        '&:hover': {
          backgroundColor: "#2e2f30", 
        },
        mx: 0,
      }}
      onClick={() => processImage("laplace_edge_detection")}
    >
      Laplace
    </Button>
  );
};

export default Laplace;