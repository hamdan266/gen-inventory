<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with('items.product');
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('transaction_date', [$request->from, $request->to]);
        }
        return response()->json($query->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|in:sale,purchase,return',
            'payment_method' => 'required|in:cash,card,transfer,other',
            'paid_amount' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selling_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($data) {
            $invoice = 'INV-' . now()->format('Ymd') . '-' . strtoupper(uniqid());
            $subtotal = 0;

            $transaction = Transaction::create([
                'invoice_number' => $invoice,
                'type' => $data['type'],
                'tax' => $data['tax'] ?? 0,
                'discount' => $data['discount'] ?? 0,
                'payment_method' => $data['payment_method'],
                'paid_amount' => $data['paid_amount'],
                'notes' => $data['notes'] ?? null,
                'transaction_date' => now(),
                'subtotal' => 0,
                'total_amount' => 0,
                'change_amount' => 0,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $lineSubtotal = $item['quantity'] * $item['selling_price'];
                $subtotal += $lineSubtotal;

                if ($data['type'] === 'sale') {
                    if ($product->stock_quantity < $item['quantity']) {
                        throw new \Exception("Insufficient stock for product: {$product->name}");
                    }
                    $product->decrement('stock_quantity', $item['quantity']);
                } elseif ($data['type'] === 'purchase') {
                    $product->increment('stock_quantity', $item['quantity']);
                }

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'purchase_price' => $product->purchase_price,
                    'selling_price' => $item['selling_price'],
                    'subtotal' => $lineSubtotal,
                ]);
            }

            $total = $subtotal + ($data['tax'] ?? 0) - ($data['discount'] ?? 0);
            $change = max(0, $data['paid_amount'] - $total);

            $transaction->update([
                'subtotal' => $subtotal,
                'total_amount' => $total,
                'change_amount' => $change,
            ]);

            return response()->json($transaction->load('items.product'), 201);
        });
    }

    public function show(Transaction $transaction): JsonResponse
    {
        return response()->json($transaction->load('items.product'));
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        $transaction->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
