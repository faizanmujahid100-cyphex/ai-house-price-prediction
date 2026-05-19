import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './view/pages/admin/Dashboard'
import AddProperty from './view/pages/admin/AddProperty'
import EditProperty from './view/pages/admin/EditProperty'
import Listings from './view/pages/admin/Listings'
import UserManagement from './view/pages/admin/UserManagement'
import PropertyPriceHistory from './view/pages/admin/PropertyPriceHistory'
import AdminProfile from './view/pages/admin/AdminProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/properties" element={<Listings />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/edit-property/:id" element={<EditProperty />} />
        <Route path="/market-trends" element={<PropertyPriceHistory />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/property-prices" element={<PropertyPriceHistory />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/settings" element={<AdminProfile />} /> {/* Settings can also go to profile */}
      </Routes>
    </Router>
  )
}

export default App