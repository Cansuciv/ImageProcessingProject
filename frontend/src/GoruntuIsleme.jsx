import React, { useState } from "react";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import axios from "axios";
import Button from '@mui/material/Button';

import UploadFile from './Processes/UploadFile.jsx';
import BackToOriginal from './Processes/BackToOriginal.jsx';
import ConvertToGray from './Processes/ConvertToGray.jsx';
import RedFilter from './Processes/RedFilter.jsx';
import GreenFilter from './Processes/GreenFilter.jsx';
import BlueFilter from './Processes/BlueFilter.jsx';
import NegativeFilter from './Processes/NegativeFilter.jsx';
import BrightnessAdjustment from './Processes/BrightnessAdjustment.jsx';
import Thresholding from './Processes/Thresholding.jsx';
import Histogram from './Processes/Histogram.jsx';
import HistogramEqualization from './Processes/HistogramEqualization.jsx';
import ContrastOptions from './Processes/ContrastOptions.jsx';
import FrameOptions from './Processes/FrameOptions.jsx';
import CropImage from "./Processes/CropImage.jsx";


const optionsContrast = ['Linear Contrast Stretching', 'Manual Contrast Stretching', 'Multi Linear Contrast'];
const optionsFrame = ['Rectangle', 'Circle', 'Ellipse', "Polygon"];

