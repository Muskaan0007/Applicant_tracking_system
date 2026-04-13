import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import JobList         from './pages/JobList';
import JobDetail       from './pages/JobDetail';
import JobForm         from './pages/JobForm';
import MyApplications  from './pages/MyApplications';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Applicants      from './pages/Applicants';

import './assets/styles.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>

          {/* Public routes */}
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs"     element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Candidate only */}
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute role="candidate">
                <MyApplications />
              </ProtectedRoute>
            }
          />

          {/* Recruiter only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/create"
            element={
              <ProtectedRoute role="recruiter">
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id/edit"
            element={
              <ProtectedRoute role="recruiter">
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/applicants/:jobId"
            element={
              <ProtectedRoute role="recruiter">
                <Applicants />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
