import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const CropImage = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropValues, setCropValues] = useState({
    y1: 50,
    y2: 200,
    x1: 100,
    x2: 300
  });
  const anchorRef = useRef(null);

  const handleCropClick = () => {
    setShowInputs(prev => !prev);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCropValues(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleApply = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }
  
    setIsProcessing(true);
    
    try {
      // Create a value object with all crop coordinates
      const value = JSON.stringify({
        y1: Math.min(cropValues.y1, cropValues.y2),
        y2: Math.max(cropValues.y1, cropValues.y2),
        x1: Math.min(cropValues.x1, cropValues.x2),
        x2: Math.max(cropValues.x1, cropValues.x2)
      });
      
      await processImage("crop_image", value);
    } catch (error) {
      console.error("Crop operation error:", error);
    } finally {
      setIsProcessing(false);
      setShowInputs(false); // Close the panel after applying
    }
  };
  // Close inputs when clicking outside
  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setShowInputs(false);
      }
    };

    if (showInputs) {
      const timer = setTimeout(() => {
        window.addEventListener('click', handleGlobalClick);
      }, 100);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleGlobalClick);
      };
    }
  }, [showInputs]);

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
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
        onClick={(e) => {
          e.stopPropagation();
          handleCropClick();
        }}
      >
         Kırp
      </Button>

      <Box 
  sx={{
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "white",
    boxShadow: 3,
    padding: showInputs ? '8px' : '0',
    width: '160px'
  }}
  onClick={(e) => e.stopPropagation()}
>
  <Collapse in={showInputs}>
    <ClickAwayListener onClickAway={() => setShowInputs(false)}>
      <Box
        component="form"
        onSubmit={handleApply}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 0.5,
          border: '1px solid #ddd',
          borderRadius: 1,
          width: '150px'
        }}
        noValidate
        autoComplete="off"
      >
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '4px',
          width: '100%'
        }}>
          <TextField
            id="y1-input"
            label="Y1"
            variant="outlined"
            name="y1"
            size="small"
            value={cropValues.y1}
            onChange={handleInputChange}
            type="number"
            sx={{ width: '60px' }}
          />
          
          <TextField
            id="y2-input"
            label="Y2"
            variant="outlined"
            name="y2"
            size="small"
            value={cropValues.y2}
            onChange={handleInputChange}
            type="number"
            sx={{ width: '60px' }}
          />
          
          <TextField
            id="x1-input"
            label="X1"
            variant="outlined"
            name="x1"
            size="small"
            value={cropValues.x1}
            onChange={handleInputChange}
            type="number"
            sx={{ width: '60px' }}
          />
          
          <TextField
            id="x2-input"
            label="X2"
            variant="outlined"
            name="x2"
            size="small"
            value={cropValues.x2}
            onChange={handleInputChange}
            type="number"
            sx={{ width: '60px' }}
          />
        </Box>
        
        <Button
          variant="contained"
          disableElevation
          sx={{
            backgroundColor: "#1f2021",  
            color: "#cccccc",            
            width: "70px",
            height: "25px",
            textTransform: "none",
            fontSize: 14,   
            fontWeight: "bold",   
            '&:hover': {
              backgroundColor: "#2e2f30", 
            },
            mx: 0,
            mt: 0.5
          }}
          type="submit"
        >
          Apply
        </Button>
      </Box>
    </ClickAwayListener>
  </Collapse>
</Box>
    </Box>
  );
};

export default CropImage;