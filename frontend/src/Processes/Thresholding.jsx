import React from 'react';
import { Button, Box } from '@mui/material';
import Slider from '@mui/material/Slider';
import Collapse from '@mui/material/Collapse';

const Thresholding = ({ thresholdingOn, setThresholdingOn, thresholdingValue, handleThresholdingChange }) => {
  return (
    <Box>
      <Button
        variant="contained"
        disableElevation
        onClick={() => setThresholdingOn(!thresholdingOn)}
        sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
      >
        Eşikleme
      </Button>
      <Collapse in={thresholdingOn}>
        <Slider
          value={thresholdingValue}
          onChange={handleThresholdingChange}
          aria-label="Thresholding"
          valueLabelDisplay="auto"
          min={0}
          max={255}
        />
      </Collapse>
    </Box>
  );
};

export default Thresholding;