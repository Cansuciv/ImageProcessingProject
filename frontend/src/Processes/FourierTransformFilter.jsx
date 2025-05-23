import React, { useState, useRef, useEffect } from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Typography from "@mui/material/Typography";

const fourierOptions = ["Fourier Transform", "LPF", "HPF", "Faurier Grafik"];

const FourierTransformFilter = ({ 
  processImage, 
  processedImage, 
  originalImage, 
  setFourierHistogramImage,
  setShowFourierPlot  // Make sure this prop is received
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [radius, setRadius] = useState(30);
  const [histogramImage, setHistogramImage] = useState(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleFourierClick = () => {
    if (selectedIndex === null) {
      setSelectedIndex(0);
    }
    
    // If Fourier Transform is selected, process immediately
    if (selectedIndex === 0) {
      handleApply();
    } else {
      setShowInputs(prev => !prev);
    }
  };
  
  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
    
    // If Fourier Transform is selected, process immediately
    if (index === 0) {
      handleApply();
    } else {
      setShowInputs(true);
    }
  };

  const handleRadiusChange = (event) => {
    setRadius(parseInt(event.target.value) || 30);
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return false;
    }
  
    setIsProcessing(true);
    let operation;
    let value = null;
    
    switch (selectedIndex) {
      case 0: // Fourier Transform
        operation = "fourier_transform";
        break;
      case 1: // LPF
        operation = "fourier_low_pass_filter";
        value = radius;
        break;
      case 2: // HPF
        operation = "fourier_high_pass_filter";
        value = radius;
        break;
      case 3: // Grafik
        operation = "fourier_filter_plot";
        value = radius;
        try {
          const result = await processImage(operation, value);
          if (result) {
            // Önceki görüntüyü temizle
            if (fourierHistogramImage) {
              URL.revokeObjectURL(fourierHistogramImage);
            }
            const imageUrl = URL.createObjectURL(result);
            setFourierHistogramImage(imageUrl);
            setShowFourierPlot(true);
          }
          return true;
        } catch (error) {
          console.error("Fourier transform error:", error);
          return false;
        } finally {
          setIsProcessing(false);
        }
      default:
        operation = "fourier_transform";
    }
    
    try {
      await processImage(operation, value);
      return true;
    } catch (error) {
      console.error("Fourier transform error:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    const handleGlobalClick = () => {
      if (showInputs) {
        setShowInputs(false);
      }
    };

    if (showInputs) {
      const timer = setTimeout(() => {
        window.addEventListener('click', handleGlobalClick);
      }, 200);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleGlobalClick);
      };
    }
  }, [showInputs]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (histogramImage) {
        URL.revokeObjectURL(histogramImage);
      }
    };
  }, [histogramImage]);

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button
          variant="contained"
          disableElevation
          sx={{
            backgroundColor: "#1f2021",  
            color: "#cccccc",            
            width: "200px",
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
            handleFourierClick();
          }}
        >
          {fourierOptions[selectedIndex]}
        </Button>

        <Button
          sx={{
            backgroundColor: "#1f2021",
            "&:hover": { backgroundColor: "#2e2f30" }
          }}
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1300,
          position: "absolute",
          top: "100%",
          left: 0
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper sx={{ backgroundColor: "#1f2021", color: "#cccccc" }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList 
                  id="split-button-menu" 
                  autoFocusItem
                  onClick={(e) => e.stopPropagation()}
                >
                  {fourierOptions.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleMenuItemClick(event, index);
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {/* Only show inputs for LPF, HPF, and Histogram */}
      {selectedIndex !== 0 && (
        <Box 
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: "white",
            boxShadow: 3,
            padding: showInputs ? '20px' : '0',
            width: "160px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Collapse in={showInputs}>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 0.5, width: '10ch' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 1,
                p: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
                width: '140px',
                backgroundColor: 'white'
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="radius"
                label="Radius"
                variant="outlined"
                size="small"
                value={radius}
                onChange={handleRadiusChange}
                type="number"
                inputProps={{ min: 1, max: 100 }}
                sx={{ width: '50px' }}
              />
              <Button
                variant="contained"
                disableElevation
                size="small"
                sx={{
                  backgroundColor: "#1f2021",  
                  color: "#cccccc",            
                  width: "70px",
                  height: "25px",
                  textTransform: "none",
                  fontSize: 14,   
                  fontWeight: "bold",   
                  '&:hover': {
                    backgroundColor: "#2e2f30", 
                  },
                  mx: 0,
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
      )}
      {histogramImage && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6">Fourier Magnitude Spectrum</Typography>
          <img 
            src={histogramImage} 
            alt="Fourier Histogram" 
            style={{ 
              maxWidth: '100%', 
              marginTop: '10px',
              border: '1px solid #ddd'
            }}
          />
          <Button 
            variant="contained" 
            onClick={() => {
              setHistogramImage(null);
              if (setFourierHistogramImage) {
                setFourierHistogramImage(null);
              }
            }}
            sx={{ mt: 1, backgroundColor: "purple" }}
          >
            Close
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FourierTransformFilter;