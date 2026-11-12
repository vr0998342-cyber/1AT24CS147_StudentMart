import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearAuthSession, getAuthToken } from "../utils/api";

const API_BASE = "http://localhost:5002/api";

// Fallback sample products if backend is not yet started
const FALLBACK_PRODUCTS = [
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
  },
  {
    _id: "prod-5",
    name: "Spiral Ruled Project Notebooks (Set of 4)",
    description: "200-page single ruled spiral notebooks with thick 70gsm bleed-proof paper.",
    price: 240,
    category: "Stationery",
    stock: 50,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
  },
  {
    _id: "prod-6",
    name: "USB-C 7-in-1 Multiport Hub Adapter",
    description: "HDMI 4K, 3x USB 3.0, SD Card Reader, and 100W Power Delivery pass-through.",
    price: 1100,
    category: "Electronics",
    stock: 12,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
  }
];

function formatDate(dateStr) {
  if (!dateStr) return "Recently";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "Recently";
  }
}

function CustomerDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => getCurrentUser());

  // Active navigation tab: 'store' | 'cart' | 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState("store");

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceSort, setPriceSort] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Shopping cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("studentmartCart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("Main Student Center");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Check login
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem("studentmartCart", JSON.stringify(cart));
  }, [cart]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (priceSort) params.set("sort", priceSort);

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data && data.length > 0 ? data : FALLBACK_PRODUCTS);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch {
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoadingProducts(false);
    }
  }, [searchTerm, categoryFilter, priceSort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch my orders
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        const local = JSON.parse(localStorage.getItem("studentmartMyOrders") || "[]");
        setOrders(local);
      }
    } catch {
      const local = JSON.parse(localStorage.getItem("studentmartMyOrders") || "[]");
      setOrders(local);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  // Cart actions
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Place Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    setOrderMessage("");

    const token = getAuthToken();

    try {
      const payload = {
        items: cart.map((item) => ({
          product: item._id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          image: item.image || ""
        })),
        pickupLocation,
        notes: orderNotes
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setCart([]);
        localStorage.removeItem("studentmartCart");
        setOrderMessage("Order placed successfully! Pickup code generated.");
        setActiveTab("orders");
        fetchOrders();
      } else {
        const mockOrder = {
          _id: "ORD-" + Date.now().toString().slice(-6),
          items: cart,
          totalAmount: cartTotal,
          pickupLocation,
          status: "Pending",
          createdAt: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem("studentmartMyOrders") || "[]");
        const updated = [mockOrder, ...existing];
        localStorage.setItem("studentmartMyOrders", JSON.stringify(updated));
        setOrders(updated);
        setCart([]);
        localStorage.removeItem("studentmartCart");
        setOrderMessage("Order placed successfully! (Offline mode)");
        setActiveTab("orders");
      }
    } catch {
      const mockOrder = {
        _id: "ORD-" + Date.now().toString().slice(-6),
        items: cart,
        totalAmount: cartTotal,
        pickupLocation,
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem("studentmartMyOrders") || "[]");
      const updated = [mockOrder, ...existing];
      localStorage.setItem("studentmartMyOrders", JSON.stringify(updated));
      setOrders(updated);
      setCart([]);
      localStorage.removeItem("studentmartCart");
      setOrderMessage("Order placed successfully! (Saved locally)");
      setActiveTab("orders");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean))
  ];

  return (
    <div className="portal-layout">
      {/* =========================================
          CUSTOMER SIDEBAR NAVIGATION
          ========================================= */}
      <aside className="portal-sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">🎓</div>
          <div>
            <h3>StudentMart</h3>
            <span className="portal-role-tag customer-tag">Customer Portal</span>
          </div>
        </div>

        <div className="sidebar-user-preview">
          <div className="user-avatar-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="user-preview-text">
            <strong>{user?.name || "Student User"}</strong>
            <small>{user?.course || "Student"}</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-tab-btn ${activeTab === "store" ? "active" : ""}`}
            onClick={() => setActiveTab("store")}
          >
            <span className="tab-icon">🛍️</span>
            <span>View Products</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => setActiveTab("cart")}
          >
            <span className="tab-icon">🛒</span>
            <span>Shopping Cart</span>
            {cartItemCount > 0 && (
              <span className="cart-counter-pill">{cartItemCount}</span>
            )}
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span className="tab-icon">📦</span>
            <span>My Orders</span>
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
          MAIN PORTAL CONTENT AREA
          ========================================= */}
      <main className="portal-main">
        {/* Top bar header */}
        <header className="portal-topbar">
          <div className="topbar-title">
            <h2>
              {activeTab === "store" && "Student Store"}
              {activeTab === "cart" && "Shopping Cart"}
              {activeTab === "orders" && "My Campus Orders"}
              {activeTab === "profile" && "Student Profile"}
            </h2>
            <p>
              {activeTab === "store" && "Browse campus essentials, textbooks, electronics & lab equipment"}
              {activeTab === "cart" && "Review your selected items and complete campus checkout"}
              {activeTab === "orders" && "Track current order progress and pickup locations"}
              {activeTab === "profile" && "Manage your student credentials and preferences"}
            </p>
          </div>

          <div className="topbar-actions">
            {activeTab !== "cart" && (
              <button
                className="cart-quick-btn"
                onClick={() => setActiveTab("cart")}
              >
                🛒 Cart ({cartItemCount})
              </button>
            )}
            <span className="role-indicator student-badge">
              Role: Customer
            </span>
          </div>
        </header>

        {orderMessage && (
          <div className="portal-banner success-banner">
            ✨ {orderMessage}
            <button onClick={() => setOrderMessage("")}>✕</button>
          </div>
        )}

        {/* -----------------------------------------
            TAB 1: VIEW PRODUCTS (STUDENT STORE)
            No "Add Product" button or link here!
            ----------------------------------------- */}
        {activeTab === "store" && (
          <section className="portal-view">
            {/* Hero Card */}
            <div className="customer-hero">
              <div className="hero-text">
                <span className="hero-chip">STUDENT DISCOUNTS & CAMPUS PICKUP</span>
                <h1>Welcome, {user?.name || "Student"}!</h1>
                <p>
                  Order items directly from campus stores with zero delivery fees.
                  Pick up at your nearest campus desk.
                </p>
              </div>
              <div className="hero-graphic">📚</div>
            </div>

            {/* Filter and Search Bar */}
            <div className="store-filters-bar">
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchTerm("")}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="filter-selects">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter category"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "All" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>

                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  aria-label="Sort by price"
                >
                  <option value="">Default Order</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="portal-loading">Loading student store products...</div>
            ) : products.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="portal-product-grid">
                {products.map((item) => {
                  const inCart = cart.find((c) => c._id === item._id);
                  const isOutOfStock = item.stock !== undefined && item.stock <= 0;

                  return (
                    <div className="store-product-card" key={item._id}>
                      <div className="card-image-box">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600";
                            }}
                          />
                        ) : (
                          <div className="image-fallback">📦</div>
                        )}
                        <span className="category-pill">{item.category}</span>
                      </div>

                      <div className="card-body">
                        <h4>{item.name}</h4>
                        <p className="card-desc">{item.description}</p>

                        <div className="stock-status-line">
                          {isOutOfStock ? (
                            <span className="out-of-stock-tag">Out of stock</span>
                          ) : (
                            <span className="in-stock-tag">
                              ✓ {item.stock ? `${item.stock} in stock` : "In stock"}
                            </span>
                          )}
                        </div>

                        <div className="card-footer-action">
                          <div className="price-tag">
                            ₹{Number(item.price).toFixed(2)}
                          </div>

                          <div className="action-buttons-group">
                            <button
                              type="button"
                              className="view-spec-btn"
                              onClick={() => setSelectedProduct(item)}
                              title="View details"
                            >
                              Details
                            </button>

                            <button
                              type="button"
                              className={`add-cart-btn ${inCart ? "already-in-cart" : ""}`}
                              onClick={() => addToCart(item)}
                              disabled={isOutOfStock}
                            >
                              {inCart ? `In Cart (${inCart.quantity})` : "+ Add to Cart"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* -----------------------------------------
            TAB 2: SHOPPING CART
            ----------------------------------------- */}
        {activeTab === "cart" && (
          <section className="portal-view">
            {cart.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-icon">🛒</div>
                <h3>Your shopping cart is empty</h3>
                <p>Explore the Student Store to add books, instruments, and stationery.</p>
                <button
                  className="primary-button inline-btn"
                  onClick={() => setActiveTab("store")}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="cart-checkout-layout">
                {/* Cart Items List */}
                <div className="cart-items-column">
                  <div className="card-panel">
                    <h3>Cart Items ({cartItemCount})</h3>
                    <div className="cart-list">
                      {cart.map((item) => (
                        <div className="cart-item-row" key={item._id}>
                          <div className="cart-item-img">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>

                          <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            <span className="item-cat-label">{item.category}</span>
                            <div className="item-unit-price">
                              ₹{Number(item.price).toFixed(2)} each
                            </div>
                          </div>

                          <div className="cart-qty-controls">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, -1)}
                              title="Decrease"
                            >
                              −
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, 1)}
                              title="Increase"
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-item-subtotal">
                            <strong>₹{(Number(item.price) * item.quantity).toFixed(2)}</strong>
                            <button
                              type="button"
                              className="remove-item-btn"
                              onClick={() => removeFromCart(item._id)}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkout Summary Card */}
                <div className="cart-summary-column">
                  <div className="card-panel summary-panel">
                    <h3>Order Summary</h3>

                    <div className="summary-row">
                      <span>Items Subtotal:</span>
                      <strong>₹{cartTotal.toFixed(2)}</strong>
                    </div>

                    <div className="summary-row">
                      <span>Campus Delivery:</span>
                      <strong className="free-tag">FREE</strong>
                    </div>

                    <div className="form-group-compact">
                      <label>Campus Pickup Desk *</label>
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      >
                        <option value="Main Student Center">Main Student Center (Block A)</option>
                        <option value="Central Library Desk">Central Library Helpdesk</option>
                        <option value="Department Office">CS Department Reception</option>
                        <option value="Campus Cafeteria">Student Cafeteria Counter</option>
                      </select>
                    </div>

                    <div className="form-group-compact">
                      <label>Special Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Please hold until 3 PM"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>

                    <div className="summary-total-divider" />

                    <div className="summary-total-row">
                      <span>Total Amount:</span>
                      <span className="total-amount">₹{cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                      type="button"
                      className="primary-button checkout-btn"
                      onClick={handlePlaceOrder}
                      disabled={placingOrder}
                    >
                      {placingOrder ? "Placing Order..." : "Place Campus Order"}
                    </button>

                    <p className="checkout-guarantee">
                      🔒 No payment upfront required for campus pickup. Pay at the student desk.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* -----------------------------------------
            TAB 3: MY ORDERS
            ----------------------------------------- */}
        {activeTab === "orders" && (
          <section className="portal-view">
            {loadingOrders ? (
              <div className="portal-loading">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-icon">📦</div>
                <h3>No Orders Placed Yet</h3>
                <p>When you place an order, track its status and pickup location right here.</p>
                <button
                  className="primary-button inline-btn"
                  onClick={() => setActiveTab("store")}
                >
                  Explore Store
                </button>
              </div>
            ) : (
              <div className="orders-container">
                {orders.map((ord) => {
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
                    <div className="order-card" key={ord._id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-id-label">Order #{orderId}</span>
                          <span className="order-date">
                            Placed on {formatDate(ord.createdAt)}
                          </span>
                        </div>
                        <div className={`order-status-pill ${statusClass}`}>
                          {ord.status === "Pending" && "⏳ Pending"}
                          {ord.status === "Ready for Pickup" && "📦 Ready for Pickup"}
                          {ord.status === "Completed" && "✅ Completed"}
                          {ord.status === "Cancelled" && "❌ Cancelled"}
                        </div>
                      </div>

                      <div className="order-pickup-info">
                        📍 <strong>Pickup Desk:</strong> {ord.pickupLocation || "Main Student Center"}
                        {ord.notes && <span className="order-note"> ({ord.notes})</span>}
                      </div>

                      <div className="order-items-table">
                        {ord.items &&
                          ord.items.map((it, idx) => (
                            <div className="order-item-line" key={idx}>
                              <span>
                                {it.name} <small>× {it.quantity}</small>
                              </span>
                              <span>₹{(Number(it.price) * it.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                      </div>

                      <div className="order-card-footer">
                        <span>Total Paid / Due at Desk:</span>
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
            TAB 4: PROFILE
            ----------------------------------------- */}
        {activeTab === "profile" && (
          <section className="portal-view">
            <div className="profile-card-modern">
              <div className="profile-banner-top">
                <div className="profile-avatar-large">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <h2>{user?.name || "Student User"}</h2>
                  <span className="profile-role-badge">Student Customer</span>
                </div>
              </div>

              <div className="profile-info-grid">
                <div className="profile-field-box">
                  <label>Full Name</label>
                  <p>{user?.name}</p>
                </div>

                <div className="profile-field-box">
                  <label>Email Address</label>
                  <p>{user?.email}</p>
                </div>

                <div className="profile-field-box">
                  <label>Department / Course</label>
                  <p>{user?.course || "Computer Science"}</p>
                </div>

                <div className="profile-field-box">
                  <label>Academic Year</label>
                  <p>{user?.year || "3rd Year"}</p>
                </div>

                <div className="profile-field-box">
                  <label>Role Authorization</label>
                  <p>Customer (Campus Store Shopper)</p>
                </div>

                <div className="profile-field-box">
                  <label>Campus Delivery Status</label>
                  <p>Eligible for Free Campus Pickup</p>
                </div>
              </div>

              <div className="profile-action-row">
                <button
                  className="primary-button inline-btn"
                  onClick={() => setActiveTab("store")}
                >
                  ← Back to Store
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
          PRODUCT DETAILS MODAL
          ========================================= */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>

            <div className="modal-content-grid">
              <div className="modal-image-box">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                ) : (
                  <div className="modal-fallback">📦</div>
                )}
              </div>

              <div className="modal-details-info">
                <span className="category-pill">{selectedProduct.category}</span>
                <h2>{selectedProduct.name}</h2>
                <p className="modal-desc">{selectedProduct.description}</p>

                <div className="modal-pricing-row">
                  <span className="modal-price">₹{Number(selectedProduct.price).toFixed(2)}</span>
                  <span className="in-stock-tag">
                    {selectedProduct.stock > 0
                      ? `Stock: ${selectedProduct.stock} available`
                      : "In stock"}
                  </span>
                </div>

                <div className="modal-actions-row">
                  <button
                    className="primary-button"
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    + Add to Shopping Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
