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

const butterworthOptions = ["Butterworth LPF", "Butterworth HPF", "Butterworth Grafik"];

const ButterworthFiltre = ({ 
  processImage, 
  processedImage, 
  originalImage,
  setButterworthFilterPlotImage,
  setShowButterworthFilterPlot
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [D0, setD0] = useState(30);
  const [n, setN] = useState(2);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleButterworthClick = () => {
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

  const handleD0Change = (event) => {
    setD0(parseInt(event.target.value) || 30);
  };

  const handleNChange = (event) => {
    setN(parseInt(event.target.value) || 2);
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return false;
    }
  
    setIsProcessing(true);
    let operation;
    let value = `${D0},${n}`;
  
    try {
      switch (selectedIndex) {
        case 0: // Butterworth LPF
          operation = "butterworth_lpf";
          await processImage(operation, value);
          break;
        case 1: // Butterworth HPF
          operation = "butterworth_hpf";
          await processImage(operation, value);
          break;
        case 2: // Butterworth Grafik
          operation = "butterworth_plot";
          await processImage(operation, value);
          break;
        default:
          return false;
      }
      return true;
    } catch (error) {
      console.error("Butterworth filter error:", error);
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
            handleButterworthClick();
          }}
        >
          {butterworthOptions[selectedIndex]}
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
                  {butterworthOptions.map((option, index) => (
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
          padding: showInputs ? '20px' : '0',
          minWidth: 100,
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
              p: 1,
              border: '1px solid #ddd',
              borderRadius: 1,
              width: '185px',
              backgroundColor: 'white'
            }}
            noValidate
            autoComplete="off"
          >
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              width: '140px',
              justifyContent: 'space-between',
            }}>
              <TextField
                id="D0"
                label="D0"
                variant="outlined"
                size="small"
                value={D0}
                onChange={handleD0Change}
                type="number"
                inputProps={{ min: 1, max: 100 }}
                sx={{ width: '70px' }}
              />
              <TextField
                id="n"
                label="n"
                variant="outlined"
                size="small"
                value={n}
                onChange={handleNChange}
                type="number"
                inputProps={{ min: 1, max: 10 }}
                sx={{ width: '70px' }}
              />
            </Box>
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
                mt: 1,
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

export default ButterworthFiltre;