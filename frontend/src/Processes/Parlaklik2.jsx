import React from 'react';
import { Button, Box } from '@mui/material';
import Slider from '@mui/material/Slider';
import Collapse from '@mui/material/Collapse';

const Parlaklik2 = ({ parlaklik2On, setParlaklik2On, parlaklik2Value, handleParlaklik2Change }) => {
  return (
    <Box>
      <Button
        variant="contained"
        disableElevation
        sx={{
          backgroundColor: "#1f2021",  
          color: "#cccccc",            
          width: "100px",
          height: "30px",
          textTransform: "none",
          fontSize: 17,   
          fontWeight: "bold",             
          '&:hover': {
            backgroundColor: "#2e2f30", 
          },
          mx: 0,
        }}
        onClick={() => setParlaklik2On(!parlaklik2On)}
      >
        Parlaklık2
      </Button>
      <Collapse in={parlaklik2On}>
        <Slider
          value={parlaklik2Value}
          onChange={handleParlaklik2Change}
          aria-label="Parlaklık 2"
          valueLabelDisplay="auto"
          min={-255}
          max={255}
          sx={{
            color: "#cccccc",
            '& .MuiSlider-thumb': {
              backgroundColor: "#cccccc",
              border: '2px solid #1f2021',
            },
            '& .MuiSlider-track': {
              backgroundColor: "#cccccc",
            },
            '& .MuiSlider-rail': {
              backgroundColor: "#2e2f30",
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: "#1f2021",
              color: "#ffffff",
            }
          }}
        />
      </Collapse>
    </Box>
  );
};

export default Parlaklik2;