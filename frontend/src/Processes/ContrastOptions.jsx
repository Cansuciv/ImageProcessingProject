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
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

const ContrastOptions = ({ 
  options, 
  onOperationSelect, 
  processedImage, 
  originalImage,
  showManualInputs,
  showMultiLinearInputs,
  setShowManualInputs,
  setShowMultiLinearInputs
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValues, setInputValues] = useState({
    in_min: 50,
    in_max: 200,
    out_min: 0,
    out_max: 255
  });
  const [ranges, setRanges] = useState([
    { in_min: 0, in_max: 80, out_min: 0, out_max: 100 },
    { in_min: 81, in_max: 160, out_min: 50, out_max: 200 },
    { in_min: 161, in_max: 255, out_min: 150, out_max: 255 }
  ]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMenuItemClick = (event, index) => {
    const selectedOption = options[index];
    const isManual = selectedOption === "Manual Contrast Stretching";
    const isMultiLinear = selectedOption === "Multi Linear Contrast";
    const isLinear = selectedOption === "Linear Contrast Stretching";

    // Eğer aynı seçeneğe tekrar tıklanırsa, inputları kapat
    if ((isManual && showManualInputs) || (isMultiLinear && showMultiLinearInputs)) {
      setShowManualInputs(false);
      setShowMultiLinearInputs(false);
      setSelectedIndex(index);
      setOpen(false);
      return;
    }

    // Diğer durumlarda normal işlemleri yap
    setSelectedIndex(index);
    setOpen(false);
    
    setShowManualInputs(isManual);
    setShowMultiLinearInputs(isMultiLinear);

    if (isLinear) {
      onOperationSelect(selectedOption);
      setShowManualInputs(false);
      setShowMultiLinearInputs(false);
    }
  };

  // Dışarı tıklandığında veya başka bir işlem yapıldığında input alanlarını kapat
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // Eğer tıklanan element ContrastOptions bileşeninin bir parçası değilse
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setShowManualInputs(false);
        setShowMultiLinearInputs(false);
      }
    };

    if (showManualInputs || showMultiLinearInputs) {
      // Event listener'ı biraz gecikmeli ekleyerek hemen kapanmasını önle
      const timer = setTimeout(() => {
        window.addEventListener('click', handleGlobalClick);
      }, 100);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleGlobalClick);
      };
    }
  }, [showManualInputs, showMultiLinearInputs, setShowManualInputs, setShowMultiLinearInputs]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleRangeChange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index][field] = parseInt(value) || 0;
    setRanges(newRanges);
  };

  const addRange = () => {
    setRanges([...ranges, { in_min: 0, in_max: 50, out_min: 0, out_max: 100 }]);
  };

  const removeRange = (index) => {
    if (ranges.length > 1) {
      const newRanges = [...ranges];
      newRanges.splice(index, 1);
      setRanges(newRanges);
    }
  };

  const handleManualSubmit = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }

    const imageToUse = processedImage || originalImage;
    const response = await fetch(imageToUse);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob, "manual_contrast.jpg");
    formData.append("operation", "manual_contrast_stretching");
    formData.append("in_min", inputValues.in_min.toString());
    formData.append("in_max", inputValues.in_max.toString());
    formData.append("out_min", inputValues.out_min.toString());
    formData.append("out_max", inputValues.out_max.toString());

    try {
      const response = await axios.post("http://127.0.0.1:5000/process", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      });

      const imageUrl = URL.createObjectURL(response.data);
      onOperationSelect({
        operation: "manual_contrast_stretching",
        result: imageUrl,
        isTemporary: false
      });

    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleMultiLinearSubmit = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }

    const imageToUse = processedImage || originalImage;
    const response = await fetch(imageToUse);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob, "multi_linear_contrast.jpg");
    formData.append("operation", "multi_linear_contrast");

    // Convert ranges to the format expected by the backend
    const rangesArray = ranges.map(range => [
      range.in_min,
      range.in_max,
      range.out_min,
      range.out_max
    ]);

    formData.append("ranges", JSON.stringify(rangesArray));

    try {
      const response = await axios.post("http://127.0.0.1:5000/process", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      });

      const imageUrl = URL.createObjectURL(response.data);
      onOperationSelect({
        operation: "multi_linear_contrast",
        result: imageUrl,
        isTemporary: false
      });

    } catch (error) {
      console.error("Error processing image:", error);
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
            width: "270px",
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
            const selectedOption = options[selectedIndex];
            const isManual = selectedOption === "Manual Contrast Stretching";
            const isMultiLinear = selectedOption === "Multi Linear Contrast";
            
            // Eğer inputlar açıksa, aynı butona tıklayarak kapat
            if ((isManual && showManualInputs) || (isMultiLinear && showMultiLinearInputs)) {
              setShowManualInputs(false);
              setShowMultiLinearInputs(false);
            } else {
              handleToggle();
            }
          }}
        >
          {options[selectedIndex]}
        </Button>
        <Button
          variant="contained"
          disableElevation
          sx={{
            backgroundColor: "#1f2021",  
            color: "#cccccc",            
            width: "20px",
            height: "30px",
            textTransform: "none",
            fontSize: 17,   
            fontWeight: "bold",             
            '&:hover': {
              backgroundColor: "#2e2f30", 
            },
            mx: 0,
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
          width: showMultiLinearInputs ? 'auto' : 'auto',
          padding: showMultiLinearInputs ? '20px' : '0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Manual Contrast Stretching Inputs */}
        <Collapse in={showManualInputs}>
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mt: 2,
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: 'white',
              maxWidth: '600px',
              margin: '0 auto'
            }}
            noValidate
            autoComplete="off"
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              <TextField
                id="in_min"
                label="in_min"
                variant="outlined"
                name="in_min"
                value={inputValues.in_min}
                onChange={handleInputChange}
                type="number"
                size="small"
                sx={{ width: '120px' }}
                inputProps={{ min: 0, max: 255 }}
              />
              <TextField
                id="in_max"
                label="in_max"
                variant="outlined"
                name="in_max"
                value={inputValues.in_max}
                onChange={handleInputChange}
                type="number"
                size="small"
                sx={{ width: '120px' }}
                inputProps={{ min: inputValues.in_min + 1, max: 255 }}
              />
              <TextField
                id="out_min"
                label="out_min"
                variant="outlined"
                name="out_min"
                value={inputValues.out_min}
                onChange={handleInputChange}
                type="number"
                size="small"
                sx={{ width: '120px' }}
                inputProps={{ min: 0, max: 255 }}
              />
              <TextField
                id="out_max"
                label="out_max"
                variant="outlined"
                name="out_max"
                value={inputValues.out_max}
                onChange={handleInputChange}
                type="number"
                size="small"
                sx={{ width: '120px' }}
                inputProps={{ min: inputValues.out_min + 1, max: 255 }}
              />
            </Box>
            <Button
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#1f2021",  
                color: "#cccccc",            
                minWidth: "120px",
                height: "40px",
                textTransform: "none",
                fontSize: 17,   
                fontWeight: "bold",             
                '&:hover': {
                  backgroundColor: "#2e2f30", 
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleManualSubmit();
              }}
            >
              Apply
            </Button>
          </Box>
        </Collapse>

        {/* Multi Linear Contrast Inputs - Ultra Compact */}
        <Collapse in={showMultiLinearInputs}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 0.25 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 0.5,
              p: 0.5,
              border: '1px solid #ddd',
              borderRadius: 0.5,
              backgroundColor: 'white',
              maxWidth: '400px'
            }}
            noValidate
            autoComplete="off"
          >
            {ranges.map((range, index) => (
              <Box key={index} sx={{ 
                width: '100%',
                mb: 0.5,
                p: 0.5,
                border: '1px solid #eee',
                borderRadius: 0.5,
                position: 'relative'
              }}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Bölge {index + 1}</Typography>
                
                <Grid container spacing={0.5}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="in_min"
                      variant="outlined"
                      value={range.in_min}
                      onChange={(e) => handleRangeChange(index, 'in_min', e.target.value)}
                      type="number"
                      size="small"
                      margin="dense"
                      inputProps={{ 
                        min: 0, 
                        max: range.in_max - 1,
                        style: { 
                          padding: '4px 6px',
                          fontSize: '0.75rem'
                        }
                      }}
                      InputLabelProps={{
                        shrink: true,
                        style: { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="in_max"
                      variant="outlined"
                      value={range.in_max}
                      onChange={(e) => handleRangeChange(index, 'in_max', e.target.value)}
                      type="number"
                      size="small"
                      margin="dense"
                      inputProps={{ 
                        min: range.in_min + 1, 
                        max: 255,
                        style: { 
                          padding: '4px 6px',
                          fontSize: '0.75rem'
                        }
                      }}
                      InputLabelProps={{
                        shrink: true,
                        style: { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="out_min"
                      variant="outlined"
                      value={range.out_min}
                      onChange={(e) => handleRangeChange(index, 'out_min', e.target.value)}
                      type="number"
                      size="small"
                      margin="dense"
                      inputProps={{ 
                        min: 0, 
                        max: range.out_max - 1,
                        style: { 
                          padding: '4px 6px',
                          fontSize: '0.75rem'
                        }
                      }}
                      InputLabelProps={{
                        shrink: true,
                        style: { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="out_max"
                      variant="outlined"
                      value={range.out_max}
                      onChange={(e) => handleRangeChange(index, 'out_max', e.target.value)}
                      type="number"
                      size="small"
                      margin="dense"
                      inputProps={{ 
                        min: range.out_min + 1, 
                        max: 255,
                        style: { 
                          padding: '4px 6px',
                          fontSize: '0.75rem'
                        }
                      }}
                      InputLabelProps={{
                        shrink: true,
                        style: { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                </Grid>
                
                {ranges.length > 1 && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRange(index);
                    }}
                    color="error"
                    size="small"
                    sx={{ 
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      padding: '2px'
                    }}
                  >
                    <RemoveCircleIcon fontSize="inherit" style={{ fontSize: '1rem' }} />
                  </IconButton>
                )}
              </Box>
            ))}

            <Box sx={{ 
              display: 'flex', 
              gap: 0.5, 
              width: '100%', // Genişliği tam yap
              height: "24px", 
              mt: 0.5,
              justifyContent: 'center' // İçeriği ortala
            }}>
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon style={{ fontSize: '0.9rem' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  addRange();
                }}
                sx={{ 
                  py: 0.25,
                  fontSize: '0.7rem',
                  minHeight: '24px',
                  width: 'auto' // Genişliği otomatik ayarla
                }}
              >
                Ekle
              </Button>
              <Button
                variant="contained"
                disableElevation
                sx={{
                  backgroundColor: "#1f2021",  
                  color: "#cccccc",            
                  minWidth: "60px",
                  height: "24px",
                  textTransform: "none",
                  fontSize: '0.7rem',   
                  fontWeight: "bold",             
                  '&:hover': {
                    backgroundColor: "#2e2f30", 
                  },
                  mx: 0,
                  p: 0.25
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMultiLinearSubmit();
                }}
              >
                Uygula
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default ContrastOptions;