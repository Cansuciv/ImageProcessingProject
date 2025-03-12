import React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import Slider from '@mui/material/Slider';
import Collapse from '@mui/material/Collapse';


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// ✅ Ana bileşen adı düzeltildi
export default function GoruntuIsleme() {
  const [imageSrc, setImageSrc] = useState(null);
  const [brightnessOn, setBrightnessOn] = useState(false);
  const [contrastOn, setContrastOn] = useState(false);

  const handleFileChange = (event) => {
    const files = event.target.files;

    const file = files[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file));
    }
  };

  const handleBrightnessChange = () => {
    setBrightnessOn(!brightnessOn);
  }

  const handleContrastChange = () => {
    setContrastOn(!contrastOn);
  }

  return (
    <Box sx={{ textAlign: 'center', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Görsel İşleme Uygulaması
      </Typography>
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        sx={{ marginBottom: 2 }}
      >
        Upload files
        <VisuallyHiddenInput type="file" onChange={handleFileChange} multiple />
      </Button>


      {imageSrc && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h1" color="black" fontSize="larger">
            Orijinal Resim:
          </Typography>
          <img
            src={imageSrc}
            alt="Uploaded"
            style={{ maxWidth: '100%', maxHeight: '400px', marginTop: 2 }}
          />
        </Box>
      )}

      <Box display="flex" flexDirection="row" gap={2} marginTop="50px" >
        <Box sx={{ marginLeft: "10px" }}>
          <Button
            variant="contained"
            onClick={handleBrightnessChange}
            sx={{ backgroundColor: "purple", width: "100px", height: "50px" }} // 'heigh' yerine 'height' doğru yazım
          >
            Parlaklık
          </Button>

          <Collapse in={brightnessOn}>
            <Box sx={{ width: 90, marginTop: 2, marginLeft: "5px" }}>
              <Slider aria-label="Default" valueLabelDisplay="auto" max={255} color="secondary" />
            </Box>
          </Collapse>
        </Box>

        <Box sx={{ marginLeft: "10px" }}>
          <Button
            variant="contained"
            onClick={handleContrastChange}
            sx={{ backgroundColor: "purple", width: "100px", height: "50px" }} // 'heigh' yerine 'height' doğru yazım
          >
            Kontras
          </Button>

          <Collapse in={contrastOn}>
            <Box sx={{ width: 90, marginTop: 2, marginLeft: "5px" }}>
              <Slider aria-label="Default" valueLabelDisplay="auto" max={255} color="secondary" />
            </Box>
          </Collapse>
        </Box>

        <Box sx={{ marginLeft: "10px" }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "purple", width: "100px", height: "50px" }} // 'heigh' yerine 'height' doğru yazım
          >
            Negatifini Alma
          </Button>
        </Box>
      </Box>




    </Box>
  );
}
