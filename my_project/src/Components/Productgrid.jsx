


// -> client/src/components/ProductGrid.jsx for third program
import { useEffect, useState } from "react";
import "../styles/ProductGrid.css";

const API = "http://localhost:5002/api/products";

function ProductGrid({ onViewDetails }) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        setMessage("");

        try {
            const params = new URLSearchParams();

            if (search.trim()) params.set("search", search.trim());
            if (category !== "All") params.set("category", category);
            if (sort) params.set("sort", sort);

            const response = await fetch(`${API}?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load products");
            }

            setProducts(data);
        } catch (error) {
            setMessage(error.message || "Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, category, sort]);

    const categories = [
        "All",
        ...new Set(products.map((product) => product.category))
    ];

    return (
        <section className="products-page">
            <div className="products-heading">
                <div>
                    <h1>Explore Products</h1>
                    <p>Find what you need for student life.</p>
                </div>
            </div>

            <div className="product-controls">
                <input
                    type="search"
                    placeholder="Search products by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search products"
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Filter by category"
                >
                    {categories.map((item) => (
                        <option key={item} value={item}>
                            {item === "All" ? "All Categories" : item}
                        </option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="Sort by price"
                >
                    <option value="">Default Order</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                </select>
            </div>

            {message && <p className="products-message">{message}</p>}

            {loading ? (
                <p className="products-status">Loading products...</p>
            ) : products.length === 0 ? (
                <div className="products-empty">
                    <h3>No products found</h3>
                    <p>Try another search or add a new product.</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <article className="product-card" key={product._id}>
                            {product.image ? (
                                <img
                                    className="product-image"
                                    src={product.image}
                                    alt={product.name}
                                />
                            ) : (
                                <div className="product-image-placeholder">
                                    No image available
                                </div>
                            )}

                            <div className="product-card-content">
                                <span className="product-category">
                                    {product.category}
                                </span>

                                <h3>{product.name}</h3>

                                <p className="product-description">
                                    {product.description}
                                </p>

                                <div className="product-card-footer">
                                    <strong>
                                        ₹{Number(product.price).toFixed(2)}
                                    </strong>

                                    <button
                                        type="button"
                                        onClick={() => onViewDetails(product._id)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ProductGrid;