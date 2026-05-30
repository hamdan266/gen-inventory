<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Expense::query();
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('expense_date', [$request->from, $request->to]);
        }
        return response()->json($query->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:electricity,salary,rent,cleaning,supplies,maintenance,other',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'receipt_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);
        $expense = Expense::create($data);
        return response()->json($expense, 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        return response()->json($expense);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|in:electricity,salary,rent,cleaning,supplies,maintenance,other',
            'amount' => 'sometimes|numeric|min:0',
            'expense_date' => 'sometimes|date',
            'receipt_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);
        $expense->update($data);
        return response()->json($expense);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
