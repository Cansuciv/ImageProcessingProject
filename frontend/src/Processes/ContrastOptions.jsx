import React, { useState, useRef } from 'react';
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
  const [showContrastInputs, setShowContrastInputs] = useState(false);
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
          sx={{
            backgroundColor: "purple",
            textTransform: "none",
            fontSize: 18,
            "&:hover": { backgroundColor: "purple" }
          }}
          onClick={() => {
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
          sx={{
            backgroundColor: "purple",
            "&:hover": { backgroundColor: "purple" }
          }}
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
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
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
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

      <Box sx={{
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: "white",
        boxShadow: 3,
        width: showMultiLinearInputs ? '600px' : 'auto', // Sadece Multi Linear için geniş
        padding: showMultiLinearInputs ? '20px' : '0' // Sadece Multi Linear için padding
      }}>
        {/* Manual Contrast Stretching Inputs */}
        <Collapse in={showManualInputs}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '20ch' },
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
              id="in_min"
              label="in_min"
              variant="outlined"
              name="in_min"
              value={inputValues.in_min}
              onChange={handleInputChange}
              type="number"
            />
            <TextField
              id="in_max"
              label="in_max"
              variant="outlined"
              name="in_max"
              value={inputValues.in_max}
              onChange={handleInputChange}
              type="number"
            />
            <TextField
              id="out_min"
              label="out_min"
              variant="outlined"
              name="out_min"
              value={inputValues.out_min}
              onChange={handleInputChange}
              type="number"
            />
            <TextField
              id="out_max"
              label="out_max"
              variant="outlined"
              name="out_max"
              value={inputValues.out_max}
              onChange={handleInputChange}
              type="number"
            />
            <Button
              variant="contained"
              onClick={handleManualSubmit}
              sx={{ mt: 2, backgroundColor: "purple", '&:hover': { backgroundColor: "#6a1b9a" } }}
            >
              Manual Contrast Stretching Uygula
            </Button>
          </Box>
        </Collapse>

        {/* Multi Linear Contrast Inputs */}
        <Collapse in={showMultiLinearInputs}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1 },
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
            {ranges.map((range, index) => (
              <Box key={index} sx={{ 
                width: '100%',
                mb: 3,
                p: 2,
                border: '1px solid #eee',
                borderRadius: 1,
                position: 'relative'
              }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Bölge {index + 1}</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="in_min"
                      variant="outlined"
                      value={range.in_min}
                      onChange={(e) => handleRangeChange(index, 'in_min', e.target.value)}
                      type="number"
                      size="small"
                      inputProps={{ min: 0, max: range.in_max - 1 }}
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
                      inputProps={{ min: range.in_min + 1, max: 255 }}
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
                      inputProps={{ min: 0, max: range.out_max - 1 }}
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
                      inputProps={{ min: range.out_min + 1, max: 255 }}
                    />
                  </Grid>
                </Grid>
                
                {ranges.length > 1 && (
                  <IconButton
                    onClick={() => removeRange(index)}
                    color="error"
                    size="small"
                    sx={{ 
                      position: 'absolute',
                      top: 8,
                      right: 8
                    }}
                  >
                    <RemoveCircleIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                onClick={addRange}
                fullWidth
                sx={{ py: 1.5 }}
              >
                Bölge Ekle
              </Button>
              <Button
                variant="contained"
                onClick={handleMultiLinearSubmit}
                fullWidth
                sx={{ 
                  py: 1.5,
                  backgroundColor: "purple" 
                }}
              >
                Multi Linear Contrast Uygula
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default ContrastOptions;