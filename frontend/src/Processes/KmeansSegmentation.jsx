import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const KmeansSegmentation = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState({
    k: "3",
    max_iter: "100",
    epsilon: "0.2"
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
        const processedParams = {
            k: parseInt(params.k),
            max_iter: parseInt(params.max_iter),
            epsilon: parseFloat(params.epsilon)
        };

        const operation = `kmeans_segmentation`;
        
        const success = await processImage(operation, processedParams);
        
        if (success) {
            setShowInputs(false);
        }
    } catch (error) {
        console.error("K-means Segmentation error:", error);
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
        K-means Segmentation
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
              '& > :not(style)': { m: 0.5, width: '20ch' },
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
              id="k"
              label="K"
              variant="outlined"
              value={params.k}
              onChange={(e) => handleParamChange("k", e.target.value)}
              type="number"
              inputProps={{ min: 2, step: 1 }}
              size="small"
            />
            <TextField
              id="max_iter"
              label="Iter"
              variant="outlined"
              value={params.max_iter}
              onChange={(e) => handleParamChange("max_iter", e.target.value)}
              type="number"
              inputProps={{ min: 1, step: 1 }}
              size="small"
            />
            <TextField
              id="epsilon"
              label="Eps"
              variant="outlined"
              value={params.epsilon}
              onChange={(e) => handleParamChange("epsilon", e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
              size="small"
            />
            
            <Button
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#1f2021",  
                color: "#cccccc",            
                width: "70px",
                height: "28px",
                textTransform: "none",
                fontSize: 14,   
                fontWeight: "bold",   
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
                mt: 1
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

export default KmeansSegmentation;