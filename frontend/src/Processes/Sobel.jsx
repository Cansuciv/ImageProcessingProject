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

  const options = ["Sobel X", "Sobel Y", "Toplam Kenar (|G|)", "Sobel Grafik"];

  export default function Sobel({ 
    processImage, 
    originalImage,
    processedImage,
    setSobelPlotImage,
    setShowSobelPlot
  }) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showInputs, setShowInputs] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ksize, setKsize] = useState(3);

    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    const handleSobelClick = () => {
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

    const handleKsizeChange = (event) => {
      setKsize(parseInt(event.target.value) || 3);
    };

    const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return false;
    }

    setIsProcessing(true);
    let operation;
    let value = ksize.toString();

    try {
      switch (selectedIndex) {
        case 0: // Sobel X
          operation = "sobel_x";
          await processImage(operation, value);
          break;
        case 1: // Sobel Y
          operation = "sobel_y";
          await processImage(operation, value);
          break;
        case 2: // Toplam Kenar (|G|)
          operation = "sobel_magnitude";
          await processImage(operation, value);
          break;
        case 3: // Sobel Grafik
          operation = "sobel_plot";
          const plotImage = await processImage(operation, value);
          if (plotImage) {
            setSobelPlotImage(plotImage);
            setShowSobelPlot(true);
          }
          break;
        default:
          return false;
      }
      return true;
    } catch (error) {
      console.error("Sobel filter error:", error);
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
              handleSobelClick();
            }}
          >
            {options[selectedIndex]}
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
                    {options.map((option, index) => (
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              p: 2, 
              border: '1px solid #ddd', 
              borderRadius: 1,
              width: '70%',
              m: 'auto',
              mt: 2
            }}>
              <TextField
                label="ksize"
                value={ksize}
                onChange={handleKsizeChange}
                type="number"
                inputProps={{ min: 1, max: 7, step: 2 }}
                sx={{ width: '100%', mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply();
                }}
                disabled={isProcessing}
                sx={{ 
                  bgcolor: "#1f2021",  
                  color: "#cccccc",            
                  width: "80px",
                  '&:hover': { bgcolor: "#2e2f30" },
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Apply
              </Button>
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  }