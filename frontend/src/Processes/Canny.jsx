import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Typography from "@mui/material/Typography";

const Canny = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [inputValues, setInputValues] = useState({
      threshold1: "50",
      threshold2: "150"
    });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInputs && !event.target.closest('.canny-input-container')) {
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
      setError("No image available");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const threshold1 = parseInt(inputValues.threshold1);
      const threshold2 = parseInt(inputValues.threshold2);

      const value = {
        threshold1: threshold1,
        threshold2: threshold2
      };
      
      await processImage("canny", value);
      setShowInputs(false);
    } catch (error) {
      console.error("Canny Edge Detection error:", error);
      setError(error.message || "Failed to process image");
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
          width: "230px",
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
        Canny Edge Detection
      </Button>

      <Box 
        className="canny-input-container"
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
              '& > :not(style)': { m: 0.5, width: '16ch' }, // Margin ve genişlik azaltıldı
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 1, // Üst margin azaltıldı
              p: 1, // Padding azaltıldı (20px -> 8px)
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: 'white' // Arkaplan rengi eklendi
            }}
            noValidate
            autoComplete="off"
          >
            {error && (
              <Typography color="error" sx={{ mb: 1, fontSize: '0.8rem' }}> {/* Yazı boyutu küçültüldü */}
                {error}
              </Typography>
            )}

            <TextField
              id="threshold1"
              name="threshold1"
              label="Threshold1"
              type="number"
              variant="outlined"
              size="small" // Daha küçük input boyutu
              value={inputValues.threshold1}
              onChange={handleInputChange}
              inputProps={{ min: 0, max: 255 }}
              sx={{ 
                '& .MuiInputBase-root': { height: 40 } // Input yüksekliği ayarı
              }}
            />
            <TextField
              id="threshold2"
              name="threshold2"
              label="Threshold2"
              type="number"
              variant="outlined"
              size="small" // Daha küçük input boyutu
              value={inputValues.threshold2}
              onChange={handleInputChange}
              inputProps={{ min: 0, max: 255 }}
              sx={{ 
                '& .MuiInputBase-root': { height: 40 } // Input yüksekliği ayarı
              }}
            />
            
            <Button
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#1f2021",  
                color: "#cccccc",            
                width: "70px", // Genişlik azaltıldı
                height: "28px", // Yükseklik azaltıldı
                textTransform: "none",
                fontSize: '0.8rem', // Yazı boyutu küçültüldü  
                fontWeight: "bold",   
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
                mt: 0.5, // Üst margin azaltıldı
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

export default Canny;