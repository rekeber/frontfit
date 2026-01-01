'use client';

import React from 'react';
import FoodCameraComponent from '@/components/Camera/FoodCameraComponent';
import { useRouter } from 'next/navigation';
import { FoodAnalysis } from '@/types/camera';

const FoodCameraPage: React.FC = () => {
  const router = useRouter();

  const handleAnalysisComplete = (analysis: FoodAnalysis) => {
    // Could redirect to nutrition page or show success message
    console.log('Food analysis completed:', analysis);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <FoodCameraComponent
      onAnalysisComplete={handleAnalysisComplete}
      onClose={handleClose}
    />
  );
};

export default FoodCameraPage;