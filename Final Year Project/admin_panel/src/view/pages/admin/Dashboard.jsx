import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/AdminNavbar'
import { HouseService } from '../../../services/HouseService'

const houseService = new HouseService()

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [houses, setHouses] = useState([])
  const [stats, setStats] = useState({ totalProperties: 0, newListings: 0, pendingRequests: 0, averagePrice: 0, totalValue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([houseService.getHouses(), houseService.getDashboardStats()])
      .then(([houseData, statData]) => {
        setHouses(houseData)
        setStats(statData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatPrice = (price) => `₨ ${(price / 10000000).toFixed(1)} Cr`

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'available') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">● Active</span>
    if (s === 'sold')      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">● Sold</span>
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">● Pending</span>
  }

  const filteredHouses = houses.filter(house => {
    const matchesSearch = (house.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (house.area  || '').toLowerCase().includes(searchTerm.toLowerCase())
    const s = (house.status || '').toLowerCase()
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && s === 'available') ||
      selectedStatus === s
    return matchesSearch && matchesStatus
  })

  const statCards = [
    { label: 'Total Listings',    value: stats.totalProperties,                icon: '🏠', color: 'blue'   },
    { label: 'Active Properties', value: stats.newListings,                    icon: '✅', color: 'green'  },
    { label: 'Pending',           value: stats.pendingRequests,                icon: '⏳', color: 'yellow' },
    { label: 'Avg Price',         value: stats.averagePrice ? formatPrice(stats.averagePrice) : '—', icon: '💰', color: 'purple' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-4 lg:p-8">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-xl`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="flex-1 relative">
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by property name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      {[['all', 'All'], ['active', 'Active'], ['sold', 'Sold']].map(([val, label]) => (
                        <button key={val} onClick={() => setSelectedStatus(val)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedStatus === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Link to="/add-property">
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add New Property
                    </button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHouses.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-4xl mb-3">🏠</div>
                    <p className="text-gray-500">No properties found</p>
                  </div>
                ) : (
                  filteredHouses.map((house) => (
                    <Link key={house.id} to="/properties"
                      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden block">
                      <div className="h-40 overflow-hidden">
                        {house.image ? (
                          <img src={house.image} alt={house.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-5xl">🏠</div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{house.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{house.area}</p>
                          </div>
                          {getStatusBadge(house.status)}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-sm text-gray-600">{house.bedrooms} beds</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-sm text-gray-600">{house.bathrooms} baths</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-sm text-gray-600">{house.marla} Marla</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xl font-bold text-blue-600">{formatPrice(house.price)}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">© 2026 Lahore House. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
