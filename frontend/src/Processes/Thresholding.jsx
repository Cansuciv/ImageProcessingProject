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
          sx={{
            backgroundColor: "#1f2021",  
            color: "#cccccc",            
            width: "90px",
            height: "30px",
            textTransform: "none",
            fontSize: 17,   
            fontWeight: "bold",             
            '&:hover': {
              backgroundColor: "#2e2f30", 
            },
            mx: 0,
          }}
        onClick={() => setThresholdingOn(!thresholdingOn)}
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
          sx={{
            color: "#cccccc", // thumb ve track rengi (buton yazı rengiyle uyumlu)
            '& .MuiSlider-thumb': {
              backgroundColor: "#cccccc", // thumb rengi
              border: '2px solid #1f2021',
            },
            '& .MuiSlider-track': {
              backgroundColor: "#cccccc", // dolu kısmın rengi
            },
            '& .MuiSlider-rail': {
              backgroundColor: "#2e2f30", // boş kısmın rengi (buton hover gibi)
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: "#1f2021", // label arka plan
              color: "#ffffff",           // label yazı rengi
            }
          }}
        />
      </Collapse>
    </Box>
  );
};

export default Thresholding;