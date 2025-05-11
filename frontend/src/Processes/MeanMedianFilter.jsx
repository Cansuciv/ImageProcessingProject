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

const filterOptions = ["Mean Filter", "Median Filter"];

const MeanMedianFilter = ({ processImage, processedImage, originalImage }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValues, setInputValues] = useState({
    kernelSize: "(5,5)",
    filterSize: "5"
  });

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

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

  const handleFilterClick = () => {
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const parseKernelSize = (value) => {
    try {
      // Remove parentheses and split by comma
      const cleaned = value.replace(/[()\s]/g, '');
      const parts = cleaned.split(',');
      
      if (parts.length !== 2) {
        throw new Error('Invalid format');
      }
      
      const x = parseInt(parts[0]);
      const y = parseInt(parts[1]);
      
      if (isNaN(x) || isNaN(y)) {
        throw new Error('Invalid numbers');
      }
      
      return [x, y];
    } catch (e) {
      return [5, 5]; // default value if parsing fails
    }
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }
  
    setIsProcessing(true);
    const operation = selectedIndex === 0 ? "mean_filter" : "median_filter";
    
    try {
      let value;
      if (selectedIndex === 0) { // Mean filter
        // Parse the kernel size properly
        const cleaned = inputValues.kernelSize.replace(/[()\s]/g, '');
        const parts = cleaned.split(',');
        if (parts.length !== 2) {
          throw new Error('Invalid kernel size format');
        }
        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        if (isNaN(x) || isNaN(y)) {
          throw new Error('Invalid kernel size numbers');
        }
        value = { kernel_size: `${x},${y}` }; // Send as object with kernel_size property
      } else { // Median filter
        const size = parseInt(inputValues.filterSize);
        if (isNaN(size)) {
          throw new Error('Invalid filter size');
        }
        value = { filter_size: size }; // Send as object with filter_size property
      }
  
      const success = await processImage(operation, value);
      
      if (success) {
        setShowInputs(false);
      }
    } catch (error) {
      console.error("Filter error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

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
            width: "150px",
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
            handleFilterClick();
          }}
        >
          {filterOptions[selectedIndex]}
        </Button>

        <Button
          sx={{
            backgroundColor: "#1f2021",
            "&:hover": { backgroundColor: "#2e2f30" }
          }}
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select filter type"
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
                  {filterOptions.map((option, index) => (
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
              '& > :not(style)': { 
                m: 0.5,  // Margin'i küçült
                width: '12ch'  // Genişliği küçült
              },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 1,  // Margin top'u küçült
              p: 1,   // Padding'i küçült
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: 'white'  // Arkaplan rengi eklendi
            }}
            noValidate
            autoComplete="off"
          >
            {selectedIndex === 0 ? (
              <TextField
                id="kernelSize"
                label="Kernel Size"
                variant="outlined"
                name="kernelSize"
                value={inputValues.kernelSize}
                onChange={handleInputChange}
                placeholder="(5,5)"
                size="small"  // Küçük boyutlu input
                sx={{
                  '& .MuiInputBase-root': {
                    height: 35  // Input yüksekliği
                  }
                }}
              />
            ) : (
              <TextField
                id="filterSize"
                label="Filter Size"
                variant="outlined"
                name="filterSize"
                value={inputValues.filterSize}
                onChange={handleInputChange}
                type="number"
                inputProps={{ step: 1 }}
                size="small"  // Küçük boyutlu input
                sx={{
                  '& .MuiInputBase-root': {
                    height: 35  // Input yüksekliği
                  }
                }}
              />
            )}
            <Button
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#1f2021",  
                color: "#cccccc",            
                width: "70px",  // Genişliği küçült
                height: "25px", // Yüksekliği küçült
                textTransform: "none",
                fontSize: 14,   // Yazı boyutunu küçült  
                fontWeight: "bold",   
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
                mx: 0,
                mt: 0.5  // Üst margin ekle
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

export default MeanMedianFilter;