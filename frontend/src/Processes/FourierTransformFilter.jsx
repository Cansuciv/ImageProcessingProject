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

const fourierOptions = ["Fourier Transform", "LPF", "HPF", "Grafik"];

const FourierTransformFilter = ({ processImage, processedImage, originalImage, setFourierHistogramImage }) => {
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
        break;
      default:
        operation = "fourier_transform";
    }
    
    try {
      const result = await processImage(operation, value);
      
      if (selectedIndex === 3) {
        // Grafik için blob response alıyoruz
        if (result instanceof Blob) {
          const imageUrl = URL.createObjectURL(result);
          setHistogramImage(imageUrl);
          if (setFourierHistogramImage) {
            setFourierHistogramImage(imageUrl);
          }
        }
      }
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
          sx={{
            backgroundColor: "purple",
            textTransform: "none",
            fontSize: 18,
            "&:hover": { backgroundColor: "purple" }
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
            backgroundColor: "purple",
            "&:hover": { backgroundColor: "purple" }
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
            <Paper sx={{ backgroundColor: "purple", color: "white" }}>
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
            minWidth: 100,
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
                borderRadius: 1,
                width: '70%',
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="radius"
                label="Radius"
                variant="outlined"
                value={radius}
                onChange={handleRadiusChange}
                type="number"
                inputProps={{ min: 1, max: 100 }}
                sx={{ width: '100%' }}
              />
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply();
                }}
                disabled={isProcessing}
                sx={{ 
                  mt: 2, 
                  backgroundColor: "purple",
                  "&:hover": { backgroundColor: "purple" },
                  width: '100%',
                }}
              >
                Apply {fourierOptions[selectedIndex]}
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