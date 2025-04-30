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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const zoomOptions = [
  "Zoom Out (Pixel Replace)", 
  "Zoom Out (Interpolation)", 
  "Zoom In (Pixel Replace)", 
  "Zoom In (Interpolation)"
];

const interpolationOptions = [
  { value: "bilinear", label: "Bilinear" },
  { value: "bicubic", label: "Bicubic" },
  { value: "lanczos", label: "Lanczos" }
];

const ZoomOutZoomIn = ({ processImage, processedImage, originalImage }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(2);
  const [interpolationType, setInterpolationType] = useState("bilinear");

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleZoomClick = () => {
    if (selectedIndex === null) {
      setSelectedIndex(0);
    }
    setShowInputs(prev => !prev);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
    setShowInputs(true);
  };

  const handleScaleFactorChange = (event) => {
    setScaleFactor(parseFloat(event.target.value) || 1);
  };

  const handleInterpolationChange = (event) => {
    setInterpolationType(event.target.value);
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }
  
    setIsProcessing(true);
    let operation;
    
    switch(selectedIndex) {
      case 0: operation = "zoom_out_pixel_replace"; break;
      case 1: operation = "zoom_out_with_interpolation"; break;
      case 2: operation = "zoom_in_pixel_replace"; break;
      case 3: operation = "zoom_in_with_interpolation"; break;
      default: operation = "zoom_out_pixel_replace";
    }
    
    try {
      let value;
      if (selectedIndex === 1 || selectedIndex === 3) {
        // Interpolation operations need JSON
        value = JSON.stringify({ 
          scale: scaleFactor, 
          type: interpolationType 
        });
      } else {
        // Pixel replace operations just need the number
        value = scaleFactor.toString();
      }
      
      await processImage(operation, value);
    } catch (error) {
      console.error("Zoom operation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  
  // Close inputs when other operations are performed
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
            handleZoomClick();
          }}
        >
          {zoomOptions[selectedIndex]}
        </Button>

        <Button
          sx={{
            backgroundColor: "purple",
            "&:hover": { backgroundColor: "purple" }
          }}
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select zoom operation"
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
                  {zoomOptions.map((option, index) => (
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

      <Box 
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: 3,
          padding: showInputs ? '16px' : '0',
          width: '220px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Collapse in={showInputs}>
          <Box
            component="form"
            sx={{
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
              id="scale-factor"
              label="Scale Factor"
              variant="outlined"
              value={scaleFactor}
              onChange={handleScaleFactorChange}
              type="number"
              inputProps={{ step: "0.1", min: "0.1", max: "10" }}
              sx={{ mb: 2, width: '100%' }}
            />
            
            {(selectedIndex === 1 || selectedIndex === 3) && (
              <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
                <FormLabel component="legend">Interpolation Type</FormLabel>
                <RadioGroup
                  aria-label="interpolation"
                  name="interpolation-type"
                  value={interpolationType}
                  onChange={handleInterpolationChange}
                >
                  {interpolationOptions.map((option) => (
                    <FormControlLabel 
                      key={option.value}
                      value={option.value} 
                      control={<Radio />} 
                      label={option.label} 
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
            
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              disabled={isProcessing}
              sx={{ mt: 2, backgroundColor: "purple" }}
            >
              Apply {zoomOptions[selectedIndex]}
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default ZoomOutZoomIn;