import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const CrimminsSpeckleFilter = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [thresholdValue, setThresholdValue] = useState("10");

  // Close inputs when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInputs && !event.target.closest('.filter-input-container')) {
        setShowInputs(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInputs]);

  const handleInputChange = (event) => {
    setThresholdValue(event.target.value);
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }
  
    setIsProcessing(true);
    
    try {
      const threshold = parseInt(thresholdValue);
      
      if (isNaN(threshold)) {
        throw new Error('Please enter a valid number');
      }

      const success = await processImage("crimmins_speckle_filter", threshold);
      
      if (success) {
        setShowInputs(false);
      }
    } catch (error) {
      console.error("Crimmins Speckle Filter error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Button
        variant="contained"
        disableElevation
        sx={{
          backgroundColor: "#1f2021",  
          color: "#cccccc",            
          width: "240px",
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
          setShowInputs(!showInputs);
        }}
      >
        Crimmins Speckle Filter
      </Button>

      <Box 
        className="filter-input-container"
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 1,
              gap: 1
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              id="threshold"
              label="Threshold"
              variant="outlined"
              size="small"
              value={thresholdValue}
              onChange={handleInputChange}
              type="number"
              inputProps={{ min: 0, max: 255, step: 1 }}
              sx={{ width: '120px' }}
            />
            
            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#1f2021",
                color: "#cccccc",
                width: "80px",
                textTransform: "none",
                fontSize: "0.875rem",
                '&:hover': {
                  backgroundColor: "#2e2f30",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              disabled={isProcessing}
            >
              Apply
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default CrimminsSpeckleFilter;