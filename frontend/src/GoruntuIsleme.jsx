import React from "react";
import { useState } from "react";
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
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImages, setProcessedImages] = useState([]); // Resimleri dizi olarak saklayacağız
  const [brightnessOn, setBrightnessOn] = useState(false);
  const [contrastOn, setContrastOn] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setOriginalImage(URL.createObjectURL(file));
      setProcessedImages([]); // Yeni dosya yüklenince işlenmiş resimleri sıfırla
    }
  };

  const processImage = async (operation, value = null) => {
    const formData = new FormData();
    const fileInput = document.querySelector('input[type="file"]');

    formData.append("image", fileInput.files[0]);
    formData.append("operation", operation);
    if (value !== null) {
      formData.append("value", value);
    }

    const response = await axios.post("http://127.0.0.1:5000/process", formData, { responseType: "blob" })
    const imageUrl = URL.createObjectURL(response.data);
    setProcessedImages((prevImages) => [...prevImages, imageUrl]);

  };




  return (
    <Box sx={{
      backgroundColor: "#E3F2FD", minHeight: "100vh", width: "100vw", margin: 0,
      padding: 0, display: "flex", flexDirection: "column",
    }} >
      {/*backgroundColor'da kenarda kalan beyaz boşlukları yok etmek için kullanıldı */}
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

        {/* Orijinal ve işlenmiş resimleri yan yana göster */}
        {originalImage && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 3 }}>
            <Box>
              <Typography variant="h6">Orijinal Resim</Typography>
              <img src={originalImage} alt="Orijinal" style={{ maxWidth: "400px", maxHeight: "400px", border: "2px solid gray" }} />
            </Box>
            <Box>
              <Typography variant="h6">İşlenmiş Resim</Typography>
              <img
                src={processedImages.length > 0 ? processedImages.at(-1) : originalImage}
                alt="İşlenmiş"
                style={{ maxWidth: "400px", maxHeight: "400px", border: "2px solid gray" }}
              />
            </Box>
          </Box>
        )}
 

        <Button
          variant="contained"
          sx={{ backgroundColor: "purple", mx: "auto", marginTop: 5, textTransform: "none", fontSize: 20 }}
          onClick={() => setProcessedImages([])} // İşlenmiş resimleri sıfırla
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
                  value={brightness}
                  onChange={(e, newValue) => setBrightness(newValue)}
                  onChangeCommitted={() => processImage("brightness", brightness)}
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
                  value={contrast}
                  onChange={(e, newValue) => setContrast(newValue)}
                  onChangeCommitted={() => processImage("contrast", contrast)}
                  max={255}
                  color="secondary"
                />
              </Box>
            </Collapse>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}
