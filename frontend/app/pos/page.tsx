"use client";

import { useEffect, useState } from "react";
import { getProducts, createTransaction } from "@/lib/api";
import Nav from "../components/Nav";

interface Product {
  id: number;
  name: string;
  sku: string;
  selling_price: number;
  stock_quantity: number;
  status: string;
}

interface CartItem {
  product: Product;
  qty: number;
  price: number;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState("cash");
  const [paid, setPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProducts("?status=available").then(setProducts).catch(console.error);
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.qty + 1 > product.stock_quantity) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1, price: product.selling_price }];
    });
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== id) return i;
          const newQty = i.qty + delta;
          if (newQty < 1) return null;
          if (newQty > i.product.stock_quantity) return i;
          return { ...i, qty: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const total = subtotal;

  async function checkout() {
    if (cart.length === 0) return;
    const paidAmt = Number(paid);
    if (paidAmt < total) {
      setMessage("Paid amount is less than total!");
      return;
    }
    setLoading(true);
    try {
      await createTransaction({
        type: "sale",
        payment_method: payment,
        paid_amount: paidAmt,
        notes,
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.qty,
          selling_price: i.price,
        })),
      });
      setMessage("Transaction completed successfully!");
      setCart([]);
      setPaid("");
      setNotes("");
      getProducts("?status=available").then(setProducts);
    } catch (e: any) {
      setMessage("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">
          Point of Sale
        </h1>

        {message && (
          <div className="bg-brutal-yellow border-4 border-black p-4 mb-6 font-bold shadow-brutal">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border-4 border-black font-bold bg-white shadow-brutal-sm mb-4 focus:outline-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="text-left bg-white border-4 border-black p-4 shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
                >
                  <p className="font-black text-sm leading-tight">{p.name}</p>
                  <p className="text-xs font-bold text-gray-600">
                    {p.sku} · Stock: {p.stock_quantity}
                  </p>
                  <p className="text-lg font-black mt-1">
                    ${p.selling_price.toLocaleString()}
                  </p>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="border-4 border-black p-8 bg-white shadow-brutal text-center">
                  <p className="font-black">NO PRODUCTS FOUND</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="bg-white border-4 border-black p-5 shadow-brutal-lg h-fit">
            <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
              Cart
            </h2>
            {cart.length === 0 ? (
              <p className="text-sm font-bold text-gray-600 py-8 text-center">
                Cart is empty
              </p>
            ) : (
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="border-4 border-black p-3 bg-brutal-cream"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-sm">{item.product.name}</p>
                      <p className="font-black">
                        ${(item.qty * item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.product.id, -1)}
                        className="w-8 h-8 bg-black text-white font-black border-2 border-black flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="font-black text-lg">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product.id, 1)}
                        className="w-8 h-8 bg-brutal-green text-black font-black border-2 border-black flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t-4 border-black pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-bold">Subtotal</span>
                <span className="font-black">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl">
                <span className="font-black uppercase">Total</span>
                <span className="font-black">${total.toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Payment</label>
                <select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Paid Amount</label>
                <input
                  type="number"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                  placeholder="0"
                />
              </div>

              {Number(paid) >= total && (
                <div className="flex justify-between bg-brutal-green border-4 border-black p-2">
                  <span className="font-black">Change</span>
                  <span className="font-black">
                    ${(Number(paid) - total).toLocaleString()}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream text-sm"
                  rows={2}
                />
              </div>

              <button
                onClick={checkout}
                disabled={cart.length === 0 || loading}
                className="w-full py-4 bg-brutal-green text-black font-black text-lg border-4 border-black shadow-brutal hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform disabled:opacity-50"
              >
                {loading ? "PROCESSING..." : "COMPLETE SALE"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
