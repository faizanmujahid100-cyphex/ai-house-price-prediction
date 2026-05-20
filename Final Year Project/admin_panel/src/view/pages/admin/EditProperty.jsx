import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/AdminNavbar'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:7860'

const LAHORE_AREAS = [
  'DHA Phase 1','DHA Phase 2','DHA Phase 3','DHA Phase 4','DHA Phase 5',
  'DHA Phase 6','DHA Phase 7','DHA Phase 8','Bahria Town','Bahria Orchard',
  'Johar Town','Gulberg','Model Town','Faisal Town','Garden Town',
  'Wapda Town','Cantt','Iqbal Town','Allama Iqbal Town','Township',
]

const EditProperty = () => {
  const navigate = useNavigate()
  const { id }   = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading]         = useState(true)
  const [saving,  setSaving]          = useState(false)
  const [msg,     setMsg]             = useState(null)

  const [formData, setFormData] = useState({
    title: '', area: '', marla: '', bedrooms: '', bathrooms: '',
    kitchen: '1', yearBuilt: '', price: '', description: '',
    furnished: false, hasGarage: false, hasGarden: false,
    hasRoofAccess: false, status: 'available', image: '',
  })

  useEffect(() => {
    fetch(`${BACKEND_URL}/house/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(h => {
        if (h) setFormData({
          title:        h.title        || '',
          area:         h.area         || '',
          marla:        String(h.marla || ''),
          bedrooms:     String(h.bedrooms  || ''),
          bathrooms:    String(h.bathrooms || ''),
          kitchen:      String(h.kitchen   || 1),
          yearBuilt:    String(h.yearBuilt || ''),
          price:        String(h.price     || ''),
          description:  h.description  || '',
          furnished:    !!h.furnished,
          hasGarage:    !!h.hasGarage,
          hasGarden:    !!h.hasGarden,
          hasRoofAccess:!!h.hasRoofAccess,
          status:       h.status || 'available',
          image:        h.image  || '',
        })
      })
      .catch(() => setMsg({ type: 'error', text: 'Could not load property.' }))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)

    const marla = parseFloat(formData.marla) || 0
    const price = parseFloat(formData.price) || 0

    const payload = {
      title:         formData.title,
      area:          formData.area,
      marla,
      bedrooms:      parseInt(formData.bedrooms)  || 0,
      bathrooms:     parseInt(formData.bathrooms) || 0,
      kitchen:       parseInt(formData.kitchen)   || 1,
      yearBuilt:     parseInt(formData.yearBuilt) || new Date().getFullYear(),
      price,
      pricePerMarla: marla > 0 ? Math.round(price / marla) : 0,
      description:   formData.description,
      furnished:     formData.furnished,
      hasGarage:     formData.hasGarage,
      hasGarden:     formData.hasGarden,
      hasRoofAccess: formData.hasRoofAccess,
      status:        formData.status,
      image:         formData.image,
    }

    try {
      const res = await fetch(`${BACKEND_URL}/house/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setMsg({ type: 'success', text: 'Property updated successfully!' })
      setTimeout(() => navigate('/properties'), 1200)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-4 lg:p-8 max-w-3xl">

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Property</h1>
            <p className="text-sm text-gray-500 mt-1">Update listing details</p>
          </div>

          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select name="area" value={formData.area} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Area</option>
                    {LAHORE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size (Marla)</label>
                  <select name="marla" value={formData.marla} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    {[3,4,5,6,7,8,10,12,15,20].map(m => <option key={m} value={m}>{m} Marla</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'bedrooms', label: 'Bedrooms', opts: [1,2,3,4,5,6,7,8] },
                  { name: 'bathrooms',label: 'Bathrooms',opts: [1,2,3,4,5,6,7,8] },
                  { name: 'kitchen',  label: 'Kitchens', opts: [1,2,3]           },
                ].map(({ name, label, opts }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <select name={name} value={formData[name]} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select</option>
                      {opts.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                  <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange}
                    placeholder="2020" min="2000" max="2026"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {[
                  { name: 'furnished',     label: 'Furnished'    },
                  { name: 'hasGarage',     label: 'Garage'       },
                  { name: 'hasGarden',     label: 'Garden/Lawn'  },
                  { name: 'hasRoofAccess', label: 'Roof Access'  },
                ].map(({ name, label }) => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Property Image</h2>
              <input type="url" name="image" value={formData.image} onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg border"
                  onError={(e) => { e.target.style.display = 'none' }} />
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => navigate('/properties')}
                className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProperty
