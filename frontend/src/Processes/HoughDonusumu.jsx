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

const options = ["Hough Doğru Dönüşümü", "Hough Çember Dönüşümü"];

export default function HoughDonusumu({ 
  processImage, 
  originalImage,
  processedImage
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [lineParams, setLineParams] = useState({
    threshold: 150,
    angle_resolution: 180,
    canny_threshold1: 50,
    canny_threshold2: 150
  });
  
  const [circleParams, setCircleParams] = useState({
    dp: 1,
    minDist: 30,
    param1: 50,
    param2: 30,
    minRadius: 10,
    maxRadius: 100,
    blur_ksize: 9,
    blur_sigma: 2
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

  const handleHoughClick = () => {
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

  const handleLineParamChange = (e) => {
    const { name, value } = e.target;
    setLineParams(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleCircleParamChange = (e) => {
    const { name, value } = e.target;
    setCircleParams(prev => ({
      ...prev,
      [name]: name.includes('blur') ? parseInt(value) : parseFloat(value)
    }));
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return false;
    }

    setIsProcessing(true);
    let operation;
    let params;

    try {
      if (selectedIndex === 0) { // Line Transform
        operation = "hough_line_detection";
        params = lineParams;
      } else { // Circle Transform
        operation = "hough_circle_detection";
        params = circleParams;
      }
      
      await processImage(operation, params);
      return true;
    } catch (error) {
      console.error("Hough transform error:", error);
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
            width: "260px",
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
            handleHoughClick();
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
            {selectedIndex === 0 ? (
              <>
                <TextField
                  label="Threshold"
                  type="number"
                  name="threshold"
                  value={lineParams.threshold}
                  onChange={handleLineParamChange}
                  fullWidth
                />
                <TextField
                  label="Angle Resolution"
                  type="number"
                  name="angle_resolution"
                  value={lineParams.angle_resolution}
                  onChange={handleLineParamChange}
                  fullWidth
                />
                <TextField
                  label="Canny Threshold1"
                  type="number"
                  name="canny_threshold1"
                  value={lineParams.canny_threshold1}
                  onChange={handleLineParamChange}
                  fullWidth
                />
                <TextField
                  label="Canny Threshold2"
                  type="number"
                  name="canny_threshold2"
                  value={lineParams.canny_threshold2}
                  onChange={handleLineParamChange}
                  fullWidth
                />
              </>
            ) : (
              <>
                <TextField
                  label="dp"
                  type="number"
                  step="0.1"
                  name="dp"
                  value={circleParams.dp}
                  onChange={handleCircleParamChange}
                  fullWidth
                />
                <TextField
                  label="minDist"
                  type="number"
                  name="minDist"
                  value={circleParams.minDist}
                  onChange={handleCircleParamChange}
                  fullWidth
                />
                <TextField
                  label="param1"
                  type="number"
                  name="param1"
                  value={circleParams.param1}
                  onChange={handleCircleParamChange}
                  fullWidth
                />
                <TextField
                  label="param2"
                  type="number"
                  name="param2"
                  value={circleParams.param2}
                  onChange={handleCircleParamChange}
                  fullWidth
                />
                <TextField
                  label="minRadius"
                  type="number"
                  name="minRadius"
                  value={circleParams.minRadius}
                  onChange={handleCircleParamChange}
                  fullWidth
                />
                <TextField
                  label="maxRadius"
                  type="number"
                  name="maxRadius"
                  value={circleParams.maxRadius}
                  onChange={handleCircleParamChange}
                  fullWidth
                />
                <TextField
                  label="Blur ksize"
                  type="number"
                  name="blur_ksize"
                  value={circleParams.blur_ksize}
                  onChange={handleCircleParamChange}
                  fullWidth
                />
                <TextField
                  label="Blur sigma"
                  type="number"
                  name="blur_sigma"
                  value={circleParams.blur_sigma}
                  onChange={handleCircleParamChange}
                  fullWidth
                />
              </>
            )}
            <Button
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#1f2021",  
                color: "#cccccc",            
                width: "80px",
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
}