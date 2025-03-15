import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import { Box } from "@mui/material";
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Typography from "@mui/material/Typography";
import axios from "axios";
import Slider from "@mui/material/Slider";
import Collapse from "@mui/material/Collapse";

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

export default function GorntuIsleme() {
  const [originalImage, setOriginalImage] = useState(null); // orijinal resmi tutmak için kullanılır
  const [processedImage, setProcessedImage] = useState(null); // İşlenmiş resmi tutacak state
  const [brightnessOn, setBrightnessOn] = useState(false); // Parlaklığı arttırmak/azaltmak için slider'ı açacak
  const [contrastOn, setContrastOn] = useState(false); // Konstratı arttırmak/azaltmak için slider'ı açacak
  const [brightnessValue, setBrightnessValue] = useState(50); // Parlaklık değerini tutacak state

  const processImage = async (operation, value = null) => {
    //FormData: Dosya ve diğer verileri sunucuya göndermeye yarayan özel bir veri yapısıdır.
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

    //Sunucuya istek göndermek
    const responseFromServer = await axios.post("http://127.0.0.1:5000/process", formData, { responseType: "blob" });

    //Sunucudan gelen işlenmiş resimleri göstermek
    const imageUrl = URL.createObjectURL(responseFromServer.data);
    setProcessedImage(imageUrl); // İşlenmiş resmi güncelle
  };

  const backToOriginalImage = () => {
    setProcessedImage(originalImage)
  }

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const imgUrl = URL.createObjectURL(event.target.files[0]);
      setOriginalImage(imgUrl);
      setProcessedImage(imgUrl);
    }
  }

  const handleBrightnessChange = (event, newValue) => {
    setBrightnessValue(newValue);
    processImage("brightness", newValue);
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
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 3 }}>
            <Box>
              <Typography ariant="h6">Orijinal Resim</Typography>
              <img src={originalImage} alt="Orijinal" style={{ marginTop: 10 }} />
            </Box>
            <Box>
              <Typography ariant="h6">İşlenen Resim</Typography>
              <img src={processedImage} alt="İşlenmiş" tyle={{ maxWidth: "400px", maxHeight: "400px", border: "2px solid gray" }}
              />
            </Box>

          </Box>
        )}

        <Button variant="contained" disableElevation
          sx={{ backgroundColor: "purple", mx: "auto", marginTop: 5, textTransform: "none", fontSize: 20 }}
          onClick={backToOriginalImage}>
          Orijinal Resme Geri Dön
        </Button>

        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} marginTop="50px" textTransform={"none"}>
          <Button variant="contained" disableElevation
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
            onClick={() => processImage("grayscale")}>
            Gri Resim
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
                aria-label="Default"
                valueLabelDisplay="auto"
                color="secondary"
                max={255}
              />
            </Collapse>
          </Box>

          <Button variant="contained" disableElevation
            onClick={() => processImage("negative")}
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}>
            Negatifi
          </Button>

        </Box>

      </Box>
    </Box>
  );
}