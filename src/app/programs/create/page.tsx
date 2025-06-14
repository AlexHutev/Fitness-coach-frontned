                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="mixed">Mixed</option>
                  <option value="rehabilitation">Rehabilitation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={program.difficulty_level}
                  onChange={(e) => setProgram(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={program.duration_weeks}
                  onChange={(e) => setProgram(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sessions per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={program.sessions_per_week}
                  onChange={(e) => setProgram(prev => ({ ...prev, sessions_per_week: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={program.is_template}
                    onChange={(e) => setProgram(prev => ({ ...prev, is_template: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Save as template</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Templates can be reused for multiple clients</p>
              </div>
            </div>
          </div>

          {/* Workout Structure */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Workout Structure</h2>
              <button
                type="button"
                onClick={addWorkoutDay}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Day</span>
              </button>
            </div>

            <div className="space-y-6">
              {program.workout_structure.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      value={day.name}
                      onChange={(e) => updateWorkoutDay(dayIndex, { name: e.target.value })}
                      className="text-lg font-medium border-none p-0 focus:ring-0 focus:outline-none bg-transparent"
                      placeholder="Day name"
                    />
                    <button
                      type="button"
                      onClick={() => removeWorkoutDay(dayIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">
                            {getExerciseName(exercise.exercise_id)}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeExerciseFromDay(dayIndex, exerciseIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Sets</label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={exercise.sets}
                              onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, { sets: parseInt(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Reps</label>
                            <input
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, { reps: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="e.g., 10 or 8-12"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Weight</label>
                            <input
                              type="text"
                              value={exercise.weight}
                              onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, { weight: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="e.g., 60kg or bodyweight"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Rest (sec)</label>
                            <input
                              type="number"
                              min="0"
                              max="600"
                              value={exercise.rest_seconds}
                              onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, { rest_seconds: parseInt(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                          <input
                            type="text"
                            value={exercise.notes || ''}
                            onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, { notes: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Any specific instructions..."
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDayIndex(dayIndex);
                        setShowExerciseSelector(true);
                      }}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Exercise</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Creating...' : 'Create Program'}</span>
            </button>
          </div>
        </form>

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select Exercise</h3>
                  <button
                    onClick={() => setShowExerciseSelector(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => addExerciseToDay(selectedDayIndex, exercise)}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">{exercise.name}</h4>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {exercise.muscle_groups?.map((group) => (
                          <span
                            key={group}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                          >
                            {group.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{exercise.equipment?.join(', ').replace(/_/g, ' ')}</span>
                        {exercise.difficulty_level && (
                          <span className={`px-2 py-1 rounded-full ${
                            exercise.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                            exercise.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {exercise.difficulty_level}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredExercises.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No exercises found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CreateProgramPage);
