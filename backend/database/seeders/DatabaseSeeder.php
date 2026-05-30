<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $electronics = Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Gadgets & devices']);
        $clothing = Category::create(['name' => 'Clothing', 'slug' => 'clothing', 'description' => 'Apparel & fashion']);
        $food = Category::create(['name' => 'Food & Beverage', 'slug' => 'food', 'description' => 'Consumables']);
        $home = Category::create(['name' => 'Home & Living', 'slug' => 'home', 'description' => 'Household items']);

        Product::create(['category_id' => $electronics->id, 'name' => 'Wireless Mouse', 'sku' => 'ELEC-001', 'purchase_price' => 15.00, 'selling_price' => 29.99, 'stock_quantity' => 45, 'low_stock_threshold' => 10, 'unit' => 'pcs']);
        Product::create(['category_id' => $electronics->id, 'name' => 'USB-C Cable', 'sku' => 'ELEC-002', 'purchase_price' => 5.00, 'selling_price' => 12.99, 'stock_quantity' => 120, 'low_stock_threshold' => 20, 'unit' => 'pcs']);
        Product::create(['category_id' => $clothing->id, 'name' => 'Cotton T-Shirt', 'sku' => 'CLTH-001', 'purchase_price' => 8.00, 'selling_price' => 19.99, 'stock_quantity' => 60, 'low_stock_threshold' => 15, 'unit' => 'pcs']);
        Product::create(['category_id' => $clothing->id, 'name' => 'Denim Jeans', 'sku' => 'CLTH-002', 'purchase_price' => 25.00, 'selling_price' => 49.99, 'stock_quantity' => 8, 'low_stock_threshold' => 10, 'unit' => 'pcs']);
        Product::create(['category_id' => $food->id, 'name' => 'Organic Coffee Beans', 'sku' => 'FOOD-001', 'purchase_price' => 12.00, 'selling_price' => 24.99, 'stock_quantity' => 30, 'low_stock_threshold' => 5, 'unit' => 'kg']);
        Product::create(['category_id' => $food->id, 'name' => 'Green Tea Box', 'sku' => 'FOOD-002', 'purchase_price' => 6.00, 'selling_price' => 14.99, 'stock_quantity' => 0, 'low_stock_threshold' => 5, 'unit' => 'box']);
        Product::create(['category_id' => $home->id, 'name' => 'LED Desk Lamp', 'sku' => 'HOME-001', 'purchase_price' => 18.00, 'selling_price' => 34.99, 'stock_quantity' => 22, 'low_stock_threshold' => 8, 'unit' => 'pcs']);
        Product::create(['category_id' => $home->id, 'name' => 'Kitchen Towels', 'sku' => 'HOME-002', 'purchase_price' => 4.00, 'selling_price' => 9.99, 'stock_quantity' => 3, 'low_stock_threshold' => 10, 'unit' => 'pack']);
    }
}
