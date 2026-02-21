import React from 'react';
import WeeklyExercises from '@/components/WeeklyExercises';

interface WeeklyExerciseViewProps {
  clientId: number;
  assignedPrograms?: any[];
  refreshData?: () => Promise<void>;
  isTrainerView?: boolean;
}

export default function WeeklyExerciseView({ 
  clientId, 
  assignedPrograms = [],
  refreshData,
  isTrainerView = false
}: WeeklyExerciseViewProps) {
  // Use the real WeeklyExercises component now that backend is working
  // isTrainerView=false enables action buttons for clients
  return (
    <WeeklyExercises 
      clientId={clientId} 
      isTrainerView={isTrainerView} 
    />
  );
}
