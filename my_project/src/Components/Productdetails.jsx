

// -> client/src/components/ProductDetails.jsx for third program
import { useEffect, useState } from "react";
import "../styles/ProductDetails.css";

const API = "http://localhost:5002/api/products";

function ProductDetails({ productId, onBack }) {
    const [product, setProduct] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setMessage("");

            try {
                const response = await fetch(`${API}/${productId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load product");
                }

                setProduct(data);
            } catch (error) {
                setMessage(error.message || "Unable to connect to server");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) {
        return <p className="product-details-status">Loading product...</p>;
    }

    if (!product) {
        return (
            <section className="product-details-page">
                <p>{message || "Product not found"}</p>
                <button onClick={onBack}>Back to Products</button>
            </section>
        );
    }

    return (
        <section className="product-details-page">
            <button className="product-back-button" onClick={onBack}>
                ← Back to Products
            </button>

            <div className="product-details-card">
                {product.image ? (
                    <img src={product.image} alt={product.name} />
                ) : (
                    <div className="product-details-placeholder">
                        No image available
                    </div>
                )}

                <div className="product-details-content">
                    <span className="product-category">
                        {product.category}
                    </span>

                    <h1>{product.name}</h1>

                    <p className="product-details-description">
                        {product.description}
                    </p>

                    <p className="product-details-price">
                        ₹{Number(product.price).toFixed(2)}
                    </p>

                    <p>
                        <strong>Available stock:</strong> {product.stock}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default ProductDetails;