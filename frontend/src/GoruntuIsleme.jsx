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
  import Translate from './Processes/Translate.jsx';
  import Mirroring from './Processes/Mirroring.jsx';
  import Shearing from './Processes/Shearing.jsx';
  import ZoomOutZoomIn from './Processes/ZoomOutZoomIn.jsx';
  import Rotate from './Processes/Rotate.jsx'
  import CropImage from './Processes/CropImage.jsx';
  import Perspective from './Processes/Perspective.jsx';
  import MeanMedianFilter from './Processes/MeanMedianFilter.jsx';
  import GaussianBlurFilter from './Processes/GaussianBlurFilter.jsx';
  import ConservativeFilter from './Processes/ConservativeFilter.jsx';
  import FrameOptions from './Processes/FrameOptions.jsx';

  const optionsContrast = ['Linear Contrast Stretching', 'Manual Contrast Stretching', 'Multi Linear Contrast'];


  export default function GorntuIsleme() {
    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [brightnessOn, setBrightnessOn] = useState(false);
    const [thresholdingOn, setThresholdingOn] = useState(false);
    const [brightnessValue, setBrightnessValue] = useState(127);
    const [thresholdingValue, setThresholdingValue] = useState(127);
    const [histogramImage, setHistogramImage] = useState(null);
    const [histogramEqualizationImage, setHistogramEqualizationImage] = useState(null);
    const [tempManualContrastImage, setTempManualContrastImage] = useState(null);
    const [baseImage, setBaseImage] = useState(null);
    const [baseOperation, setBaseOperation] = useState(null);
    const [operations, setOperations] = useState([]);
    const [showManualInputs, setShowManualInputs] = useState(false);
    const [showMultiLinearInputs, setShowMultiLinearInputs] = useState(false);

    const processImage = async (operation, value = null) => {
      const formData = new FormData();
      const fileInput = document.querySelector('input[type="file"]');
    
      try {
        // Determine which image to use
        const imageToUse =
          ["brightness", "thresholding", "manual_translate", "functional_translate",
            "shear_x", "shearing_x_manuel", "shear_y", "shearing_y_manuel"].includes(operation)
            ? (baseImage || originalImage)
            : (processedImage || originalImage);
    
        if (!imageToUse) {
          console.error("No image available for processing");
          return false;
        }
    
        // Get image as blob
        const response = await fetch(imageToUse);
        const blob = await response.blob();
        formData.append("image", blob, fileInput?.files[0]?.name || "image.jpg");
        formData.append("operation", operation);
    
        // Add specific parameters
        if (operation === "brightness" && value !== null) {
          formData.append("value", value.toString());
        }
        if (operation === "thresholding" && value !== null) {
          formData.append("value", value.toString());
        }
        if (operation.includes("translate") && value) {
          formData.append("dx", value.dx.toString());
          formData.append("dy", value.dy.toString());
        }
        // Mirror operations
        if (operation === "mirror_image_by_center" && value?.x0) {
          formData.append("x0", value.x0.toString());
        }
        if (operation === "mirror_image_angle" && value?.angle) {
          formData.append("angle", value.angle.toString());
        }
        // Shearing operations
        if (["shear_x", "shearing_x_manuel", "shear_y", "shearing_y_manuel"].includes(operation) && value !== null) {
          formData.append("value", value.toString());
        }
        // zoom-out/zoom-in operations
        if (["zoom_out_pixel_replace", "zoom_out_with_interpolation", "zoom_in_pixel_replace", "zoom_in_with_interpolation"].includes(operation) && value !== null) {
          formData.append("value", value.toString());
        }
        // Rotation
        if (["rotate_image_without_alias", "rotate_with_interpolations"].includes(operation) && value !== null) {
          formData.append("value", value.toString());
        }
        // Crop
        if (operation.includes("crop_image") && value) {
          const cropData = JSON.parse(value);
          formData.append("y1", cropData.y1.toString());
          formData.append("y2", cropData.y2.toString());
          formData.append("x1", cropData.x1.toString());
          formData.append("x2", cropData.x2.toString());
        }
        // Perspective
        if (operation === "perspektif_duzeltme" && value) {
          const perspectiveData = JSON.parse(value);
          formData.append("value", JSON.stringify({
            pts1: perspectiveData.pts1,
            pts2: perspectiveData.pts2,
            width: perspectiveData.width,
            height: perspectiveData.height
          }));
        }
        if (operation === "interactive_perspective_correction" && value) {
          const perspectiveData = JSON.parse(value);
          formData.append("value", JSON.stringify({
            points: perspectiveData.points,
            width: perspectiveData.width,
            height: perspectiveData.height
          }));
        }

        // Mean and Median filters
        if (operation.includes("mean_filter") && value) {
          formData.append("kernel_size", value.kernel_size);
        }
        if (operation.includes("median_filter") && value) {
          formData.append("filter_size", value.filter_size.toString());
        }

        // Gaussian Blur Filter 
        if (operation.includes("gaussian_blur_filter") && value) {
          formData.append("kernel_size", value.kernel_size.toString());
          formData.append("sigma", value.sigma.toString());
        }
    
    
        const axiosResponse = await axios.post("http://127.0.0.1:5000/process", formData, {
          responseType: operation === "histogram_equalization" ? "json" : "blob",
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
    
        // Handle different response types
        if (operation === "histogram_equalization") {
          const equalizedImage = `data:image/jpeg;base64,${axiosResponse.data.equalized_image}`;
          const histogramImage = `data:image/png;base64,${axiosResponse.data.histogram_image}`;
    
          setProcessedImage(equalizedImage);
          setHistogramImage(histogramImage);
          setHistogramEqualizationImage(histogramImage);
        } else if (operation === "histogram") {
          const imageUrl = URL.createObjectURL(axiosResponse.data);
          setHistogramImage(imageUrl);
        } else {
          const imageUrl = URL.createObjectURL(axiosResponse.data);
          setProcessedImage(imageUrl);
    
          // Update baseImage for color, mirror and shearing operations
          if (["convert_gray", "red", "green", "blue", "negative",
            "shear_x", "shearing_x_manuel", "shear_y", "shearing_y_manuel"].includes(operation)) {
            setBaseImage(imageUrl);
          }
          if (operation.includes("mirror")) {
            setBaseImage(imageUrl);
          }
        }
        return true;
      } catch (error) {
        console.error("Error processing image:", error);
        throw error;
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
      // Aşağıdaki satırları ekleyin
      setShowManualInputs(false);
      setShowMultiLinearInputs(false);
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
      setBrightnessValue(newValue);
      processImage("brightness", newValue);
    };

    const handleThresholdingChange = (event, newValue) => {
      setThresholdingValue(newValue);
      processImage("thresholding", newValue);
    };

    const handleProcessButtonClick = (operation, processFn, value = null) => {
      // Input alanlarını kapat
      setShowManualInputs(false);
      setShowMultiLinearInputs(false);

      // İlgili işlemi çalıştır
      if (processFn) {
        processFn(operation, value);
      }
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
              <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
                <Box>
                  <Typography variant="h6">Orijinal Resim</Typography>
                  <img src={originalImage} alt="Orijinal" style={{ marginTop: 10 }} />
                </Box>
                <Box>
                  <Typography variant="h6">İşlenen Resim</Typography>
                  <img src={tempManualContrastImage || processedImage || originalImage} alt="İşlenmiş" style={{ marginTop: 10 }} />
                </Box>
              </Box>

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
            <ConvertToGray processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <RedFilter processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <GreenFilter processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <BlueFilter processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <NegativeFilter processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <BrightnessAdjustment
              brightnessOn={brightnessOn}
              setBrightnessOn={(value) => {
                setShowManualInputs(false);
                setShowMultiLinearInputs(false);
                setBrightnessOn(value);
              }}
              brightnessValue={brightnessValue}
              handleBrightnessChange={(event, newValue) => {
                setShowManualInputs(false);
                setShowMultiLinearInputs(false);
                handleBrightnessChange(event, newValue);
              }}
            />

            <Thresholding
              thresholdingOn={thresholdingOn}
              setThresholdingOn={(value) => {
                setShowManualInputs(false);
                setShowMultiLinearInputs(false);
                setThresholdingOn(value);
              }}
              thresholdingValue={thresholdingValue}
              handleThresholdingChange={(event, newValue) => {
                setShowManualInputs(false);
                setShowMultiLinearInputs(false);
                handleThresholdingChange(event, newValue);
              }}
            />
            <Histogram processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <HistogramEqualization processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <ContrastOptions
              options={optionsContrast}
              onOperationSelect={handleContrastOperationSelect}
              processedImage={processedImage}
              originalImage={originalImage}
              showManualInputs={showManualInputs}
              showMultiLinearInputs={showMultiLinearInputs}
              setShowManualInputs={setShowManualInputs}
              setShowMultiLinearInputs={setShowMultiLinearInputs}
            />
            <Translate
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <Mirroring
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <Shearing
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
              setProcessedImage={setProcessedImage}
            />
            <ZoomOutZoomIn
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <Rotate
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <CropImage
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              processedImage={processedImage}
              originalImage={originalImage}
            />
            <Perspective
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              processedImage={processedImage}
              originalImage={originalImage}
            />
            <MeanMedianFilter
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <GaussianBlurFilter
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <ConservativeFilter 
              processImage={(operation) => handleProcessButtonClick(operation, processImage)}
              originalImage={originalImage}
              processedImage={processedImage}
            />

            {/*
          <FrameOptions 
            options={optionsFrame} 
            onOperationSelect={(operation) => {
              setShowManualInputs(false);
              setShowMultiLinearInputs(false);
              handleFrameOperationSelect(operation);
            }} 
          /> */}
            {/*
          <CropImage 
            processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)} 
            selectedFrame={selectedFrame} 
          />*/}
          </Box>
        </Box>
      </Box>
    );
  }