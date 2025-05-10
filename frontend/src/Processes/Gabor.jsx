import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const Gabor = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState({
    ksize: "21",
    sigma: "5",
    pi: "4",
    lambd: "10",
    gamma: "0.5",
    psi: "0"
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

// Input değişikliklerini işle
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
        ksize: parseInt(params.ksize),
        sigma: parseFloat(params.sigma),
        pi: parseFloat(params.pi),
        lambd: parseFloat(params.lambd),
        gamma: parseFloat(params.gamma),
        psi: parseFloat(params.psi)
      };

      // Yeni bir işlem ID'si ekleyerek cache sorununu önle
      const cacheBuster = Date.now();
      const operation = `gabor_filter_${cacheBuster}`;
      
      const success = await processImage(operation, processedParams);
      
      if (success) {
        setShowInputs(false);
      }
    } catch (error) {
      console.error("Gabor Filter error:", error);
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
        Gabor Filter
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
              '& > :not(style)': { m: 1, width: '12ch' },
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
              id="ksize"
              label="Kernel Size"
              variant="outlined"
              value={params.ksize}
              onChange={(e) => handleParamChange("ksize", e.target.value)}
              type="number"
              inputProps={{ min: 1, step: 1 }}
            />
            <TextField
              id="sigma"
              label="Sigma"
              variant="outlined"
              value={params.sigma}
              onChange={(e) => handleParamChange("sigma", e.target.value)}
              type="number"
              inputProps={{ min: 0.1, step: 0.1 }}
            />
            <TextField
              id="pi"
              label="Pi"
              variant="outlined"
              value={params.pi}
              onChange={(e) => handleParamChange("pi", e.target.value)}
              type="number"
              inputProps={{ min: 1, step: 1 }}
            />
            <TextField
              id="lambd"
              label="Lambda"
              variant="outlined"
              value={params.lambd}
              onChange={(e) => handleParamChange("lambd", e.target.value)}
              type="number"
              inputProps={{ min: 1, step: 1 }}
            />
            <TextField
              id="gamma"
              label="Gamma"
              variant="outlined"
              value={params.gamma}
              onChange={(e) => handleParamChange("gamma", e.target.value)}
              type="number"
              inputProps={{ min: 0.1, step: 0.1 }}
            />
            <TextField
              id="psi"
              label="Psi"
              variant="outlined"
              value={params.psi}
              onChange={(e) => handleParamChange("psi", e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
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
              Apply Filter
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Gabor;