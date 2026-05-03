import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlices'
// import projectReducer from './slices/projectSlice'
// import taskReducer from './slices/taskSlice'
// import dashboardReducer from './slices/dashboardSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // project: projectReducer,
        // task: taskReducer,
        // dashboard: dashboardReducer,
    }
})