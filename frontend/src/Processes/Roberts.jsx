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

const options = ["Roberts X", "Roberts Y", "Roberts Toplam (|G|)", "Roberts Grafik"];

export default function Roberts({ 
  processImage, 
  originalImage,
  processedImage,
  setRobertsPlotImage,
  setShowRobertsPlot
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMenuItemClick = async (event, index) => {
  setSelectedIndex(index);
  setOpen(false);
  
  if (!processedImage && !originalImage) {
    console.error("No image available");
    return;
  }

  setIsProcessing(true);
  let operation;

  try {
    switch (index) {
      case 0: // Roberts X
        operation = "roberts_x";
        await processImage(operation);
        break;
      case 1: // Roberts Y
        operation = "roberts_y";
        await processImage(operation);
        break;
      case 2: // Roberts Toplam (|G|)
        operation = "roberts_magnitude";
        await processImage(operation);
        break;
      case 3: // Roberts Grafik
        operation = "roberts_plot";
        const plotImage = await processImage(operation);
        if (plotImage) {
          setRobertsPlotImage(plotImage);
          setShowRobertsPlot(true);
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Roberts filter error:", error);
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
            width: "210px",
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
            handleToggle();
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
                      onClick={(event) => handleMenuItemClick(event, index)}
                      disabled={isProcessing}
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
    </Box>
  );
}