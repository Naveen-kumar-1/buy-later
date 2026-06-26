import React, { useState, useEffect, useMemo } from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useTheme } from '../context/ThemeContext'
import {
  syncUserWithDB,
  fetchProductsFromDB,
  saveProductToDB,
  deleteProductFromDB
} from '../lib/api'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter, 
  Globe, 
  AlertTriangle, 
  Calendar, 
  X, 
  Clock, 
  ChevronDown, 
  Check, 
  Sun, 
  Moon,
  Sparkles,
  Info,
  ChevronRight,
  ChevronLeft,
  Archive,
  ShoppingCart,
  Loader2
} from 'lucide-react'

// Import all PNG assets
import ajioLogo from '../assets/ajio.png'
import amazonLogo from '../assets/amazon.png'
import flipkartLogo from '../assets/flipkart.png'
import meeshoLogo from '../assets/meesho.png'
import myntraLogo from '../assets/myntra.png'
import appLogo from '../assets/buy-later.png'

// Platform definitions mapping to downloaded assets
const PLATFORMS = {
  Amazon: { name: 'Amazon', logo: amazonLogo, border: 'hover:border-amber-500', activeLight: 'border-black bg-slate-50 text-black', activeDark: 'border-blue-500 bg-blue-500/5 text-white' },
  Flipkart: { name: 'Flipkart', logo: flipkartLogo, border: 'hover:border-blue-550', activeLight: 'border-black bg-slate-50 text-black', activeDark: 'border-blue-500 bg-blue-500/5 text-white' },
  Meesho: { name: 'Meesho', logo: meeshoLogo, border: 'hover:border-pink-500', activeLight: 'border-black bg-slate-50 text-black', activeDark: 'border-blue-500 bg-blue-500/5 text-white' },
  Myntra: { name: 'Myntra', logo: myntraLogo, border: 'hover:border-red-500', activeLight: 'border-black bg-slate-50 text-black', activeDark: 'border-blue-500 bg-blue-500/5 text-white' },
  Ajio: { name: 'Ajio', logo: ajioLogo, border: 'hover:border-teal-500', activeLight: 'border-black bg-slate-50 text-black', activeDark: 'border-blue-500 bg-blue-500/5 text-white' },
  Other: { name: 'Other', logo: null, border: 'hover:border-slate-500', activeLight: 'border-black bg-slate-50 text-black', activeDark: 'border-blue-500 bg-blue-500/5 text-white' }
}

const STATUSES = ['Saved', 'Planned', 'Ordered', 'Purchased']


