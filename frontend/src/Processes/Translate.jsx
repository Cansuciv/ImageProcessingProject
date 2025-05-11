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

const translateOptions = ["Manual Translate", "Functional Translate"];

const Translate = ({ processImage, processedImage, originalImage }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValues, setInputValues] = useState({
    dx: 40,
    dy: 150
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

  const handleTranslateClick = () => {
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
      [name]: parseInt(value) || 0
    }));
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }
  
    setIsProcessing(true);
    const operation = selectedIndex === 0 ? "manual_translate" : "functional_translate";
    
    try {
      const success = await processImage(operation, { 
        dx: inputValues.dx, 
        dy: inputValues.dy 
      });
      
      if (success) {
        setShowInputs(false);
        // Force update by creating a new URL object
        if (processedImage) {
          URL.revokeObjectURL(processedImage);
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Diğer işlemler yapıldığında input alanlarını kapat
  useEffect(() => {
    const handleGlobalClick = () => {
      if (showInputs) {
        setShowInputs(false);
      }
    };

    // Bu efekt sadece showInputs true olduğunda çalışacak
    if (showInputs) {
      // 200ms sonra event listener'ı ekle (böylece kendi tıklamamızı yakalamayız)
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
            e.stopPropagation(); // Global click eventini engelle
            handleTranslateClick();
          }}
        >
          {translateOptions[selectedIndex]}
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
            e.stopPropagation(); // Global click eventini engelle
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
                  onClick={(e) => e.stopPropagation()} // Menü içindeki tıklamaları yakala
                >
                  {translateOptions.map((option, index) => (
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
          padding: showInputs ? '20px' : '0'
        }}
        onClick={(e) => e.stopPropagation()} // Input alanı içindeki tıklamaları yakala
      >
        <Collapse in={showInputs}>
          <Box
            component="form"
            sx={{
              width: "220px",
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 1,
              p: 1,
              border: '1px solid #ddd',
              borderRadius: 1,
              gap: 1
            }}
            noValidate
            autoComplete="off"
          >
            <Box 
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center'
              }}
            >
              <TextField
                id="dx"
                label="dx"
                name="dx"
                size="small"
                value={inputValues.dx}
                onChange={handleInputChange}
                type="number"
                inputProps={{ min: -1000, max: 1000 }}
                sx={{ width: '70px' }}
              />
              <TextField
                id="dy"
                label="dy"
                name="dy"
                size="small"
                value={inputValues.dy}
                onChange={handleInputChange}
                type="number"
                inputProps={{ min: -1000, max: 1000 }}
                sx={{ width: '70px' }}
              />
            </Box>
            <Button
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#1f2021",  
                textTransform: 'none',
                color: "#cccccc",            
                width: "80px",
                height: "28px",
                fontSize: 14,
                fontWeight: "bold",
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
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

export default Translate;