import React from 'react';
import { Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles'; // Import styled here

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



const UploadFile = ({ onImageChange }) => {
    return (
        <Box sx={{ textAlign: "center", padding: 2 }}>
            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} sx={{ marginBottom: 2, marginTop: 0, display: 'flex', mx: 'auto', width: 200, height: 50 }}>
                Upload files
                <VisuallyHiddenInput type="file" onChange={onImageChange} />
            </Button>
        </Box>
    );
};

export default UploadFile;
