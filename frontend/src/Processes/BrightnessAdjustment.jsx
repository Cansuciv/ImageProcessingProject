import React from 'react';
import { Button, Box } from '@mui/material';
import Slider from '@mui/material/Slider';
import Collapse from '@mui/material/Collapse';


const BrightnessAdjustment = ({ brightnessOn, setBrightnessOn, brightnessValue, handleBrightnessChange }) => {
  return (
    <Box>
      <Button
        variant="contained"
        disableElevation
        onClick={() => setBrightnessOn(!brightnessOn)}
        sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
      >
        Parlaklık
      </Button>
      <Collapse in={brightnessOn}>
        <Slider
          value={brightnessValue}
          onChange={handleBrightnessChange}
          aria-label="Brightness"
          valueLabelDisplay="auto"
          min={0}
          max={255}
        />
      </Collapse>
    </Box>
  );
};

export default BrightnessAdjustment;