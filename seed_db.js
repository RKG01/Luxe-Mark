import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgres://neondb_owner:npg_r0tS3TWwRisd@ep-patient-mountain-aol0oo41-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const categoriesToSeed = [
  { name: 'Electronics', description: 'Smartphones, Laptops, and modern tech accessories' },
  { name: 'Fashion', description: 'Apparel, footwear, and accessories' },
  { name: 'Home & Kitchen', description: 'Kitchenware, appliances, and home decor' },
  { name: 'Books', description: 'Fiction, non-fiction, and educational literature' }
];

const productsToSeed = {
  'Electronics': [
    { name: 'iPhone 15 Pro Max', description: 'Apple iPhone 15 Pro Max, 256GB, Titanium Blue - Super Retina XDR display.', price: 139900.00, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5' },
    { name: 'MacBook Pro M3', description: 'Apple 2024 MacBook Pro Laptop M3 chip: 14.2-inch Liquid Retina XDR Display, 16GB Unified Memory.', price: 169900.00, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' },
    { name: 'Sony WH-1000XM5', description: 'Sony Wireless Industry Leading Noise Canceling Overhead Headphones, Black.', price: 29990.00, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
    { name: 'Apple Watch Series 9', description: 'Smartwatch with Midnight Aluminum Case with Midnight Sport Band. Fitness Tracker.', price: 41900.00, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' },
    { name: 'iPad Air M1', description: 'Apple iPad Air (5th Generation): with M1 chip, 10.9-inch Liquid Retina Display, 64GB.', price: 59900.00, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0' },
    { name: 'Sony Alpha 7 IV', description: 'Sony Alpha 7 IV Full-frame Mirrorless Interchangeable Lens Camera - 33MP.', price: 219900.00, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32' },
    { name: 'JBL Flip 6 Speaker', description: 'Portable Waterproof Bluetooth Speaker with 2-Way Speaker System, Red.', price: 9999.00, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1' },
    { name: 'Anker Power Bank 20K', description: 'Anker Power Bank, 20,000mAh Portable Charger with PowerIQ Technology.', price: 3499.00, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1609592424085-f5b045e3f538' },
    { name: 'Logitech MX Master 3S', description: 'Logitech Performance Wireless Mouse with Ultra-fast Scrolling, Ergonomic Design.', price: 9499.00, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7' },
    { name: 'Keychron K2 Keyboard', description: 'Wireless Mechanical Keyboard with Gateron G Pro Brown Switches, RGB Backlight.', price: 7999.00, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3' }
  ],
  'Fashion': [
    { name: 'Nike Pegasus 40 Shoes', description: 'Nike Pegasus 40 Men Road Running Shoes. Lightweight mesh upper, Zoom Air cushioning.', price: 11495.00, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
    { name: 'Levis 511 Slim Jeans', description: 'Levis Mens 511 Slim Fit Stretch Jeans, Durable Denim Construction.', price: 3599.00, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
    { name: 'Champion Fleece Hoodie', description: 'Champion Reverse Weave Hoodie, Heavyweight Fabric, Embroidered Logo, Classic fit.', price: 4999.00, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7' },
    { name: 'Ray-Ban Classic Wayfarer', description: 'Ray-Ban Wayfarer Classic Sunglasses, Black Frame, Green Classic G-15 Lenses.', price: 9890.00, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f' },
    { name: 'Zara Evening Dress', description: 'Zara Women Elegant Evening Slip Dress, Premium Satin Finish, Sleeveless.', price: 5990.00, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8' },
    { name: 'Patagonia Torrent Jacket', description: 'Patagonia Torrentshell 3L Waterproof Rain Jacket, Recycled Nylon Fabric.', price: 12999.00, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27' },
    { name: 'Herschel Heritage Pack', description: 'Herschel Heritage Backpack, Durable Polyester Canvas, Signature Striped Liner.', price: 4599.00, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62' },
    { name: 'Tommy Hilfiger Belt', description: 'Tommy Hilfiger Mens Dress Leather Belt with Brushed Metal Buckle, Tan.', price: 2499.00, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb8ecfbd4' },
    { name: 'Adidas Cushioned Socks', description: 'Adidas Athletic Cushioned Crew Socks (3-Pack), Moisture-Wicking Performance.', price: 899.00, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558' },
    { name: 'Fossil Minimalist Watch', description: 'Fossil Mens Minimalist Slim Quartz Stainless Steel Leather Strap Dress Watch.', price: 8495.00, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d' }
  ],
  'Home & Kitchen': [
    { name: 'Philips Air Fryer', description: 'Philips Essential Airfryer with Rapid Air Technology, 4.1L Capacity, Analog Controls.', price: 8999.00, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736' },
    { name: 'Nespresso Coffee Maker', description: 'Nespresso Vertuo Next Coffee and Espresso Machine by DeLonghi, Premium Red.', price: 18999.00, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fc9f' },
    { name: 'Ninja Pro Blender', description: 'Ninja Professional Blender with 1000-Watt Base and 72oz Pitcher for Crushing Ice.', price: 7999.00, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1' },
    { name: 'Instant Pot Multi-Cooker', description: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, Slow Cooker, Rice Cooker.', price: 9999.00, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707' },
    { name: 'Dyson V12 Cordless Vacuum', description: 'Dyson V12 Detect Slim Cordless Vacuum Cleaner with Laser Dust Detection.', price: 45900.00, stock: 7, imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001' },
    { name: 'Corelle Dinner Set 18pc', description: 'Corelle Service for 6 Dinnerware Set, Vitrelle Chip and Break Resistant Glass.', price: 6999.00, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7' },
    { name: 'Tefal Cookware Set', description: 'Tefal Non-Stick Aluminum Cookware Set (10-Piece), Thermo-spot Heat Indicator.', price: 5499.00, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7' },
    { name: 'Hydro Flask Water Bottle', description: 'Hydro Flask Wide Mouth Straw Lid Water Bottle, Double-Wall Vacuum Insulation.', price: 3299.00, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8' },
    { name: 'Bombay Cotton Bed Sheets', description: 'Bombay Dyeing Double Bed Cotton Bedsheet with 2 Matching Pillow Covers.', price: 2199.00, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af' },
    { name: 'Philips LED Desk Lamp', description: 'Philips Rechargeable LED Desk Lamp, 3-Level Dimming, Eye-Comfort Technology.', price: 1499.00, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c' }
  ],
  'Books': [
    { name: 'Atomic Habits', description: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear.', price: 499.00, stock: 120, imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f' },
    { name: 'Dune (Sci-Fi Novel)', description: 'Dune: Book 1 in the classic Dune sci-fi saga by Frank Herbert. Collector\'s Edition.', price: 599.00, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a' },
    { name: 'Thinking Fast and Slow', description: 'Thinking, Fast and Slow by Daniel Kahneman. Exploration of cognitive systems.', price: 699.00, stock: 70, imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73' },
    { name: 'Sapiens', description: 'Sapiens: A Brief History of Humankind by Yuval Noah Harari. Bestselling non-fiction.', price: 550.00, stock: 95, imageUrl: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76' },
    { name: 'Gordons Ramsay Cookbook', description: 'Gordon Ramsay Quick & Easy: 100 Recipes in 30 Minutes or Less. Hardcover.', price: 1299.00, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e' },
    { name: 'Educated (Memoir)', description: 'Educated: A Memoir by Tara Westover. Bestselling autobiography of resilience.', price: 450.00, stock: 65, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794' },
    { name: 'The Silent Patient', description: 'The Silent Patient: Psychological mystery thriller by Alex Michaelides.', price: 399.00, stock: 110, imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73' },
    { name: 'The Intelligent Investor', description: 'The Intelligent Investor: The Definitive Book on Value Investing by Benjamin Graham.', price: 650.00, stock: 85, imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666' },
    { name: 'Milk and Honey Poetry', description: 'Milk and Honey: Bestselling poetry and prose collection by Rupi Kaur.', price: 350.00, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6' },
    { name: 'Harry Potter Box Set', description: 'Harry Potter Paperback Box Set (Books 1-7) by J.K. Rowling in Premium Slipcase.', price: 2999.00, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76' }
  ]
};

async function seed() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Neon PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    // 1. Ensure Admin Users exist
    async function ensureUser(username, email, passwordHash) {
      const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      let userId;
      if (userRes.rows.length === 0) {
        const insertUserRes = await client.query(
          'INSERT INTO users (username, email, password, enabled) VALUES ($1, $2, $3, $4) RETURNING id',
          [username, email, passwordHash, true]
        );
        userId = insertUserRes.rows[0].id;
        console.log(`User ${username} registered with ID: ${userId}`);
      } else {
        userId = userRes.rows[0].id;
        console.log(`User ${username} already exists with ID: ${userId}. Resetting password and enabling...`);
        await client.query(
          'UPDATE users SET password = $1, enabled = $2 WHERE id = $3',
          [passwordHash, true, userId]
        );
      }
      
      const rolesRes = await client.query('SELECT id, name FROM roles WHERE name IN (\'ROLE_ADMIN\', \'ROLE_CUSTOMER\')');
      for (const role of rolesRes.rows) {
        await client.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userId, role.id]
        );
      }
    }

    console.log('Ensuring admin user accounts are seeded...');
    await ensureUser('admin', 'admin@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8GP.3xg3eXn.0V2WJ2wZ3j7DtbL5c59n9J.');
    await ensureUser('ryuk', 'ryuk@example.com', '$2a$12$4XcA1umpiJRuRRf3kMyKT.A3zaDv4XipxmBsbKoSZjV335I03SPPa');
    console.log('Admin user accounts and roles mapped successfully.');

    // 2. Seeding Categories
    const categoryIds = {};
    for (const cat of categoriesToSeed) {
      const catRes = await client.query('SELECT id FROM categories WHERE name = $1', [cat.name]);
      if (catRes.rows.length === 0) {
        const insertCatRes = await client.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [cat.name, cat.description]
        );
        categoryIds[cat.name] = insertCatRes.rows[0].id;
        console.log(`Seeded category: ${cat.name} (ID: ${categoryIds[cat.name]})`);
      } else {
        categoryIds[cat.name] = catRes.rows[0].id;
        console.log(`Category exists: ${cat.name} (ID: ${categoryIds[cat.name]})`);
      }
    }

    // 3. Seeding Products
    for (const [catName, products] of Object.entries(productsToSeed)) {
      const categoryId = categoryIds[catName];
      console.log(`Seeding products for category: ${catName} (ID: ${categoryId})...`);

      for (const p of products) {
        const prodRes = await client.query('SELECT id FROM products WHERE name = $1', [p.name]);
        if (prodRes.rows.length === 0) {
          await client.query(
            'INSERT INTO products (name, description, price, stock, image_url, category_id, active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [p.name, p.description, p.price, p.stock, p.imageUrl, categoryId, true]
          );
          console.log(`  Seeded product: ${p.name}`);
        } else {
          console.log(`  Product already exists: ${p.name}`);
        }
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (e) {
    console.error('Error during database seeding:', e);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

seed();
