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

const bandOptions = ["Band Geçiren", "Band Durduran", "Grafik"];

const BandGecirenDurduranFiltre = ({ 
  processImage, 
  processedImage, 
  originalImage, 
  setBandFilterPlotImage,
  setShowBandFilterPlot // Yeni prop
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [D1, setD1] = useState(20);
  const [D2, setD2] = useState(50);
  const [plotImage, setPlotImage] = useState(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleBandClick = () => {
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

  const handleD1Change = (event) => {
    setD1(parseInt(event.target.value) || 20);
  };

  const handleD2Change = (event) => {
    setD2(parseInt(event.target.value) || 50);
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return false;
    }
  
    setIsProcessing(true);
    let operation;
    let value = `${D1},${D2}`;
  
    try {
      switch (selectedIndex) {
        case 0: // Band Geçiren
          operation = "band_geciren_filtre";
          const result1 = await processImage(operation, value);
          if (result1) {
            setBandFilterPlotImage(null);
            setShowBandFilterPlot(false);
          }
          return result1;
        case 1: // Band Durduran
          operation = "band_durduran_filtre";
          const result2 = await processImage(operation, value);
          if (result2) {
            setBandFilterPlotImage(null);
            setShowBandFilterPlot(false);
          }
          return result2;
        case 2: // Grafik
          operation = "band_gecirendurduran_plot";
          const plotResult = await processImage(operation, value);
          if (plotResult instanceof Blob) {
            const imageUrl = URL.createObjectURL(plotResult);
            setBandFilterPlotImage(imageUrl);
            setShowBandFilterPlot(true);
          }
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error("Band filter error:", error);
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
      if (plotImage) {
        URL.revokeObjectURL(plotImage);
      }
    };
  }, [plotImage]);

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
            handleBandClick();
          }}
        >
          {bandOptions[selectedIndex]}
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
                  {bandOptions.map((option, index) => (
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
              id="D1"
              label="D1 Değeri"
              variant="outlined"
              value={D1}
              onChange={handleD1Change}
              type="number"
              inputProps={{ min: 1, max: 100 }}
              sx={{ width: '100%' }}
            />
            <TextField
              id="D2"
              label="D2 Değeri"
              variant="outlined"
              value={D2}
              onChange={handleD2Change}
              type="number"
              inputProps={{ min: 1, max: 100 }}
              sx={{ width: '100%', mt: 2 }}
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
              Uygula {bandOptions[selectedIndex]}
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};


export default BandGecirenDurduranFiltre;