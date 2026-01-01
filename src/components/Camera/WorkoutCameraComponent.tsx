'use client';

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Videocam,
  Stop,
  FlipCameraAndroid,
  Close,
  FitnessCenter,
  Timer,
  LocalFireDepartment,
  Warning,
  CheckCircle,
  Info,
  Repeat
} from '@mui/icons-material';
import { apiService } from '@/services/apiService';
import { 
  WorkoutAnalysis, 
  WorkoutAnalysisRequest, 
  ExerciseType, 
  FormSuggestion,
  Severity 
} from '@/types/camera';
import toast from 'react-hot-toast';

interface WorkoutCameraComponentProps {
  onAnalysisComplete?: (analysis: WorkoutAnalysis) => void;
  onClose?: () => void;
}

const WorkoutCameraComponent: React.FC<WorkoutCameraComponentProps> = ({
  onAnalysisComplete,
  onClose
}) => {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WorkoutAnalysis | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [showResults, setShowResults] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(ExerciseType.SQUAT);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  };

  const exerciseOptions = [
    { value: ExerciseType.SQUAT, label: 'Squat' },
    { value: ExerciseType.PUSH_UP, label: 'Push Up' },
    { value: ExerciseType.PULL_UP, label: 'Pull Up' },
    { value: ExerciseType.DEADLIFT, label: 'Deadlift' },
    { value: ExerciseType.BENCH_PRESS, label: 'Bench Press' },
    { value: ExerciseType.PLANK, label: 'Plank' },
    { value: ExerciseType.BURPEE, label: 'Burpee' },
    { value: ExerciseType.JUMPING_JACKS, label: 'Jumping Jacks' },
    { value: ExerciseType.LUNGES, label: 'Lunges' },
    { value: ExerciseType.MOUNTAIN_CLIMBERS, label: 'Mountain Climbers' }
  ];

  // Recording timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(() => {
    if (!webcamRef.current?.stream) return;

    const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm'
    });

    mediaRecorderRef.current = mediaRecorder;
    setRecordedChunks([]);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      analyzeWorkout();
    };

    mediaRecorder.start();
    setIsRecording(true);
    toast.success('Recording started!');
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped. Analyzing...');
    }
  }, [isRecording]);

  const analyzeWorkout = useCallback(async () => {
    if (recordedChunks.length === 0) return;

    setIsAnalyzing(true);

    try {
      // Create blob from recorded chunks
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const request: WorkoutAnalysisRequest = {
          videoBase64: base64Data,
          exerciseType: selectedExercise,
          timestamp: new Date().toISOString()
        };

        try {
          const response = await apiService.analyzeWorkoutVideo(request);
          
          if (response.data.success && response.data.analysis) {
            setAnalysis(response.data.analysis);
            setShowResults(true);
            onAnalysisComplete?.(response.data.analysis);
            toast.success('Workout analysis completed!');
          } else {
            toast.error(response.data.error || 'Analysis failed');
          }
        } catch (error) {
          console.error('Workout analysis error:', error);
          toast.error('Failed to analyze workout');
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Recording processing error:', error);
      toast.error('Failed to process recording');
      setIsAnalyzing(false);
    }
  }, [recordedChunks, selectedExercise, onAnalysisComplete]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const retakeVideo = () => {
    setRecordedChunks([]);
    setAnalysis(null);
    setShowResults(false);
    setRecordingDuration(0);
  };

  const closeResults = () => {
    setShowResults(false);
    retakeVideo();
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL:
        return <Warning color="error" />;
      case Severity.WARNING:
        return <Warning color="warning" />;
      case Severity.INFO:
        return <Info color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL:
        return 'error';
      case Severity.WARNING:
        return 'warning';
      case Severity.INFO:
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh', bgcolor: 'black' }}>
      {/* Camera View */}
      {!showResults && (
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
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
              <Box textAlign="center">
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Workout Analyzer
                </Typography>
                {isRecording && (
                  <Typography variant="h4" sx={{ color: 'red', fontWeight: 'bold' }}>
                    {formatTime(recordingDuration)}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={toggleCamera} sx={{ color: 'white' }}>
                <FlipCameraAndroid />
              </IconButton>
            </Box>

            {/* Exercise Selection */}
            <Box sx={{ alignSelf: 'center', mb: 2 }}>
              <FormControl sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}>
                <InputLabel>Exercise Type</InputLabel>
                <Select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value as ExerciseType)}
                  disabled={isRecording}
                >
                  {exerciseOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Center Guide */}
            <Box
              sx={{
                alignSelf: 'center',
                width: 300,
                height: 400,
                border: isRecording ? '3px solid red' : '2px solid white',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.3)',
                animation: isRecording ? 'pulse 1s infinite' : 'none'
              }}
            >
              <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
                {isRecording ? 'Recording in progress...' : 'Position yourself within this frame'}
              </Typography>
            </Box>

            {/* Bottom Controls */}
            <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
              {!isRecording ? (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <IconButton
                    onClick={startRecording}
                    disabled={isAnalyzing}
                    sx={{
                      bgcolor: 'red',
                      color: 'white',
                      width: 80,
                      height: 80,
                      '&:hover': {
                        bgcolor: 'darkred'
                      }
                    }}
                  >
                    {isAnalyzing ? (
                      <CircularProgress size={40} sx={{ color: 'white' }} />
                    ) : (
                      <Videocam fontSize="large" />
                    )}
                  </IconButton>
                </motion.div>
              ) : (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <IconButton
                    onClick={stopRecording}
                    sx={{
                      bgcolor: 'white',
                      color: 'red',
                      width: 80,
                      height: 80,
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    <Stop fontSize="large" />
                  </IconButton>
                </motion.div>
              )}
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
            <FitnessCenter color="primary" />
            <Typography variant="h6">Workout Analysis Results</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {analysis && (
            <Box>
              {/* Overall Performance Summary */}
              <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="h4">{analysis.formScore}</Typography>
                      <Typography variant="caption">Form Score</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h4">{analysis.repCount}</Typography>
                      <Typography variant="caption">Reps</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h4">{Math.round(analysis.duration)}</Typography>
                      <Typography variant="caption">Seconds</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="h4">{analysis.caloriesBurned}</Typography>
                      <Typography variant="caption">Calories</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Form Score Indicator */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Form Quality: {analysis.formScore}/100
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysis.formScore}
                  color={analysis.formScore > 80 ? 'success' : analysis.formScore > 60 ? 'warning' : 'error'}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {analysis.formScore > 80 ? 'Excellent form!' : 
                   analysis.formScore > 60 ? 'Good form with room for improvement' : 
                   'Form needs significant improvement'}
                </Typography>
              </Box>

              {/* Form Suggestions */}
              {analysis.suggestions.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Form Suggestions ({analysis.suggestions.length})
                  </Typography>
                  <List>
                    {analysis.suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ListItem>
                          <ListItemIcon>
                            {getSeverityIcon(suggestion.severity)}
                          </ListItemIcon>
                          <ListItemText
                            primary={suggestion.message}
                            secondary={
                              <Box>
                                <Chip 
                                  label={suggestion.type.replace('_', ' ')}
                                  size="small"
                                  color={getSeverityColor(suggestion.severity) as any}
                                  sx={{ mr: 1, mt: 0.5 }}
                                />
                                {suggestion.bodyPart && (
                                  <Chip 
                                    label={suggestion.bodyPart}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 1, mt: 0.5 }}
                                  />
                                )}
                                {suggestion.timestamp && (
                                  <Typography variant="caption" color="text.secondary">
                                    At {Math.round(suggestion.timestamp)}s
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      </motion.div>
                    ))}
                  </List>
                </Box>
              )}

              {/* Exercise Details */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Exercise Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Exercise Type
                      </Typography>
                      <Typography variant="body1">
                        {analysis.exerciseType.replace('_', ' ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Analysis Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(analysis.analysisDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Processing Status */}
              {!analysis.isProcessed && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Analysis is still being processed. Some details may be updated shortly.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={retakeVideo} variant="outlined" startIcon={<Repeat />}>
            Record Again
          </Button>
          <Button onClick={closeResults} variant="contained">
            Save Analysis
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default WorkoutCameraComponent;