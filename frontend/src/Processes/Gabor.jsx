import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const Gabor = ({ processImage, processedImage, originalImage }) => {
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState({
    ksize: "21,21",
    sigma: "5",
    pi: "4",
    lambd: "10",
    gamma: "0.5",
    psi: "0"
  });

  // Close inputs when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInputs && !event.target.closest('.filter-input-container')) {
        setShowInputs(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInputs]);

// Input değişikliklerini işle
// Gabor.jsx'deki handleParamChange fonksiyonunu güncelleyin
const handleParamChange = (paramName, value) => {
  // Kernel boyutu için özel işleme
  if (paramName === "ksize") {
    // "x,y" formatında mı kontrol et
    if (value.includes(',')) {
      const [x, y] = value.split(',').map(Number);
      // Eğer geçerli iki sayı varsa
      if (!isNaN(x) && !isNaN(y) && x > 0 && y > 0) {
        setParams(prev => ({
          ...prev,
          [paramName]: value // "x,y" formatında sakla
        }));
        return;
      }
    }
    // Geçerli bir sayı ise (eski davranış)
    if (!isNaN(value) && value > 0) {
      setParams(prev => ({
        ...prev,
        [paramName]: `${value},${value}` // "x,x" formatına çevir
      }));
    }
    return;
  }
  
  // Diğer parametreler için normal işleme
  setParams(prev => ({
    ...prev,
    [paramName]: value
  }));
};

  const handleApply = async () => {
  if (!processedImage && !originalImage) {
    console.error("No image available");
    return;
  }

  setIsProcessing(true);
  
  try {
    // Kernel boyutunu "x,y" formatından ayır
    const [ksizeX, ksizeY] = params.ksize.split(',').map(Number);

    const processedParams = {
      ksize: ksizeX, // Sadece x boyutunu gönder (backend'de her iki boyut için aynı değer kullanılacak)
      sigma: parseFloat(params.sigma),
      pi: parseFloat(params.pi),
      lambd: parseFloat(params.lambd),
      gamma: parseFloat(params.gamma),
      psi: parseFloat(params.psi)
    };

    // Yeni bir işlem ID'si ekleyerek cache sorununu önle
    const cacheBuster = Date.now();
    const operation = `gabor_filter_${cacheBuster}`;
    
    const success = await processImage(operation, processedParams);
    
    if (success) {
      setShowInputs(false);
    }
  } catch (error) {
    console.error("Gabor Filter error:", error);
  } finally {
    setIsProcessing(false);
  }
};
  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Button
        variant="contained"
        disableElevation
        sx={{
          backgroundColor: "#1f2021",  
          color: "#cccccc",            
          width: "140px",
          height: "30px",
          textTransform: "none",
          fontSize: 17,   
          fontWeight: "bold",   
          '&:hover': {
            backgroundColor: "#2e2f30", 
          },
          mx: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowInputs(!showInputs);
        }}
      >
        Gabor Filter
      </Button>

      <Box 
        className="filter-input-container"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: 3,
          padding: showInputs ? '20px' : '0',
          width:"300px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Collapse in={showInputs}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 1,
              p: 1,
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              width:"290px",
              padding:"5px"
            }}
            noValidate
            autoComplete="off"
          >
            {/* İlk satır - 3 input yan yana */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1}}>
              <TextField
                id="ksize"
                label="Kernel Size (x,y)"
                variant="outlined"
                size="small"
                value={params.ksize}
                onChange={(e) => handleParamChange("ksize", e.target.value)}
                type="text"
                inputProps={{ pattern: "\\d+,\\d+" }} // İki sayı ve virgül formatı
                sx={{ width: '90px' }}
                helperText="Format: x,y"
              />
              <TextField
                id="sigma"
                label="Sigma"
                variant="outlined"
                size="small"
                value={params.sigma}
                onChange={(e) => handleParamChange("sigma", e.target.value)}
                type="number"
                inputProps={{ min: 0.1, step: 0.1 }}
                sx={{ width: '90px' }}
              />
              <TextField
                id="pi"
                label="Pi"
                variant="outlined"
                size="small"
                value={params.pi}
                onChange={(e) => handleParamChange("pi", e.target.value)}
                type="number"
                inputProps={{ min: 1, step: 1 }}
                sx={{ width: '90px' }}
              />
            </Box>

            {/* İkinci satır - 3 input yan yana */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <TextField
                id="lambd"
                label="Lambda"
                variant="outlined"
                size="small"
                value={params.lambd}
                onChange={(e) => handleParamChange("lambd", e.target.value)}
                type="number"
                inputProps={{ min: 1, step: 1 }}
                sx={{ width: '90px' }}
              />
              <TextField
                id="gamma"
                label="Gamma"
                variant="outlined"
                size="small"
                value={params.gamma}
                onChange={(e) => handleParamChange("gamma", e.target.value)}
                type="number"
                inputProps={{ min: 0.1, step: 0.1 }}
                sx={{ width: '90px' }}
              />
              <TextField
                id="psi"
                label="Psi"
                variant="outlined"
                size="small"
                value={params.psi}
                onChange={(e) => handleParamChange("psi", e.target.value)}
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                sx={{ width: '90px' }}
              />
            </Box>

            <Button
              variant="contained"
              disableElevation
              size="small"
              sx={{
                backgroundColor: "#1f2021",
                color: "#cccccc",
                width: "80px",
                height: "30px",
                textTransform: "none",
                fontSize: 14,
                fontWeight: "bold",
                '&:hover': {
                  backgroundColor: "#2e2f30",
                },
                mx: 0,
                mt: 1
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              disabled={isProcessing}
            >
              Apply
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Gabor;