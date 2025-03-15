import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import Slider from "@mui/material/Slider";
import Collapse from "@mui/material/Collapse";
import axios from "axios";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function GoruntuIsleme() {
  const [originalImage, setOriginalImage] = useState(null); // orijinal resmi tutmak için kullanılır
  const [processedImage, setProcessedImage] = useState(null); // İşlenmiş resmi tutacak state

  const [brightnessOn, setBrightnessOn] = useState(false); // Parlaklığı arttırmak/azaltmak için slider'ı açacak
  const [contrastOn, setContrastOn] = useState(false); // Konstratı arttırmak/azaltmak için slider'ı açacak


  // Yüklenen dosyaları göstermek
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setOriginalImage(imageUrl);
    setProcessedImage(imageUrl); // İşlenmiş resmi orijinal resimle olarak (varsayılann şekilde) başlatılıyor

  };

  const processImage = async (operation) => {
    const formData = new FormData();
    const fileInput = document.querySelector('input[type="file"]');

    // İşlenmiş resmi kullanarak yeni işlem yapmak
    const response = await fetch(processedImage);
    const blob = await response.blob();

    formData.append("image", blob, fileInput.files[0].name); // İşlenmiş resmi gönder
    formData.append("operation", operation);

    //Sunucuya istek göndermek
    const responseFromServer = await axios.post("http://127.0.0.1:5000/process", formData, { responseType: "blob" });
    
    //Sunucudan gelen işlenmiş resimleri göstermek
    const imageUrl = URL.createObjectURL(responseFromServer.data);
    setProcessedImage(imageUrl); // İşlenmiş resmi güncelle
  };

  // İşlenmiş resmi orijinal resme geri döndürmek için kullanılır
  const resetToOriginal = () => {
    setProcessedImage(originalImage); 
  };

  return (
    <Box >
      {/* Arkalan rengi ayarlama. Box içinde sx={{backgroundColor}} yapınca kenarlarda beyaz kısımlarkalıyor*/}
      <style>
        {`html, body {margin: 0;padding: 0; width: 100%;height: 100%; background-color: #E3F2FD;overflow-x: hidden;  }`}
      </style>

      <title>Görüntü İşleme</title>

      <Box sx={{ textAlign: "center", padding: 2 }}>
        <Typography variant="h4" gutterBottom >
          Görsel İşleme Uygulaması
        </Typography>
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}
          sx={{ marginBottom: 2, marginTop: 5, display: "flex", mx: "auto", width: 200, height: 50 }}>
          Upload files
          <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>

        {originalImage && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 3 }}>
            <Box>
              <Typography variant="h6">Orijinal Resim</Typography>
              <img src={originalImage} alt="Orijinal" style={{ maxWidth: "400px", maxHeight: "400px", border: "2px solid gray" }} />
            </Box>
            <Box>
              <Typography variant="h6">İşlenmiş Resim</Typography>
              <img
                src={processedImage}
                alt="İşlenmiş"
                style={{ maxWidth: "400px", maxHeight: "400px", border: "2px solid gray" }}
              />
            </Box>
          </Box>
        )}

        <Button
          variant="contained"
          sx={{ backgroundColor: "purple", mx: "auto", marginTop: 5, textTransform: "none", fontSize: 20 }}
          onClick={resetToOriginal} // İşlenmiş resmi orijinal resme geri döndür
        >
          Orjinal Resme Geri dön
        </Button>

        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} marginTop="50px" textTransform={"none"} >

          <Button
            variant="contained"
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
            onClick={() => processImage("grayscale")}
          >
            Gri Resim
          </Button>

          <Button
            variant="contained"
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
            onClick={() => processImage("red")}
          >
            Kırmızı
          </Button>

          <Button
            variant="contained"
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
            onClick={() => processImage("green")}
          >
            Yeşil
          </Button>

          <Button
            variant="contained"
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
            onClick={() => processImage("blue")}
          >
            Mavi
          </Button>

          <Box>
            <Button
              variant="contained"
              sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
              onClick={() => setBrightnessOn(!brightnessOn)}
            >
              Parlaklık
            </Button>
            <Collapse in={brightnessOn}>
              <Box sx={{ width: 120, marginTop: 2 }}>
                <Slider
            
                  onChangeCommitted={() => processImage("brightness")}
                  max={255}
                  color="secondary"
                />
              </Box>
            </Collapse>
          </Box>

          <Box>
            <Button
              variant="contained"
              sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
              onClick={() => setContrastOn(!contrastOn)}
            >
              Kontrast
            </Button>
            <Collapse in={contrastOn}>
              <Box sx={{ width: 120, marginTop: 2 }}>
                <Slider
                  onChangeCommitted={() => processImage("contrast")}
                  max={255}
                  color="secondary"
                />
              </Box>
            </Collapse>
          </Box>

          <Button
            variant="contained"
            sx={{ backgroundColor: "purple", width: "120px", height: "50px", textTransform: "none", fontSize: 18 }}
            onClick={() => processImage("negative")}
          >
            Negatifi
          </Button>

        </Box>
      </Box>
    </Box>
  );
}