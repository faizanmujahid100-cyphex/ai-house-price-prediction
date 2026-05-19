import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/AdminNavbar'
import { HouseService } from '../../../services/HouseService'

const houseService = new HouseService()

const Properties = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    houseService.getHouses()
      .then(data => {
        setProperties(data)
        setTotalValue(data.reduce((s, h) => s + (h.price || 0), 0))
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

  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      (property.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.area  || '').toLowerCase().includes(searchTerm.toLowerCase())
    const s = (property.status || '').toLowerCase()
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && s === 'available') ||
      selectedStatus === s
    return matchesSearch && matchesStatus
  })

  const deleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return
    try {
      await houseService.deleteHouse(String(id))
      setProperties(prev => prev.filter(p => p.id !== id && String(p.id) !== String(id)))
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    }
  }

  const editProperty = (property) => {
    setEditingProperty({ ...property })
    setShowEditModal(true)
  }

  const updateProperty = async () => {
    setSaving(true)
    try {
      const updated = await houseService.updateHouse(String(editingProperty.id), editingProperty)
      setProperties(prev => prev.map(p => String(p.id) === String(editingProperty.id) ? updated : p))
      setShowEditModal(false)
      setEditingProperty(null)
    } catch (e) {
      alert('Failed to update: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const activeCnt  = properties.filter(p => (p.status || '').toLowerCase() === 'available').length
  const soldCnt    = properties.filter(p => (p.status || '').toLowerCase() === 'sold').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-4 lg:p-8">

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Manage Properties</h1>
            <p className="text-sm text-gray-500 mt-1">View, edit and manage all your property listings</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Properties', value: properties.length,            icon: '🏠', color: 'blue'   },
              { label: 'Active',           value: activeCnt,                    icon: '✅', color: 'green'  },
              { label: 'Sold',             value: soldCnt,                      icon: '📦', color: 'gray'   },
              { label: 'Total Value',      value: formatPrice(totalValue),      icon: '💰', color: 'purple' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-xl`}>{stat.icon}</div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
                  <input type="text" placeholder="Search by property name or location..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
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
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🏠</div>
                <p className="text-gray-500">No properties found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Beds</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Baths</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {property.image
                              ? <img src={property.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              : <div className="text-2xl w-10 text-center">🏠</div>}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{property.title}</p>
                              <p className="text-xs text-gray-500">{property.area}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{property.marla} Marla</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(property.price)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{property.bedrooms}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{property.bathrooms}</td>
                        <td className="px-4 py-3">{getStatusBadge(property.status)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => editProperty(property)}
                              className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm transition">
                              Edit
                            </button>
                            <button onClick={() => deleteProperty(property.id)}
                              className="px-3 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-sm transition">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">© 2026 Lahore House. All rights reserved.</p>
          </div>
        </div>
      </div>

      {showEditModal && editingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Edit Property</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <input type="text" placeholder="Property Title" value={editingProperty.title || ''}
                onChange={(e) => setEditingProperty({...editingProperty, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Location/Area" value={editingProperty.area || ''}
                onChange={(e) => setEditingProperty({...editingProperty, area: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Area (Marla)" value={editingProperty.marla || ''}
                onChange={(e) => setEditingProperty({...editingProperty, marla: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Price (PKR)" value={editingProperty.price || ''}
                onChange={(e) => setEditingProperty({...editingProperty, price: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Beds" value={editingProperty.bedrooms || ''}
                  onChange={(e) => setEditingProperty({...editingProperty, bedrooms: parseInt(e.target.value)})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Baths" value={editingProperty.bathrooms || ''}
                  onChange={(e) => setEditingProperty({...editingProperty, bathrooms: parseInt(e.target.value)})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={editingProperty.status || 'available'}
                  onChange={(e) => setEditingProperty({...editingProperty, status: e.target.value})}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="available">Active</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={updateProperty} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Update Property'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Properties
