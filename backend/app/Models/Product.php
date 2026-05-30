<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'sku', 'description',
        'purchase_price', 'selling_price', 'stock_quantity',
        'low_stock_threshold', 'unit', 'status'
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    protected static function booted(): void
    {
        static::saving(function ($product) {
            if ($product->stock_quantity <= 0) {
                $product->status = 'out_of_stock';
            } elseif ($product->stock_quantity <= $product->low_stock_threshold) {
                $product->status = 'low_stock';
            } else {
                $product->status = 'available';
            }
        });
    }
}
