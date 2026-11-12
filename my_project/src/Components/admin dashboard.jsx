import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearAuthSession, getAuthToken, setAuthSession } from "../utils/api";

const API_BASE = "http://localhost:5002/api";

// Fallback products if backend is starting
const INITIAL_ADMIN_PRODUCTS = [
  {
    _id: "prod-1",
    name: "Casio FX-991CW Scientific Calculator",
    description: "Advanced engineering calculator with solar + battery backup, suitable for all semester exams.",
    price: 1250,
    category: "Electronics",
    stock: 15,
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"
  },
  {
    _id: "prod-2",
    name: "Campus Waterproof Laptop Backpack",
    description: "Durable 25L backpack with 15.6 inch padded laptop compartment and water bottle holder.",
    price: 899,
    category: "Bags & Gear",
    stock: 20,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
  },
  {
    _id: "prod-3",
    name: "Engineering Drawing & Drafting Kit",
    description: "Complete mini-drafter, compass, set squares, and scale ruler set for lab work.",
    price: 450,
    category: "Stationery",
    stock: 30,
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80"
  },
  {
    _id: "prod-4",
    name: "Official StudentMart Campus Hoodie",
    description: "Premium fleece pullover college hoodie with embroidered student crest.",
    price: 999,
    category: "Apparel",
    stock: 25,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80"
  }
];

