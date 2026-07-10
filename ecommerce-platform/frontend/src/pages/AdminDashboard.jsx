import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: '',
  tags: '',
  stock: '',
  sku: '',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  function loadStats() {
    api.get('/admin/stats').then((res) => setStats(res.data));
  }

  function loadProducts() {
    api.get('/products?limit=50').then((res) => setProducts(res.data.products));
  }

  function loadOrders() {
    api.get('/admin/orders').then((res) => setOrders(res.data));
  }

  useEffect(() => {
    loadStats();
    loadProducts();
    loadOrders();
  }, []);

  async function handleProductSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (editingId) {
      await api.put(`/admin/products/${editingId}`, payload);
    } else {
      await api.post('/admin/products', payload);
    }

    setForm(emptyProduct);
    setEditingId(null);
    loadProducts();
    loadStats();
  }

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      tags: product.tags.join(', '),
      stock: product.stock,
      sku: product.sku || '',
    });
    setTab('products');
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/admin/products/${id}`);
    loadProducts();
    loadStats();
  }

  async function updateStock(id, stock) {
    await api.patch(`/admin/products/${id}/stock`, { stock: Number(stock) });
    loadProducts();
    loadStats();
  }

  async function updateOrderStatus(id, status) {
    await api.patch(`/admin/orders/${id}/status`, { status });
    loadOrders();
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin dashboard</h1>

      <div className="admin-tabs">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          Inventory
        </button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          Orders
        </button>
      </div>

      {tab === 'overview' && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.productCount}</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.orderCount}</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.userCount}</span>
            <span className="stat-label">Customers</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">${stats.totalRevenue.toFixed(2)}</span>
            <span className="stat-label">Revenue</span>
          </div>

          {stats.lowStock.length > 0 && (
            <div className="low-stock-alert">
              <h4>Low stock</h4>
              <ul>
                {stats.lowStock.map((p) => (
                  <li key={p._id}>
                    {p.name} &mdash; {p.stock} left
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="admin-products">
          <form className="product-form" onSubmit={handleProductSubmit}>
            <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
            <input
              placeholder="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="form-row">
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                type="number"
                placeholder="Stock"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <input
              placeholder="Category"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <div className="form-row">
              <button type="submit" className="btn-primary">
                {editingId ? 'Save changes' : 'Add product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyProduct);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      className="stock-input"
                      defaultValue={p.stock}
                      onBlur={(e) => updateStock(p._id, e.target.value)}
                    />
                  </td>
                  <td>
                    <button className="link-button" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="link-button danger" onClick={() => handleDelete(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o._id.slice(-6)}</td>
                <td>{o.user?.name}</td>
                <td>${o.total.toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)}>
                    {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
