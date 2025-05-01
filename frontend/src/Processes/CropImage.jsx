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
        ref={anchorRef}
        sx={{
          backgroundColor: "purple",
          textTransform: "none",
          fontSize: 18,
          "&:hover": { backgroundColor: "purple" }
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
          padding: showInputs ? '16px' : '0',
          width: '220px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Collapse in={showInputs}>
          <ClickAwayListener onClickAway={() => setShowInputs(false)}>
            <Box
              component="form"
              onSubmit={handleApply}  // Use onSubmit instead of onClick
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 2,
                p: 2,
                border: '1px solid #ddd',
                borderRadius: 1
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="y1-input"
                label="Y1 (Top)"
                variant="outlined"
                name="y1"
                value={cropValues.y1}
                onChange={handleInputChange}
                type="number"
                sx={{ mb: 2, width: '100%' }}
              />
              
              <TextField
                id="y2-input"
                label="Y2 (Bottom)"
                variant="outlined"
                name="y2"
                value={cropValues.y2}
                onChange={handleInputChange}
                type="number"
                sx={{ mb: 2, width: '100%' }}
              />
              
              <TextField
                id="x1-input"
                label="X1 (Left)"
                variant="outlined"
                name="x1"
                value={cropValues.x1}
                onChange={handleInputChange}
                type="number"
                sx={{ mb: 2, width: '100%' }}
              />
              
              <TextField
                id="x2-input"
                label="X2 (Right)"
                variant="outlined"
                name="x2"
                value={cropValues.x2}
                onChange={handleInputChange}
                type="number"
                sx={{ mb: 2, width: '100%' }}
              />
              
              <Button
                type="submit"  // Change to type="submit"
                variant="contained"
                disabled={isProcessing}
                sx={{ mt: 2, backgroundColor: "purple" }}
              >
                Apply Crop
              </Button>
            </Box>
          </ClickAwayListener>
        </Collapse>
      </Box>
    </Box>
  );
};

export default CropImage;