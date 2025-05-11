import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import { ChromePicker } from "react-color";

const Frame = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState({
    left: "10",
    right: "10",
    top: "20",
    bottom: "20",
    color: { r: 0, g: 0, b: 255 }
  });

  const frameRef = useRef(null);

  // Close inputs when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (frameRef.current && !frameRef.current.contains(event.target)) {
        setShowInputs(false);
        setShowColorPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleParamChange = (paramName, value) => {
    // Validate numeric inputs
    if (['left', 'right', 'top', 'bottom'].includes(paramName)) {
      value = Math.max(0, parseInt(value) || 0);
    }
    
    setParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleColorChange = (color) => {
    setParams(prev => ({
      ...prev,
      color: color.rgb
    }));
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }

    setIsProcessing(true);
    
    try {
      const processedParams = {
        left: parseInt(params.left),
        right: parseInt(params.right),
        top: parseInt(params.top),
        bottom: parseInt(params.bottom),
        color: [params.color.r, params.color.g, params.color.b]
      };

      await processImage("frame", processedParams);
      setShowInputs(false);
      setShowColorPicker(false);
    } catch (error) {
      console.error("Frame error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const colorText = `rgb(${params.color.r}, ${params.color.g}, ${params.color.b})`;

  return (
    <Box sx={{ position: "relative", display: "inline-block" }} ref={frameRef}>
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
        Çerçeve
      </Button>

      <Box 
        className="frame-input-container"
        sx={{
          position: "absolute",
          left: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: 3,
          padding: showInputs ? '20px' : '0',
          width: '150px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Collapse in={showInputs}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 0.5, width: '16ch' },
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
              id="left"
              label="Left"
              variant="outlined"
              value={params.left}
              onChange={(e) => handleParamChange("left", e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 1 }}
              size="small"
            />
            <TextField
              id="right"
              label="Right"
              variant="outlined"
              value={params.right}
              onChange={(e) => handleParamChange("right", e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 1 }}
              size="small"
            />
            <TextField
              id="top"
              label="Top"
              variant="outlined"
              value={params.top}
              onChange={(e) => handleParamChange("top", e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 1 }}
              size="small"
            />
            <TextField
              id="bottom"
              label="Bottom"
              variant="outlined"
              value={params.bottom}
              onChange={(e) => handleParamChange("bottom", e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 1 }}
              size="small"
            />
            
            <Box sx={{ position: 'relative', width: '100%' }}>
              <TextField
                label="Color"
                value={colorText}
                onClick={() => setShowColorPicker(!showColorPicker)}
                sx={{ cursor: 'pointer' }}
                InputProps={{
                  readOnly: true,
                }}
              />
              
              {showColorPicker && (
                <Box sx={{ 
                  position: 'absolute', 
                  zIndex: 2, 
                  mt: 1,
                  left: 0
                }}>
                  <ChromePicker
                    color={params.color}
                    onChange={handleColorChange}
                  />
                </Box>
              )}
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
                fontSize: 13,   
                fontWeight: "bold",   
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
                mt: 1,
              }}
              onClick={(e) => {
                e.preventDefault();
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

export default Frame;