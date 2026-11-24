import { DatabaseSync } from 'node:sqlite';

/**
 * Seeds the database with rich, realistic sample data for QueryPilot demo mode.
 */
export function seedDatabase(db: DatabaseSync): void {
  // 1. Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      country TEXT NOT NULL,
      customer_tier TEXT NOT NULL CHECK(customer_tier IN ('Standard', 'Premium', 'VIP', 'Enterprise')),
      signup_date TEXT NOT NULL,
      lifetime_spend REAL DEFAULT 0.00
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      price REAL NOT NULL,
      stock_quantity INTEGER NOT NULL,
      rating REAL DEFAULT 4.5,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      order_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('completed', 'shipped', 'processing', 'cancelled', 'refunded')),
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('credit_card', 'paypal', 'apple_pay', 'crypto', 'bank_transfer')),
      shipping_city TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount_percent REAL DEFAULT 0.0
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      review_date TEXT NOT NULL
    );
  `);

  // Clear any existing demo rows to ensure idempotency
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM products;
    DELETE FROM customers;
    DELETE FROM categories;
  `);

  // 2. Insert Categories
  db.exec(`
    INSERT INTO categories (id, name, department, description) VALUES
    (1, 'Cloud Infrastructure', 'Developer Tools', 'Servers, databases, edge networks, and storage buckets'),
    (2, 'Developer Software', 'Developer Tools', 'IDEs, API clients, CI/CD pipelines, and observability tools'),
    (3, 'Smart Hardware', 'Electronics', 'Connected microcontrollers, sensor kits, and developer boards'),
    (4, 'Audio & Ergonomics', 'Workstation', 'Noise-canceling headsets, mechanical keyboards, and desk accessories'),
    (5, 'AI & ML Services', 'Software', 'Pre-trained models, embeddings, vector databases, and inference pipelines'),
    (6, 'Security & Identity', 'Security', 'Auth providers, zero-trust tokens, and secrets vaults');
  `);

  // 3. Insert Customers
  db.exec(`
    INSERT INTO customers (id, name, email, country, customer_tier, signup_date, lifetime_spend) VALUES
    (1, 'Alice Chen', 'alice.chen@techcorp.io', 'USA', 'VIP', '2023-01-15', 14850.50),
    (2, 'Marcus Vance', 'marcus.v@cloudscale.net', 'Canada', 'Enterprise', '2022-11-04', 32400.00),
    (3, 'Sophia Müller', 'sophia.m@berlin-ai.de', 'Germany', 'Premium', '2023-03-22', 7200.75),
    (4, 'Kenji Sato', 'k.sato@tokyo-dev.jp', 'Japan', 'VIP', '2023-05-10', 12150.20),
    (5, 'Elena Rostova', 'elena@datapulse.eu', 'Netherlands', 'Standard', '2023-08-19', 2450.00),
    (6, 'David Okafor', 'david@lagosfintech.ng', 'Nigeria', 'Premium', '2023-02-14', 8900.00),
    (7, 'Camila Santos', 'camila.santos@saopaulo.br', 'Brazil', 'Standard', '2023-09-01', 1980.50),
    (8, 'Liam Gallagher', 'liam@dublincode.ie', 'Ireland', 'VIP', '2022-08-30', 18900.00),
    (9, 'Aarav Patel', 'aarav.patel@bengalurulabs.in', 'India', 'Enterprise', '2022-10-12', 41200.80),
    (10, 'Chloe Dubois', 'chloe.d@paris-analytics.fr', 'France', 'Premium', '2023-04-18', 6450.25),
    (11, 'Oliver Smith', 'oliver.s@oxford-systems.co.uk', 'United Kingdom', 'VIP', '2023-01-20', 13500.00),
    (12, 'Zainab Al-Mansoor', 'zainab@gulftech.ae', 'UAE', 'Enterprise', '2023-06-05', 28950.00),
    (13, 'Jonas Lindqvist', 'jonas@nordiccloud.se', 'Sweden', 'Standard', '2023-10-11', 1420.00),
    (14, 'Isabella Rossi', 'isabella@milan-design.it', 'Italy', 'Standard', '2023-11-02', 890.00),
    (15, 'Mateo Rodriguez', 'mateo@madrid-saas.es', 'Spain', 'Premium', '2023-07-25', 5600.00);
  `);

  // 4. Insert Products
  db.exec(`
    INSERT INTO products (id, name, category_id, price, stock_quantity, rating, is_active, created_at) VALUES
    (101, 'Compute Instance 4vCPU 16GB', 1, 99.00, 450, 4.8, 1, '2023-01-01'),
    (102, 'High-Throughput NVMe Storage 1TB', 1, 140.00, 220, 4.9, 1, '2023-01-10'),
    (103, 'Global Anycast CDN Edge Pack', 1, 65.00, 890, 4.7, 1, '2023-02-01'),
    (104, 'QueryPilot Pro Team License (Annual)', 2, 499.00, 1000, 4.9, 1, '2023-03-01'),
    (105, 'CI/CD Pipeline Accelerator 50-Pack', 2, 250.00, 310, 4.6, 1, '2023-03-15'),
    (106, 'Real-time Observability Agent', 2, 120.00, 500, 4.5, 1, '2023-04-01'),
    (107, 'Developer IoT Board ESP32-Ultra', 3, 45.00, 15, 4.4, 1, '2023-05-01'),
    (108, 'Edge AI Camera Sensor Kit', 3, 185.00, 28, 4.7, 1, '2023-05-20'),
    (109, 'LoRaWAN Long-Range Gateway', 3, 320.00, 8, 4.3, 1, '2023-06-01'),
    (110, 'Split Ergonomic Mechanical Keyboard', 4, 289.00, 42, 4.9, 1, '2023-01-20'),
    (111, 'ANC Developer Studio Headphones', 4, 349.00, 35, 4.8, 1, '2023-02-15'),
    (112, 'Motorized Dual-Motor Standing Desk Deskpad', 4, 75.00, 120, 4.6, 1, '2023-03-10'),
    (113, 'LLM Fine-Tuning Cluster 100-Hours', 5, 1200.00, 50, 4.9, 1, '2023-04-10'),
    (114, 'Vector Database Managed Node (M16)', 5, 380.00, 180, 4.8, 1, '2023-04-25'),
    (115, 'Semantic Search Embedding API 10M Tokens', 5, 50.00, 2500, 4.7, 1, '2023-05-15'),
    (116, 'Zero-Trust FIDO2 Security Hardware Key', 6, 65.00, 340, 4.9, 1, '2023-01-05'),
    (117, 'Enterprise Secrets Manager Agent', 6, 450.00, 95, 4.6, 1, '2023-02-28');
  `);

  // 5. Insert Orders
  db.exec(`
    INSERT INTO orders (id, customer_id, order_date, status, total_amount, payment_method, shipping_city) VALUES
    (1001, 1, '2024-01-10', 'completed', 1588.00, 'credit_card', 'San Francisco'),
    (1002, 2, '2024-01-12', 'completed', 4850.00, 'bank_transfer', 'Toronto'),
    (1003, 3, '2024-01-15', 'completed', 740.00, 'paypal', 'Berlin'),
    (1004, 4, '2024-01-18', 'completed', 1497.00, 'credit_card', 'Tokyo'),
    (1005, 5, '2024-01-20', 'completed', 289.00, 'apple_pay', 'Amsterdam'),
    (1006, 6, '2024-01-25', 'completed', 1200.00, 'crypto', 'Lagos'),
    (1007, 7, '2024-02-01', 'processing', 349.00, 'credit_card', 'Sao Paulo'),
    (1008, 8, '2024-02-04', 'completed', 2760.00, 'credit_card', 'Dublin'),
    (1009, 9, '2024-02-08', 'completed', 6400.00, 'bank_transfer', 'Bengaluru'),
    (1010, 10, '2024-02-12', 'completed', 860.00, 'paypal', 'Paris'),
    (1011, 11, '2024-02-15', 'completed', 1950.00, 'credit_card', 'London'),
    (1012, 12, '2024-02-20', 'completed', 5200.00, 'bank_transfer', 'Dubai'),
    (1013, 1, '2024-03-01', 'completed', 2400.00, 'credit_card', 'San Francisco'),
    (1014, 2, '2024-03-05', 'completed', 8900.00, 'bank_transfer', 'Toronto'),
    (1015, 3, '2024-03-10', 'shipped', 638.00, 'paypal', 'Berlin'),
    (1016, 4, '2024-03-15', 'completed', 2140.00, 'credit_card', 'Tokyo'),
    (1017, 8, '2024-03-22', 'completed', 3800.00, 'credit_card', 'Dublin'),
    (1018, 9, '2024-03-28', 'completed', 7500.00, 'bank_transfer', 'Bengaluru'),
    (1019, 13, '2024-04-02', 'cancelled', 499.00, 'apple_pay', 'Stockholm'),
    (1020, 14, '2024-04-05', 'refunded', 289.00, 'credit_card', 'Milan'),
    (1021, 15, '2024-04-10', 'shipped', 1250.00, 'credit_card', 'Madrid'),
    (1022, 1, '2024-04-15', 'completed', 380.00, 'credit_card', 'San Francisco'),
    (1023, 6, '2024-04-20', 'processing', 2400.00, 'crypto', 'Lagos'),
    (1024, 11, '2024-04-25', 'shipped', 1580.00, 'credit_card', 'London'),
    (1025, 12, '2024-05-02', 'completed', 6100.00, 'bank_transfer', 'Dubai');
  `);

  // 6. Insert Order Items
  db.exec(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount_percent) VALUES
    (1001, 104, 2, 499.00, 0.0),
    (1001, 110, 2, 289.00, 5.0),
    (1002, 113, 3, 1200.00, 10.0),
    (1002, 114, 3, 380.00, 0.0),
    (1003, 101, 2, 99.00, 0.0),
    (1003, 102, 2, 140.00, 5.0),
    (1003, 116, 4, 65.00, 0.0),
    (1004, 104, 3, 499.00, 0.0),
    (1005, 110, 1, 289.00, 0.0),
    (1006, 113, 1, 1200.00, 0.0),
    (1007, 111, 1, 349.00, 0.0),
    (1008, 104, 4, 499.00, 5.0),
    (1008, 114, 2, 380.00, 0.0),
    (1009, 113, 5, 1200.00, 15.0),
    (1009, 117, 1, 450.00, 0.0),
    (1010, 105, 2, 250.00, 0.0),
    (1010, 108, 2, 180.00, 0.0),
    (1011, 104, 2, 499.00, 0.0),
    (1011, 111, 2, 349.00, 10.0),
    (1011, 116, 4, 65.00, 0.0),
    (1012, 113, 4, 1200.00, 10.0),
    (1012, 117, 1, 450.00, 0.0),
    (1013, 113, 2, 1200.00, 0.0),
    (1014, 113, 6, 1200.00, 15.0),
    (1014, 104, 3, 499.00, 5.0),
    (1015, 110, 1, 289.00, 0.0),
    (1015, 111, 1, 349.00, 0.0),
    (1016, 104, 2, 499.00, 0.0),
    (1016, 114, 3, 380.00, 0.0),
    (1017, 114, 10, 380.00, 5.0),
    (1018, 113, 6, 1200.00, 10.0),
    (1021, 113, 1, 1200.00, 0.0),
    (1022, 114, 1, 380.00, 0.0),
    (1023, 113, 2, 1200.00, 0.0),
    (1024, 104, 2, 499.00, 0.0),
    (1024, 110, 2, 289.00, 0.0),
    (1025, 113, 5, 1200.00, 10.0);
  `);

  // 7. Insert Reviews
  db.exec(`
    INSERT INTO reviews (product_id, customer_id, rating, comment, review_date) VALUES
    (104, 1, 5, 'QueryPilot transformed our database workflow. The AI assistant generates spot-on queries!', '2024-01-20'),
    (104, 4, 5, 'Excellent performance and very intuitive schema viewer. Highly recommended.', '2024-02-01'),
    (104, 8, 5, 'Best SQL workbench we have deployed across our backend engineering team.', '2024-02-15'),
    (110, 1, 5, 'Incredible split mechanical keyboard. My wrist strain disappeared within a week.', '2024-01-25'),
    (110, 5, 4, 'Great build quality, tactile feel is superb, though slight learning curve.', '2024-02-10'),
    (111, 7, 5, 'Active noise cancellation is whisper quiet. Blocks office chatter completely.', '2024-02-14'),
    (113, 2, 5, 'The 100-hour GPU compute cluster was rock solid and trained our model without timeouts.', '2024-01-30'),
    (113, 9, 5, 'Exceptional throughput for fine-tuning our localized language models.', '2024-02-28'),
    (114, 3, 5, 'Vector indexing latency dropped to 12ms. Scales gracefully with our million embeddings.', '2024-02-05'),
    (116, 11, 5, 'Essential hardware token for our infrastructure access. Seamless WebAuthn support.', '2024-02-18'),
    (107, 6, 4, 'Very capable ESP32 board, good GPIO breakout and power efficiency.', '2024-03-05'),
    (109, 2, 4, 'Impressive wireless range across 5km in dense urban coverage testing.', '2024-03-12');
  `);
}