const Home = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, isLoaded } = useUser()
  const [products, setProducts] = useState([])
  const [isSyncing, setIsSyncing] = useState(true)
  const [syncError, setSyncError] = useState(null)
  const [retryTrigger, setRetryTrigger] = useState(0)

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  
  // Form state fields
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState('Amazon')
  const [expectedDate, setExpectedDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  
  // Custom dropdowns
  const [activeStatusDropdown, setActiveStatusDropdown] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState(() => new Date())

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
  }

  const selectCalendarDay = (dateStr) => {
    setExpectedDate(dateStr)
    setIsCalendarOpen(false)
  }

  const daysArray = useMemo(() => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()
    const prevTotalDays = new Date(year, month, 0).getDate()

    const days = []

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevTotalDays - i
      const d = new Date(year, month - 1, prevDay)
      days.push({
        dayNum: prevDay,
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false
      })
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i)
      const localISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        dayNum: i,
        date: d,
        dateStr: localISO,
        isCurrentMonth: true
      })
    }

    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i)
      days.push({
        dayNum: i,
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false
      })
    }

    return days
  }, [calendarDate])

  // Sync user profile & fetch products from database
  useEffect(() => {
    if (!isLoaded || !user) return

    const syncAndLoad = async () => {
      try {
        setIsSyncing(true)
        setSyncError(null)

        // 1. Sync user data with the backend database
        await syncUserWithDB(
          user.id,
          user.primaryEmailAddress?.emailAddress,
          user.firstName,
          user.lastName
        )

        // 2. Fetch products from the database
        const data = await fetchProductsFromDB(user.id)
        if (data.success && data.products) {
          const mappedProducts = data.products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            url: p.link || '#',
            platform: p.platform || 'Other',
            expectedDate: p.orderDate ? p.orderDate.split('T')[0] : '',
            status: p.status,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
          }))
          setProducts(mappedProducts)
        }
      } catch (err) {
        console.error('Error in syncAndLoad:', err)
        setSyncError(err.message)
      } finally {
        setIsSyncing(false)
      }
    }

    syncAndLoad()
  }, [isLoaded, user, retryTrigger])

  const resetForm = () => {
    setName('')
    setPrice('')
    setUrl('')
    setPlatform('Amazon')
    setExpectedDate('')
    setIsEditMode(false)
    setEditingProductId(null)
    setIsSubmitting(false)
    setSubmitSuccess(null)
    setSubmitError(null)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!name || !price || !platform || !url || !user) return

    try {
      setIsSubmitting(true)
      setSubmitSuccess(null)
      setSubmitError(null)

      const data = await saveProductToDB({
        clerkUserId: user.id,
        name,
        price: Number(price),
        url: url || '#',
        platform,
        expectedDate: expectedDate || null,
        status: 'Saved'
      })

      if (data.success && data.product) {
        const savedProduct = {
          id: data.product.id,
          name: data.product.name,
          price: data.product.price,
          url: data.product.link || '#',
          platform: data.product.platform || 'Other',
          expectedDate: data.product.orderDate ? data.product.orderDate.split('T')[0] : '',
          status: data.product.status,
          createdAt: data.product.createdAt,
          updatedAt: data.product.updatedAt
        }

        setProducts((prev) => [savedProduct, ...prev])
        setSubmitSuccess('Product successfully added!')
        
        setTimeout(() => {
          setIsAddModalOpen(false)
          resetForm()
        }, 1500)
      }
    } catch (err) {
      console.error('Error adding product:', err)
      setSubmitError(err.message || 'Error saving product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = async (e) => {
    e.preventDefault()
    if (!name || !price || !platform || !url || !editingProductId || !user) return

    try {
      setIsSubmitting(true)
      setSubmitSuccess(null)
      setSubmitError(null)

      const data = await saveProductToDB({
        id: editingProductId,
        clerkUserId: user.id,
        name,
        price: Number(price),
        url: url || '#',
        platform,
        expectedDate: expectedDate || null
      })

      if (data.success && data.product) {
        const updatedProduct = {
          id: data.product.id,
          name: data.product.name,
          price: data.product.price,
          url: data.product.link || '#',
          platform: data.product.platform || 'Other',
          expectedDate: data.product.orderDate ? data.product.orderDate.split('T')[0] : '',
          status: data.product.status,
          createdAt: data.product.createdAt,
          updatedAt: data.product.updatedAt
        }

        setProducts((prev) => 
          prev.map((p) => p.id === editingProductId ? updatedProduct : p)
        )
        setSubmitSuccess('Product successfully updated!')

        setTimeout(() => {
          setIsAddModalOpen(false)
          resetForm()
        }, 1500)
      }
    } catch (err) {
      console.error('Error editing product:', err)
      setSubmitError(err.message || 'Error updating product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (product) => {
    setIsEditMode(true)
    setEditingProductId(product.id)
    setName(product.name)
    setPrice(product.price)
    setUrl(product.url)
    setPlatform(product.platform)
    setExpectedDate(product.expectedDate)
    setIsAddModalOpen(true)
  }

  const confirmDelete = (id) => {
    setDeleteConfirmationId(id)
  }

  const handleDeleteProduct = async () => {
    if (!deleteConfirmationId || !user) return

    try {
      await deleteProductFromDB(deleteConfirmationId, user.id)
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirmationId))
      setDeleteConfirmationId(null)
    } catch (err) {
      console.error('Error deleting product:', err)
      alert(`Error deleting product: ${err.message}`)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    if (!user || statusUpdatingId === id) return

    setStatusUpdatingId(id)
    setActiveStatusDropdown(null) // Close the dropdown immediately so user sees the status updating on the badge trigger

    try {
      const data = await saveProductToDB({
        id,
        clerkUserId: user.id,
        status: newStatus
      })

      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, status: newStatus, updatedAt: data.product.updatedAt }
              : p
          )
        )
      }
    } catch (err) {
      console.error('Error changing product status:', err)
      alert(`Error updating status: ${err.message}`)
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = products.length
    const ordered = products.filter((p) => p.status === 'Ordered').length
    const purchased = products.filter((p) => p.status === 'Purchased').length
    const pending = products.filter((p) => p.status === 'Saved' || p.status === 'Planned').length
    const totalValue = products.reduce((acc, p) => acc + p.price, 0)
    
    return { total, ordered, purchased, pending, totalValue }
  }, [products])

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.platform.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'All' || product.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [products, searchTerm, statusFilter])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateStr).toLocaleDateString('en-IN', options)
  }

  const getRelativeTime = (isoString) => {
    if (!isoString) return '-'
    const now = new Date()
    const updated = new Date(isoString)
    const diffMs = now - updated
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getStatusBadgeStyle = (status) => {
    if (theme === 'dark') {
      switch (status) {
        case 'Saved': return 'bg-slate-800 text-slate-300 border-slate-700'
        case 'Planned': return 'bg-amber-950/40 text-amber-300 border-amber-900/60'
        case 'Ordered': return 'bg-blue-950/40 text-blue-300 border-blue-900/60'
        case 'Purchased': return 'bg-emerald-950/40 text-emerald-355 border-emerald-900/60'
        default: return 'bg-slate-800 text-slate-400 border-slate-700'
      }
    } else {
      // Strict monochrome black-and-white concept in light theme
      switch (status) {
        case 'Saved': return 'bg-slate-100 text-slate-800 border-slate-200'
        case 'Planned': return 'bg-slate-200/80 text-slate-900 border-slate-350'
        case 'Ordered': return 'bg-neutral-850 text-gray-500 border-neutral-850'
        case 'Purchased': return 'bg-black text-white border-black font-bold'
        default: return 'bg-slate-100 text-slate-650 border-slate-200'
      }
    }
  }

  const getStatusStepIndex = (status) => {
    return STATUSES.indexOf(status)
  }

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-300 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase animate-pulse">
            Syncing user profile...
          </span>
        </div>
      </div>
    )
  }

  if (syncError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4 transition-colors duration-300">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-full flex items-center justify-center border border-red-100 dark:border-red-900/40 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-slate-950 dark:text-slate-200 text-sm">Database Connection Failed</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {syncError}
          </p>
        </div>
        <button
          onClick={() => setRetryTrigger((prev) => prev + 1)}
          className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm
            ${theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'bg-black hover:bg-slate-900 text-white'}`}
        >
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-300 selection:bg-slate-200 dark:selection:bg-slate-800 selection:text-black dark:selection:text-white">
      
      {/* Solid header with thin borders - Shopify Polaris concept */}
      <header className="relative z-10 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1 overflow-hidden shadow-sm">
              <img src={appLogo} alt="Buy Later Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-lg font-bold text-slate-950 dark:text-white tracking-tight">
              Buy Later
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-550 dark:text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content body */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200 dark:border-slate-900">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-semibold tracking-wide mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Smart Shopper Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white">
              Saved Products
            </h1>
            <p className="text-xs text-slate-555 dark:text-slate-400 mt-0.5 max-w-lg">
              Manage your future purchases, organize shopping carts, and keep tabs on target buy dates.
            </p>
            <div className="mt-2.5">
              <button
                onClick={() => setShowStats(!showStats)}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span>{showStats ? 'Hide Stats Summary' : 'Show Stats Summary'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showStats ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm group
              ${theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-black hover:bg-slate-900 text-white'}`}
          >
            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Stats Grid Section with smooth transition */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showStats ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Saved */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl shadow-sm relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-800">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${theme === 'dark' ? 'bg-indigo-650' : 'bg-black'}`} />
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">Total Saved</span>
                  <span className="text-xl font-black text-slate-950 dark:text-white block">{stats.total} Items</span>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-indigo-400 block mt-0.5">Value: {formatCurrency(stats.totalValue)}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-indigo-950/20 text-slate-800 dark:text-indigo-455">
                  <Archive className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Card 2: Pending */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl shadow-sm relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-800">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${theme === 'dark' ? 'bg-amber-500' : 'bg-slate-700'}`} />
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider block">Pending</span>
                  <span className="text-xl font-black text-slate-950 dark:text-white block">{stats.pending} Items</span>
                  <span className="text-[11px] text-slate-550 dark:text-slate-450 block">Wishlist & Planning</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-amber-950/20 text-slate-800 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Card 3: Ordered */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl shadow-sm relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-800">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-455'}`} />
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider block">Ordered</span>
                  <span className="text-xl font-black text-slate-950 dark:text-white block">{stats.ordered} Items</span>
                  <span className="text-[11px] text-slate-550 dark:text-slate-450 block">Ordered / Placed</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-blue-950/20 text-slate-800 dark:text-blue-400">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Card 4: Purchased */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl shadow-sm relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-800">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${theme === 'dark' ? 'bg-emerald-555' : 'bg-slate-300'}`} />
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider block">Purchased</span>
                  <span className="text-xl font-black text-slate-950 dark:text-white block">{stats.purchased} Items</span>
                  <span className="text-[11px] text-slate-550 dark:text-slate-450 block">Completed</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-emerald-950/20 text-slate-800 dark:text-emerald-450">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Toolbar - Search and Status Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl shadow-sm">
          
          <div className="relative w-full sm:max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none focus:ring-1 text-slate-900 dark:text-slate-100 placeholder-slate-450 transition-all
                ${theme === 'dark' 
                  ? 'border-slate-850 focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-slate-200 focus:ring-black focus:border-black'}`}
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider hidden md:inline">Filter:</span>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850 w-full sm:w-auto overflow-x-auto scrollbar-none whitespace-nowrap flex-nowrap">
              {['All', ...STATUSES].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center flex-1 sm:flex-initial whitespace-nowrap shrink-0
                    ${statusFilter === status 
                      ? theme === 'dark'
                        ? 'bg-slate-900 text-blue-400 shadow-sm border border-slate-800/40'
                        : 'bg-white text-black shadow-sm border border-slate-200/60'
                      : 'text-slate-550 dark:text-slate-400 hover:text-black dark:hover:text-white'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Saved Cart Cards Design */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl p-16 text-center space-y-4 shadow-sm transition-colors duration-300">
            <div className="w-11 h-11 bg-slate-50 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-950 dark:text-slate-200 text-sm">No items match filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {searchTerm || statusFilter !== 'All' 
                ? "Try adjusting your filter settings or search string to locate saved products."
                : "Your Buy Later cart has no items yet. Click Add Product to start tracking products."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const selectedPlatform = PLATFORMS[product.platform] || PLATFORMS.Other
              const logo = selectedPlatform.logo
              const currentStep = getStatusStepIndex(product.status)

              return (
                <div 
                  key={product.id}
                  className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl overflow-hidden shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300"
                >
                  {/* Card Header (Platform Store info & Status Badge) */}
                  <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-md bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-0.5 overflow-hidden shadow-inner">
                        {logo ? (
                          <img src={logo} alt={product.platform} className="w-5.5 h-5.5 object-contain" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-950 dark:text-slate-250 leading-tight">
                          {product.platform}
                        </span>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{getRelativeTime(product.updatedAt)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Badge trigger with dropdown inside */}
                    <div className="relative">
                      <button
                        disabled={statusUpdatingId === product.id}
                        onClick={() => {
                          if (statusUpdatingId !== product.id) {
                            setActiveStatusDropdown(activeStatusDropdown === product.id ? null : product.id)
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-extrabold border transition-all flex items-center space-x-1 shadow-sm ${getStatusBadgeStyle(product.status)} ${
                          statusUpdatingId === product.id ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <span>{product.status}</span>
                        {statusUpdatingId === product.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-current" />
                        ) : (
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        )}
                      </button>

                      {activeStatusDropdown === product.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => {
                              if (statusUpdatingId !== product.id) {
                                setActiveStatusDropdown(null)
                              }
                            }} 
                          />
                          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-xl z-40 py-1 divide-y divide-slate-100 dark:divide-slate-900 animate-in fade-in-50 slide-in-from-top-1">
                            {STATUSES.map((status) => (
                              <button
                                key={status}
                                disabled={statusUpdatingId === product.id}
                                onClick={() => {
                                  if (statusUpdatingId !== product.id) {
                                    handleStatusChange(product.id, status)
                                  }
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                                  statusUpdatingId === product.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                } ${
                                  product.status === status
                                    ? 'text-black dark:text-blue-400 bg-slate-50 dark:bg-blue-950/10 font-bold'
                                    : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-black dark:hover:text-white'
                                }`}
                              >
                                <span>{status}</span>
                                {product.status === status && <Check className="w-3 h-3 text-black dark:text-blue-400" />}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Body details of product card */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm text-slate-950 dark:text-slate-100 leading-snug line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <div className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                        {formatCurrency(product.price)}
                      </div>
                    </div>

                    {/* Progress indicators segment */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                        <span>Save</span>
                        <span>Plan</span>
                        <span>Order</span>
                        <span>Buy</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {STATUSES.map((_, idx) => {
                          const isCompleted = idx <= currentStep
                          return (
                            <div 
                              key={idx}
                              className={`h-full rounded-sm transition-all duration-300 ${
                                isCompleted 
                                  ? theme === 'dark' ? 'bg-blue-500' : 'bg-black'
                                  : 'bg-slate-200 dark:bg-slate-800'
                              }`} 
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Timeline buying details */}
                    <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100 dark:border-slate-850 text-slate-550 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 opacity-65" />
                        <span>Expected Order:</span>
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-350">{formatDate(product.expectedDate)}</span>
                    </div>

                  </div>

                  {/* Card actions bottom bar */}
                  <div className="px-4 py-3 bg-slate-50/40 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-850/80 flex items-center justify-between">
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-slate-450 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-950 rounded-md border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(product.id)}
                        className="p-1.5 text-slate-450 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-950 rounded-md border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Store redirect link - styling is black in light mode, blue in dark mode */}
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1 cursor-pointer
                        ${theme === 'dark' 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                          : 'bg-black hover:bg-slate-900 text-white'}`}
                    >
                      <span>Store</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500 transition-colors duration-305">
        <p>&copy; {new Date().getFullYear()} Buy Later. All rights reserved.</p>
      </footer>

      {/* ==================== ADD / EDIT PRODUCT MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => { if (!isSubmitting) { setIsAddModalOpen(false); resetForm(); } }}
          />
          
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-xl max-w-lg w-full p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200 transition-colors overflow-y-auto max-h-[90vh] sm:max-h-none">
            
            {/* Modal Title header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3.5">
              <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center space-x-2">
                <Plus className="w-4.5 h-4.5 text-slate-500" />
                <span>{isEditMode ? 'Edit Wishlist Item' : 'Add Product to Wishlist'}</span>
              </h2>
              <button 
                onClick={() => { if (!isSubmitting) { setIsAddModalOpen(false); resetForm(); } }}
                disabled={isSubmitting}
                className={`p-1 rounded-lg text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors ${isSubmitting ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal form items */}
            <form onSubmit={isEditMode ? handleEditProduct : handleAddProduct} className="space-y-4 pt-3.5">
              
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider block">Product Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mechanical Keyboard, iPad, running shoes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none focus:ring-1 text-slate-900 dark:text-slate-100 placeholder-slate-400
                    ${theme === 'dark' 
                      ? 'border-slate-850 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-slate-200 focus:ring-black focus:border-black'}`}
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider block">Price (INR) *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</div>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="e.g. 9999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full pl-7 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none focus:ring-1 text-slate-900 dark:text-slate-100 placeholder-slate-400
                      ${theme === 'dark' 
                        ? 'border-slate-850 focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-slate-200 focus:ring-black focus:border-black'}`}
                  />
                </div>
              </div>

              {/* Store URL link */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider block">Product URL *</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://example.com/item"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none focus:ring-1 text-slate-900 dark:text-slate-100 placeholder-slate-400
                    ${theme === 'dark' 
                      ? 'border-slate-850 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-slate-200 focus:ring-black focus:border-black'}`}
                />
              </div>

              {/* Store Brand selector grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider block">Store Platform *</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(PLATFORMS).map((item) => {
                    const isSelected = platform === item.name
                    const logo = item.logo
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setPlatform(item.name)}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? theme === 'dark' ? item.activeDark : item.activeLight
                            : 'border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-950'
                        }`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
                          {logo ? (
                            <img src={logo} alt={item.name} className="w-5.5 h-5.5 object-contain" />
                          ) : (
                            <Globe className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="text-[9px] font-bold tracking-wide">{item.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Expected Order Date */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider block">Expected Purchase Date</label>
                
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className={`w-full px-3 py-2 text-xs text-left font-medium border rounded-lg shadow-sm flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 transition-all cursor-pointer
                    ${theme === 'dark' 
                      ? 'border-slate-850 focus:ring-blue-500 focus:border-blue-500 text-slate-100' 
                      : 'border-slate-200 focus:ring-black focus:border-black text-slate-900'}`}
                >
                  <Calendar className="w-4 h-4 text-slate-450 shrink-0" />
                  <span className="flex-1">{expectedDate ? formatDate(expectedDate) : 'Pick a date'}</span>
                  {expectedDate && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpectedDate('');
                      }}
                      className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-black dark:hover:text-white"
                      title="Clear date"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                </button>

                {isCalendarOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsCalendarOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-1.5 p-3 w-[260px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-xl z-40 space-y-3 animate-in fade-in-50 slide-in-from-bottom-1 transition-colors duration-300">
                      
                      {/* Calendar Navigation Header */}
                      <div className="flex items-center justify-between text-xs font-bold text-slate-950 dark:text-slate-100">
                        <button
                          type="button"
                          onClick={prevMonth}
                          className="p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span>
                          {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          type="button"
                          onClick={nextMonth}
                          className="p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Days of Week Header */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-450 dark:text-slate-555 uppercase">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {daysArray.map((day, idx) => {
                          const isSelected = expectedDate === day.dateStr
                          const isToday = new Date().toDateString() === day.date.toDateString()

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectCalendarDay(day.dateStr)}
                              className={`w-7 h-7 text-[11px] rounded-md flex items-center justify-center transition-all cursor-pointer font-semibold
                                ${!day.isCurrentMonth 
                                  ? 'text-slate-350 dark:text-slate-800 hover:bg-transparent pointer-events-none opacity-40' 
                                  : isSelected
                                    ? theme === 'dark'
                                      ? 'bg-blue-650 text-white font-bold'
                                      : 'bg-black text-white font-bold'
                                    : isToday
                                      ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold'
                                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-750 dark:text-slate-300'
                                }`}
                            >
                              {day.dayNum}
                            </button>
                          )
                        })}
                      </div>

                    </div>
                  </>
                )}
              </div>

              {submitSuccess && (
                <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {submitError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-650 dark:text-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Action Buttons: Light mode button is black, dark mode button is blue */}
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  disabled={isSubmitting || !!submitSuccess}
                  onClick={() => { if (!isSubmitting) { setIsAddModalOpen(false); resetForm(); } }}
                  className={`px-4 py-2 text-xs font-bold border border-slate-250 dark:border-slate-850 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors
                    ${isSubmitting || submitSuccess ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!submitSuccess}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-sm
                    ${isSubmitting || submitSuccess ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                    ${theme === 'dark' 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-black hover:bg-slate-900 text-white'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : submitSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Done!</span>
                    </>
                  ) : (
                    <span>{isEditMode ? 'Save Changes' : 'Add to Cart'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity" 
            onClick={() => setDeleteConfirmationId(null)}
          />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200 transition-colors">
            
            <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-100 dark:border-red-900/40">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Remove item from cart?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal px-2">
                Are you sure you want to remove <span className="font-bold text-slate-950 dark:text-slate-200">"{products.find(p => p.id === deleteConfirmationId)?.name}"</span>? This will permanently delete it from your Buy Later wishlist.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold border border-slate-250 dark:border-slate-850 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-sm cursor-pointer text-center"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Home