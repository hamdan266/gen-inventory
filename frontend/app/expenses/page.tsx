"use client";

import { useEffect, useState } from "react";
import { getExpenses, createExpense } from "@/lib/api";
import Nav from "../components/Nav";

interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  description?: string;
}

const CATEGORIES = [
  { key: "electricity", label: "Electricity", color: "bg-brutal-yellow" },
  { key: "salary", label: "Salary", color: "bg-brutal-blue" },
  { key: "rent", label: "Rent", color: "bg-brutal-orange" },
  { key: "cleaning", label: "Cleaning", color: "bg-brutal-green" },
  { key: "supplies", label: "Supplies", color: "bg-brutal-purple" },
  { key: "maintenance", label: "Maintenance", color: "bg-brutal-pink" },
  { key: "other", label: "Other", color: "bg-brutal-gray" },
];

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {};
CATEGORIES.forEach((c) => (CATEGORY_MAP[c.key] = { label: c.label, color: c.color }));

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "other",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
    receipt_number: "",
    notes: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createExpense({
        ...form,
        amount: Number(form.amount),
      });
      setShowForm(false);
      setForm({
        title: "",
        category: "other",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
        description: "",
        receipt_number: "",
        notes: "",
      });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Operational Expenses
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-brutal-pink text-black font-black border-4 border-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
          >
            {showForm ? "CLOSE" : "+ ADD EXPENSE"}
          </button>
        </div>

        {error && (
          <div className="bg-brutal-red text-white border-4 border-black p-4 mb-6 font-bold shadow-brutal">
            ERROR: {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {CATEGORIES.map((c) => {
            const catTotal = expenses
              .filter((e) => e.category === c.key)
              .reduce((s, e) => s + Number(e.amount), 0);
            return (
              <div
                key={c.key}
                className={`${c.color} border-4 border-black p-3 shadow-brutal-sm`}
              >
                <p className="text-[10px] font-black uppercase">{c.label}</p>
                <p className="text-lg font-black">${catTotal.toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-brutal-yellow border-4 border-black p-4 mb-8 shadow-brutal">
          <p className="text-sm font-black uppercase">Total Expenses</p>
          <p className="text-3xl font-black">${total.toLocaleString()}</p>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border-4 border-black p-6 mb-8 shadow-brutal-lg"
          >
            <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
              New Expense
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Amount</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Receipt #</label>
                <input
                  value={form.receipt_number}
                  onChange={(e) => setForm({ ...form, receipt_number: e.target.value })}
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border-4 border-black font-bold bg-brutal-cream"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-brutal-pink text-black font-black border-4 border-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
            >
              SAVE EXPENSE
            </button>
          </form>
        )}

        <div className="bg-white border-4 border-black shadow-brutal-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-4 border-black bg-black text-white">
                  <th className="text-left p-3 font-black">Date</th>
                  <th className="text-left p-3 font-black">Title</th>
                  <th className="text-left p-3 font-black">Category</th>
                  <th className="text-right p-3 font-black">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading && expenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center font-black">
                      LOADING...
                    </td>
                  </tr>
                )}
                {expenses.map((e) => {
                  const cat = CATEGORY_MAP[e.category] || { label: e.category, color: "bg-brutal-gray" };
                  return (
                    <tr key={e.id} className="border-b-2 border-black hover:bg-brutal-cream">
                      <td className="p-3 font-bold">{e.expense_date}</td>
                      <td className="p-3 font-bold">{e.title}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 text-[10px] font-black uppercase border-2 border-black ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black">
                        ${Number(e.amount).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {expenses.length === 0 && !loading && (
            <div className="p-8 text-center font-black border-t-4 border-black">
              NO EXPENSES RECORDED
            </div>
          )}
        </div>
      </main>
    </>
  );
}
