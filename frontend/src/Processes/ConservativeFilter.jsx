import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ConservativeFilter = ({ processImage, processedImage, originalImage }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConservativeFilter = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }

    setIsProcessing(true);
    
    try {
      await processImage("conservative_smoothing_filter");
    } catch (error) {
      console.error("Conservative Filter error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        variant="contained"
        disableElevation
        sx={{
          backgroundColor: "#1f2021",  
          color: "#cccccc",            
          width: "230px",
          height: "30px",
          textTransform: "none",
          fontSize: 17,   
          fontWeight: "bold",   
          '&:hover': {
            backgroundColor: "#2e2f30", 
          },
          mx: 0,
        }}
        onClick={handleConservativeFilter}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress  sx={{ color: 'white', mr: 1 }} />
            Processing...
          </Box>
        ) : (
          'Konservatif Filtreleme'
        )}
      </Button>
    </Box>
  );
};

export default ConservativeFilter;