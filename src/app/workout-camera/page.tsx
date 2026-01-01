'use client';

import React from 'react';
import WorkoutCameraComponent from '@/components/Camera/WorkoutCameraComponent';
import { useRouter } from 'next/navigation';
import { WorkoutAnalysis } from '@/types/camera';

const WorkoutCameraPage: React.FC = () => {
  const router = useRouter();

  const handleAnalysisComplete = (analysis: WorkoutAnalysis) => {
    // Could redirect to exercise page or show success message
    console.log('Workout analysis completed:', analysis);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <WorkoutCameraComponent
      onAnalysisComplete={handleAnalysisComplete}
      onClose={handleClose}
    />
  );
};

export default WorkoutCameraPage;