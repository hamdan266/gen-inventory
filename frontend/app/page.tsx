"use client";

import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import Nav from "./components/Nav";

interface DashboardData {
  period: string;
  date_range: { from: string; to: string };
  summary: {
    sales_count: number;
    total_revenue: number;
    gross_profit: number;
    total_expenses: number;
    net_profit: number;
  };
  sales_by_day: { date: string; total: number }[];
  expenses_by_category: { category: string; total: number }[];
  top_products: { name: string; total_sold: number; total_revenue: number }[];
  inventory_status: {
    total_products: number;
    available: number;
    low_stock: number;
    out_of_stock: number;
  };
}

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

const SUMMARY_COLORS = [
  { label: "Sales", key: "sales_count" as const, color: "bg-brutal-yellow" },
  { label: "Revenue", key: "total_revenue" as const, color: "bg-brutal-green", prefix: "$" },
  { label: "Gross Profit", key: "gross_profit" as const, color: "bg-brutal-blue", prefix: "$" },
  { label: "Expenses", key: "total_expenses" as const, color: "bg-brutal-pink", prefix: "$" },
  { label: "Net Profit", key: "net_profit" as const, color: "bg-brutal-orange", prefix: "$" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getDashboard(period)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Dashboard
          </h1>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 text-sm font-bold border-4 border-black transition-transform ${
                  period === p.key
                    ? "bg-black text-white"
                    : "bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-brutal-sm"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-brutal-red text-white border-4 border-black p-4 mb-8 font-bold shadow-brutal">
            ERROR: {error}
          </div>
        )}

        {loading && !data && (
          <div className="text-center py-20 text-xl font-black border-4 border-black bg-white shadow-brutal">
            LOADING...
          </div>
        )}

        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              {SUMMARY_COLORS.map((item) => (
                <div
                  key={item.key}
                  className={`${item.color} border-4 border-black p-5 shadow-brutal`}
                >
                  <p className="text-sm font-bold uppercase tracking-wide mb-1">
                    {item.label}
                  </p>
                  <p className="text-3xl font-black">
                    {item.prefix || ""}
                    {data.summary[item.key]?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inventory Status */}
              <div className="bg-white border-4 border-black p-6 shadow-brutal-lg">
                <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
                  Inventory Status
                </h2>
                <div className="space-y-3">
                  <StatusRow
                    label="Available"
                    value={data.inventory_status.available}
                    total={data.inventory_status.total_products}
                    color="bg-brutal-green"
                  />
                  <StatusRow
                    label="Low Stock"
                    value={data.inventory_status.low_stock}
                    total={data.inventory_status.total_products}
                    color="bg-brutal-yellow"
                  />
                  <StatusRow
                    label="Out of Stock"
                    value={data.inventory_status.out_of_stock}
                    total={data.inventory_status.total_products}
                    color="bg-brutal-red"
                  />
                </div>
                <p className="mt-4 text-sm font-bold">
                  Total Products: {data.inventory_status.total_products}
                </p>
              </div>

              {/* Top Products */}
              <div className="bg-white border-4 border-black p-6 shadow-brutal-lg">
                <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
                  Top Selling Products
                </h2>
                <div className="space-y-3">
                  {data.top_products.length === 0 && (
                    <p className="text-sm font-bold text-gray-600">No sales data yet.</p>
                  )}
                  {data.top_products.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-4 border-black p-3 bg-brutal-cream"
                    >
                      <div>
                        <p className="font-black text-sm">{p.name}</p>
                        <p className="text-xs font-bold">
                          {p.total_sold} sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">
                          ${p.total_revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sales by Day */}
            <div className="mt-6 bg-white border-4 border-black p-6 shadow-brutal-lg">
              <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
                Sales Trend
              </h2>
              {data.sales_by_day.length === 0 ? (
                <p className="text-sm font-bold text-gray-600">No sales data for this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-4 border-black">
                        <th className="text-left py-2 font-black">Date</th>
                        <th className="text-right py-2 font-black">Sales ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sales_by_day.map((s, i) => (
                        <tr key={i} className="border-b-2 border-black">
                          <td className="py-2 font-bold">{s.date}</td>
                          <td className="py-2 text-right font-black">
                            ${s.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Expenses by Category */}
            <div className="mt-6 bg-white border-4 border-black p-6 shadow-brutal-lg">
              <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
                Expenses by Category
              </h2>
              {data.expenses_by_category.length === 0 ? (
                <p className="text-sm font-bold text-gray-600">No expenses recorded.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {data.expenses_by_category.map((e, i) => (
                    <div
                      key={i}
                      className="bg-brutal-pink border-4 border-black p-4 shadow-brutal-sm"
                    >
                      <p className="text-xs font-black uppercase">{e.category}</p>
                      <p className="text-xl font-black mt-1">
                        ${e.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function StatusRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="border-4 border-black">
      <div className="flex justify-between px-3 py-1 bg-black text-white">
        <span className="text-xs font-black uppercase">{label}</span>
        <span className="text-xs font-black">{value} ({pct}%)</span>
      </div>
      <div className="h-4 bg-brutal-gray">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
