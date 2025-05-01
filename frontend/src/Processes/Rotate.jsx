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

const rotateOptions = [
  "Rotate Without Alias", 
  "Rotate With Interpolation"
];

const interpolationOptions = [
  { value: "bilinear", label: "Bilinear" },
  { value: "bicubic", label: "Bicubic" },
  { value: "lanczos", label: "Lanczos" }
];

const Rotate = ({ processImage, processedImage, originalImage }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [angle, setAngle] = useState(45);
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

  const handleRotateClick = () => {
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

  const handleAngleChange = (event) => {
    setAngle(parseFloat(event.target.value) || 0);
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
    
    // Map UI options to backend operation names
    switch(selectedIndex) {
      case 0: operation = "rotate_image_without_alias"; break;
      case 1: operation = "rotate_with_interpolations"; break;
      default: operation = "rotate_image_without_alias";
    }
    
    try {
      let value;
      if (operation === "rotate_with_interpolations") {
        // For interpolation operations, send angle and interpolation type
        value = JSON.stringify({ 
          angle: angle,
          type: interpolationType 
        });
      } else {
        // For simple rotation, just send the angle
        value = angle.toString();
      }
      
      await processImage(operation, value);
    } catch (error) {
      console.error("Rotate operation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Dışarı tıklandığında veya başka bir işlem yapıldığında input alanlarını kapat
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // Eğer tıklanan element Rotate bileşeninin bir parçası değilse
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setShowInputs(false);
      }
    };

    if (showInputs) {
      // Event listener'ı biraz gecikmeli ekleyerek hemen kapanmasını önle
      const timer = setTimeout(() => {
        window.addEventListener('click', handleGlobalClick);
      }, 100);

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
            handleRotateClick();
          }}
        >
          {rotateOptions[selectedIndex]}
        </Button>

        <Button
          sx={{
            backgroundColor: "purple",
            "&:hover": { backgroundColor: "purple" }
          }}
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select rotate operation"
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
                  {rotateOptions.map((option, index) => (
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
              id="rotation-angle"
              label="Rotation Angle"
              variant="outlined"
              value={angle}
              onChange={handleAngleChange}
              type="number"
              inputProps={{ min: "-360", max: "360" }}
              sx={{ mb: 2, width: '100%' }}
            />
            
            {selectedIndex === 1 && (
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
              Apply {rotateOptions[selectedIndex]}
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Rotate;