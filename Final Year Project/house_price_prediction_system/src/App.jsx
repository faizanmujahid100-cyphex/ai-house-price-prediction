import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/pages/Home';
import Listings from './views/pages/Listing';
import HouseDetails from './views/pages/HouseDetail';
import HousePricePredictor from './views/pages/PricePredictor';
import HistoricalRates from './views/pages/HistoricalRates';
import UserProfile from './views/pages/Profile';
import SignIn from './views/pages/SignIn';
import SignUp from './views/pages/SignUp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/house/:id" element={<HouseDetails />} />
        <Route path="/predict" element={<HousePricePredictor />} />
        <Route path="/historical-rates" element={<HistoricalRates />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/sign_in" element={<SignIn />} />
        <Route path="/sign_up" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;