export default function GorntuIsleme() {
  const [originalImage, setOriginalImage] = useState(null); // orijinal resmi tutmak için kullanılır
  const [processedImage, setProcessedImage] = useState(null); // İşlenmiş resmi tutacak state
  const [brightnessOn, setBrightnessOn] = useState(false); // Parlaklığı arttırmak/azaltmak için slider'ı açacak
  const [thresholdingOn, setThresholdingOn] = useState(false); // Kontrast değerini tutacak state
  const [brightnessValue, setBrightnessValue] = useState(127); // Parlaklık değerini tutacak state
  const [thresholdingValue, setThresholdingValue] = useState(127); // Kontrast değerini tutacak state
  const [histogramImage, setHistogramImage] = useState(null); // Histogram grafiği için 
  const [histogramEqualizationImage, setHistogramEqualizationImage] = useState(null); // Histogram eşitleme grafiği için 
  const [selectedFrame, setSelectedFrame] = useState(optionsFrame[0]);
  const [tempManualContrastImage, setTempManualContrastImage] = useState(null); // Yeni state

  const [baseImage, setBaseImage] = useState(null); // Yeni state: Temel görüntü (orijinal, gri, mavi vb.)
  const [baseOperation, setBaseOperation] = useState(null); // Yeni state: Temel işlem türü
  const [operations, setOperations] = useState([]); // Uygulanan işlemlerin listesi
  
  const processImage = async (operation, value = null) => {
    const formData = new FormData();
    const fileInput = document.querySelector('input[type="file"]');
  
    // Get the appropriate image source
    const imageToUse = 
      (operation === "brightness" || operation === "thresholding") 
        ? (baseImage || originalImage) 
        : (processedImage || originalImage);
    
    const response = await fetch(imageToUse);
    const blob = await response.blob();
    formData.append("image", blob, fileInput.files[0].name);
    formData.append("operation", operation);
    
    if (value !== null) {
      formData.append("value", value);
    }
  
    try {
      const response = await axios.post("http://127.0.0.1:5000/process", formData, {
        responseType: operation === "histogram_equalization" ? "json" : "blob"
      });
  
      if (operation === "histogram_equalization") {
        // Handle the JSON response containing both images
        const equalizedImage = `data:image/jpeg;base64,${response.data.equalized_image}`;
        const histogramImage = `data:image/png;base64,${response.data.histogram_image}`;
        
        setProcessedImage(equalizedImage);
        setHistogramImage(histogramImage);
        setHistogramEqualizationImage(histogramImage);
        
        return;
      }
  
      if (operation === "histogram") {
        const imageUrl = URL.createObjectURL(response.data);
        setHistogramImage(imageUrl);
      } else {
        const imageUrl = URL.createObjectURL(response.data);
        setProcessedImage(imageUrl);
        
        // Update base image for color operations
        if (["convert_gray", "red", "green", "blue", "negative"].includes(operation)) {
          setBaseImage(imageUrl);
        }
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const backToOriginalImage = () => {
      setProcessedImage(originalImage);
      setBaseImage(null);
      setOperations([]);
      setBaseOperation(null);
      setBrightnessValue(127);
      setThresholdingValue(127);
      setHistogramImage(null);
      setHistogramEqualizationImage(null);
      setTempManualContrastImage(null);
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
    console.info(`You clicked ${optionsContrast[selectedIndex]}`);
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

  const handleContrastOperationSelect = (operation) => {
    if (typeof operation === 'object') {
      if (operation.operation === "manual_contrast_stretching") {
        if (operation.isTemporary) {
          setTempManualContrastImage(operation.result);
        } else if (operation.result) {
          setProcessedImage(operation.result);
        }
      } else if (operation.operation === "multi_linear_contrast" && operation.result) {
        setProcessedImage(operation.result);
      }
      return;
    }
  
    let operationKey;
    switch (operation) {
      case "Linear Contrast Stretching":
        operationKey = "linear_contrast_stretching";
        break;
      case "Manual Contrast Stretching":
      case "Multi Linear Contrast":
        // These cases are handled by the object check above
        return;
      default:
        operationKey = "";
    }
    
    if (operationKey) {
      processImage(operationKey);
    }
  };

  const handleFrameOperationSelect = (operation) => {
    setSelectedFrame(operation); // Seçilen çerçeve türünü state'e kaydet
    let operationKey;
    switch (operation) {
      case "Rectangle":
        operationKey = "rectangle";
        break;
      case "Circle":
        operationKey = "circle";
        break;
      case "Ellipse":
        operationKey = "ellipse";   
        break;
      case "Polygon":
        operationKey = "polygon";
        break;
      default:
        operationKey = "";
    }
    if (operationKey) {
      processImage(operationKey);
    }
  };

const handleCrop = () => {
    processImage("crop", selectedFrame);
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
        <UploadFile onImageChange={onImageChange} />

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
                <img src={tempManualContrastImage || processedImage || originalImage}  alt="İşlenmiş" style={{ marginTop: 10 }} />
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
              </Box>
            )}
          </Box>
        )}

        <BackToOriginal backToOriginalImage={backToOriginalImage} />

        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} marginTop="50px" textTransform={"none"}>
          <ConvertToGray processImage={processImage} />
          <RedFilter processImage={processImage} />
          <GreenFilter processImage={processImage} />
          <BlueFilter processImage={processImage} />
          <NegativeFilter processImage={processImage} />
          <BrightnessAdjustment
            brightnessOn={brightnessOn}
            setBrightnessOn={setBrightnessOn}
            brightnessValue={brightnessValue}
            handleBrightnessChange={(event, newValue) => {
                setBrightnessValue(newValue);
                processImage("brightness", newValue);
            }}
           />
          <Thresholding
            thresholdingOn={thresholdingOn}
            setThresholdingOn={setThresholdingOn}
            thresholdingValue={thresholdingValue}
            handleThresholdingChange={handleThresholdingChange}
          />
          <Histogram processImage={processImage} />
          <HistogramEqualization processImage={processImage} />
          <ContrastOptions 
            options={optionsContrast} 
            onOperationSelect={handleContrastOperationSelect}
            processedImage={processedImage}
            originalImage={originalImage}
          />
          <FrameOptions options={optionsFrame} onOperationSelect={handleFrameOperationSelect} />
          <CropImage processImage={processImage} selectedFrame={selectedFrame} />
        </Box>
      </Box>
    </Box>
  );
}