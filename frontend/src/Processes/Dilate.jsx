import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const Dilate = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState({
    kernel_size: "3,3",
    iterations: "1"
  });

  // Close inputs when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInputs && !event.target.closest('.dilate-input-container')) {
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
        kernel_size: `${kernelX},${kernelY}`,
        iterations: parseInt(params.iterations)
      };

      const success = await processImage("dilate", processedParams);
      
      if (success) {
        setShowInputs(false);
      }
    } catch (error) {
      console.error("Dilation error:", error);
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
          setShowInputs(!showInputs);
        }}
      >
        Dilate
      </Button>

      <Box 
        className="dilate-input-container"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: 3,
          padding: showInputs ? '2px' : '0',
          width: '90px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Collapse in={showInputs}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 0.5, width: '8ch' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 1,
              p: 1,
              border: '1px solid #ddd',
              borderRadius: 1
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              id="kernel-size"
              label="Kernel"
              variant="outlined"
              value={params.kernel_size}
              onChange={(e) => handleParamChange("kernel_size", e.target.value)}
              placeholder="3,3"
              size="small"
            />
            <TextField
              id="iterations"
              label="Iter"
              variant="outlined"
              value={params.iterations}
              onChange={(e) => handleParamChange("iterations", e.target.value)}
              type="number"
              inputProps={{ min: 1, step: 1 }}
              size="small"
            />
            
            <Button
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#1f2021",  
                color: "#cccccc",            
                width: "70px",
                height: "25px",
                textTransform: "none",
                fontSize: 13,   
                fontWeight: "bold",   
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
                mt: 1,
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

export default Dilate;