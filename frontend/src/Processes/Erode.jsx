import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const Erode = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState({
    kernel_size: "3,3",  // Varsayılan değer artık "3,3" formatında
    iterations: "1"
  });

  // Close inputs when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInputs && !event.target.closest('.erode-input-container')) {
        setShowInputs(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInputs]);

  const handleParamChange = (paramName, value) => {
    setParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }

    setIsProcessing(true);
    
    try {
      const [kernelX, kernelY] = params.kernel_size.split(',').map(Number);
      const processedParams = {
        kernel_size: `${kernelX},${kernelY}`,  // "x,y" formatında string olarak gönder
        iterations: parseInt(params.iterations)
      };

      const success = await processImage("erode", processedParams);
      
      if (success) {
        setShowInputs(false);
      }
    } catch (error) {
      console.error("Erode error:", error);
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
        Erode
      </Button>

      <Box 
        className="erode-input-container"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: 3,
          padding: showInputs ? '20px' : '0',
          width: '90px'
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
            id="kernel-size"
            label="Ksize"
            variant="outlined"
            value={params.kernel_size}
            onChange={(e) => handleParamChange("kernel_size", e.target.value)}
            type="text" // Değişiklik burada
            />
            <TextField
              id="iterations"
              label="Iterations"
              variant="outlined"
              value={params.iterations}
              onChange={(e) => handleParamChange("iterations", e.target.value)}
              type="number"
              inputProps={{ min: 1, step: 1 }}
            />
            
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              disabled={isProcessing}
              sx={{ mt: 2, backgroundColor: "purple", "&:hover": { backgroundColor: "purple" } }}
            >
              Apply Erosion
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Erode;