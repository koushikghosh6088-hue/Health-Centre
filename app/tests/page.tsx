'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Test, ApiResponse, PaginatedResponse } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { 
  TestTube, 
  Clock, 
  Search, 
  Filter,
  ShoppingCart,
  Info,
  Heart,
  Brain,
  Activity
} from 'lucide-react'

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]) // Initialize as empty array
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    fetchTests()
  }, [searchTerm, selectedCategory])

  useEffect(() => {
    // Calculate total amount when selected tests change
    const total = (tests || [])
      .filter(test => selectedTests.includes(test.id))
      .reduce((sum, test) => sum + test.price, 0)
    setTotalAmount(total)
  }, [selectedTests, tests])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('limit', '50')

      const response = await fetch(`/api/tests?${params.toString()}`)
      const result: ApiResponse<PaginatedResponse<Test> & { categories: string[] }> = await response.json()

      if (result.success && result.data) {
        setTests(result.data.data || []) // Fallback to empty array
        setCategories(result.data.categories || [])
      } else {
        setTests([]) // Set empty array on failure
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
      setTests([]) // Set empty array on error
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const toggleTestSelection = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'blood tests':
        return <Activity className="h-5 w-5" />
      case 'imaging':
        return <Brain className="h-5 w-5" />
      case 'cardiac':
        return <Heart className="h-5 w-5" />
      default:
        return <TestTube className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'blood tests':
        return 'from-rose-50 to-rose-100 text-rose-700 border-rose-200'
      case 'imaging':
        return 'from-violet-50 to-violet-100 text-violet-700 border-violet-200'
      case 'cardiac':
        return 'from-pink-50 to-rose-100 text-pink-700 border-pink-200'
      case 'health packages':
        return 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200'
      default:
        return 'from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Modern Header */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Explore Our <span className="text-gradient">Diagnostic Tests</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Comprehensive medical testing with accurate results and expert care.
          </p>
          {/* Selected Tests Summary */}
          {selectedTests.length > 0 && (
            <div className="modern-card p-6 mt-8 inline-block text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">
                  {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected
                </span>
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <Button asChild className="w-full btn-modern btn-gradient rounded-full">
                <Link href="/tests/book">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Book Selected Tests
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Filters */}
        <div className="modern-card p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tests by name or description..."
                className="modern-input w-full pl-12 pr-4 py-4 text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="modern-select w-full pl-12 pr-4 py-4 text-gray-700"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        {(!tests || tests.length === 0) ? (
          <div className="text-center py-16">
            <div className="modern-card p-12 max-w-md mx-auto">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.map((test) => (
              <Card 
                key={test.id} 
                className={`modern-card group cursor-pointer transition-all duration-300 ${
                  selectedTests.includes(test.id) 
                    ? 'ring-2 ring-indigo-500 scale-[1.01]'
                    : ''
                }`}
                onClick={() => toggleTestSelection(test.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        {test.category && (
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mr-2 border bg-gradient-to-r ${getCategoryColor(test.category)}`}>
                            {getCategoryIcon(test.category)}
                            <span className="ml-1">{test.category}</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-1 group-hover:text-indigo-600 transition-colors">{test.name}</CardTitle>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(test.price)}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => toggleTestSelection(test.id)}
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4 text-sm">
                    {test.description}
                  </CardDescription>

                  <div className="space-y-2 text-sm text-gray-600">
                    {test.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                        Duration: {test.duration} minutes
                      </div>
                    )}
                    
                    {test.preparation && (
                      <div className="flex items-start">
                        <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-500" />
                        <span>Preparation: {test.preparation}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-5 border-t flex space-x-2">
                    <Button 
                      variant={selectedTests.includes(test.id) ? "default" : "outline"} 
                      className="flex-1 btn-modern rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTestSelection(test.id)
                      }}
                    >
                      {selectedTests.includes(test.id) ? 'Selected' : 'Select Test'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="btn-modern"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle view details - could open a modal or navigate
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Book Section */}
        {selectedTests.length === 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
            <TestTube className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Need help choosing tests?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our healthcare experts can recommend the right tests based on your symptoms and health concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contact">
                  Consult Our Experts
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/tests/packages">
                  View Health Packages
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}