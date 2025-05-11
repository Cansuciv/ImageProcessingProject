import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Typography from "@mui/material/Typography";

const Compass = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matrices, setMatrices] = useState({
    E: [[-1,-1,-1], [1,1,1], [1,1,1]],
    W: [[1,1,1], [1,1,1], [-1,-1,-1]],
    N: [[-1,1,1], [-1,1,1], [-1,1,1]],
    S: [[1,1,-1], [1,1,-1], [1,1,-1]]
  });
  const [matrixStrings, setMatrixStrings] = useState({
    E: "[[-1,-1,-1],[1,1,1],[1,1,1]]",
    W: "[[1,1,1],[1,1,1],[-1,-1,-1]]",
    N: "[[-1,1,1],[-1,1,1],[-1,1,1]]",
    S: "[[1,1,-1],[1,1,-1],[1,1,-1]]"
  });
  const [error, setError] = useState(null);

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

  const handleMatrixChange = (direction, value) => {
    setMatrixStrings(prev => ({ ...prev, [direction]: value }));
    
    try {
      const parsed = JSON.parse(value);
      if (validateMatrix(parsed)) {
        setMatrices(prev => ({ ...prev, [direction]: parsed }));
        setError(null);
      } else {
        setError(`${direction} matrix must be a 3x3 array of numbers`);
      }
    } catch (e) {
      setError(`Invalid JSON format for ${direction} matrix`);
    }
  };

  const handleApply = async () => {
  if (!processedImage && !originalImage) {
    setError("No image available");
    return;
  }

  // Validate matrices
  const allValid = ['E', 'W', 'N', 'S'].every(dir => 
    validateMatrix(matrices[dir])
  );
  
  if (!allValid) {
    setError("All matrices must be valid 3x3 arrays");
    return;
  }

  setIsProcessing(true);
  setError(null);
  
  try {
    const success = await processImage("compass_edge_detection", matrices);
    
    if (success) {
      setShowInputs(false);
    }
  } catch (error) {
    console.error("Compass Edge Detection error:", error);
    setError(error.message || "Failed to process image");
  } finally {
    setIsProcessing(false);
  }
};

  const validateMatrix = (matrix) => {
    if (!Array.isArray(matrix) || matrix.length !== 3) return false;
    for (const row of matrix) {
      if (!Array.isArray(row) || row.length !== 3) return false;
      for (const val of row) {
        if (typeof val !== 'number') return false;
      }
    }
    return true;
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Button
        variant="contained"
        disableElevation
        sx={{
          backgroundColor: "#1f2021",  
          color: "#cccccc",            
          width: "250px",
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
        Compass Edge Detection
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
              '& > :not(style)': { m: 0.5, width: '50ch' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 1,
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}
            noValidate
            autoComplete="off"
          >
            {error && (
              <Typography color="error" sx={{ mb: 1, fontSize: '0.8rem' }}>
                {error}
              </Typography>
            )}

            <TextField
              size="small"
              id="E-matrix"
              label="E"
              variant="outlined"
              value={matrixStrings.E}
              onChange={(e) => handleMatrixChange('E', e.target.value)}
              sx={{ fontSize: '0.5rem' }}
            />
            <TextField
              size="small"
              id="W-matrix"
              label="W"
              variant="outlined"
              value={matrixStrings.W}
              onChange={(e) => handleMatrixChange('W', e.target.value)}
              sx={{ fontSize: '0.5rem' }}
            />
            <TextField
              size="small"
              id="N-matrix"
              label="N"
              variant="outlined"
              value={matrixStrings.N}
              onChange={(e) => handleMatrixChange('N', e.target.value)}
              sx={{ fontSize: '0.5rem' }}
            />
            <TextField
              size="small"
              id="S-matrix"
              label="S"
              variant="outlined"
              value={matrixStrings.S}
              onChange={(e) => handleMatrixChange('S', e.target.value)}
              sx={{ fontSize: '0.5rem' }}
            />
            <Box sx={{ width: '50px' }}>
              <Button
                variant="contained"
                size="small"
                disableElevation
                sx={{
                  backgroundColor: "#1f2021",  
                  color: "#cccccc",            
                  minWidth: "50px", // minWidth kullanın
                  wwidth: "50px !important",    // width de ekleyin
                  height: "28px",
                  textTransform: "none",
                  fontSize: '0.8rem',   
                  fontWeight: "bold",   
                  '&:hover': {
                    backgroundColor: "#2e2f30", 
                  },
                  mt: 1,
                  padding: '0 !important', // Padding'i sıfırlayın
                  margin: '0 !important',  // Margin'i sıfırlayın
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
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Compass;