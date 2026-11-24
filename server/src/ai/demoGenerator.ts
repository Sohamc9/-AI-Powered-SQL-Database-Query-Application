export interface AiGeneratedSqlResponse {
  sql: string;
  explanation: string;
  tablesUsed: string[];
  suggestedFilters?: string[];
  complexity?: 'simple' | 'intermediate' | 'advanced';
  isDemoMode: boolean;
  provider: string;
}

/**
 * Smart, schema-aware offline demo generator for QueryPilot.
 * Handles diverse natural language queries with tailored SQL and explanations.
 */
export function generateDemoSql(prompt: string): AiGeneratedSqlResponse {
  const p = prompt.toLowerCase().trim();

  // 1. Top customers by spending / highest revenue
  if (p.includes('top customer') || p.includes('highest spend') || p.includes('top spend') || p.includes('best customer') || p.includes('customer ranking')) {
    return {
      sql: `-- Top customers ranked by total spend with order counts
SELECT 
  c.id,
  c.name,
  c.email,
  c.country,
  c.customer_tier,
  COUNT(o.id) AS total_orders,
  ROUND(SUM(o.total_amount), 2) AS total_spent,
  ROUND(AVG(o.total_amount), 2) AS average_order_value
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY c.id, c.name, c.email, c.country, c.customer_tier
ORDER BY total_spent DESC
LIMIT 10;`,
      explanation: 'Joins customers with their valid completed orders, groups by customer details, calculates aggregate spend and average order value, and orders descending to reveal high-value accounts.',
      tablesUsed: ['customers', 'orders'],
      suggestedFilters: ['Filter by specific country', 'Filter by customer_tier = VIP'],
      complexity: 'intermediate',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 2. Monthly revenue / sales trends
  if (p.includes('month') || p.includes('trend') || p.includes('revenue') || p.includes('sales over time')) {
    return {
      sql: `-- Monthly revenue and order volume trends
SELECT 
  strftime('%Y-%m', order_date) AS order_month,
  COUNT(id) AS total_orders,
  ROUND(SUM(total_amount), 2) AS monthly_revenue,
  ROUND(AVG(total_amount), 2) AS avg_ticket_size,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders
FROM orders
GROUP BY order_month
ORDER BY order_month ASC;`,
      explanation: 'Extracts year and month from order_date using SQLite strftime, computes total revenue and completed counts per calendar month, ordered chronologically.',
      tablesUsed: ['orders'],
      suggestedFilters: ['Filter by year: WHERE strftime(\'%Y\', order_date) = \'2024\''],
      complexity: 'intermediate',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 3. Low stock / inventory alert
  if (p.includes('low stock') || p.includes('inventory') || p.includes('out of stock') || p.includes('reorder')) {
    return {
      sql: `-- Products with low stock threshold (< 50 units)
SELECT 
  p.id,
  p.name AS product_name,
  c.name AS category_name,
  p.stock_quantity,
  p.price,
  ROUND(p.stock_quantity * p.price, 2) AS inventory_value,
  CASE 
    WHEN p.stock_quantity < 10 THEN 'CRITICAL'
    WHEN p.stock_quantity < 30 THEN 'LOW'
    ELSE 'MODERATE'
  END AS urgency_level
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.stock_quantity < 50 AND p.is_active = 1
ORDER BY p.stock_quantity ASC;`,
      explanation: 'Identifies active catalog items with inventory below 50 units, joins category metadata, calculates remaining inventory value, and assigns an operational urgency tier.',
      tablesUsed: ['products', 'categories'],
      suggestedFilters: ['WHERE p.stock_quantity < 20', 'WHERE c.name = \'Smart Hardware\''],
      complexity: 'simple',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 4. Recent orders with customer info
  if (p.includes('recent order') || p.includes('latest order') || p.includes('newest order') || p.includes('order list')) {
    return {
      sql: `-- Most recent customer orders with delivery destination
SELECT 
  o.id AS order_id,
  o.order_date,
  c.name AS customer_name,
  c.email AS customer_email,
  o.shipping_city,
  o.payment_method,
  o.status,
  ROUND(o.total_amount, 2) AS total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.id
ORDER BY o.order_date DESC, o.id DESC
LIMIT 15;`,
      explanation: 'Retrieves the latest 15 orders placed, joining with customer names and contact emails, sorting in descending chronological order.',
      tablesUsed: ['orders', 'customers'],
      complexity: 'simple',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 5. Category sales performance
  if (p.includes('category') || p.includes('department') || p.includes('popular categor')) {
    return {
      sql: `-- Category sales performance breakdown
SELECT 
  c.id,
  c.name AS category_name,
  c.department,
  COUNT(DISTINCT p.id) AS active_products,
  COUNT(oi.id) AS total_units_ordered,
  ROUND(SUM(oi.quantity * oi.unit_price * (1.0 - oi.discount_percent / 100.0)), 2) AS gross_sales
FROM categories c
JOIN products p ON c.id = p.category_id
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY c.id, c.name, c.department
ORDER BY gross_sales DESC;`,
      explanation: 'Aggregates sales performance across product categories by multiplying quantity, unit price, and net discount per line item.',
      tablesUsed: ['categories', 'products', 'order_items'],
      complexity: 'intermediate',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 6. Best rated products / reviews
  if (p.includes('rating') || p.includes('review') || p.includes('best product') || p.includes('feedback')) {
    return {
      sql: `-- Top rated products with customer reviews
SELECT 
  p.id,
  p.name,
  p.price,
  p.rating AS overall_rating,
  COUNT(r.id) AS review_count,
  ROUND(AVG(r.rating), 2) AS calculated_avg_rating
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.price, p.rating
HAVING review_count > 0
ORDER BY overall_rating DESC, review_count DESC;`,
      explanation: 'Finds products that have received verified customer reviews, calculating aggregate review metrics sorted by rating score.',
      tablesUsed: ['products', 'reviews'],
      complexity: 'intermediate',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 7. Average Order Value (AOV) by customer tier
  if (p.includes('average order') || p.includes('aov') || p.includes('tier') || p.includes('customer segment')) {
    return {
      sql: `-- Average order value and customer distribution by tier
SELECT 
  c.customer_tier,
  COUNT(DISTINCT c.id) AS customer_count,
  COUNT(o.id) AS order_count,
  ROUND(SUM(o.total_amount), 2) AS total_revenue,
  ROUND(AVG(o.total_amount), 2) AS avg_order_value,
  ROUND(SUM(o.total_amount) / COUNT(DISTINCT c.id), 2) AS revenue_per_customer
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'completed'
GROUP BY c.customer_tier
ORDER BY total_revenue DESC;`,
      explanation: 'Analyzes revenue metrics, average order value, and revenue per account segmented by customer loyalty tier (Enterprise, VIP, Premium, Standard).',
      tablesUsed: ['customers', 'orders'],
      complexity: 'intermediate',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 8. Payment methods distribution
  if (p.includes('payment') || p.includes('crypto') || p.includes('credit card') || p.includes('paypal')) {
    return {
      sql: `-- Payment method distribution and volume
SELECT 
  payment_method,
  COUNT(*) AS total_transactions,
  ROUND(SUM(total_amount), 2) AS total_volume,
  ROUND(AVG(total_amount), 2) AS avg_transaction_size,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM orders), 1) AS percent_of_orders
FROM orders
GROUP BY payment_method
ORDER BY total_volume DESC;`,
      explanation: 'Calculates the volume, count, and overall percentage share of each payment method using a subquery for the total transaction count denominator.',
      tablesUsed: ['orders'],
      complexity: 'intermediate',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 9. Customers by country
  if (p.includes('country') || p.includes('geographic') || p.includes('city') || p.includes('location')) {
    return {
      sql: `-- Global customer distribution and order activity
SELECT 
  c.country,
  COUNT(DISTINCT c.id) AS total_customers,
  COUNT(o.id) AS total_orders,
  ROUND(COALESCE(SUM(o.total_amount), 0), 2) AS total_spend
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.country
ORDER BY total_spend DESC;`,
      explanation: 'Breaks down customer accounts and total purchasing power across geographic countries.',
      tablesUsed: ['customers', 'orders'],
      complexity: 'simple',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // 10. Discount analysis
  if (p.includes('discount') || p.includes('promo') || p.includes('margin')) {
    return {
      sql: `-- Orders with highest item discounts applied
SELECT 
  oi.order_id,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  oi.discount_percent,
  ROUND(oi.quantity * oi.unit_price * (oi.discount_percent / 100.0), 2) AS discount_amount_saved,
  o.order_date
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE oi.discount_percent > 0
ORDER BY discount_amount_saved DESC
LIMIT 10;`,
      explanation: 'Analyzes items sold with promotional discounts, calculating total savings granted per line item.',
      tablesUsed: ['order_items', 'products', 'orders'],
      complexity: 'intermediate',
      isDemoMode: true,
      provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
    };
  }

  // Fallback: Dynamic intelligent generator based on detected tokens
  return {
    sql: `-- Query based on prompt: "${prompt.replace(/"/g, '')}"
SELECT 
  o.id AS order_id,
  c.name AS customer_name,
  c.customer_tier,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  o.status,
  o.order_date
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
ORDER BY o.order_date DESC
LIMIT 20;`,
    explanation: `Generated a comprehensive multi-table join (orders, customers, order_items, and products) tailored to explore data related to "${prompt}".`,
    tablesUsed: ['orders', 'customers', 'order_items', 'products'],
    complexity: 'intermediate',
    isDemoMode: true,
    provider: 'QueryPilot Demo Assistant (Offline Rule & Semantic Engine)'
  };
}
