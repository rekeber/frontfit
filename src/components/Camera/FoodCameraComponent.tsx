'use client';

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  CameraAlt,
  FlipCameraAndroid,
  FlashOn,
  FlashOff,
  Close,
  Restaurant,
  LocalFireDepartment,
  FitnessCenter
} from '@mui/icons-material';
import { apiService } from '@/services/apiService';
import { FoodAnalysis, FoodAnalysisRequest, DetectedFood } from '@/types/camera';
import toast from 'react-hot-toast';

interface FoodCameraComponentProps {
  onAnalysisComplete?: (analysis: FoodAnalysis) => void;
  onClose?: () => void;
}

const FoodCameraComponent: React.FC<FoodCameraComponentProps> = ({
  onAnalysisComplete,
  onClose
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashMode, setFlashMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  };

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error('Failed to capture image');
      return;
    }

    setCapturedImage(imageSrc);
    setIsAnalyzing(true);

    try {
      // Convert base64 to just the data part
      const base64Data = imageSrc.split(',')[1];
      
      const request: FoodAnalysisRequest = {
        imageBase64: base64Data,
        mealType: 'general',
        timestamp: new Date().toISOString()
      };

      const response = await apiService.analyzeFoodImage(request);
      
      if (response.data.success && response.data.analysis) {
        setAnalysis(response.data.analysis);
        setShowResults(true);
        onAnalysisComplete?.(response.data.analysis);
        toast.success('Food analysis completed!');
      } else {
        toast.error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Food analysis error:', error);
      toast.error('Failed to analyze food');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = () => {
    setFlashMode(prev => !prev);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setShowResults(false);
  };

  const closeResults = () => {
    setShowResults(false);
    retakePhoto();
  };

  const renderFoodItem = (food: DetectedFood, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" color="primary">
              {food.name}
            </Typography>
            <Chip 
              label={`${Math.round(food.confidence * 100)}% confident`}
              color={food.confidence > 0.8 ? 'success' : food.confidence > 0.6 ? 'warning' : 'error'}
              size="small"
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalFireDepartment color="error" fontSize="small" />
                <Typography variant="body2">
                  {food.nutritionPer100g.calories} cal/100g
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <FitnessCenter color="primary" fontSize="small" />
                <Typography variant="body2">
                  {food.nutritionPer100g.protein}g protein
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Carbs: {food.nutritionPer100g.carbs}g
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Fat: {food.nutritionPer100g.fat}g
              </Typography>
            </Grid>
          </Grid>
          
          <Box mt={1}>
            <Chip 
              label={food.category}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Est. weight: {food.estimatedWeight}g
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ position: 'relative', height: '100vh', bgcolor: 'black' }}>
      {/* Camera View */}
      {!showResults && (
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          {/* Camera Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2
            }}
          >
            {/* Top Controls */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                Food Scanner
              </Typography>
              <Box display="flex" gap={1}>
                <IconButton onClick={toggleFlash} sx={{ color: 'white' }}>
                  {flashMode ? <FlashOn /> : <FlashOff />}
                </IconButton>
                <IconButton onClick={toggleCamera} sx={{ color: 'white' }}>
                  <FlipCameraAndroid />
                </IconButton>
              </Box>
            </Box>

            {/* Center Guide */}
            <Box
              sx={{
                alignSelf: 'center',
                width: 250,
                height: 250,
                border: '2px solid white',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.3)'
              }}
            >
              <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
                Position food within this frame
              </Typography>
            </Box>

            {/* Bottom Controls */}
            <Box display="flex" justifyContent="center" alignItems="center">
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                <IconButton
                  onClick={capturePhoto}
                  disabled={isAnalyzing}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    width: 80,
                    height: 80,
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  {isAnalyzing ? (
                    <CircularProgress size={40} />
                  ) : (
                    <CameraAlt fontSize="large" />
                  )}
                </IconButton>
              </motion.div>
            </Box>
          </Box>
        </Box>
      )}

      {/* Analysis Results Dialog */}
      <Dialog
        open={showResults}
        onClose={closeResults}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Restaurant color="primary" />
            <Typography variant="h6">Food Analysis Results</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {analysis && (
            <Box>
              {/* Captured Image */}
              {capturedImage && (
                <Box mb={3} textAlign="center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedImage}
                    alt="Captured food"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 8
                    }}
                  />
                </Box>
              )}

              {/* Overall Nutrition Summary */}
              <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Nutrition
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="h4">{analysis.totalCalories}</Typography>
                      <Typography variant="caption">Calories</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h4">{analysis.totalCarbs}g</Typography>
                      <Typography variant="caption">Carbs</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h4">{analysis.totalProtein}g</Typography>
                      <Typography variant="caption">Protein</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h4">{analysis.totalFat}g</Typography>
                      <Typography variant="caption">Fat</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Detected Foods */}
              <Typography variant="h6" gutterBottom>
                Detected Foods ({analysis.detectedFoods.length})
              </Typography>
              
              {analysis.detectedFoods.map((food, index) => renderFoodItem(food, index))}

              {/* Confidence Indicator */}
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>
                  Analysis Confidence: {Math.round(analysis.confidence * 100)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysis.confidence * 100}
                  color={analysis.confidence > 0.8 ? 'success' : analysis.confidence > 0.6 ? 'warning' : 'error'}
                />
              </Box>

              {analysis.confidence < 0.7 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Low confidence analysis. Please verify the results and consider retaking the photo.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={retakePhoto} variant="outlined">
            Retake Photo
          </Button>
          <Button onClick={closeResults} variant="contained">
            Save Results
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FoodCameraComponent;