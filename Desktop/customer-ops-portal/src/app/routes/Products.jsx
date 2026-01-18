import React, { useEffect, useState } from 'react'
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../lib/db/products'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await listProducts()
    setProducts(data)
    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setSku('')
    setPrice('')
    setCategory('')
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (product) => {
    setName(product.name || '')
    setSku(product.sku || '')
    setPrice(product.price?.toString() || '')
    setCategory(product.category || '')
    setEditing(product)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    const data = { name: name.trim(), sku, price: parseFloat(price) || 0, category }
    if (editing) {
      await updateProduct(editing.id, data)
    } else {
      await createProduct(data)
    }
    resetForm()
    await loadData()
    setBusy(false)
  }

  const handleToggle = async (product) => {
    setBusy(true)
    await updateProduct(product.id, { active: !product.active })
    await loadData()
    setBusy(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    setBusy(true)
    await deleteProduct(id)
    await loadData()
    setBusy(false)
  }

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-4">Catalog</p>
          <h1 className="text-4xl font-extralight tracking-tight">Products</h1>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
          Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-neutral-100 p-8 mb-8">
          <p className="text-2xs tracking-widest text-neutral-400 uppercase mb-6">
            {editing ? 'Edit Product' : 'New Product'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-2xs font-medium tracking-widest text-neutral-500 uppercase mb-3">Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-elite" />
              </div>
              <div>
                <label className="block text-2xs font-medium tracking-widest text-neutral-500 uppercase mb-3">SKU</label>
                <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="input-elite" />
              </div>
              <div>
                <label className="block text-2xs font-medium tracking-widest text-neutral-500 uppercase mb-3">Price</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input-elite" />
              </div>
              <div>
                <label className="block text-2xs font-medium tracking-widest text-neutral-500 uppercase mb-3">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input-elite" />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" disabled={busy} className="btn-primary">{editing ? 'Save' : 'Add'}</button>
              <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-elite max-w-md"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-4 h-4 border border-neutral-900 border-t-transparent animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-neutral-200">
          <p className="text-sm text-neutral-400">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filtered.map(product => (
            <div key={product.id} className={`border p-6 ${product.active === false ? 'border-neutral-100 opacity-50' : 'border-neutral-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                  {product.sku && <p className="text-xs text-neutral-400 mt-1">SKU: {product.sku}</p>}
                </div>
                {product.active === false && (
                  <span className="badge bg-neutral-100 text-neutral-400">Inactive</span>
                )}
              </div>
              <p className="text-lg font-light mt-4">${product.price?.toFixed(2) || '0.00'}</p>
              {product.category && <p className="text-2xs tracking-widest text-neutral-400 uppercase mt-2">{product.category}</p>}
              <div className="flex gap-4 mt-6 pt-4 border-t border-neutral-100">
                <button onClick={() => handleToggle(product)} className="text-xs text-neutral-400 hover:text-neutral-900">
                  {product.active === false ? 'Activate' : 'Deactivate'}
                </button>
                <button onClick={() => openEdit(product)} className="text-xs text-neutral-400 hover:text-neutral-900">Edit</button>
                <button onClick={() => handleDelete(product.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
