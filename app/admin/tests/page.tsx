'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TestTube,
  DollarSign,
  Clock,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'

interface Test {
  id: string
  name: string
  description: string
  price: number
  category: string
  duration: number
  preparation: string
  isActive: boolean
  createdAt: string
}

export default function AdminTests() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    duration: 0,
    preparation: ''
  })

  const categories = [
    'Blood Tests',
    'Imaging',
    'Cardiac',
    'Health Packages',
    'Other'
  ]

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests')
      const result = await response.json()
      
      if (result.success) {
        setTests(result.data.data)
      } else {
        toast.error('Failed to fetch tests')
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
      toast.error('Failed to fetch tests')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingTest ? `/api/tests/${editingTest.id}` : '/api/tests'
      const method = editingTest ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(editingTest ? 'Test updated successfully' : 'Test added successfully')
        setShowAddForm(false)
        setEditingTest(null)
        setFormData({
          name: '',
          description: '',
          price: 0,
          category: '',
          duration: 0,
          preparation: ''
        })
        fetchTests()
      } else {
        toast.error(result.error || 'Failed to save test')
      }
    } catch (error) {
      console.error('Error saving test:', error)
      toast.error('Failed to save test')
    }
  }

  const handleEdit = (test: Test) => {
    setEditingTest(test)
    setFormData({
      name: test.name,
      description: test.description,
      price: test.price,
      category: test.category,
      duration: test.duration,
      preparation: test.preparation
    })
    setShowAddForm(true)
  }

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return

    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Test deleted successfully')
        fetchTests()
      } else {
        toast.error(result.error || 'Failed to delete test')
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      toast.error('Failed to delete test')
    }
  }

  const filteredTests = tests?.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests Management</h1>
          <p className="text-gray-600">Manage diagnostic tests and their information</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Test
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingTest ? 'Edit Test' : 'Add New Test'}</CardTitle>
            <CardDescription>
              {editingTest ? 'Update test information' : 'Enter test details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Instructions
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  value={formData.preparation}
                  onChange={(e) => setFormData({...formData, preparation: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingTest ? 'Update Test' : 'Add Test'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingTest(null)
                    setFormData({
                      name: '',
                      description: '',
                      price: 0,
                      category: '',
                      duration: 0,
                      preparation: ''
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(test)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(test.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-blue-600 font-medium">
                {test.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  ₹{test.price}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {test.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="h-4 w-4" />
                  {test.category}
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {test.description}
                </p>
                {test.preparation && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Preparation:</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {test.preparation}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first test'}
          </p>
        </div>
      )}
    </div>
  )
}
