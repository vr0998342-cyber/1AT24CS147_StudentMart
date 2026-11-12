

// -> client/src/components/ProductForm.jsx for third program

import { useState } from "react";
import "../styles/ProductForm.css";

const API = "http://localhost:5002/api/products";

function ProductForm({ onProductAdded, onCancel }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        stock: "0"
    });

    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!form.name.trim() || !form.description.trim() ||
            !form.category.trim()) {
            setMessage("Please complete all required fields.");
            return;
        }

        if (Number(form.price) < 0 || form.price === "") {
            setMessage("Enter a valid, non-negative price.");
            return;
        }

        if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
            setMessage("Stock must be a non-negative whole number.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    stock: Number(form.stock)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to add product");
            }

            setForm({
                name: "",
                description: "",
                price: "",
                category: "",
                image: "",
                stock: "0"
            });

            onProductAdded(data.product);
        } catch (error) {
            setMessage(error.message || "Unable to connect to server");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="product-form-page">
            <form className="product-form-card" onSubmit={handleSubmit}>
                <h2>Add New Product</h2>
                <p>Enter the product details below.</p>

                <label htmlFor="product-name">Product Name *</label>
                <input
                    id="product-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="e.g. College Backpack"
                />

                <label htmlFor="product-description">Description *</label>
                <textarea
                    id="product-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    maxLength={1000}
                    placeholder="Describe the product"
                />

                <div className="product-form-row">
                    <div>
                        <label htmlFor="product-price">Price (₹) *</label>
                        <input
                            id="product-price"
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="product-stock">Stock</label>
                        <input
                            id="product-stock"
                            name="stock"
                            type="number"
                            value={form.stock}
                            onChange={handleChange}
                            min="0"
                            step="1"
                        />
                    </div>
                </div>

                <label htmlFor="product-category">Category *</label>
                <input
                    id="product-category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    maxLength={60}
                    placeholder="e.g. Stationery"
                />

                <label htmlFor="product-image">Image URL (optional)</label>
                <input
                    id="product-image"
                    name="image"
                    type="url"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/product.jpg"
                />

                {message && <p className="product-form-message">{message}</p>}

                <div className="product-form-actions">
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Add Product"}
                    </button>

                    <button type="button" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}

export default ProductForm;