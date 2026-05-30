"use client";

import { useEffect, useState } from "react";
import { getProfitLoss, getInventoryReport, getTransactions } from "@/lib/api";
import Nav from "../components/Nav";

interface PLRow {
  month: string;
  month_number: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  expenses: number;
  net_profit: number;
}

interface InvItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock_quantity: number;
  total_sold: number;
  inventory_value: number;
  status: string;
}

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [plData, setPlData] = useState<PLRow[]>([]);
  const [invData, setInvData] = useState<InvItem[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProfitLoss(year),
      getInventoryReport(),
      getTransactions("?type=sale"),
    ])
      .then(([pl, inv, txs]) => {
        setPlData(pl.data);
        setInvData(inv);
        setTransactions(txs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year]);

  const totalRevenue = plData.reduce((s, r) => s + r.revenue, 0);
  const totalCOGS = plData.reduce((s, r) => s + r.cogs, 0);
  const totalGross = plData.reduce((s, r) => s + r.gross_profit, 0);
  const totalExpenses = plData.reduce((s, r) => s + r.expenses, 0);
  const totalNet = plData.reduce((s, r) => s + r.net_profit, 0);

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Financial Reports
          </h1>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 border-4 border-black font-black bg-white shadow-brutal-sm"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-brutal-red text-white border-4 border-black p-4 mb-6 font-bold shadow-brutal">
            ERROR: {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card label="Revenue" value={totalRevenue} color="bg-brutal-green" />
          <Card label="COGS" value={totalCOGS} color="bg-brutal-yellow" />
          <Card label="Gross Profit" value={totalGross} color="bg-brutal-blue" />
          <Card label="Expenses" value={totalExpenses} color="bg-brutal-pink" />
          <Card label="Net Profit" value={totalNet} color="totalNet >= 0 ? 'bg-brutal-green' : 'bg-brutal-red'" />
        </div>

        {/* P&L Table */}
        <div className="bg-white border-4 border-black p-6 shadow-brutal-lg mb-8 overflow-hidden">
          <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
            Profit & Loss Statement — {year}
          </h2>
          {loading ? (
            <p className="py-8 font-black text-center">LOADING...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-4 border-black bg-black text-white">
                    <th className="text-left p-3 font-black">Month</th>
                    <th className="text-right p-3 font-black">Revenue</th>
                    <th className="text-right p-3 font-black">COGS</th>
                    <th className="text-right p-3 font-black">Gross</th>
                    <th className="text-right p-3 font-black">Expenses</th>
                    <th className="text-right p-3 font-black">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {plData.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b-2 border-black ${
                        r.net_profit >= 0 ? "bg-brutal-cream" : "bg-red-50"
                      }`}
                    >
                      <td className="p-3 font-bold">{r.month}</td>
                      <td className="p-3 text-right font-bold">
                        ${r.revenue.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold">
                        ${r.cogs.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold">
                        ${r.gross_profit.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold">
                        ${r.expenses.toLocaleString()}
                      </td>
                      <td
                        className={`p-3 text-right font-black ${
                          r.net_profit >= 0 ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        ${r.net_profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-black text-white">
                    <td className="p-3 font-black">TOTAL</td>
                    <td className="p-3 text-right font-black">
                      ${totalRevenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-black">
                      ${totalCOGS.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-black">
                      ${totalGross.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-black">
                      ${totalExpenses.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-black">
                      ${totalNet.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inventory Report */}
        <div className="bg-white border-4 border-black p-6 shadow-brutal-lg mb-8 overflow-hidden">
          <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
            Inventory Valuation
          </h2>
          {loading ? (
            <p className="py-8 font-black text-center">LOADING...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-4 border-black bg-black text-white">
                    <th className="text-left p-3 font-black">Product</th>
                    <th className="text-left p-3 font-black">SKU</th>
                    <th className="text-left p-3 font-black">Category</th>
                    <th className="text-right p-3 font-black">Stock</th>
                    <th className="text-right p-3 font-black">Sold</th>
                    <th className="text-right p-3 font-black">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {invData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b-2 border-black hover:bg-brutal-cream"
                    >
                      <td className="p-3 font-bold">{item.name}</td>
                      <td className="p-3 font-bold">{item.sku}</td>
                      <td className="p-3 font-bold">{item.category || "—"}</td>
                      <td className="p-3 text-right font-bold">
                        {item.stock_quantity}
                      </td>
                      <td className="p-3 text-right font-bold">
                        {item.total_sold}
                      </td>
                      <td className="p-3 text-right font-black">
                        ${item.inventory_value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border-4 border-black p-6 shadow-brutal-lg overflow-hidden">
          <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
            Recent Sales Transactions
          </h2>
          {loading ? (
            <p className="py-8 font-black text-center">LOADING...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-4 border-black bg-black text-white">
                    <th className="text-left p-3 font-black">Invoice</th>
                    <th className="text-left p-3 font-black">Date</th>
                    <th className="text-left p-3 font-black">Payment</th>
                    <th className="text-right p-3 font-black">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((t) => (
                    <tr
                      key={t.id}
                      className="border-b-2 border-black hover:bg-brutal-cream"
                    >
                      <td className="p-3 font-bold">{t.invoice_number}</td>
                      <td className="p-3 font-bold">
                        {new Date(t.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-bold uppercase">
                        {t.payment_method}
                      </td>
                      <td className="p-3 text-right font-black">
                        ${Number(t.total_amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center font-black">
                        NO TRANSACTIONS
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Card({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} border-4 border-black p-5 shadow-brutal`}>
      <p className="text-xs font-black uppercase mb-1">{label}</p>
      <p className="text-2xl font-black">${value.toLocaleString()}</p>
    </div>
  );
}
