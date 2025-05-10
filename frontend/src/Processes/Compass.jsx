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
              '& > :not(style)': { m: 1, width: '25ch' },
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
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TextField
              id="E-matrix"
              label="E"
              variant="outlined"
              value={matrixStrings.E}
              onChange={(e) => handleMatrixChange('E', e.target.value)}
            />
            <TextField
              id="W-matrix"
              label="W"
              variant="outlined"
              value={matrixStrings.W}
              onChange={(e) => handleMatrixChange('W', e.target.value)}
            />
            <TextField
              id="N-matrix"
              label="N"
              variant="outlined"
              value={matrixStrings.N}
              onChange={(e) => handleMatrixChange('N', e.target.value)}
            />
            <TextField
              id="S-matrix"
              label="S"
              variant="outlined"
              value={matrixStrings.S}
              onChange={(e) => handleMatrixChange('S', e.target.value)}
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
              {isProcessing ? 'Processing...' : 'Apply Compass Filter'}
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Compass;