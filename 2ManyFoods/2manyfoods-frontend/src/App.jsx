import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import AccountPage from './pages/AccountPage';
import SecurityPage from './pages/SecurityPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DietaryPreferencesPage from './pages/DietaryPreferencesPage';
import CuisinePreferencesPage from './pages/CuisinePreferencesPage';
import FoodHistoryPage from './pages/FoodHistoryPage';
import FoodReviewPage from './pages/FoodReviewPage';
import GroupsPage from './pages/GroupsPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import InProgressPage from './pages/InProgressPage';
import ResultsPage from './pages/ResultsPage';
import VotingPage from './pages/VotingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/security" element={<SecurityPage />} />
        <Route path="/account/security/change-password" element={<ChangePasswordPage />} />
        <Route path="/account/dietary" element={<DietaryPreferencesPage />} />
        <Route path="/account/cuisine" element={<CuisinePreferencesPage />} />
        <Route path="/account/history" element={<FoodHistoryPage />} />
        <Route path="/account/review" element={<FoodReviewPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/create" element={<CreateGroupPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
        <Route path="/foodball/in-progress" element={<InProgressPage />} />
        <Route path="/foodball/results" element={<ResultsPage />} />
        <Route path="/foodball/voting" element={<VotingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
