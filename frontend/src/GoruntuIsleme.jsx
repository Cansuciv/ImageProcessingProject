import React, { useState, useRef, useEffect } from 'react';
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import axios from "axios";
import Button from '@mui/material/Button';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import IconButton from '@mui/material/IconButton';

  import UploadFile from './Processes/UploadFile.jsx';
  import BackToOriginal from './Processes/BackToOriginal.jsx';
  import Kaydet from './Processes/Kaydet.jsx';
  import GrafikKaydet from './Processes/GrafikKaydet';
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
  import Canny from './Processes/Canny.jsx';
  import Laplace from './Processes/Laplace.jsx';
  import Gabor from './Processes/Gabor.jsx';
  import HoughDonusumu from './Processes/HoughDonusumu.jsx';
  import KmeansSegmentation from './Processes/KmeansSegmentation.jsx';
  import Erode from './Processes/Erode.jsx';
  import Dilate from './Processes/Dilate.jsx';
  import Frame from './Processes/Frame.jsx';
  import Parlaklik2 from './Processes/Parlaklik2.jsx';


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
    const [parlaklik2On, setParlaklik2On] = useState(false);
    const [parlaklik2Value, setParlaklik2Value] = useState(0);

    const processImage = async (operation, value = null) => {
      const formData = new FormData();
      const fileInput = document.querySelector('input[type="file"]');
    
      try {
        // Determine which image to use
        const imageToUse = 
          ["fourier_transform", "fourier_low_pass_filter", "fourier_high_pass_filter", 
          "fourier_filter_plot", "band_gecirendurduran_plot", "gaussianFilterPlotImage",
          "homomorphic_filter", "sobel_plot", "prewitt_plot", "roberts_plot",
          "compass_edge_detection", "canny", "gabor_filter","gaussian_plot", "gaussian_hpf", "gaussian_lpf","gaussian_filter"].includes(operation)
            ? (processedImage || originalImage)
            : (["brightness", "brightness2", "thresholding", "manual_translate", "functional_translate",
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
        if (operation === "brightness2" && value !== null) {
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
        if (["gaussian_lpf", "gaussian_hpf", "gaussian_plot"].includes(operation) && value !== null) {
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
        // Gaussian Blur Filter 
        if (operation.includes("canny") && value) {
          formData.append("threshold1", value.threshold1.toString());
          formData.append("threshold2", value.threshold2.toString());
        }
        if (operation.startsWith("gabor_filter")) {
          formData.append("ksize", value.ksize.toString());
          formData.append("sigma", value.sigma.toString());
          formData.append("pi", value.pi.toString());
          formData.append("lambd", value.lambd.toString());
          formData.append("gamma", value.gamma.toString());
          formData.append("psi", value.psi.toString());
        }
        if (operation === "hough_line_detection" && value) {
          formData.append("threshold", value.threshold.toString());
          formData.append("angle_resolution", value.angle_resolution.toString());
          formData.append("canny_threshold1", value.canny_threshold1.toString());
          formData.append("canny_threshold2", value.canny_threshold2.toString());
        }
        if (operation === "hough_circle_detection" && value) {
          formData.append("dp", value.dp.toString());
          formData.append("minDist", value.minDist.toString());
          formData.append("param1", value.param1.toString());
          formData.append("param2", value.param2.toString());
          formData.append("minRadius", value.minRadius.toString());
          formData.append("maxRadius", value.maxRadius.toString());
          formData.append("blur_ksize", value.blur_ksize.toString());
          formData.append("blur_sigma", value.blur_sigma.toString());
        }
        if (operation === "kmeans_segmentation" && value) {
          formData.append("k", value.k.toString());
          formData.append("max_iter", value.max_iter.toString());
          formData.append("epsilon", value.epsilon.toString());
        }
        if (operation === "erode" && value) {
          formData.append("kernel_size", value.kernel_size.toString());
          formData.append("iterations", value.iterations.toString());
        }
        if (operation === "dilate" && value) {
          formData.append("kernel_size", value.kernel_size.toString());
          formData.append("iterations", value.iterations.toString());
        }
        if (operation === "frame" && value) {
        formData.append("left", value.left.toString());
        formData.append("right", value.right.toString());
        formData.append("top", value.top.toString());
        formData.append("bottom", value.bottom.toString());
        formData.append("color[0]", value.color[0].toString());
        formData.append("color[1]", value.color[1].toString());
        formData.append("color[2]", value.color[2].toString());
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
              "shear_x", "shearing_x_manuel", "shear_y", "shearing_y_manuel", "laplace_edge_detection"].includes(operation)) {
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
        const handleParlaklik2Change = (event, newValue) => {
        setParlaklik2Value(newValue);
        processImage("brightness2", newValue);
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



  const CloseableImageBox = ({ title, image, onClose, alt }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        {/* Kapatma butonu sol üstte */}
        <Button 
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            minWidth: 'auto',
            padding: 0,
            color: 'white',
            backgroundColor: '#f44336',
            borderRadius: '4px',
            fontSize: '20px',
            lineHeight: 1,
            fontWeight: 'bold',
            zIndex: 1,
            '&:hover': {
              backgroundColor: '#d32f2f',
            }
          }}
        >
          ×
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" color="white">{title}</Typography>
          <img src={image} alt={alt} style={{ marginTop: 10 }} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <GrafikKaydet grafikImage={image} />
          </Box>
        </Box>
      </Box>
    );
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

  const [expandedComponents, setExpandedComponents] = useState({});
  const [containerHeight, setContainerHeight] = useState('auto');
  const buttonsContainerRef = useRef(null);

  // Yükseklik güncelleme işlemi
  useEffect(() => {
    if (buttonsContainerRef.current) {
      // Container'ın yüksekliğini içeriğe göre ayarla
      setContainerHeight(buttonsContainerRef.current.scrollHeight);
    }
  }, [expandedComponents]); // expandedComponents değiştiğinde çalışacak

  // Bileşenin genişletilmiş durumunu değiştir
  const toggleComponentExpansion = (componentName) => {
    setExpandedComponents(prev => ({
      ...prev,
      [componentName]: !prev[componentName]
    }));
  };

  // Scroll fonksiyonu
  const scrollButtons = (direction) => {
    const container = buttonsContainerRef.current;
    const scrollAmount = 300;

    if (container) {
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const isAtEnd = container.scrollLeft + scrollAmount >= maxScrollLeft;

        if (isAtEnd) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }
  };




    return (
      <Box>
        {/* Arkalan rengi ayarlama. Box içinde sx={{backgroundColor}} yapınca kenarlarda beyaz kısımlar kalıyor*/}
        <style>
          {`html, body {margin: 0;padding: 0; width: 100%;height: 100%; background-color:rgb(67, 69, 70);overflow-x: hidden;  }`}
        </style>

        <title>Görüntü İşleme</title>

        <Box sx={{ textAlign: "center", padding: 2 }}>
          <UploadFile onImageChange={onImageChange} />

          {originalImage && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
                <Box>
                  <Typography variant="h6" color="white">Orijinal Resim</Typography>
                  <img src={originalImage} alt="Orijinal" style={{ marginTop: 10 }} />
                </Box>
                <Box>
                  <Typography variant="h6" color="white">İşlenen Resim</Typography>
                  <img src={tempManualContrastImage || processedImage || originalImage} alt="İşlenmiş" style={{ marginTop: 10 }} />
                </Box>
              </Box>


              {/* Diğer grafikler (histogram vb.) */}
              {(histogramImage || histogramEqualizationImage || fourierHistogramImage
                || bandFilterPlotImage || butterworthFilterPlotImage || gaussianFilterPlotImage
                || sobelPlotImage || prewittPlotImage || robertsPlotImage) && (
                <Box sx={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 4 }}>
                  {histogramImage && (
                    <CloseableImageBox
                      title="Histogram Grafiği"
                      image={histogramImage}
                      alt="Histogram"
                      onClose={() => setHistogramImage(null)}
                    />
                  )}
                  {histogramEqualizationImage && (
                    <CloseableImageBox
                      title="Eşitlenmiş Histogram"
                      image={histogramEqualizationImage}
                      alt="Eşitlenmiş Histogram"
                      onClose={() => setHistogramEqualizationImage(null)}
                    />
                  )}
                  {fourierHistogramImage && (
                    <CloseableImageBox
                      title="Fourier Spektrumu"
                      image={fourierHistogramImage}
                      alt="Fourier Spektrumu"
                      onClose={() => setFourierHistogramImage(null)}
                    />
                  )}
                  {bandFilterPlotImage && (
                    <CloseableImageBox
                      title="Band Filtre Grafiği"
                      image={bandFilterPlotImage}
                      alt="Band Filtre Grafiği"
                      onClose={() => setBandFilterPlotImage(null)}
                    />
                  )}
                  {butterworthFilterPlotImage && (
                    <CloseableImageBox
                      title="Butterworth Filtre Grafiği"
                      image={butterworthFilterPlotImage}
                      alt="Butterworth Filtre Grafiği"
                      onClose={() => setButterworthFilterPlotImage(null)}
                    />
                  )}
                  {gaussianFilterPlotImage && (
                    <CloseableImageBox
                      title="Gaussian Filtre Grafiği"
                      image={gaussianFilterPlotImage}
                      alt="Gaussian Filtre Grafiği"
                      onClose={() => setGaussianFilterPlotImage(null)}
                    />
                  )}
                  {sobelPlotImage && (
                    <CloseableImageBox
                      title="Sobel Grafikleri"
                      image={sobelPlotImage}
                      alt="Sobel Grafikleri"
                      onClose={() => setSobelPlotImage(null)}
                    />
                  )}
                  {prewittPlotImage && (
                    <CloseableImageBox
                      title="Prewitt Grafikleri"
                      image={prewittPlotImage}
                      alt="Prewitt Grafikleri"
                      onClose={() => setPrewittPlotImage(null)}
                    />
                  )}
                  {robertsPlotImage && (
                    <CloseableImageBox
                      title="Roberts Grafikleri"
                      image={robertsPlotImage}
                      alt="Roberts Grafikleri"
                      onClose={() => setRobertsPlotImage(null)}
                    />
                  )}
                </Box>
              )}
            </Box>
          )}


          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <BackToOriginal backToOriginalImage={backToOriginalImage} />
            <Box sx={{ marginRight: '160px' }} /> {/* Boşluk ekler */}
            <Kaydet processedImage={processedImage} originalImage={originalImage} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '50px' }}>
        <IconButton onClick={() => scrollButtons('left')} sx={{ color: 'white' }}>
          <KeyboardDoubleArrowLeftIcon fontSize="large" />
        </IconButton>
        
        <Box
          ref={buttonsContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            gap: 1,
            px: 1,
            py: 2,
            height: "350px", // Dinamik yükseklik
            transition: 'height 0.3s ease', // Yumuşak geçiş efekti
            '& > *': {
              flexShrink: 0,
            },
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          }}
        >



            <ConvertToGray processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <RedFilter processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <GreenFilter processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <BlueFilter processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <NegativeFilter processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
              <Frame
                processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
                originalImage={originalImage}
                processedImage={processedImage}
              />
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
            <Parlaklik2
                parlaklik2On={parlaklik2On}
                setParlaklik2On={setParlaklik2On}
                parlaklik2Value={parlaklik2Value}
                handleParlaklik2Change={handleParlaklik2Change}
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
            <Canny
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <Laplace processImage={(operation) => handleProcessButtonClick(operation, processImage)} />
            <Gabor
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <HoughDonusumu
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <KmeansSegmentation
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedIm
              age={processedImage}
            />
            <Erode
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
            <Dilate
              processImage={(operation, value) => handleProcessButtonClick(operation, processImage, value)}
              originalImage={originalImage}
              processedImage={processedImage}
            />
          </Box>
          <IconButton onClick={() => scrollButtons('right')} sx={{ color: 'white' }}>
            <KeyboardDoubleArrowRightIcon fontSize="large" />
          </IconButton>

          </Box>
        </Box>
      </Box>
    );
  }