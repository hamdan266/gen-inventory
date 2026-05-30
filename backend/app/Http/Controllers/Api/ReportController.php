<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');
        $now = Carbon::now();

        $range = match ($period) {
            'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'week' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'year' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            default => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };

        $transactions = Transaction::whereBetween('transaction_date', $range)->get();
        $expenses = Expense::whereBetween('expense_date', $range)->get();

        $salesCount = $transactions->where('type', 'sale')->count();
        $totalRevenue = $transactions->where('type', 'sale')->sum('total_amount');
        $totalPurchaseCost = $transactions->where('type', 'sale')
            ->flatMap(fn($t) => $t->items)
            ->sum(fn($item) => $item->purchase_price * $item->quantity);
        $grossProfit = $totalRevenue - $totalPurchaseCost;
        $totalExpenses = $expenses->sum('amount');
        $netProfit = $grossProfit - $totalExpenses;

        $salesByDay = Transaction::where('type', 'sale')
            ->whereBetween('transaction_date', $range)
            ->select(DB::raw('DATE(transaction_date) as date'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $expensesByCategory = Expense::whereBetween('expense_date', $range)
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get();

        $topProducts = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->where('transactions.type', 'sale')
            ->whereBetween('transactions.transaction_date', $range)
            ->select('products.name', DB::raw('SUM(transaction_items.quantity) as total_sold'), DB::raw('SUM(transaction_items.subtotal) as total_revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $inventoryStatus = [
            'total_products' => Product::count(),
            'available' => Product::where('status', 'available')->count(),
            'low_stock' => Product::where('status', 'low_stock')->count(),
            'out_of_stock' => Product::where('status', 'out_of_stock')->count(),
        ];

        return response()->json([
            'period' => $period,
            'date_range' => [
                'from' => $range[0]->toDateString(),
                'to' => $range[1]->toDateString(),
            ],
            'summary' => [
                'sales_count' => $salesCount,
                'total_revenue' => round($totalRevenue, 2),
                'gross_profit' => round($grossProfit, 2),
                'total_expenses' => round($totalExpenses, 2),
                'net_profit' => round($netProfit, 2),
            ],
            'sales_by_day' => $salesByDay,
            'expenses_by_category' => $expensesByCategory,
            'top_products' => $topProducts,
            'inventory_status' => $inventoryStatus,
        ]);
    }

    public function profitLoss(Request $request): JsonResponse
    {
        $year = $request->get('year', Carbon::now()->year);

        $data = [];
        for ($month = 1; $month <= 12; $month++) {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = Carbon::create($year, $month, 1)->endOfMonth();

            $revenue = Transaction::where('type', 'sale')
                ->whereBetween('transaction_date', [$start, $end])
                ->sum('total_amount');

            $cogs = Transaction::where('type', 'sale')
                ->whereBetween('transaction_date', [$start, $end])
                ->with('items')
                ->get()
                ->flatMap(fn($t) => $t->items)
                ->sum(fn($item) => $item->purchase_price * $item->quantity);

            $expenses = Expense::whereBetween('expense_date', [$start, $end])->sum('amount');
            $grossProfit = $revenue - $cogs;
            $netProfit = $grossProfit - $expenses;

            $data[] = [
                'month' => $start->format('F'),
                'month_number' => $month,
                'revenue' => round($revenue, 2),
                'cogs' => round($cogs, 2),
                'gross_profit' => round($grossProfit, 2),
                'expenses' => round($expenses, 2),
                'net_profit' => round($netProfit, 2),
            ];
        }

        return response()->json([
            'year' => $year,
            'data' => $data,
        ]);
    }

    public function inventoryReport(): JsonResponse
    {
        $products = Product::with('category')->get()->map(function ($product) {
            $soldQty = $product->transactionItems()
                ->whereHas('transaction', fn($q) => $q->where('type', 'sale'))
                ->sum('quantity');
            $purchasedQty = $product->transactionItems()
                ->whereHas('transaction', fn($q) => $q->where('type', 'purchase'))
                ->sum('quantity');

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category?->name,
                'purchase_price' => $product->purchase_price,
                'selling_price' => $product->selling_price,
                'stock_quantity' => $product->stock_quantity,
                'status' => $product->status,
                'total_sold' => (int) $soldQty,
                'total_purchased' => (int) $purchasedQty,
                'inventory_value' => round($product->stock_quantity * $product->purchase_price, 2),
            ];
        });

        return response()->json($products);
    }
}
