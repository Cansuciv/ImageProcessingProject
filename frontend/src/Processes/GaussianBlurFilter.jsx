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
        disableElevation
        sx={{
          backgroundColor: "#1f2021",  
          color: "#cccccc",            
          width: "160px",
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
              '& > :not(style)': { 
                m: 0.5,  // Margin'i küçülttük
                width: '100px'  // Genişliği biraz artırdık
              },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 1,  // Üst margin'i küçülttük
              p: 1,   // Padding'i küçülttük
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: 'white'  // Arka plan rengi eklendi
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              id="kernelSize"
              label="Kernel Size"
              variant="outlined"
              name="kernelSize"
              size="small"  // Küçük boyutlu input
              value={inputValues.kernelSize}
              onChange={handleInputChange}
              placeholder="5,5"
              sx={{
                '& .MuiInputBase-root': {
                  height: '40px'  // Input yüksekliği
                }
              }}
            />
            
            <TextField
              id="sigma"
              label="Sigma"
              variant="outlined"
              name="sigma"
              size="small"  // Küçük boyutlu input
              value={inputValues.sigma}
              onChange={handleInputChange}
              type="number"
              inputProps={{ step: 1 }}
              sx={{
                '& .MuiInputBase-root': {
                  height: '40px'  // Input yüksekliği
                }
              }}
            />
            
            <Button
              variant="contained"
              disableElevation
              size="small"  // Küçük boyutlu buton
              sx={{
                backgroundColor: "#1f2021",  
                color: "#cccccc",            
                width: "80px",  // Genişliği biraz artırdık
                height: "32px",
                textTransform: "none",
                fontSize: "0.8rem",  // Yazı boyutunu küçülttük  
                fontWeight: "bold",   
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
                mt: 0.5  // Üst margin ekledik
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
            >
              Apply
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default GaussianBlurFilter;