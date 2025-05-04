import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const GaussianBlurFilter = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValues, setInputValues] = useState({
    kernelSize: "5,5",
    sigma: "1"
  });

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
    const { name, value } = event.target;
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }
  
    setIsProcessing(true);
    
    try {
      // Parse the kernel size
      const kernelParts = inputValues.kernelSize.split(',');
      if (kernelParts.length !== 2) {
        throw new Error('Invalid kernel size format (use "width,height")');
      }
      
      const kernelX = parseInt(kernelParts[0]);
      const kernelY = parseInt(kernelParts[1]);
      const sigma = parseFloat(inputValues.sigma);
      
      if (isNaN(kernelX) || isNaN(kernelY) || isNaN(sigma)) {
        throw new Error('Please enter valid numbers');
      }
      
      if (kernelX % 2 === 0 || kernelY % 2 === 0) {
        throw new Error('Kernel size must be odd numbers');
      }

      const value = {
        kernel_size: `${kernelX},${kernelY}`,
        sigma: sigma
      };

      const success = await processImage("gaussian_blur_filter", value);
      
      if (success) {
        setShowInputs(false);
      }
    } catch (error) {
      console.error("Gaussian Blur error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Button
        variant="contained"
        sx={{
          backgroundColor: "purple",
          textTransform: "none",
          fontSize: 18,
          "&:hover": { backgroundColor: "purple" }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowInputs(!showInputs);
        }}
      >
        Gaussian Blur
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
              '& > :not(style)': { m: 1, width: '10ch' },
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
              id="kernelSize"
              label="Kernel Size"
              variant="outlined"
              name="kernelSize"
              value={inputValues.kernelSize}
              onChange={handleInputChange}
              placeholder="5,5"
            />
            
            <TextField
              id="sigma"
              label="Sigma"
              variant="outlined"
              name="sigma"
              value={inputValues.sigma}
              onChange={handleInputChange}
              type="number"
              inputProps={{ step: 1}}
            />
            
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              disabled={isProcessing}
              sx={{ mt: 2, backgroundColor: "purple", "&:hover": { backgroundColor: "#7b1fa2" } }}
            >
              Apply Gaussian Blur
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default GaussianBlurFilter;