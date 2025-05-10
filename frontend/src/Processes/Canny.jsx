import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Typography from "@mui/material/Typography";

const Canny = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [inputValues, setInputValues] = useState({
      threshold1: "50",
      threshold2: "150"
    });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInputs && !event.target.closest('.canny-input-container')) {
        setShowInputs(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInputs]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      setError("No image available");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const threshold1 = parseInt(inputValues.threshold1);
      const threshold2 = parseInt(inputValues.threshold2);

      const value = {
        threshold1: threshold1,
        threshold2: threshold2
      };
      
      await processImage("canny", value);
      setShowInputs(false);
    } catch (error) {
      console.error("Canny Edge Detection error:", error);
      setError(error.message || "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Button
        variant="contained"
        sx={{
          backgroundColor: "Purple",
          textTransform: "none",
          fontSize: 18,
          "&:hover": { backgroundColor: "Purple" }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowInputs(!showInputs);
        }}
      >
        Canny Edge Detection
      </Button>

      <Box 
        className="canny-input-container"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: 3,
          padding: showInputs ? '20px' : '0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Collapse in={showInputs}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '18ch' },
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
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TextField
              id="threshold1"
              name="threshold1"
              label="Threshold1"
              type="number"
              variant="outlined"
              value={inputValues.threshold1}
              onChange={handleInputChange}
              inputProps={{ min: 0, max: 255 }}
            />
            <TextField
              id="threshold2"
              name="threshold2"
              label="Threshold2"
              type="number"
              variant="outlined"
              value={inputValues.threshold2}
              onChange={handleInputChange}
              inputProps={{ min: 0, max: 255 }}
            />
            
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              disabled={isProcessing}
              sx={{ mt: 2, backgroundColor: "Purple", "&:hover": { backgroundColor: "Purple" } }}
            >
              {isProcessing ? 'Processing...' : 'Apply Canny Filter'}
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Canny;