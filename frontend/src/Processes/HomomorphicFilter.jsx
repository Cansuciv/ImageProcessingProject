import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const HomomorphicFilter = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValues, setInputValues] = useState({
    d0: "30",
    h_l: "0.5",
    h_h: "2",
    c: "1"
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
      const d0 = parseFloat(inputValues.d0);
      const h_l = parseFloat(inputValues.h_l);
      const h_h = parseFloat(inputValues.h_h);
      const c = parseFloat(inputValues.c);
  
      // Create an object with all parameters
      const value = {
        d0: d0,
        h_l: h_l,
        h_h: h_h,
        c: c
      };
  
      // Stringify the object to send as form data
      const success = await processImage("homomorphic_filter", JSON.stringify(value));
      
      if (success) {
        setShowInputs(false);
      }
    } catch (error) {
      console.error("Homomorphic Filter error:", error);
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
          width: "210px",
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
        Homomorphic Filter
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
              '& > :not(style)': { m: 0.5, width: '18ch' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 1,
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: 'white'
            }}
            noValidate
            autoComplete="off"
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                id="d0"
                label="D0"
                variant="outlined"
                size="small"
                name="d0"
                value={inputValues.d0}
                onChange={handleInputChange}
                type="number"
                inputProps={{ step: 1, min: 1 }}
              />
              <TextField
                id="h_l"
                label="H Low"
                variant="outlined"
                size="small"
                name="h_l"
                value={inputValues.h_l}
                onChange={handleInputChange}
                type="number"
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                id="h_h"
                label="H High"
                variant="outlined"
                size="small"
                name="h_h"
                value={inputValues.h_h}
                onChange={handleInputChange}
                type="number"
                inputProps={{ step: 0.1, min: 0 }}
              />
              <TextField
                id="c"
                label="C"
                variant="outlined"
                size="small"
                name="c"
                value={inputValues.c}
                onChange={handleInputChange}
                type="number"
                inputProps={{ step: 0.1, min: 0.1 }}
              />
            </Box>
            
            <Button
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#1f2021",  
                color: "#cccccc",            
                width: "50px",
                height: "30px",
                textTransform: "none",
                fontSize: 14,   
                fontWeight: "bold",   
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
                mt: 1,
                mb: 0.5
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

export default HomomorphicFilter;