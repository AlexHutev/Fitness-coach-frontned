className="text-lg font-semibold text-gray-900">
                Week of {schedule.week_start}
              </h3>
              <p className="text-sm text-gray-500">
                {schedule.week_start} to {schedule.week_end}
              </p>
            </div>
            <button
              onClick={handleNextWeek}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{schedule.completion_percentage}%</div>
            <div className="text-sm text-gray-500">
              {schedule.completed_exercises} of {schedule.total_exercises} completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${schedule.completion_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Daily Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(schedule.days).map(([dayKey, exercises]) => {
          const dayNumber = parseInt(dayKey.replace('day_', ''));
          const dayName = getDayName(dayNumber);
          const dayProgress = calculateDayProgress(exercises);

          return (
            <div key={dayKey} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{dayName}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{dayProgress}%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${dayProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isTrainerView={isTrainerView}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Exercise Card Component
interface ExerciseCardProps {
  exercise: WeeklyExercise;
  isTrainerView: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isTrainerView }) => {
  const statusColor = getStatusColor(exercise.status);
  const statusIcon = getStatusIcon(exercise.status);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h5 className="font-medium text-gray-900">{exercise.exercise_name}</h5>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {statusIcon} {exercise.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {exercise.sets} sets × {exercise.reps} 
            {exercise.weight && ` @ ${exercise.weight}`}
          </p>
          
          {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {exercise.muscle_groups.slice(0, 3).map((group, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700"
                >
                  {group}
                </span>
              ))}
              {exercise.muscle_groups.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
                  +{exercise.muscle_groups.length - 3}
                </span>
              )}
            </div>
          )}

          {exercise.exercise_notes && (
            <p className="text-xs text-gray-500 italic mb-2">{exercise.exercise_notes}</p>
          )}
        </div>
      </div>

      {/* Exercise Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div className="flex items-center text-gray-600">
          <Dumbbell className="w-3 h-3 mr-1" />
          {exercise.sets} sets × {exercise.reps}
        </div>
        {exercise.weight && (
          <div className="flex items-center text-gray-600">
            <Weight className="w-3 h-3 mr-1" />
            {exercise.weight}
          </div>
        )}
        {exercise.rest_seconds && (
          <div className="flex items-center text-gray-600">
            <Timer className="w-3 h-3 mr-1" />
            {exercise.rest_seconds}s rest
          </div>
        )}
        {exercise.due_date && (
          <div className="flex items-center text-gray-600">
            <Calendar className="w-3 h-3 mr-1" />
            {exercise.due_date}
          </div>
        )}
      </div>

      {/* Feedback Display */}
      {exercise.client_feedback && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">{exercise.client_feedback}</p>
          </div>
        </div>
      )}

      {/* Trainer Feedback (if trainer view) */}
      {isTrainerView && exercise.trainer_feedback && (
        <div className="mt-3 p-2 bg-purple-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-purple-800">{exercise.trainer_feedback}</p>
          </div>
        </div>
      )}

      {/* Completion Percentage */}
      {exercise.completion_percentage > 0 && exercise.completion_percentage < 100 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{exercise.completion_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all"
              style={{ width: `${exercise.completion_percentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100';
    case 'in_progress': return 'text-blue-600 bg-blue-100';
    case 'skipped': return 'text-red-600 bg-red-100';
    case 'pending': 
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'completed': return '✅';
    case 'in_progress': return '🏃';
    case 'skipped': return '⏭️';
    case 'pending':
    default: return '⏳';
  }
};

export default WeeklyExercisesTest;