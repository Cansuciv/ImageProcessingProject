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
    import axios from 'axios';

    const shearingOptions = ["Shear X", "Shearing X Manuel", "Shear Y", "Shearing Y Manuel"];

    const Shearing = ({ processImage, processedImage, originalImage, setProcessedImage }) => {
        const [open, setOpen] = useState(false);
        const anchorRef = useRef(null);
        const [selectedIndex, setSelectedIndex] = useState(0);
        const [showInputs, setShowInputs] = useState(false);
        const [isProcessing, setIsProcessing] = useState(false);
        const [inputValue, setInputValue] = useState(-0.5);
      
        const handleToggle = () => {
          setOpen((prevOpen) => !prevOpen);
        };
      
        const handleClose = (event) => {
          if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
          }
          setOpen(false);
        };
      
        const handleShearingClick = () => {
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
          setInputValue(parseFloat(event.target.value) || 0);
        };
      
        const handleApply = async () => {
            if (!processedImage && !originalImage) {
              console.error("No image available");
              return;
            }
          
            setIsProcessing(true);
            let operation;
            
            // Map frontend options to backend operation names
            switch(selectedIndex) {
              case 0:
                operation = "shear_x";
                break;
              case 1:
                operation = "shearing_x_manuel";
                break;
              case 2:
                operation = "shear_y";
                break;
              case 3:
                operation = "shearing_y_manuel";
                break;
              default:
                operation = "shear_x";
            }
            
            try {
              const success = await processImage(operation, inputValue);
              if (success) {
                setShowInputs(false);
              }
            } catch (error) {
              console.error("Shearing error:", error);
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
                handleShearingClick();
            }}
            >
            {shearingOptions[selectedIndex]}
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
                    {shearingOptions.map((option, index) => (
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
            padding: showInputs ? '16px' : '0', // Slightly reduced padding
            width: '150px' // Set a fixed width for the container
            }}
            onClick={(e) => e.stopPropagation()}
        >
           <Collapse in={showInputs}>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 0.5, width: '10ch' }, // Daha dar ve daha az boşluk
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 1, // Daha az yukarı boşluk
                p: 1,  // Daha az padding
                border: '1px solid #ddd',
                borderRadius: 1,
                backgroundColor: '#ffffff' // Arka plan beyazsa daha düzgün görünür
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="shear-value"
                label={selectedIndex <= 1 ? "sh_x" : "sh_y"}
                variant="outlined"
                value={inputValue}
                onChange={handleInputChange}
                type="number"
                inputProps={{ step: "0.1", min: -5, max: 5 }}
                size="small" // TextField'ı daha küçük yapar
              />

              <Button
                variant="contained"
                disableElevation
                sx={{
                  backgroundColor: "#1f2021",  
                  color: "#cccccc",            
                  width: "40px",
                  height: "28px",
                  textTransform: "none",
                  fontSize: 14,   
                  fontWeight: "bold",             
                  '&:hover': {
                    backgroundColor: "#2e2f30", 
                  },
                  mt: 1
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

    export default Shearing;