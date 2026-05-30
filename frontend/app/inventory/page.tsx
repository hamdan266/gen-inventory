"use client";

import { useEffect, useState } from "react";
import { getProducts, createProduct, getCategories } from "@/lib/api";
import Nav from "../components/Nav";

interface Product {
  id: number;
  name: string;
  sku: string;
  category?: { name: string };
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  unit: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-brutal-green",
  low_stock: "bg-brutal-yellow",
  out_of_stock: "bg-brutal-red",
};

const STATUS_LABELS: Record<string, string> = {
  available: "AVAILABLE",
  low_stock: "LOW STOCK",
  out_of_stock: "OUT OF STOCK",
};

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: "",
    purchase_price: "",
    selling_price: "",
    stock_quantity: "",
    low_stock_threshold: "10",
    unit: "pcs",
    description: "",
  });

  useEffect(() => {
    load();
    getCategories().then(setCategories).catch(console.error);
  }, []);

  async function load() {
    setLoading(true);
    try {
      let params = "";
      if (filterStatus) params += `?status=${filterStatus}`;
      if (search) params += `${params ? "&" : "?"}search=${encodeURIComponent(search)}`;
      const data = await getProducts(params);
      setProducts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createProduct({
        ...form,
        category_id: Number(form.category_id),
        purchase_price: Number(form.purchase_price),
        selling_price: Number(form.selling_price),
        stock_quantity: Number(form.stock_quantity),
        low_stock_threshold: Number(form.low_stock_threshold),
      });
      setShowForm(false);
      setForm({ name: "", sku: "", category_id: "", purchase_price: "", selling_price: "", stock_quantity: "", low_stock_threshold: "10", unit: "pcs", description: "" });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Inventory
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-brutal-blue text-white font-black border-4 border-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
          >
            {showForm ? "CLOSE FORM" : "+ ADD PRODUCT"}
          </button>
        </div>

        {error && (
          <div className="bg-brutal-red text-white border-4 border-black p-4 mb-6 font-bold shadow-brutal">
            ERROR: {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border-4 border-black font-bold bg-white shadow-brutal-sm focus:outline-none focus:shadow-brutal transition-shadow"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-4 border-black font-bold bg-white shadow-brutal-sm"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button
            onClick={load}
            className="px-6 py-3 bg-black text-white font-black border-4 border-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
          >
            SEARCH
          </button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border-4 border-black p-6 mb-8 shadow-brutal-lg"
          >
            <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
              New Product
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label="SKU" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} required />
              <div>
                <label className="block text-xs font-black uppercase mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                  required
                >
                  <option value="">Select...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Field label="Purchase Price" type="number" value={form.purchase_price} onChange={(v) => setForm({ ...form, purchase_price: v })} required />
              <Field label="Selling Price" type="number" value={form.selling_price} onChange={(v) => setForm({ ...form, selling_price: v })} required />
              <Field label="Stock Qty" type="number" value={form.stock_quantity} onChange={(v) => setForm({ ...form, stock_quantity: v })} required />
              <Field label="Low Stock Threshold" type="number" value={form.low_stock_threshold} onChange={(v) => setForm({ ...form, low_stock_threshold: v })} />
              <Field label="Unit" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} />
              <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-brutal-green text-black font-black border-4 border-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
            >
              SAVE PRODUCT
            </button>
          </form>
        )}

        {/* Product Grid */}
        {loading && !products.length ? (
          <div className="text-center py-20 text-xl font-black border-4 border-black bg-white shadow-brutal">
            LOADING...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white border-4 border-black p-5 shadow-brutal hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`inline-block px-2 py-1 text-[10px] font-black uppercase border-2 border-black text-black ${
                      STATUS_COLORS[p.status] || "bg-brutal-gray"
                    }`}
                  >
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </div>
                <h3 className="text-lg font-black mb-1 leading-tight">{p.name}</h3>
                <p className="text-xs font-bold text-gray-600 mb-3">
                  {p.sku} · {p.category?.name || "Uncategorized"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="border-2 border-black p-2 bg-brutal-cream">
                    <p className="text-[10px] font-black uppercase">Stock</p>
                    <p className="font-black text-lg">
                      {p.stock_quantity} {p.unit}
                    </p>
                  </div>
                  <div className="border-2 border-black p-2 bg-brutal-cream">
                    <p className="text-[10px] font-black uppercase">Price</p>
                    <p className="font-black text-lg">
                      ${p.selling_price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="border-t-2 border-black pt-2 flex justify-between text-xs font-bold">
                  <span>Buy: ${p.purchase_price.toLocaleString()}</span>
                  <span>Margin: ${(p.selling_price - p.purchase_price).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-20 border-4 border-black bg-white shadow-brutal">
            <p className="text-xl font-black">NO PRODUCTS FOUND</p>
          </div>
        )}
      </main>
    </>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream focus:outline-none"
      />
    </div>
  );
}
