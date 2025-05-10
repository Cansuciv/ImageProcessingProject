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
  import CrimminsSpeckleFilter from './Processes/CrimminsSpeckleFilter.jsx';
  import FourierTransformFilter from './Processes/FourierTransformFilter.jsx';
  import BandGecirenDurduranFiltre from './Processes/BandGecirenDurduranFiltre.jsx';
  import ButterworthFiltre from './Processes/ButterworthFiltre.jsx';
  import GaussianFilter from './Processes/GaussianFilter.jsx';
  import HomomorphicFilter from './Processes/HomomorphicFilter.jsx';
  import Sobel from './Processes/Sobel.jsx';
  import Prewitt from './Processes/Prewitt.jsx';
  import Roberts from './Processes/Roberts.jsx';
  import Compass from './Processes/Compass.jsx';
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
    const [fourierHistogramImage, setFourierHistogramImage] = useState(null);
    const [showFourierPlot, setShowFourierPlot] = useState(false);
    const [bandFilterPlotImage, setBandFilterPlotImage] = useState(null);
    const [showBandFilterPlot, setShowBandFilterPlot] = useState(false);
    const [showButterworthFilterPlot, setShowButterworthFilterPlot] = useState(false);
    const [butterworthFilterPlotImage, setButterworthFilterPlotImage] = useState(null);
    const [showGaussianFilterPlot, setShowGaussianFilterPlot] = useState(false);
    const [gaussianFilterPlotImage, setGaussianFilterPlotImage] = useState(null);
    const [sobelPlotImage, setSobelPlotImage] = useState(null);
    const [showSobelPlot, setShowSobelPlot] = useState(false);
    const [prewittPlotImage, setPrewittPlotImage] = useState(null);
    const [showPrewittPlot, setShowPrewittPlot] = useState(false);
    const [robertsPlotImage, setRobertsPlotImage] = useState(null);
    const [showRobertslot, setShowRobertsPlot] = useState(false);

    const processImage = async (operation, value = null) => {
      const formData = new FormData();
      const fileInput = document.querySelector('input[type="file"]');
    
      try {
        // Determine which image to use
        const imageToUse = 
          ["fourier_transform", "fourier_low_pass_filter", "fourier_high_pass_filter", 
          "fourier_filter_plot", "band_gecirendurduran_plot", "gaussianFilterPlotImage",
          "homomorphic_filter", "sobel_plot", "prewitt_plot", "roberts_plot",
          "compass_edge_detection"].includes(operation)
            ? (processedImage || originalImage)
            : (["brightness", "thresholding", "manual_translate", "functional_translate",
                "shear_x", "shearing_x_manuel", "shear_y", "shearing_y_manuel", 
                "crimmins_speckle_filter"].includes(operation)
                ? (baseImage || originalImage)
                : (processedImage || originalImage));

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

        // Add Fourier transform parameters
        if (["fourier_low_pass_filter", "fourier_high_pass_filter"].includes(operation) && value !== null) {
          formData.append("value", value.toString());
        }
        if (operation === "fourier_filter_plot" && value !== null) {
          formData.append("value", value.toString()); // Radius değerini string olarak ekle
        }
        if (["band_geciren_filtre", "band_durduran_filtre", "band_gecirendurduran_plot"].includes(operation) && value !== null) {
          formData.append("value", value.toString());
          formData.append("value", value.toString());
        }

        if (operation.includes("butterworth") && value !== null) {
          formData.append("value", value.toString());
        }
        if (["gaussian_lpf", "gaussian_hpf", "i"].includes(operation) && value !== null) {
          formData.append("value", value.toString());
        }
        if (operation.includes("homomorphic_filter") && value) {
          const homomorphicData = JSON.parse(value);
          formData.append("d0", homomorphicData.d0.toString());
          formData.append("h_l", homomorphicData.h_l.toString());
          formData.append("h_h", homomorphicData.h_h.toString());
          formData.append("c", homomorphicData.c.toString());
        }
        if (["sobel_x", "sobel_y", "sobel_magnitude", "sobel_plot"].includes(operation) && value !== null) {
          formData.append("value", value.toString());
        }
        if (operation === "compass_edge_detection" && value) {
          formData.append("compass_matrices", JSON.stringify(value));
        }




        let responseType;
        if (operation === "histogram_equalization") {
          responseType = "json";
        } else if (operation === "histogram" || operation === "fourier_filter_plot" || 
                  operation === "band_gecirendurduran_plot" || operation === "butterworth_plot" ||
                  operation === "gaussian_plot" || operation === "sobel_plot" ||
                  operation === "prewitt_plot" || operation === "roberts_plot") {
          responseType = "blob";
        } else {
          responseType = "blob";
        }

        const axiosResponse = await axios.post("http://127.0.0.1:5000/process", formData, {
            responseType: responseType,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    
        // Handle different response types
        if (operation === "histogram_equalization") {
          const equalizedImage = `data:image/jpeg;base64,${axiosResponse.data.equalized_image}`;
          const histogramImage = `data:image/png;base64,${axiosResponse.data.histogram_image}`;
          setProcessedImage(equalizedImage);
          setHistogramEqualizationImage(histogramImage);
          setHistogramImage(null);
          setFourierHistogramImage(null);
          setBandFilterPlotImage(null);
          setButterworthFilterPlotImage(null);
          setGaussianFilterPlotImage(null);
          setSobelPlotImage(null);
          setPrewittPlotImage(null);
          setRobertsPlotImage(null);
          return true;
      } 
      else if (operation === "histogram") {
          const imageUrl = URL.createObjectURL(axiosResponse.data);
          setHistogramImage(imageUrl);
          setHistogramEqualizationImage(null); 
          setFourierHistogramImage(null);
          setBandFilterPlotImage(null);
          setButterworthFilterPlotImage(null);
          setGaussianFilterPlotImage(null); 
          setSobelPlotImage(null);
          setPrewittPlotImage(null);
          setRobertsPlotImage(null);
          return true;
      } 
      else if (operation === "fourier_filter_plot") {
        if (fourierHistogramImage) {
          URL.revokeObjectURL(fourierHistogramImage);
        }
        const imageUrl = URL.createObjectURL(axiosResponse.data);
        setFourierHistogramImage(imageUrl);
        setHistogramImage(null);
        setHistogramEqualizationImage(null);
        setBandFilterPlotImage(null);
        setButterworthFilterPlotImage(null);
        setGaussianFilterPlotImage(null);
        setSobelPlotImage(null);
        setPrewittPlotImage(null);
        setRobertsPlotImage(null);
        return imageUrl;
      }
      else if (operation === "band_gecirendurduran_plot") {
        const imageUrl = URL.createObjectURL(axiosResponse.data);
        setBandFilterPlotImage(imageUrl);
        setHistogramImage(null); 
        setHistogramEqualizationImage(null); 
        setFourierHistogramImage(null);
        setButterworthFilterPlotImage(null);
        setGaussianFilterPlotImage(null);
        setSobelPlotImage(null);
        setPrewittPlotImage(null);
        setRobertsPlotImage(null);
        return true;
    } 
        else if (operation === "butterworth_plot") {
          const imageUrl = URL.createObjectURL(axiosResponse.data);
          setButterworthFilterPlotImage(imageUrl)
          setBandFilterPlotImage(null);
          setHistogramImage(null); 
          setHistogramEqualizationImage(null);
          setFourierHistogramImage(null);
          setGaussianFilterPlotImage(null);
          setSobelPlotImage(null);
          setPrewittPlotImage(null);
          setRobertsPlotImage(null);
          return true;
      } 
      else if (operation === "gaussian_plot") {
        const imageUrl = URL.createObjectURL(axiosResponse.data);
        setGaussianFilterPlotImage(imageUrl);
        setButterworthFilterPlotImage(null);
        setBandFilterPlotImage(null);
        setHistogramImage(null);
        setHistogramEqualizationImage(null);
        setFourierHistogramImage(null);
        setSobelPlotImage(null);
        setPrewittPlotImage(null);
        setRobertsPlotImage(null);
        return imageUrl;
      }
      else if (operation === "sobel_plot") {
        const imageUrl = URL.createObjectURL(axiosResponse.data);
        setSobelPlotImage(imageUrl)
        setGaussianFilterPlotImage(null);
        setButterworthFilterPlotImage(null);
        setBandFilterPlotImage(null);
        setHistogramImage(null);
        setHistogramEqualizationImage(null);
        setFourierHistogramImage(null);
        setPrewittPlotImage(null);
        setRobertsPlotImage(null);
        return imageUrl;
      }
      else if (operation === "prewitt_plot") {
        const imageUrl = URL.createObjectURL(axiosResponse.data);
        setPrewittPlotImage(imageUrl);
        setSobelPlotImage(null);
        setGaussianFilterPlotImage(null);
        setButterworthFilterPlotImage(null);
        setBandFilterPlotImage(null);
        setHistogramImage(null);
        setHistogramEqualizationImage(null);
        setFourierHistogramImage(null);
        setRobertsPlotImage(null);
        return imageUrl;
      }
      else if (operation === "roberts_plot") {
        const imageUrl = URL.createObjectURL(axiosResponse.data);
        setRobertsPlotImage(imageUrl);
        setPrewittPlotImage(null);
        setSobelPlotImage(null);
        setGaussianFilterPlotImage(null);
        setButterworthFilterPlotImage(null);
        setBandFilterPlotImage(null);
        setHistogramImage(null);
        setHistogramEqualizationImage(null);
        setFourierHistogramImage(null);
        return imageUrl;
      }
      else {
          const imageUrl = URL.createObjectURL(axiosResponse.data);
          setProcessedImage(imageUrl);
      
          // Update baseImage for specific operations
          if (["convert_gray", "red", "green", "blue", "negative",
              "shear_x", "shearing_x_manuel", "shear_y", "shearing_y_manuel"].includes(operation)) {
              setBaseImage(imageUrl);
          }
          if (operation.includes("mirror")) {
              setBaseImage(imageUrl);
          }
          return true;
        }
      }
      catch (error) {
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
  setFourierHistogramImage(null);
  setBandFilterPlotImage(null);
  setShowBandFilterPlot(false);
  setTempManualContrastImage(null);
  setShowManualInputs(false);
  setShowMultiLinearInputs(false);
  setShowButterworthFilterPlot(false); 
  setButterworthFilterPlotImage(null); 
  setShowGaussianFilterPlot(false);
  setGaussianFilterPlotImage(false);
  setShowSobelPlot(false);
  setSobelPlotImage(false);
  setShowPrewittPlot(false);
  setPrewittPlotImage(false);
  setShowRobertsPlot(false);
  setRobertsPlotImage(false)
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


              {/* Diğer grafikler (histogram vb.) */}
              {(histogramImage || histogramEqualizationImage ||fourierHistogramImage
               || bandFilterPlotImage || butterworthFilterPlotImage || gaussianFilterPlotImage
                || sobelPlotImage || prewittPlotImage || robertsPlotImage) && (
                <Box sx={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 4 }}>
                  {histogramImage && (
                    <Box>
                      <Typography variant="h6">Histogram Grafiği</Typography>
                      <img src={histogramImage} alt="Histogram" style={{ marginTop: 10 }} />
                    </Box>
                  )}
                  {histogramEqualizationImage && (
                    <Box>
                      <Typography variant="h6">Eşitlenmiş Histogram</Typography>
                      <img src={histogramEqualizationImage} alt="Eşitlenmiş Histogram" style={{ marginTop: 10 }} />
                    </Box>
                  )}

                  {fourierHistogramImage && (
                    <Box>
                      <Typography variant="h6">Fourier Spektrumu</Typography>
                      <img src={fourierHistogramImage} alt="Fourier Spektrumu" style={{ marginTop: 10 }} />
                    </Box>
                  )}

                  {bandFilterPlotImage && (
                    <Box>
                      <Typography variant="h6">Band Filtre Grafiği</Typography>
                      <img src={bandFilterPlotImage} alt="Band Filtre Grafiği" style={{ marginTop: 10 }} />
                    </Box>
                  )}

                  {butterworthFilterPlotImage && (
                    <Box>
                      <Typography variant="h6">Butterworth Filtre Grafiği</Typography>
                      <img src={butterworthFilterPlotImage} alt="Butterworth Filtre Grafiği" style={{ marginTop: 10 }} />
                    </Box>
                  )}
                  {gaussianFilterPlotImage && (
                    <Box>
                      <Typography variant="h6">Gaussian Filtre Grafiği</Typography>
                      <img src={gaussianFilterPlotImage} alt="Gaussian Filtre Grafiği" style={{ marginTop: 10 }} />
                    </Box>
                  )}
                  {sobelPlotImage && (
                    <Box>
                      <Typography variant="h6">Sobel Grafikleri</Typography>
                      <img src={sobelPlotImage} alt="Sobel Grafikleri" style={{ marginTop: 10 }} />
                    </Box>
                  )}
                  {prewittPlotImage && (
                    <Box>
                      <Typography variant="h6">Prewitt Grafikleri</Typography>
                      <img src={prewittPlotImage} alt="Prewitt Grafikleri" style={{ marginTop: 10 }} />
                    </Box>
                  )}
                  {robertsPlotImage && (
                    <Box>
                      <Typography variant="h6">Roberts Grafikleri</Typography>
                      <img src={robertsPlotImage} alt="Roberts Grafikleri" style={{ marginTop: 10 }} />
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
            <CrimminsSpeckleFilter 
            processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
            originalImage={originalImage}
            processedImage={processedImage}
            />

            <FourierTransformFilter
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
              setFourierHistogramImage={setFourierHistogramImage}
              setShowFourierPlot={setShowFourierPlot}
            />
            <BandGecirenDurduranFiltre
              processImage={processImage}
              originalImage={originalImage}
              processedImage={processedImage}
              setBandFilterPlotImage={setBandFilterPlotImage}
              setShowBandFilterPlot={setShowBandFilterPlot}
            />
            <ButterworthFiltre
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
              setButterworthFilterPlotImage={setButterworthFilterPlotImage}
              setShowButterworthFilterPlot={setShowButterworthFilterPlot}
            />
            <GaussianFilter
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
              setGaussianFilterPlotImage={setGaussianFilterPlotImage}
              setShowGaussianFilterPlot={setShowGaussianFilterPlot}
            />
            <HomomorphicFilter
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <Sobel
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
              setSobelPlotImage={setSobelPlotImage}
              setShowSobelPlot={setShowSobelPlot}
            />
            <Prewitt
              processImage={(operation) => handleProcessButtonClick(operation, processImage)}
              originalImage={originalImage}
              processedImage={processedImage}
              setPrewittPlotImage={setPrewittPlotImage}
              setShowPrewittPlot={setShowPrewittPlot}
            />
            <Roberts
              processImage={(operation) => handleProcessButtonClick(operation, processImage)}
              originalImage={originalImage}
              processedImage={processedImage}
              setRobertsPlotImage={setRobertsPlotImage}
              setShowRobertsPlot={setShowRobertsPlot}
            />
            <Compass
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
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