function formatOrderDateTime(dateStr) {
  if (!dateStr) return "Recently";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "Recently";
  }
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => getCurrentUser());

  // Active navigation tab: 'manage-products' | 'add-product' | 'manage-orders' | 'profile'
  const [activeTab, setActiveTab] = useState("manage-products");

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Add Product form state
  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Stationery",
    customCategory: "",
    image: "",
    stock: 10
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Edit Product Modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: 0
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  // Notification banners
  const [banner, setBanner] = useState({ type: "", message: "" });

  const showBanner = (type, message) => {
    setBanner({ type, message });
    setTimeout(() => {
      setBanner({ type: "", message: "" });
    }, 4500);
  };

  // Auth verification
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "admin") {
      navigate("/customer/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data && data.length > 0 ? data : INITIAL_ADMIN_PRODUCTS);
      } else {
        setProducts(INITIAL_ADMIN_PRODUCTS);
      }
    } catch {
      setProducts(INITIAL_ADMIN_PRODUCTS);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch All Orders
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        const local = JSON.parse(localStorage.getItem("studentmartAllOrders") || "[]");
        if (local.length > 0) {
          setOrders(local);
        } else {
          setOrders([
            {
              _id: "ORD-882314",
              customerName: "Aarav Sharma",
              customerEmail: "student@gmail.com",
              pickupLocation: "Main Student Center",
              status: "Pending",
              totalAmount: 1250,
              createdAt: new Date().toISOString(),
              items: [
                {
                  name: "Casio FX-991CW Scientific Calculator",
                  quantity: 1,
                  price: 1250
                }
              ]
            },
            {
              _id: "ORD-943102",
              customerName: "Priya Nair",
              customerEmail: "priya.nair@college.edu",
              pickupLocation: "Central Library Desk",
              status: "Ready for Pickup",
              totalAmount: 450,
              createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
              items: [
                {
                  name: "Engineering Drawing & Drafting Kit",
                  quantity: 1,
                  price: 450
                }
              ]
            }
          ]);
        }
      }
    } catch {
      const local = JSON.parse(localStorage.getItem("studentmartAllOrders") || "[]");
      setOrders(local.length > 0 ? local : []);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "manage-orders") {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  // Handle Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.description || !addForm.price) {
      showBanner("error", "Please fill in all required fields.");
      return;
    }

    setSubmittingProduct(true);
    const token = getAuthToken();
    const finalCategory =
      addForm.category === "Other"
        ? addForm.customCategory || "General"
        : addForm.category;

    try {
      const payload = {
        name: addForm.name.trim(),
        description: addForm.description.trim(),
        price: Number(addForm.price),
        category: finalCategory.trim(),
        image: addForm.image.trim(),
        stock: Number(addForm.stock) || 0
      };

      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.product) {
        setProducts([data.product, ...products]);
        showBanner("success", `Product "${data.product.name}" published successfully!`);
      } else {
        const mockProd = {
          _id: "prod-" + Date.now(),
          ...payload
        };
        setProducts([mockProd, ...products]);
        showBanner("success", `Product "${mockProd.name}" added successfully (Local mode)!`);
      }

      setAddForm({
        name: "",
        description: "",
        price: "",
        category: "Stationery",
        customCategory: "",
        image: "",
        stock: 10
      });
      setActiveTab("manage-products");
    } catch (err) {
      showBanner("error", "Failed to add product: " + err.message);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Open Edit Product Modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image || "",
      stock: product.stock !== undefined ? product.stock : 0
    });
  };

  // Save Edit Product
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);

    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/products/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(
          products.map((p) => (p._id === editingProduct._id ? data.product : p))
        );
        showBanner("success", "Product updated successfully!");
      } else {
        setProducts(
          products.map((p) =>
            p._id === editingProduct._id ? { ...p, ...editForm } : p
          )
        );
        showBanner("success", "Product updated (Local mode)!");
      }
      setEditingProduct(null);
    } catch {
      setProducts(
        products.map((p) =>
          p._id === editingProduct._id ? { ...p, ...editForm } : p
        )
      );
      showBanner("success", "Product updated (Saved locally)!");
      setEditingProduct(null);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, productName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${productName}" from the student store?`
    );
    if (!confirmDelete) return;

    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProducts(products.filter((p) => p._id !== productId));
        showBanner("success", `Product "${productName}" deleted successfully!`);
      } else {
        setProducts(products.filter((p) => p._id !== productId));
        showBanner("success", `Product "${productName}" deleted (Local mode)!`);
      }
    } catch {
      setProducts(products.filter((p) => p._id !== productId));
      showBanner("success", `Product "${productName}" deleted (Local mode)!`);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(
          orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        showBanner("success", `Order status updated to "${newStatus}"!`);
      } else {
        setOrders(
          orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        showBanner("success", `Order status updated to "${newStatus}" (Local mode)!`);
      }
    } catch {
      setOrders(
        orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      showBanner("success", `Order status updated to "${newStatus}" (Local mode)!`);
    }
  };

  // Developer Helper: Switch Role to Customer for Testing
  const handleDevRoleSwitch = () => {
    if (!user) return;
    const customerUser = {
      ...user,
      role: "customer"
    };
    setAuthSession(getAuthToken(), customerUser);
    showBanner("success", "Switched session to Customer role. Redirecting...");
    setTimeout(() => {
      navigate("/customer/dashboard", { replace: true });
    }, 500);
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" ||
      p.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "All") return true;
    return o.status === orderStatusFilter;
  });

  const allCategories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean))
  ];

  return (
    <div className="portal-layout">
      {/* =========================================
          ADMIN SIDEBAR NAVIGATION
          ========================================= */}
      <aside className="portal-sidebar admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge admin-badge-icon">🛡️</div>
          <div>
            <h3>StudentMart</h3>
            <span className="portal-role-tag admin-tag">Admin Portal</span>
          </div>
        </div>

        <div className="sidebar-user-preview">
          <div className="user-avatar-sm admin-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="user-preview-text">
            <strong>{user?.name || "Administrator"}</strong>
            <small>Campus Store Admin</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-tab-btn ${activeTab === "manage-products" ? "active" : ""}`}
            onClick={() => setActiveTab("manage-products")}
          >
            <span className="tab-icon">📋</span>
            <span>Manage Products</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "add-product" ? "active" : ""}`}
            onClick={() => setActiveTab("add-product")}
          >
            <span className="tab-icon">➕</span>
            <span>Add Products</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "manage-orders" ? "active" : ""}`}
            onClick={() => setActiveTab("manage-orders")}
          >
            <span className="tab-icon">📦</span>
            <span>Manage Orders</span>
            {orders.filter((o) => o.status === "Pending").length > 0 && (
              <span className="cart-counter-pill alert-pill">
                {orders.filter((o) => o.status === "Pending").length}
              </span>
            )}
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="tab-icon">👤</span>
            <span>Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* =========================================
          MAIN ADMIN CONTENT AREA
          ========================================= */}
      <main className="portal-main">
        {/* Topbar */}
        <header className="portal-topbar">
          <div className="topbar-title">
            <h2>
              {activeTab === "manage-products" && "Product Catalog Management"}
              {activeTab === "add-product" && "Add New Campus Product"}
              {activeTab === "manage-orders" && "Campus Orders Management"}
              {activeTab === "profile" && "Administrator Profile"}
            </h2>
            <p>
              {activeTab === "manage-products" && "View, edit inventory, update prices, or remove products"}
              {activeTab === "add-product" && "Publish new textbooks, kits, and supplies to the Student Store"}
              {activeTab === "manage-orders" && "Fulfill student campus orders and update pickup availability"}
              {activeTab === "profile" && "Administrative permissions, role verification and system tools"}
            </p>
          </div>

          <div className="topbar-actions">
            <span className="role-indicator admin-badge">
              🛡️ Role: Administrator
            </span>
          </div>
        </header>

        {/* Notifications */}
        {banner.message && (
          <div
            className={`portal-banner ${
              banner.type === "error" ? "error-banner" : "success-banner"
            }`}
          >
            {banner.type === "error" ? "⚠️ " : "✅ "}
            {banner.message}
            <button onClick={() => setBanner({ type: "", message: "" })}>✕</button>
          </div>
        )}

        {/* -----------------------------------------
            TAB 1: MANAGE PRODUCTS
            ----------------------------------------- */}
        {activeTab === "manage-products" && (
          <section className="portal-view">
            {/* Quick Metrics */}
            <div className="metrics-row">
              <div className="metric-box">
                <span className="metric-icon">📦</span>
                <div>
                  <strong>{products.length}</strong>
                  <p>Total Products</p>
                </div>
              </div>

              <div className="metric-box">
                <span className="metric-icon">⚠️</span>
                <div>
                  <strong>
                    {products.filter((p) => (p.stock || 0) <= 5).length}
                  </strong>
                  <p>Low Stock Items</p>
                </div>
              </div>

              <div className="metric-box">
                <span className="metric-icon">🏷️</span>
                <div>
                  <strong>
                    {allCategories.filter((c) => c !== "All").length}
                  </strong>
                  <p>Categories</p>
                </div>
              </div>

              <div className="metric-box">
                <button
                  className="primary-button compact-btn"
                  onClick={() => setActiveTab("add-product")}
                >
                  + Add New Product
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="store-filters-bar">
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Filter products by title..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              <div className="filter-selects">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            {loadingProducts ? (
              <div className="portal-loading">Loading catalog...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-icon">📦</div>
                <h3>No products found</h3>
                <p>Try a different keyword or publish a new product.</p>
                <button
                  className="primary-button inline-btn"
                  onClick={() => setActiveTab("add-product")}
                >
                  + Add Product
                </button>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="table-product-cell">
                            <div className="cell-img-box">
                              {p.image ? (
                                <img src={p.image} alt={p.name} />
                              ) : (
                                <span>📦</span>
                              )}
                            </div>
                            <div>
                              <strong>{p.name}</strong>
                              <p className="cell-sub">{p.description}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-pill">{p.category}</span>
                        </td>
                        <td>
                          <strong>₹{Number(p.price).toFixed(2)}</strong>
                        </td>
                        <td>
                          <span
                            className={`stock-pill ${
                              (p.stock || 0) <= 0
                                ? "stock-out"
                                : (p.stock || 0) <= 5
                                ? "stock-low"
                                : "stock-ok"
                            }`}
                          >
                            {(p.stock || 0) <= 0
                              ? "Out of Stock"
                              : `${p.stock} units`}
                          </span>
                        </td>
                        <td>
                          <div className="cell-actions-right">
                            <button
                              className="edit-action-btn"
                              onClick={() => openEditModal(p)}
                              title="Edit product"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="delete-action-btn"
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              title="Delete product"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* -----------------------------------------
            TAB 2: ADD PRODUCT
            ----------------------------------------- */}
        {activeTab === "add-product" && (
          <section className="portal-view">
            <div className="admin-form-container">
              <div className="form-card-panel">
                <h3>Publish New Product to Store</h3>
                <p className="form-lead-text">
                  Provide accurate details for students. Newly added products
                  immediately appear in the student store.
                </p>

                <form onSubmit={handleAddProduct}>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Casio Scientific Calculator FX-991CW"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      rows={3}
                      placeholder="Provide product specs, features, condition, or semester lab requirements..."
                      value={addForm.description}
                      onChange={(e) =>
                        setAddForm({ ...addForm, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 850"
                        value={addForm.price}
                        onChange={(e) =>
                          setAddForm({ ...addForm, price: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Initial Stock (Units) *</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={addForm.stock}
                        onChange={(e) =>
                          setAddForm({ ...addForm, stock: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={addForm.category}
                        onChange={(e) =>
                          setAddForm({ ...addForm, category: e.target.value })
                        }
                      >
                        <option value="Stationery">Stationery</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Bags & Gear">Bags & Gear</option>
                        <option value="Apparel">Apparel</option>
                        <option value="Textbooks">Textbooks</option>
                        <option value="Lab Equipment">Lab Equipment</option>
                        <option value="Other">Other (Custom)</option>
                      </select>
                    </div>

                    {addForm.category === "Other" && (
                      <div className="form-group">
                        <label>Custom Category Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sports Equipment"
                          value={addForm.customCategory}
                          onChange={(e) =>
                            setAddForm({
                              ...addForm,
                              customCategory: e.target.value
                            })
                          }
                          required
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={addForm.image}
                        onChange={(e) =>
                          setAddForm({ ...addForm, image: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-action-buttons">
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={submittingProduct}
                    >
                      {submittingProduct
                        ? "Publishing..."
                        : "Publish to Student Store"}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setActiveTab("manage-products")}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview Panel */}
              <div className="preview-panel">
                <h4>Live Product Card Preview</h4>
                <div className="store-product-card preview-card">
                  <div className="card-image-box">
                    {addForm.image ? (
                      <img src={addForm.image} alt="Preview" />
                    ) : (
                      <div className="image-fallback">📦</div>
                    )}
                    <span className="category-pill">
                      {addForm.category === "Other"
                        ? addForm.customCategory || "Category"
                        : addForm.category}
                    </span>
                  </div>

                  <div className="card-body">
                    <h4>{addForm.name || "Product Title Goes Here"}</h4>
                    <p className="card-desc">
                      {addForm.description ||
                        "Product description and details will appear here as you type."}
                    </p>
                    <div className="stock-status-line">
                      <span className="in-stock-tag">
                        ✓ {addForm.stock} units available
                      </span>
                    </div>
                    <div className="card-footer-action">
                      <div className="price-tag">
                        ₹{Number(addForm.price || 0).toFixed(2)}
                      </div>
                      <span className="preview-tag">Customer View</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* -----------------------------------------
            TAB 3: MANAGE ORDERS
            ----------------------------------------- */}
        {activeTab === "manage-orders" && (
          <section className="portal-view">
            {/* Orders Summary Cards */}
            <div className="metrics-row">
              <div className="metric-box">
                <span className="metric-icon">📑</span>
                <div>
                  <strong>{orders.length}</strong>
                  <p>Total Orders</p>
                </div>
              </div>

              <div className="metric-box">
                <span className="metric-icon">⏳</span>
                <div>
                  <strong>
                    {orders.filter((o) => o.status === "Pending").length}
                  </strong>
                  <p>Pending Orders</p>
                </div>
              </div>

              <div className="metric-box">
                <span className="metric-icon">📦</span>
                <div>
                  <strong>
                    {
                      orders.filter((o) => o.status === "Ready for Pickup")
                        .length
                    }
                  </strong>
                  <p>Ready for Pickup</p>
                </div>
              </div>

              <div className="metric-box">
                <span className="metric-icon">✅</span>
                <div>
                  <strong>
                    {orders.filter((o) => o.status === "Completed").length}
                  </strong>
                  <p>Completed Orders</p>
                </div>
              </div>
            </div>

            {/* Orders Filter */}
            <div className="store-filters-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <strong>Filter by Status:</strong>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button
                className="secondary-button compact-btn"
                onClick={fetchOrders}
              >
                🔄 Refresh Orders
              </button>
            </div>

            {/* Orders List */}
            {loadingOrders ? (
              <div className="portal-loading">Loading campus orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-icon">📑</div>
                <h3>No Orders Found</h3>
                <p>No student orders match the selected filter.</p>
              </div>
            ) : (
              <div className="orders-container">
                {filteredOrders.map((ord) => {
                  const statusClass =
                    ord.status === "Completed"
                      ? "status-completed"
                      : ord.status === "Ready for Pickup"
                      ? "status-ready"
                      : ord.status === "Cancelled"
                      ? "status-cancelled"
                      : "status-pending";

                  const orderId =
                    ord._id?.length > 10 ? ord._id.slice(-6).toUpperCase() : ord._id;

                  return (
                    <div className="order-card admin-order-card" key={ord._id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-id-label">Order #{orderId}</span>
                          <span className="order-date">
                            Ordered: {formatOrderDateTime(ord.createdAt)}
                          </span>
                        </div>

                        <div className="admin-status-control">
                          <label>Order Status:</label>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord._id, e.target.value)
                            }
                            className={`status-select ${statusClass}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Details Row */}
                      <div className="admin-order-customer-banner">
                        <span>
                          👤 <strong>Customer:</strong> {ord.customerName || "Student"} (
                          {ord.customerEmail || "N/A"})
                        </span>
                        <span>
                          📍 <strong>Pickup:</strong> {ord.pickupLocation}
                        </span>
                        {ord.notes && (
                          <span className="order-note">
                            📝 <em>Note:</em> {ord.notes}
                          </span>
                        )}
                      </div>

                      {/* Items */}
                      <div className="order-items-table">
                        {ord.items &&
                          ord.items.map((it, idx) => (
                            <div className="order-item-line" key={idx}>
                              <span>
                                {it.name} <small>× {it.quantity}</small>
                              </span>
                              <span>
                                ₹{(Number(it.price) * it.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                      </div>

                      <div className="order-card-footer">
                        <span>Total Order Value:</span>
                        <strong className="order-grand-total">
                          ₹{Number(ord.totalAmount).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* -----------------------------------------
            TAB 4: ADMIN PROFILE
            ----------------------------------------- */}
        {activeTab === "profile" && (
          <section className="portal-view">
            <div className="profile-card-modern admin-profile-card">
              <div className="profile-banner-top admin-banner">
                <div className="profile-avatar-large admin-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <h2>{user?.name || "Campus Administrator"}</h2>
                  <span className="profile-role-badge admin-badge">
                    Administrator
                  </span>
                </div>
              </div>

              <div className="profile-info-grid">
                <div className="profile-field-box">
                  <label>Full Name</label>
                  <p>{user?.name}</p>
                </div>

                <div className="profile-field-box">
                  <label>Admin Email</label>
                  <p>{user?.email}</p>
                </div>

                <div className="profile-field-box">
                  <label>Role</label>
                  <p>System Administrator / Store Manager</p>
                </div>

                <div className="profile-field-box">
                  <label>Admin Privileges</label>
                  <p>Create/Edit/Delete Products, Manage All Campus Orders</p>
                </div>
              </div>

              {/* Developer Helper Box */}
              <div className="dev-helper-box">
                <h4>🛠️ Developer Testing Helper</h4>
                <p>
                  Need to test the customer shopping experience? Click below to
                  temporarily switch your active session role to "Customer".
                </p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleDevRoleSwitch}
                >
                  🔄 Switch Session to Customer Dashboard
                </button>
              </div>

              <div className="profile-action-row">
                <button
                  className="primary-button inline-btn"
                  onClick={() => setActiveTab("manage-products")}
                >
                  ← Back to Manage Products
                </button>
                <button
                  className="danger-button inline-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =========================================
          EDIT PRODUCT MODAL
          ========================================= */}
      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div
            className="product-modal-card edit-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setEditingProduct(null)}
            >
              ✕
            </button>

            <h3>Edit Product Details</h3>
            <p className="modal-lead">Update information for {editingProduct.name}</p>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock (Units)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={editForm.image}
                    onChange={(e) =>
                      setEditForm({ ...editForm, image: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-action-buttons">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
