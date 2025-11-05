import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SearchPage from './pages/SearchPage';
import AccountPage from './pages/AccountPage';
import SecurityPage from './pages/SecurityPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DietaryPreferencesPage from './pages/DietaryPreferencesPage';
import PreferencesPage from './pages/PreferencesPage';
import FoodHistoryPage from './pages/FoodHistoryPage';
import FoodReviewPage from './pages/FoodReviewPage';
import GroupsPage from './pages/GroupsPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import MapPage from './pages/MapPage';
import ResultsPage from './pages/ResultsPage';
import Faqpage from './pages/FaqPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/security" element={<SecurityPage />} />
        <Route path="/account/security/change-password" element={<ChangePasswordPage />} />
        <Route path="/account/dietary" element={<DietaryPreferencesPage />} />
        <Route path="/account/preferences" element={<PreferencesPage />} />
        <Route path="/account/history" element={<FoodHistoryPage />} />
        <Route path="/account/review" element={<FoodReviewPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/create" element={<CreateGroupPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
        
        {/* MapPage used by BOTH individual and group leader */}
        <Route path="/location" element={<MapPage />} />
        
        <Route path="/result" element={<ResultsPage />} />
        <Route path="/foodball/results" element={<ResultsPage />} />
        <Route path="/FaqPage" element={<Faqpage />} />
      </Routes>
    </Router>
  );
}

export default App;
