import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Engineering Calculator",
    category: "Study",
    price: 450,
    seller: "Rahul",
    icon: "🧮",
  },
  {
    id: 2,
    name: "Scientific Calculator",
    category: "Study",
    price: 650,
    seller: "Arun",
    icon: "🔢",
  },
  {
    id: 3,
    name: "Engineering Textbooks",
    category: "Books",
    price: 800,
    seller: "Kiran",
    icon: "📚",
  },
  {
    id: 4,
    name: "Laptop Stand",
    category: "Electronics",
    price: 700,
    seller: "Vijay",
    icon: "💻",
  },
  {
    id: 5,
    name: "College Backpack",
    category: "Accessories",
    price: 550,
    seller: "Amit",
    icon: "🎒",
  },
  {
    id: 6,
    name: "Bluetooth Earphones",
    category: "Electronics",
    price: 900,
    seller: "Rohit",
    icon: "🎧",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("isLoggedIn");

    if (loggedIn !== "true") {
      navigate("/login");
      return;
    }

    const storedUser = JSON.parse(
      localStorage.getItem("studentmartUser")
    );

    setUser(storedUser);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    }
  );

  return (
    <div className="dashboard">
      <header className="navbar">
        <Link
          to="/dashboard"
          className="nav-brand"
        >
          🎓 StudentMart
        </Link>

        <nav>
          <Link to="/dashboard">
            Home
          </Link>

          <Link to="/profile">
            Profile
          </Link>

          <button
            onClick={logout}
            className="logout-button"
          >
            Logout
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="welcome">
              Welcome back,
            </p>

            <h1>
              {user?.name || "Student"} 👋
            </h1>

            <p>
              Buy, sell and exchange items with
              fellow students.
            </p>
          </div>

          <div className="hero-icon">
            🎓
          </div>
        </section>

        <section className="search-section">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="All">All Categories</option>
            <option value="Study">Study</option>
            <option value="Books">Books</option>
            <option value="Electronics">
              Electronics
            </option>
            <option value="Accessories">
              Accessories
            </option>
          </select>
        </section>

        <section className="section-heading">
          <div>
            <h2>Available Products</h2>

            <p>
              Find useful products from students
              around you.
            </p>
          </div>

          <button className="sell-button">
            + Sell Item
          </button>
        </section>

        <section className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                className="product-card"
                key={product.id}
              >
                <div className="product-image">
                  {product.icon}
                </div>

                <div className="product-info">
                  <span className="category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p className="seller">
                    Seller: {product.seller}
                  </p>

                  <div className="product-bottom">
                    <strong>
                      ₹{product.price}
                    </strong>

                    <button>
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <span>🔍</span>
              <h3>No products found</h3>
              <p>
                Try searching for something else.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
