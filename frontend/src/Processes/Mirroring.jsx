import React, { useState, useRef, useEffect } from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';

const mirrorOptions = [
  'Ekranın Ortasına Göre Aynalama', 
  'Tıklanan Noktaya Göre Aynalama', 
  'Yatay Eksende Aynalama', 
  'Açısal Aynalama'
];

export default function Mirroring({ processImage, originalImage, processedImage }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [angle, setAngle] = useState(45);
  const [showAngleInput, setShowAngleInput] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMenuItemClick = async (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
    
    const selectedOption = mirrorOptions[index];
    setShowAngleInput(selectedOption === "Açısal Aynalama");
    
    // Immediately apply mirroring for options that don't need additional input
    if (selectedOption === "Ekranın Ortasına Göre Aynalama" || 
        selectedOption === "Yatay Eksende Aynalama") {
      await handleMirrorOperation(index);
    }
  };

  const handleMirrorOperation = async (index = selectedIndex) => {
    let operation;
    let value = null;
    
    const img = document.querySelector('img[alt="İşlenmiş"]');
    if (!img) return;
    
    const imgWidth = img.naturalWidth || 320;
    
    switch (index) {
      case 0: // Ekranın Ortasına Göre Aynalama
        operation = "mirror_image_by_center";
        value = { x0: Math.floor(imgWidth / 2) };
        break;
      case 2: // Yatay Eksende Aynalama
        operation = "mirror_image_horizontal";
        break;
      case 3: // Açısal Aynalama
        operation = "mirror_image_angle";
        value = { angle: angle };
        break;
      default:
        return;
    }
    
    try {
      await processImage(operation, value);
    } catch (err) {
      console.error("Error in mirror operation:", err);
    }
  };

  useEffect(() => {
    // Diğer işlemler yapıldığında input alanını kapat
    const handleGlobalClick = () => {
      if (showAngleInput) {
        setShowAngleInput(false);
      }
    };

    if (showAngleInput) {
      // 200ms sonra event listener'ı ekle (böylece kendi tıklamamızı yakalamayız)
      const timer = setTimeout(() => {
        window.addEventListener('click', handleGlobalClick);
      }, 200);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleGlobalClick);
      };
    }
  }, [showAngleInput]);

  useEffect(() => {
    if (selectedIndex === 1) { // Sadece "Tıklanan Noktaya Göre Aynalama" seçiliyse
      const imgElement = document.querySelector('img[alt="İşlenmiş"]');
      
      if (imgElement) {
        const handleClick = async (e) => {
          // Tıklanan noktanın koordinatlarını hesapla
          const rect = e.target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Resmin gerçek boyutlarına göre normalize et
          const imgWidth = imgElement.naturalWidth;
          const imgHeight = imgElement.naturalHeight;
          const relativeX = (x / rect.width) * imgWidth;
          const relativeY = (y / rect.height) * imgHeight;
          
          console.log(`Tıklanan nokta: X=${relativeX}, Y=${relativeY}`);
          
          try {
            // Aynalama işlemini başlat
            await processImage("mirror_image_by_center", { 
              x0: Math.round(relativeX),
              y0: Math.round(relativeY)
            });
          } catch (err) {
            console.error("Aynalama hatası:", err);
            alert("Aynalama işlemi sırasında hata oluştu!");
          }
        };
        
        // Tıklama olayını ekle
        imgElement.style.cursor = "crosshair";
        imgElement.addEventListener('click', handleClick);
        
        // Temizleme fonksiyonu
        return () => {
          imgElement.style.cursor = "";
          imgElement.removeEventListener('click', handleClick);
        };
      }
    }
  }, [selectedIndex, processImage]);

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button
          sx={{
            backgroundColor: "purple",
            textTransform: "none",
            fontSize: 18,
            "&:hover": { backgroundColor: "purple" }
          }}
          onClick={(e) => {
            e.stopPropagation(); // Global click eventini engelle
            if (mirrorOptions[selectedIndex] === "Açısal Aynalama") {
              handleMirrorOperation();
            }
            handleToggle();
          }}
        >
          {mirrorOptions[selectedIndex]}
        </Button>
        <Button
          sx={{
            backgroundColor: "purple",
            "&:hover": { backgroundColor: "purple" }
          }}
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={(e) => {
            e.stopPropagation(); // Global click eventini engelle
            handleToggle();
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1300,
          position: "absolute",
          top: "100%",
          left: 0
        }}
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
                <MenuList 
                  id="split-button-menu" 
                  autoFocusItem
                  onClick={(e) => e.stopPropagation()} // Menü içindeki tıklamaları yakala
                >
                  {mirrorOptions.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleMenuItemClick(event, index);
                      }}
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

      <Box 
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: 3,
          padding: showAngleInput ? '20px' : '0'
        }}
        onClick={(e) => e.stopPropagation()} // Input alanı içindeki tıklamaları yakala
      >
        <Collapse in={showAngleInput}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '20ch' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 2,
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="Açı (derece)"
              type="number"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 360 }}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleMirrorOperation();
              }}
              sx={{ 
                mt: 2, 
                backgroundColor: "purple", 
                '&:hover': { backgroundColor: "#6a1b9a" },
                textTransform: "none"
              }}
            >
              Aynalama Uygula
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}