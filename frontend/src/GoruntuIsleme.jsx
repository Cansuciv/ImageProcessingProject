import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import { Box } from "@mui/material";
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Typography from "@mui/material/Typography";
import axios from "axios";
import Slider from "@mui/material/Slider";
import Collapse from "@mui/material/Collapse";
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

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

const options = ['Linear Contrast Stretching', 'Manual Contrast Stretching', 'Multi Linea Contrast'];


export default function GorntuIsleme() {
  const [originalImage, setOriginalImage] = useState(null); // orijinal resmi tutmak için kullanılır
  const [processedImage, setProcessedImage] = useState(null); // İşlenmiş resmi tutacak state
  const [brightnessOn, setBrightnessOn] = useState(false); // Parlaklığı arttırmak/azaltmak için slider'ı açacak
  const [thresholdingOn, setThresholdingOn] = useState(false); // Kontrast değerini tutacak state
  const [brightnessValue, setBrightnessValue] = useState(127); // Parlaklık değerini tutacak state
  const [thresholdingValue, setThresholdingValue] = useState(127); // Kontrast değerini tutacak state
  const [histogramImage, setHistogramImage] = useState(null); // Histogram grafiği için 
  const [histogramEqualizationImage, setHistogramEqualizationImage] = useState(null); // Histogram eşitleme grafiği için 

  const processImage = async (operation, value = null) => {
    const formData = new FormData();
    const fileInput = document.querySelector('input[type="file"]');

    // İşlenmiş resmi kullanarak yeni işlem yapmak
    const response = await fetch(processedImage);
    const blob = await response.blob();

    formData.append("image", blob, fileInput.files[0].name);
    formData.append("operation", operation);
    if (value !== null) {
      formData.append("value", value);
    }

    // Sunucuya istek göndermek
    const responseFromServer = await axios.post("http://127.0.0.1:5000/process", formData, { responseType: "blob" });

    // Sunucudan gelen işlenmiş resimleri göstermek
    const imageUrl = URL.createObjectURL(responseFromServer.data);

    if (operation === "histogram") {
      setHistogramImage(imageUrl);
      if (histogramEqualizationImage)
        setHistogramEqualizationImage(histogramEqualizationImage);
    }
    else if (operation === "histogram_equalization") {
      setHistogramEqualizationImage(imageUrl);
      if (histogramImage)
        setHistogramImage(histogramImage);
    } else {
      setProcessedImage(imageUrl);
    }
  };


  const backToOriginalImage = () => {
    setProcessedImage(originalImage)
    setBrightnessValue(127)
    setThresholdingValue(127)
    setHistogramImage(null);
    setHistogramEqualizationImage(null);
  };

  const resizeImage = (file, width, height, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          callback(blob);
        }, file.type);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      resizeImage(file, 320, 300, (resizedImage) => {
        const imgUrl = URL.createObjectURL(resizedImage);
        setOriginalImage(imgUrl);
        setProcessedImage(imgUrl);
        setHistogramImage(null);
        setHistogramEqualizationImage(null);
      });
    }
  };

  const handleBrightnessChange = (event, newValue) => {
    setBrightnessValue(newValue); // Slider değerini güncelle (0-255)
    processImage("brightness", newValue); // İşlenmiş değeri gönder
  };

  const handleThresholdingChange = (event, newValue) => {
    setThresholdingValue(newValue); // Slider değerini güncelle (0-255)
    processImage("thresholding", newValue); // İşlenmiş değeri gönder
  };


  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Box>
      {/* Arkalan rengi ayarlama. Box içinde sx={{backgroundColor}} yapınca kenarlarda beyaz kısımlar kalıyor*/}
      <style>
        {`html, body {margin: 0;padding: 0; width: 100%;height: 100%; background-color: #E3F2FD;overflow-x: hidden;  }`}
      </style>

      <title>Görüntü İşleme</title>

      <Box sx={{ textAlign: "center", padding: 2 }}>
        <Typography variant="h4" gutterBottom>Görsel İşleme Uygulaması</Typography>
        <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}
          sx={{ marginBottom: 2, marginTop: 5, display: 'flex', mx: 'auto', width: 200, height: 50 }}
        >
          Upload files
          <VisuallyHiddenInput type="file" onChange={onImageChange} />
        </Button>

        {originalImage && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 3 }}>
            {/* Orijinal ve İşlenmiş Resimler */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
              <Box>
                <Typography variant="h6">Orijinal Resim</Typography>
                <img src={originalImage} alt="Orijinal" style={{ marginTop: 10 }} />
              </Box>
              <Box>
                <Typography variant="h6">İşlenen Resim</Typography>
                <img src={processedImage} alt="İşlenmiş" style={{ marginTop: 10 }} />
              </Box>
            </Box>

            {/* Histogram Grafiği */}
            {(histogramImage || histogramEqualizationImage) && (
              <Box sx={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 4 }}>
                {histogramImage && (
                  <Box>
                    <Typography variant="h6">Histogram Grafiği</Typography>
                    <img src={histogramImage} alt="Histogram" style={{ marginTop: 10 }} />
                  </Box>
                )}
                {histogramEqualizationImage && (
                  <Box>
                    <Typography variant="h6">Histogram Eşitleme Grafiği</Typography>
                    <img src={histogramEqualizationImage} alt="Histogram Equalization" style={{ marginTop: 10 }} />
                  </Box>
                )}
              </Box>
            )}


          </Box>
        )}

        <Button variant="contained" disableElevation
          sx={{ backgroundColor: "purple", mx: "auto", marginTop: 5, textTransform: "none", fontSize: 20 }}
          onClick={backToOriginalImage}>
          Orijinal Resme Geri Dön
        </Button>

        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} marginTop="50px" textTransform={"none"}>
          <Button variant="contained" disableElevation
            sx={{ backgroundColor: "purple", width: "132px", height: "50px", textTransform: "none", fontSize: 18 }}
            onClick={() => processImage("convert_gray")}>
            Gri'ye Çevir
          </Button>

          <Button variant="contained" disableElevation
            onClick={() => processImage("red")}
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}>
            Kırmızı
          </Button>

          <Button variant="contained" disableElevation
            onClick={() => processImage("green")}
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}>
            Yeşil
          </Button>

          <Button variant="contained" disableElevation
            onClick={() => processImage("blue")}
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}>
            Mavi
          </Button>

          <Button variant="contained" disableElevation
            onClick={() => processImage("negative")}
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}>
            Negatifi
          </Button>

          <Box>
            <Button variant="contained" disableElevation
              onClick={() => setBrightnessOn(!brightnessOn)}
              sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}>
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

          <Box>
            <Button variant="contained" disableElevation
              onClick={() => setThresholdingOn(!thresholdingOn)}
              sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}>
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

          <Button variant="contained" disableElevation
            onClick={() => processImage("histogram")} // Histogram işlemini tetikle
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}>
            Histogram
          </Button>

          <Button variant="contained" disableElevation
            onClick={() => processImage("histogram_equalization")} // Histogram işlemini tetikle
            sx={{ backgroundColor: "purple", width: "200px", height: "50px", textTransform: "none", fontSize: 18 }}>
            Histogram Eşitleme
          </Button>


          <React.Fragment>
            <ButtonGroup
              variant="contained"
              ref={anchorRef}
              aria-label="Button group with a nested menu"
            >
              <Button sx={{ backgroundColor: "purple", textTransform: "none", fontSize: 18 }} onClick={handleClick}>{options[selectedIndex]}</Button>
              <Button
                sx={{ backgroundColor: "purple" }}
                size="small"
                aria-controls={open ? 'split-button-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="select merge strategy"
                aria-haspopup="menu"
                onClick={handleToggle}
              >
                <ArrowDropDownIcon sx={{ backgroundColor: "purple" }} />
              </Button>
            </ButtonGroup>
            <Popper

              sx={{ zIndex: 1 }}
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
                      <MenuList id="split-button-menu" autoFocusItem >
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
          </React.Fragment>



        </Box>

      </Box>
    </Box>
  );
}