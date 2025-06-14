  const addMuscleGroup = () => {
    if (newMuscleGroup && !exercise.muscle_groups?.includes(newMuscleGroup)) {
      setExercise(prev => ({
        ...prev,
        muscle_groups: [...(prev.muscle_groups || []), newMuscleGroup]
      }));
      setNewMuscleGroup('');
    }
  };

  const removeMuscleGroup = (groupToRemove: string) => {
    setExercise(prev => ({
      ...prev,
      muscle_groups: prev.muscle_groups?.filter(group => group !== groupToRemove) || []
    }));
  };

  const addEquipment = () => {
    if (newEquipment && !exercise.equipment?.includes(newEquipment)) {
      setExercise(prev => ({
        ...prev,
        equipment: [...(prev.equipment || []), newEquipment]
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipmentToRemove: string) => {
    setExercise(prev => ({
      ...prev,
      equipment: prev.equipment?.filter(item => item !== equipmentToRemove) || []
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exercises
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Exercise</h1>
          <p className="text-gray-600 mt-2">Create a new exercise for your library</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Exercise Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => setExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Push-ups, Bench Press"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={exercise.description}
                  onChange={(e) => setExercise(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the exercise..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={exercise.instructions}
                  onChange={(e) => setExercise(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Step-by-step instructions for performing the exercise..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={exercise.difficulty_level}
                  onChange={(e) => setExercise(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exercise.is_public}
                    onChange={(e) => setExercise(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Make public</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Public exercises can be used by other trainers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={exercise.image_url}
                  onChange={(e) => setExercise(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL (optional)
                </label>
                <input
                  type="url"
                  value={exercise.video_url}
                  onChange={(e) => setExercise(prev => ({ ...prev, video_url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Muscle Groups */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Muscle Groups</h3>
            
            <div className="flex space-x-2 mb-4">
              <select
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select muscle group</option>
                {muscleGroupOptions.map(group => (
                  <option key={group} value={group}>
                    {group.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addMuscleGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {exercise.muscle_groups?.map((group) => (
                <span
                  key={group}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{group.replace('_', ' ')}</span>
                  <button
                    type="button"
                    onClick={() => removeMuscleGroup(group)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment</h3>
            
            <div className="flex space-x-2 mb-4">
              <select
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select equipment</option>
                {equipmentOptions.map(equipment => (
                  <option key={equipment} value={equipment}>
                    {equipment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addEquipment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {exercise.equipment?.map((item) => (
                <span
                  key={item}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{item.replace('_', ' ')}</span>
                  <button
                    type="button"
                    onClick={() => removeEquipment(item)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
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
              <span>{loading ? 'Creating...' : 'Create Exercise'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(CreateExercisePage);
