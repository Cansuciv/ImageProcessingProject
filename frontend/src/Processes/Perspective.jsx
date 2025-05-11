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
import Typography from '@mui/material/Typography';

const perspectiveOptions = [
  "Perspektif Düzeltme",
  "İnteraktif Perspektif Düzeltme"
];

const Perspective = ({ processImage, processedImage, originalImage }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInputs, setShowInputs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clickedPoints, setClickedPoints] = useState([]);
  const inputsRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  // Default values for perspective correction
  const [pts1, setPts1] = useState("[[100, 200], [500, 150], [120, 600], [520, 650]]");
  const [pts2, setPts2] = useState("[[0, 0], [400, 0], [0, 500], [400, 500]]");
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(500);
  
  // For interactive mode
  const [interactiveWidth, setInteractiveWidth] = useState(500);
  const [interactiveHeight, setInteractiveHeight] = useState(500);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handlePerspectiveClick = () => {
    if (selectedIndex === null) {
      setSelectedIndex(0);
    }
    setShowInputs(prev => !prev);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
    setShowInputs(true);
    setClickedPoints([]);
  };

  const handleApply = async () => {
    if (!processedImage && !originalImage) {
      console.error("No image available");
      return;
    }
  
    setIsProcessing(true);
    
    try {
      if (selectedIndex === 0) {
        // Standard perspective correction
        try {
          const parsedPts1 = JSON.parse(pts1);
          const parsedPts2 = JSON.parse(pts2);
          
          const value = JSON.stringify({
            pts1: parsedPts1,
            pts2: parsedPts2,
            width: width,
            height: height
          });
          
          await processImage("perspektif_duzeltme", value);
        } catch (error) {
          console.error("JSON parse error:", error);
          alert("Lütfen geçerli bir nokta formatı girin. Örnek: [[100,200],[500,150],[120,600],[520,650]]");
        }
      } else {
        // Interactive perspective correction
        if (clickedPoints.length === 4) {
          const value = JSON.stringify({
            points: clickedPoints,
            width: interactiveWidth,
            height: interactiveHeight
          });
          
          await processImage("interactive_perspective_correction", value);
          setClickedPoints([]);
        } else {
          alert("Lütfen resim üzerinde 4 nokta seçin.");
        }
      }
    } catch (error) {
      console.error("Perspective operation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resim boyutlarını takip etmek için
  useEffect(() => {
    const imgElement = document.querySelector('img[alt="İşlenmiş"]');
    if (imgElement) {
      const updateSize = () => {
        setImageSize({
          width: imgElement.offsetWidth,
          height: imgElement.offsetHeight
        });
      };
      
      updateSize();
      
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(imgElement);
      
      return () => resizeObserver.disconnect();
    }
  }, [processedImage]);

  useEffect(() => {
    if (selectedIndex === 1 && showInputs) {
      const imgElement = document.querySelector('img[alt="İşlenmiş"]');
      
      if (imgElement) {
        const handleClick = (e) => {
          // Input alanına tıklanırsa işlem yapma
          if (inputsRef.current && inputsRef.current.contains(e.target)) {
            return;
          }
          
          const rect = imgElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Resmin gerçek boyutlarına oranla pozisyonu hesapla
          const imgWidth = imgElement.naturalWidth;
          const imgHeight = imgElement.naturalHeight;
          const displayWidth = rect.width;
          const displayHeight = rect.height;
          
          const relativeX = Math.round((x / displayWidth) * imgWidth);
          const relativeY = Math.round((y / displayHeight) * imgHeight);
          
          console.log(`Tıklanan nokta: X=${relativeX}, Y=${relativeY}`);
          
          setClickedPoints(prev => {
            if (prev.length >= 4) {
              return prev.slice(0, 4); // En fazla 4 nokta sakla
            }
            return [...prev, [relativeX, relativeY]];
          });
        };
        
        imgElement.style.cursor = "crosshair";
        imgElement.addEventListener('click', handleClick);
        
        return () => {
          imgElement.style.cursor = "";
          imgElement.removeEventListener('click', handleClick);
        };
      }
    }
  }, [selectedIndex, showInputs, clickedPoints]);

  // Seçilen noktaları resim üzerinde göstermek için overlay
  const renderPointsOverlay = () => {
    if (selectedIndex !== 1 || !showInputs || clickedPoints.length === 0) {
      return null;
    }

    const imgElement = document.querySelector('img[alt="İşlenmiş"]');
    if (!imgElement) return null;

    const rect = imgElement.getBoundingClientRect();
    const imgWidth = imgElement.naturalWidth;
    const imgHeight = imgElement.naturalHeight;
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    return (
      <div style={{
        position: 'absolute',
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: displayWidth,
        height: displayHeight,
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        {clickedPoints.map((point, index) => {
          const x = (point[0] / imgWidth) * displayWidth;
          const y = (point[1] / imgHeight) * displayHeight;
          
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: x - 5,
                top: y - 5,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'red',
                border: '2px solid white'
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <ButtonGroup
          variant="contained"
          ref={anchorRef}
          aria-label="Button group with a nested menu"
        >
          <Button
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: "#1f2021",  
              color: "#cccccc",            
              width: "290px",
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
              handlePerspectiveClick();
            }}
          >
            {perspectiveOptions[selectedIndex]}
          </Button>

          <Button
            sx={{
              backgroundColor: "#1f2021",
              "&:hover": { backgroundColor: "#2e2f30" }
            }}
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select perspective operation"
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation();
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
              <Paper sx={{ backgroundColor: "#1f2021", color: "#cccccc" }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList 
                    id="split-button-menu" 
                    autoFocusItem
                    onClick={(e) => e.stopPropagation()}
                  >
                    {perspectiveOptions.map((option, index) => (
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
          ref={inputsRef}
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: "white",
            boxShadow: 3,
            padding: showInputs ? '8px' : '0', // padding'i küçülttük
            width: '280px', // genişliği biraz küçülttük
            display: showInputs ? 'block' : 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {showInputs && (
            <Box
              component="form"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 1, // padding'i küçülttük
                border: '1px solid #ddd',
                borderRadius: 1
              }}
              noValidate
              autoComplete="off"
            >
              {selectedIndex === 0 ? (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '0.9rem' }}>Perspektif Noktaları</Typography>
                  <TextField
                    label="pts1"
                    value={pts1}
                    onChange={(e) => setPts1(e.target.value)}
                    multiline
                    rows={3} // satır sayısını azalttık
                    fullWidth
                    size="small" // daha küçük boyut
                    sx={{ mb: 1, fontSize: '0.8rem' }} // margin ve font boyutu
                  />
                  
                  <TextField
                    label="pts2"
                    value={pts2}
                    onChange={(e) => setPts2(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    sx={{ mb: 1, fontSize: '0.8rem' }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1 }}>
                    <TextField
                      label="Width"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                      fullWidth
                      size="small"
                      type="number"
                    />
                    <TextField
                      label="Height"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                      fullWidth
                      size="small"
                      type="number"
                    />
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '0.9rem' }}>Çıktı Boyutları</Typography>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1 }}>
                    <TextField
                      label="Width"
                      value={interactiveWidth}
                      onChange={(e) => setInteractiveWidth(parseInt(e.target.value) || 0)}
                      fullWidth
                      size="small"
                      type="number"
                    />
                    <TextField
                      label="Height"
                      value={interactiveHeight}
                      onChange={(e) => setInteractiveHeight(parseInt(e.target.value) || 0)}
                      fullWidth
                      size="small"
                      type="number"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.8rem' }}>
                    {clickedPoints.length < 4 ? 
                      `Lütfen resim üzerinde ${4 - clickedPoints.length} nokta daha seçin.` : 
                      "4 nokta seçildi. Uygula butonuna basabilirsiniz."}
                  </Typography>
                </>
              )}
              
              <Button
                variant="contained"
                disableElevation
                sx={{
                  backgroundColor: "#1f2021",  
                  color: "#cccccc",            
                  width: "70px", // genişliği küçülttük
                  height: "26px", // yüksekliği küçülttük
                  textTransform: "none",
                  fontSize: '0.8rem', // font boyutunu küçülttük  
                  fontWeight: "bold",   
                  '&:hover': {
                    backgroundColor: "#2e2f30", 
                  },
                  mt: 1, // üst margin ekledik
                  mx: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply();
                }}
                disabled={isProcessing || (selectedIndex === 1 && clickedPoints.length !== 4)}
              >
                Apply
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      {renderPointsOverlay()}
    </>
  );
};

export default Perspective;