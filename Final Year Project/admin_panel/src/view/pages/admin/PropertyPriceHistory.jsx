import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/AdminNavbar";
import { 
  Plus, Calendar, Edit2, Trash2, Save, X, Search, 
  TrendingUp, TrendingDown, Minus, Eye, Clock, 
  CheckCircle, AlertCircle, Layers, MapPin, Building2,
  Database, FileText, History, BarChart3, Sparkles
} from 'lucide-react'

const PropertyPriceHistory = () => {
  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Main Data State
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [priceHistoryLogs, setPriceHistoryLogs] = useState([])
  
  // UI State
  const [activeTab, setActiveTab] = useState('current')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddYearModal, setShowAddYearModal] = useState(false)
  const [showDeleteYearConfirm, setShowDeleteYearConfirm] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [yearToDelete, setYearToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState('All')
  const [selectedYear, setSelectedYear] = useState('2025')
  const [successMessage, setSuccessMessage] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Form States
  const [editPrices, setEditPrices] = useState({})
  const [newLocation, setNewLocation] = useState({
    locationName: '',
    area: '',
    initialYear: '2025',
    prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 }
  })
  const [newYearData, setNewYearData] = useState({
    year: '',
    prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 }
  })

  // Dummy Data with Independent Year Records
  useEffect(() => {
    const dummyLocations = [
      {
        id: 1,
        locationName: 'DHA Phase 6',
        area: 'DHA Defence',
        city: 'Lahore',
        createdAt: '2020-03-15T10:00:00',
        yearRecords: {
          '2020': { prices: { '5_marla': 7500000, '10_marla': 14500000, '1_kanal': 28000000, '2_kanal': 56000000 }, updatedAt: '2020-03-15T10:00:00', updatedBy: 'Admin' },
          '2021': { prices: { '5_marla': 8500000, '10_marla': 16500000, '1_kanal': 32000000, '2_kanal': 65000000 }, updatedAt: '2021-01-10T14:30:00', updatedBy: 'Admin' },
          '2022': { prices: { '5_marla': 9500000, '10_marla': 18500000, '1_kanal': 36000000, '2_kanal': 72000000 }, updatedAt: '2022-02-20T09:15:00', updatedBy: 'Admin' },
          '2023': { prices: { '5_marla': 11000000, '10_marla': 21000000, '1_kanal': 41000000, '2_kanal': 82000000 }, updatedAt: '2023-03-05T16:45:00', updatedBy: 'Admin' },
          '2024': { prices: { '5_marla': 12500000, '10_marla': 24000000, '1_kanal': 47000000, '2_kanal': 94000000 }, updatedAt: '2024-04-12T11:20:00', updatedBy: 'Admin' },
          '2025': { prices: { '5_marla': 14000000, '10_marla': 27000000, '1_kanal': 53000000, '2_kanal': 105000000 }, updatedAt: '2025-04-12T14:30:00', updatedBy: 'Admin' }
        }
      },
      {
        id: 2,
        locationName: 'Bahria Town Lahore',
        area: 'Bahria Town',
        city: 'Lahore',
        createdAt: '2021-06-20T08:00:00',
        yearRecords: {
          '2021': { prices: { '5_marla': 5500000, '10_marla': 10500000, '1_kanal': 20000000, '2_kanal': 40000000 }, updatedAt: '2021-06-20T08:00:00', updatedBy: 'Admin' },
          '2022': { prices: { '5_marla': 6200000, '10_marla': 11800000, '1_kanal': 22500000, '2_kanal': 45000000 }, updatedAt: '2022-07-15T12:00:00', updatedBy: 'Admin' },
          '2023': { prices: { '5_marla': 7000000, '10_marla': 13500000, '1_kanal': 25500000, '2_kanal': 51000000 }, updatedAt: '2023-08-10T15:30:00', updatedBy: 'Admin' },
          '2024': { prices: { '5_marla': 8000000, '10_marla': 15500000, '1_kanal': 29000000, '2_kanal': 58000000 }, updatedAt: '2024-09-05T10:00:00', updatedBy: 'Admin' },
          '2025': { prices: { '5_marla': 9000000, '10_marla': 17500000, '1_kanal': 33000000, '2_kanal': 66000000 }, updatedAt: '2025-04-10T09:15:00', updatedBy: 'Admin' }
        }
      },
      {
        id: 3,
        locationName: 'Johar Town',
        area: 'Johar Town',
        city: 'Lahore',
        createdAt: '2019-01-10T09:00:00',
        yearRecords: {
          '2019': { prices: { '5_marla': 3200000, '10_marla': 6000000, '1_kanal': 11000000, '2_kanal': 22000000 }, updatedAt: '2019-01-10T09:00:00', updatedBy: 'Admin' },
          '2020': { prices: { '5_marla': 3500000, '10_marla': 6600000, '1_kanal': 12000000, '2_kanal': 24000000 }, updatedAt: '2020-02-15T11:00:00', updatedBy: 'Admin' },
          '2021': { prices: { '5_marla': 3800000, '10_marla': 7200000, '1_kanal': 13500000, '2_kanal': 27000000 }, updatedAt: '2021-03-20T14:00:00', updatedBy: 'Admin' },
          '2022': { prices: { '5_marla': 4200000, '10_marla': 8000000, '1_kanal': 15000000, '2_kanal': 30000000 }, updatedAt: '2022-04-25T16:00:00', updatedBy: 'Admin' },
          '2023': { prices: { '5_marla': 4800000, '10_marla': 9200000, '1_kanal': 17000000, '2_kanal': 34000000 }, updatedAt: '2023-05-30T10:00:00', updatedBy: 'Admin' },
          '2024': { prices: { '5_marla': 5500000, '10_marla': 10500000, '1_kanal': 19500000, '2_kanal': 39000000 }, updatedAt: '2024-06-15T13:00:00', updatedBy: 'Admin' },
          '2025': { prices: { '5_marla': 6200000, '10_marla': 12000000, '1_kanal': 22000000, '2_kanal': 44000000 }, updatedAt: '2025-04-08T16:45:00', updatedBy: 'Admin' }
        }
      },
      {
        id: 4,
        locationName: 'Wapda Town',
        area: 'Wapda Town',
        city: 'Lahore',
        createdAt: '2021-03-01T07:00:00',
        yearRecords: {
          '2021': { prices: { '5_marla': 3200000, '10_marla': 6000000, '1_kanal': 11000000, '2_kanal': 22000000 }, updatedAt: '2021-03-01T07:00:00', updatedBy: 'Admin' },
          '2022': { prices: { '5_marla': 3500000, '10_marla': 6800000, '1_kanal': 12500000, '2_kanal': 25000000 }, updatedAt: '2022-04-10T09:00:00', updatedBy: 'Admin' },
          '2023': { prices: { '5_marla': 4000000, '10_marla': 7800000, '1_kanal': 14200000, '2_kanal': 28500000 }, updatedAt: '2023-05-20T11:00:00', updatedBy: 'Admin' },
          '2024': { prices: { '5_marla': 4600000, '10_marla': 8900000, '1_kanal': 16200000, '2_kanal': 32500000 }, updatedAt: '2024-06-30T14:00:00', updatedBy: 'Admin' },
          '2025': { prices: { '5_marla': 5200000, '10_marla': 10000000, '1_kanal': 18500000, '2_kanal': 37000000 }, updatedAt: '2025-04-05T11:20:00', updatedBy: 'Admin' }
        }
      },
      {
        id: 5,
        locationName: 'Model Town',
        area: 'Model Town',
        city: 'Lahore',
        createdAt: '2018-05-15T06:00:00',
        yearRecords: {
          '2018': { prices: { '5_marla': 10000000, '10_marla': 19000000, '1_kanal': 37000000, '2_kanal': 74000000 }, updatedAt: '2018-05-15T06:00:00', updatedBy: 'Admin' },
          '2019': { prices: { '5_marla': 10800000, '10_marla': 20500000, '1_kanal': 40000000, '2_kanal': 80000000 }, updatedAt: '2019-06-20T08:00:00', updatedBy: 'Admin' },
          '2020': { prices: { '5_marla': 11500000, '10_marla': 22000000, '1_kanal': 43000000, '2_kanal': 86000000 }, updatedAt: '2020-07-25T10:00:00', updatedBy: 'Admin' },
          '2021': { prices: { '5_marla': 12000000, '10_marla': 23000000, '1_kanal': 45000000, '2_kanal': 90000000 }, updatedAt: '2021-08-30T12:00:00', updatedBy: 'Admin' },
          '2022': { prices: { '5_marla': 13000000, '10_marla': 25500000, '1_kanal': 50000000, '2_kanal': 100000000 }, updatedAt: '2022-09-15T14:00:00', updatedBy: 'Admin' },
          '2023': { prices: { '5_marla': 14500000, '10_marla': 28000000, '1_kanal': 56000000, '2_kanal': 112000000 }, updatedAt: '2023-10-20T16:00:00', updatedBy: 'Admin' },
          '2024': { prices: { '5_marla': 16000000, '10_marla': 31000000, '1_kanal': 62000000, '2_kanal': 125000000 }, updatedAt: '2024-11-25T18:00:00', updatedBy: 'Admin' },
          '2025': { prices: { '5_marla': 17500000, '10_marla': 34000000, '1_kanal': 69000000, '2_kanal': 138000000 }, updatedAt: '2025-04-01T08:00:00', updatedBy: 'Admin' }
        }
      }
    ]

    const dummyLogs = [
      { id: 1, locationId: 1, locationName: 'DHA Phase 6', action: 'year_updated', year: '2025', date: '2025-04-12T14:30:00', updatedBy: 'Admin', details: 'Updated 2025 prices', changes: { '5_marla': { old: 13500000, new: 14000000 } } },
      { id: 2, locationId: 2, locationName: 'Bahria Town Lahore', action: 'year_updated', year: '2025', date: '2025-04-10T09:15:00', updatedBy: 'Admin', details: 'Adjusted 2025 rates', changes: { '5_marla': { old: 8500000, new: 9000000 } } },
      { id: 3, locationId: 3, locationName: 'Johar Town', action: 'year_updated', year: '2025', date: '2025-04-08T16:45:00', updatedBy: 'Admin', details: 'Quarterly 2025 revision', changes: { '5_marla': { old: 5900000, new: 6200000 } } },
      { id: 4, locationId: 3, locationName: 'Johar Town', action: 'year_added', year: '2019', date: '2024-12-01T10:00:00', updatedBy: 'Admin', details: 'Added historical 2019 data' },
      { id: 5, locationId: 5, locationName: 'Model Town', action: 'year_added', year: '2018', date: '2024-11-15T09:00:00', updatedBy: 'Admin', details: 'Added historical 2018 records' },
      { id: 6, locationId: 1, locationName: 'DHA Phase 6', action: 'year_updated', year: '2024', date: '2024-04-12T11:20:00', updatedBy: 'Admin', details: 'Annual 2024 revision' },
    ]

    setLocations(dummyLocations)
    setPriceHistoryLogs(dummyLogs)
    setSelectedLocation(dummyLocations[0])
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'PKR 0'
    if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lac`
    return `PKR ${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })
    } catch (e) {
      return dateString
    }
  }

  // Get available years for a location
  const getLocationYears = (location) => {
    if (!location || !location.yearRecords) return []
    return Object.keys(location.yearRecords).sort((a, b) => parseInt(b) - parseInt(a))
  }

  // Get all unique years across all locations
  const allAvailableYears = useMemo(() => {
    const yearsSet = new Set()
    locations.forEach(loc => {
      if (loc.yearRecords) {
        Object.keys(loc.yearRecords).forEach(year => yearsSet.add(year))
      }
    })
    return Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a))
  }, [locations])

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { amount: 0, percentage: 0 }
    const amount = current - previous
    const percentage = ((amount / previous) * 100).toFixed(1)
    return { amount, percentage }
  }

  // Get current/latest year prices
  const getCurrentPrices = (location) => {
    if (!location || !location.yearRecords) return {}
    const years = getLocationYears(location)
    if (years.length === 0) return {}
    const latestYear = years[0]
    return location.yearRecords[latestYear]?.prices || {}
  }

  // Get location history logs
  const locationLogs = useMemo(() => {
    if (!selectedLocation) return []
    return priceHistoryLogs
      .filter(log => log.locationId === selectedLocation.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [selectedLocation, priceHistoryLogs])

  // All logs filtered
  const allLogs = useMemo(() => {
    let logs = [...priceHistoryLogs].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (searchTerm && activeTab === 'logs') {
      logs = logs.filter(log => 
        log.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return logs
  }, [priceHistoryLogs, searchTerm, activeTab])

  // Filtered locations
  const filteredLocations = useMemo(() => {
    let result = [...locations]
    if (searchTerm) {
      result = result.filter(loc => 
        loc.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.area.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (filterArea !== 'All') {
      result = result.filter(loc => loc.area === filterArea)
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [locations, searchTerm, filterArea, sortConfig])

  const areas = useMemo(() => ['All', ...new Set(locations.map(loc => loc.area))], [locations])
  const sizes = ['5_marla', '10_marla', '1_kanal', '2_kanal']
  const sizeLabels = { '5_marla': '5 Marla', '10_marla': '10 Marla', '1_kanal': '1 Kanal', '2_kanal': '2 Kanal' }
  const marlasMap = { '5_marla': 5, '10_marla': 10, '1_kanal': 20, '2_kanal': 40 }

  // Handle edit location (opens full year editor)
  const handleEditClick = (location) => {
    setEditingLocation(location)
    setEditPrices(JSON.parse(JSON.stringify(location.yearRecords)))
    setShowEditModal(true)
  }

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingLocation) return

    const oldYearRecords = editingLocation.yearRecords
    const changes = []
    
    Object.keys(editPrices).forEach(year => {
      if (!oldYearRecords[year]) {
        changes.push({ year, action: 'year_added' })
      } else {
        const oldPrices = oldYearRecords[year].prices
        const newPrices = editPrices[year].prices
        let hasChanges = false
        Object.keys(newPrices).forEach(size => {
          if (newPrices[size] !== oldPrices[size]) {
            hasChanges = true
          }
        })
        if (hasChanges) {
          changes.push({ year, action: 'year_updated' })
        }
      }
    })

    setLocations(prev => prev.map(loc => 
      loc.id === editingLocation.id 
        ? { ...loc, yearRecords: editPrices }
        : loc
    ))

    changes.forEach(change => {
      const newLog = {
        id: priceHistoryLogs.length + Math.random(),
        locationId: editingLocation.id,
        locationName: editingLocation.locationName,
        action: change.action,
        year: change.year,
        date: new Date().toISOString(),
        updatedBy: 'Admin',
        details: `${change.action === 'year_added' ? 'Added' : 'Updated'} ${change.year} prices for ${editingLocation.locationName}`
      }
      setPriceHistoryLogs(prev => [newLog, ...prev])
    })

    setShowEditModal(false)
    showMessage(`✅ Prices updated for ${editingLocation.locationName}`)
  }

  // Handle add new location
  const handleAddLocation = () => {
    const newLoc = {
      id: locations.length + 1,
      locationName: newLocation.locationName,
      area: newLocation.area,
      city: 'Lahore',
      createdAt: new Date().toISOString(),
      yearRecords: {
        [newLocation.initialYear]: {
          prices: { ...newLocation.prices },
          updatedAt: new Date().toISOString(),
          updatedBy: 'Admin'
        }
      }
    }

    const newLog = {
      id: priceHistoryLogs.length + 1,
      locationId: newLoc.id,
      locationName: newLoc.locationName,
      action: 'location_added',
      date: new Date().toISOString(),
      updatedBy: 'Admin',
      details: `New location "${newLoc.locationName}" created with ${newLocation.initialYear} prices`
    }

    setLocations(prev => [...prev, newLoc])
    setPriceHistoryLogs(prev => [newLog, ...prev])
    setShowAddModal(false)
    setNewLocation({
      locationName: '',
      area: '',
      initialYear: '2025',
      prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 }
    })
    showMessage(`✅ ${newLoc.locationName} added successfully!`)
  }

  // Handle add a specific year to existing location
  const handleAddYear = () => {
    if (!selectedLocation || !newYearData.year) return

    if (selectedLocation.yearRecords[newYearData.year]) {
      showMessage(`⚠️ Year ${newYearData.year} already exists for this location!`)
      return
    }

    const updatedYearRecords = {
      ...selectedLocation.yearRecords,
      [newYearData.year]: {
        prices: { ...newYearData.prices },
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin'
      }
    }

    setLocations(prev => prev.map(loc =>
      loc.id === selectedLocation.id
        ? { ...loc, yearRecords: updatedYearRecords }
        : loc
    ))

    const newLog = {
      id: priceHistoryLogs.length + 1,
      locationId: selectedLocation.id,
      locationName: selectedLocation.locationName,
      action: 'year_added',
      year: newYearData.year,
      date: new Date().toISOString(),
      updatedBy: 'Admin',
      details: `Added historical ${newYearData.year} data for ${selectedLocation.locationName}`
    }

    setPriceHistoryLogs(prev => [newLog, ...prev])
    setShowAddYearModal(false)
    setNewYearData({ year: '', prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 } })
    showMessage(`✅ Year ${newYearData.year} added to ${selectedLocation.locationName}`)
  }

  // Handle delete specific year
  const handleDeleteYear = () => {
    if (!selectedLocation || !yearToDelete) return

    const updatedYearRecords = { ...selectedLocation.yearRecords }
    delete updatedYearRecords[yearToDelete]

    setLocations(prev => prev.map(loc =>
      loc.id === selectedLocation.id
        ? { ...loc, yearRecords: updatedYearRecords }
        : loc
    ))

    const newLog = {
      id: priceHistoryLogs.length + 1,
      locationId: selectedLocation.id,
      locationName: selectedLocation.locationName,
      action: 'year_deleted',
      year: yearToDelete,
      date: new Date().toISOString(),
      updatedBy: 'Admin',
      details: `Removed ${yearToDelete} data from ${selectedLocation.locationName}`
    }

    setPriceHistoryLogs(prev => [newLog, ...prev])
    setShowDeleteYearConfirm(false)
    setYearToDelete(null)
    showMessage(`🗑️ Year ${yearToDelete} removed from ${selectedLocation.locationName}`)
  }

  // Handle delete location
  const handleDeleteLocation = () => {
    if (!editingLocation) return

    const newLog = {
      id: priceHistoryLogs.length + 1,
      locationId: editingLocation.id,
      locationName: editingLocation.locationName,
      action: 'location_deleted',
      date: new Date().toISOString(),
      updatedBy: 'Admin',
      details: `Location "${editingLocation.locationName}" permanently deleted`
    }

    setLocations(prev => prev.filter(loc => loc.id !== editingLocation.id))
    setPriceHistoryLogs(prev => [newLog, ...prev])
    
    if (selectedLocation?.id === editingLocation.id) {
      setSelectedLocation(locations[0] || null)
    }
    
    setShowDeleteConfirm(false)
    setEditingLocation(null)
    showMessage(`🗑️ ${editingLocation.locationName} deleted`)
  }

  // Show message
  const showMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Get year for editing in modal
  const getEditYearPrice = (year, size) => {
    return editPrices[year]?.prices?.[size] || 0
  }

  // Set year price in edit modal
  const setEditYearPrice = (year, size, value) => {
    setEditPrices(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        prices: {
          ...prev[year]?.prices,
          [size]: parseInt(value) || 0
        }
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Database className="w-7 h-7 text-blue-600" />
                  Price History Management
                </h1>
                <p className="text-gray-500 mt-1">Track and manage independent yearly price records for all locations</p>
              </div>
              <button
                onClick={() => {
                  setNewLocation({
                    locationName: '',
                    area: '',
                    initialYear: '2025',
                    prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 }
                  })
                  setShowAddModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Location
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
              successMessage.startsWith('⚠️') 
                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {successMessage.startsWith('⚠️') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              <span>{successMessage}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Locations</p>
                  <p className="text-xl font-bold text-gray-800">{locations.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Year Records</p>
                  <p className="text-xl font-bold text-gray-800">
                    {locations.reduce((sum, loc) => sum + (loc.yearRecords ? Object.keys(loc.yearRecords).length : 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Updates</p>
                  <p className="text-xl font-bold text-gray-800">{priceHistoryLogs.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Years Tracked</p>
                  <p className="text-xl font-bold text-gray-800">{allAvailableYears.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN - Location List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">📍 Locations</h2>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {areas.map(area => (
                        <option key={area} value={area}>{area === 'All' ? '🏘️ All Areas' : area}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                  {filteredLocations.map(location => {
                    const currentPrices = getCurrentPrices(location)
                    const years = getLocationYears(location)
                    return (
                      <div
                        key={location.id}
                        onClick={() => setSelectedLocation(location)}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          selectedLocation?.id === location.id 
                            ? 'bg-blue-50 border-l-4 border-blue-600' 
                            : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800">{location.locationName}</h3>
                            <p className="text-xs text-gray-500">{location.area}</p>
                          </div>
                          <span className="text-xs text-gray-400">{years.length} years</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                          <span className="text-gray-500">5M: <span className="font-medium text-gray-700">{formatCurrency(currentPrices['5_marla'])}</span></span>
                          <span className="text-gray-500">10M: <span className="font-medium text-gray-700">{formatCurrency(currentPrices['10_marla'])}</span></span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          Years: {years.slice(0, 4).join(', ')}{years.length > 4 ? '...' : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Details */}
            <div className="lg:col-span-2">
              {selectedLocation ? (
                <div className="space-y-6">
                  
                  {/* Location Header */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-row items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{selectedLocation.locationName}</h2>
                        <p className="text-sm text-gray-500">
                          {selectedLocation.area} • Created: {formatDate(selectedLocation.createdAt)} • {getLocationYears(selectedLocation).length} year records
                        </p>
                      </div>
                      <div className="flex gap-2 whitespace-nowrap">
                        {/* Add Year - Improved Button */}
                        <button
                          onClick={() => {
                            setNewYearData({ year: '', prices: { '5_marla': 0, '10_marla': 0, '1_kanal': 0, '2_kanal': 0 } })
                            setShowAddYearModal(true)
                          }}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
                        >
                          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                          Add Year
                        </button>
                        
                        {/* Edit All - Improved Button */}
                        <button
                          onClick={() => handleEditClick(selectedLocation)}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
                        >
                          <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Edit All
                        </button>
                        
                        {/* Delete - Improved Button */}
                        <button
                          onClick={() => {
                            setEditingLocation(selectedLocation)
                            setShowDeleteConfirm(true)
                          }}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-90 transition-transform" />
                          Delete Location
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 border-b border-gray-100 pb-0 flex-wrap">
                      {[
                        { id: 'current', label: 'Current Rates', icon: BarChart3 },
                        { id: 'historical', label: 'Year History', icon: History },
                        { id: 'logs', label: 'Update Logs', icon: Clock }
                      ].map(tab => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                              activeTab === tab.id
                                ? 'bg-white text-blue-600 border border-b-white border-gray-100 -mb-px'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* CURRENT RATES TAB */}
                  {activeTab === 'current' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Current Market Rates ({getLocationYears(selectedLocation)[0] || 'N/A'})
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {sizes.map(size => {
                          const latestYear = getLocationYears(selectedLocation)[0]
                          const prevYear = getLocationYears(selectedLocation)[1]
                          const currentPrice = selectedLocation.yearRecords[latestYear]?.prices?.[size] || 0
                          const prevPrice = selectedLocation.yearRecords[prevYear]?.prices?.[size] || 0
                          const change = calculateChange(currentPrice, prevPrice)
                          
                          return (
                            <div key={size} className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">
                                  {size === '5_marla' ? '🏠' : size === '10_marla' ? '🏡' : size === '1_kanal' ? '🏘️' : '🏰'}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                                  change.amount >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {change.amount >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {change.percentage}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{sizeLabels[size]}</p>
                              <p className="text-2xl font-bold text-gray-800 mb-2">{formatCurrency(currentPrice)}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Per Marla: {formatCurrency(Math.round(currentPrice / marlasMap[size]))}</span>
                                <span className={change.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {change.amount >= 0 ? '+' : ''}{formatCurrency(change.amount)} YoY
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* YEAR HISTORY TAB with Improved Delete Year Control */}
                  {activeTab === 'historical' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <h3 className="text-lg font-semibold text-gray-800">Year-wise Price Records</h3>
                          <div className="flex gap-2 flex-wrap items-center">
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                {getLocationYears(selectedLocation).map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Professional Delete Year Button */}
                            <button
                              onClick={() => {
                                setYearToDelete(selectedYear)
                                setShowDeleteYearConfirm(true)
                              }}
                              className="group flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all"
                            >
                              <Trash2 className="w-4 h-4 group-hover:scale-90 transition-transform" />
                              Delete This Year
                            </button>
                          </div>
                        </div>

                        {/* Year Quick Select */}
                        <div className="flex gap-2 flex-wrap mb-6">
                          {getLocationYears(selectedLocation).map(year => (
                            <button
                              key={year}
                              onClick={() => setSelectedYear(year)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedYear === year
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>

                        {/* Selected Year Details */}
                        {selectedLocation.yearRecords[selectedYear] ? (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                {selectedYear} Prices
                              </h4>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated: {formatDate(selectedLocation.yearRecords[selectedYear].updatedAt)}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Plot Size</th>
                                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Price</th>
                                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Per Marla</th>
                                    <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">vs Previous Year</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sizes.map(size => {
                                    const price = selectedLocation.yearRecords[selectedYear]?.prices?.[size] || 0
                                    const prevYearStr = (parseInt(selectedYear) - 1).toString()
                                    const prevPrice = selectedLocation.yearRecords[prevYearStr]?.prices?.[size] || price
                                    const change = calculateChange(price, prevPrice)
                                    
                                    return (
                                      <tr key={size} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-sm font-medium text-gray-800">{sizeLabels[size]}</td>
                                        <td className="p-3 text-sm font-bold text-gray-800">{formatCurrency(price)}</td>
                                        <td className="p-3 text-sm text-gray-600">{formatCurrency(Math.round(price / marlasMap[size]))}</td>
                                        <td className="p-3">
                                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                                            change.amount > 0 ? 'text-green-600' : change.amount < 0 ? 'text-red-600' : 'text-gray-400'
                                          }`}>
                                            {change.amount > 0 ? <TrendingUp className="w-3 h-3" /> : change.amount < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                            {change.amount > 0 ? '+' : ''}{change.percentage}%
                                          </span>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            No data for {selectedYear}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* UPDATE LOGS TAB */}
                  {activeTab === 'logs' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Update History Timeline
                          </h3>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search logs..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                            />
                          </div>
                        </div>
                        
                        {locationLogs.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            No update logs for this location
                          </div>
                        ) : (
                          <div className="space-y-0">
                            {locationLogs.map((log, index) => (
                              <div key={log.id} className="relative pl-8 pb-6">
                                {index < locationLogs.length - 1 && (
                                  <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                                )}
                                <div className={`absolute left-1.5 top-1 w-4 h-4 rounded-full border-2 ${
                                  log.action === 'location_added' ? 'bg-green-100 border-green-500' :
                                  log.action === 'location_deleted' ? 'bg-red-100 border-red-500' :
                                  log.action === 'year_added' ? 'bg-teal-100 border-teal-500' :
                                  log.action === 'year_deleted' ? 'bg-orange-100 border-orange-500' :
                                  'bg-blue-100 border-blue-500'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full m-0.5 ${
                                    log.action === 'location_added' ? 'bg-green-500' :
                                    log.action === 'location_deleted' ? 'bg-red-500' :
                                    log.action === 'year_added' ? 'bg-teal-500' :
                                    log.action === 'year_deleted' ? 'bg-orange-500' :
                                    'bg-blue-500'
                                  }`}></div>
                                </div>
                                <div className={`p-4 rounded-lg border ${
                                  log.action === 'location_added' ? 'bg-green-50 border-green-100' :
                                  log.action === 'location_deleted' ? 'bg-red-50 border-red-100' :
                                  log.action === 'year_added' ? 'bg-teal-50 border-teal-100' :
                                  log.action === 'year_deleted' ? 'bg-orange-50 border-orange-100' :
                                  'bg-gray-50 border-gray-100'
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        log.action === 'location_added' ? 'bg-green-200 text-green-800' :
                                        log.action === 'location_deleted' ? 'bg-red-200 text-red-800' :
                                        log.action === 'year_added' ? 'bg-teal-200 text-teal-800' :
                                        log.action === 'year_deleted' ? 'bg-orange-200 text-orange-800' :
                                        'bg-blue-200 text-blue-800'
                                      }`}>
                                        {log.action.replace('_', ' ').toUpperCase()}
                                      </span>
                                      {log.year && (
                                        <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" /> Year: {log.year}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(log.date)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{log.details}</p>
                                  <p className="text-xs text-gray-400 mt-1">By: {log.updatedBy}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Location</h3>
                  <p className="text-gray-500">Choose a location from the left panel to view and manage price history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT ALL YEARS MODAL - Improved */}
      {showEditModal && editingLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 sticky top-0 bg-white border-b border-gray-100 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                    Edit All Year Records
                  </h2>
                  <p className="text-sm text-gray-500">{editingLocation.locationName} • {editingLocation.area}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {Object.keys(editPrices).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No year records. Add a year first.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">Year</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">5 Marla</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">10 Marla</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">1 Kanal</th>
                        <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase">2 Kanal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(editPrices).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                        <tr key={year} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-sm font-semibold text-gray-800">
                            {year}
                            <div className="text-xs text-gray-400 font-normal">
                              {editPrices[year]?.updatedAt ? formatDate(editPrices[year].updatedAt) : 'New'}
                            </div>
                           </td>
                          {sizes.map(size => {
                            const currentVal = editPrices[year]?.prices?.[size] || 0
                            const oldVal = editingLocation.yearRecords[year]?.prices?.[size] || 0
                            const hasChanged = oldVal !== currentVal && oldVal !== undefined
                            
                            return (
                              <td key={size} className="p-3">
                                <input
                                  type="number"
                                  value={currentVal}
                                  onChange={(e) => setEditYearPrice(year, size, e.target.value)}
                                  className={`w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    hasChanged ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
                                  }`}
                                />
                                {hasChanged && (
                                  <div className="text-xs mt-1 text-gray-400 line-through">
                                    {formatCurrency(oldVal)}
                                  </div>
                                )}
                               </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD YEAR MODAL - Improved */}
      {showAddYearModal && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    Add Historical Year
                  </h2>
                  <p className="text-sm text-gray-500">Add price data for a specific year to {selectedLocation.locationName}</p>
                </div>
                <button onClick={() => setShowAddYearModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  value={newYearData.year}
                  onChange={(e) => setNewYearData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="e.g., 2019"
                  min="2000"
                  max="2030"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Existing years: {getLocationYears(selectedLocation).join(', ')}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Prices for {newYearData.year || '____'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizes.map(size => (
                    <div key={size}>
                      <label className="block text-xs text-gray-600 mb-1">{sizeLabels[size]}</label>
                      <input
                        type="number"
                        value={newYearData.prices[size]}
                        onChange={(e) => setNewYearData(prev => ({
                          ...prev,
                          prices: { ...prev.prices, [size]: parseInt(e.target.value) || 0 }
                        }))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowAddYearModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleAddYear}
                  disabled={!newYearData.year}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE YEAR CONFIRMATION MODAL - Improved */}
      {showDeleteYearConfirm && yearToDelete && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Delete Year Record</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to delete <span className="font-semibold">{yearToDelete}</span> data from <span className="font-semibold">{selectedLocation.locationName}</span>?
                </p>
                <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Only this year's record will be removed. Other years will remain untouched.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowDeleteYearConfirm(false); setYearToDelete(null) }} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeleteYear} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Add New Location
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                  <input type="text" value={newLocation.locationName} onChange={(e) => setNewLocation(prev => ({ ...prev, locationName: e.target.value }))} placeholder="e.g., DHA Phase 9" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                  <input type="text" value={newLocation.area} onChange={(e) => setNewLocation(prev => ({ ...prev, area: e.target.value }))} placeholder="e.g., DHA" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Year *</label>
                <input type="number" value={newLocation.initialYear} onChange={(e) => setNewLocation(prev => ({ ...prev, initialYear: e.target.value }))} placeholder="2025" min="2000" max="2030" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Initial Prices</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizes.map(size => (
                    <div key={size}>
                      <label className="block text-xs text-gray-600 mb-1">{sizeLabels[size]}</label>
                      <input type="number" value={newLocation.prices[size]} onChange={(e) => setNewLocation(prev => ({ ...prev, prices: { ...prev.prices, [size]: parseInt(e.target.value) || 0 } }))} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleAddLocation} disabled={!newLocation.locationName || !newLocation.area} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LOCATION MODAL */}
      {showDeleteConfirm && editingLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Delete Location</h2>
                <p className="text-sm text-gray-500 mt-2">Delete <span className="font-semibold">{editingLocation.locationName}</span>?</p>
                <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  All year records and history will be permanently deleted.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleDeleteLocation} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyPriceHistory