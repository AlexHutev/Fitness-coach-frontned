import React from 'react';
import WeeklyExercises from '@/components/WeeklyExercises';

interface WeeklyExerciseViewProps {
  clientId: number;
  assignedPrograms?: any[];
  refreshData?: () => Promise<void>;
}

export default function WeeklyExerciseView({ 
  clientId, 
  assignedPrograms = [],
  refreshData 
}: WeeklyExerciseViewProps) {
  // Use the real WeeklyExercises component now that backend is working
  return (
    <WeeklyExercises 
      clientId={clientId} 
      isTrainerView={true} 
    />
  );
}
