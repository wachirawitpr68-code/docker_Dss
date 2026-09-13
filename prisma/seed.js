const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function readCSV(filePath) {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function main() {
  console.log("Starting seed process...");

  const dataDir = path.join(__dirname, '../../data');

  // 1. Customers
  console.log("Reading customers...");
  const customers = await readCSV(path.join(dataDir, 'customers.csv'));
  await prisma.customer.createMany({
    data: customers.map(c => ({
      id: c.customer_id,
      name: c.name,
      email: c.email,
      passwordHash: c.password_hash
    })),
    skipDuplicates: true
  });
  console.log(`Inserted ${customers.length} customers.`);

  // 2. Products
  console.log("Reading products...");
  const products = await readCSV(path.join(dataDir, 'products.csv'));
  await prisma.product.createMany({
    data: products.map(p => ({
      id: p.product_id,
      productName: p.product_name,
      currentPrice: parseFloat(p.current_price),
      stockQty: parseInt(p.stock_qty, 10)
    })),
    skipDuplicates: true
  });
  console.log(`Inserted ${products.length} products.`);

  // 3. Orders (Batch insert for large scale)
  console.log("Reading orders...");
  const orders = await readCSV(path.join(dataDir, 'orders.csv'));
  
  // Convert date format "2023-01-01 12:00:00" to ISO-8601
  const mapDate = (d) => {
    return new Date(d.replace(' ', 'T') + 'Z');
  };

  const orderBatches = [];
  const batchSize = 5000;
  for (let i = 0; i < orders.length; i += batchSize) {
    orderBatches.push(orders.slice(i, i + batchSize));
  }

  for (let i = 0; i < orderBatches.length; i++) {
    await prisma.order.createMany({
      data: orderBatches[i].map(o => ({
        id: o.order_id,
        orderDate: mapDate(o.order_date),
        customerId: o.customer_id,
        paymentStatus: o.payment_status
      })),
      skipDuplicates: true
    });
    console.log(`Inserted order batch ${i + 1}/${orderBatches.length}`);
  }

  // 4. Order Items
  console.log("Reading order items...");
  const orderItems = await readCSV(path.join(dataDir, 'order_items.csv'));
  
  const itemBatches = [];
  for (let i = 0; i < orderItems.length; i += batchSize) {
    itemBatches.push(orderItems.slice(i, i + batchSize));
  }

  for (let i = 0; i < itemBatches.length; i++) {
    await prisma.orderItem.createMany({
      data: itemBatches[i].map(oi => ({
        id: parseInt(oi.order_item_id, 10),
        orderId: oi.order_id,
        productId: oi.product_id,
        quantity: parseInt(oi.quantity, 10),
        purchasePrice: parseFloat(oi.purchase_price)
      })),
      skipDuplicates: true
    });
    console.log(`Inserted order item batch ${i + 1}/${itemBatches.length}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
