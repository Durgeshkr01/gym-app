import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workoutPlans: [],
  exercises: [],
  currentWorkout: null,
  loading: false,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setWorkoutPlans: (state, action) => {
      state.workoutPlans = action.payload;
    },
    setExercises: (state, action) => {
      state.exercises = action.payload;
    },
    setCurrentWorkout: (state, action) => {
      state.currentWorkout = action.payload;
    },
    setWorkoutLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setWorkoutPlans, setExercises, setCurrentWorkout, setWorkoutLoading } = workoutSlice.actions;
export default workoutSlice.reducer;
