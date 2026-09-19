const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const Expense = require('./models/Expense');
const app = require('./server');

async function runTests() {
  console.log('=== Starting Backend API Tests ===');
  
  // Wait a moment for DB connection
  let attempts = 0;
  while (mongoose.connection.readyState !== 1 && attempts < 20) {
    await new Promise(r => setTimeout(r, 500));
    attempts++;
  }

  if (mongoose.connection.readyState !== 1) {
    console.error('Database connection not established.');
    process.exit(1);
  }

  console.log('Database connected successfully. Running tests...');

  // Helper fetch function using built-in fetch
  const baseUrl = `http://localhost:${process.env.PORT || 5000}`;

  try {
    // Clean up test data
    await Expense.deleteMany({});

    // 1. Test POST /api/expenses (Valid)
    console.log('\nTest 1: POST /api/expenses (Valid)');
    const res1 = await fetch(`${baseUrl}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Team Lunch',
        amount: 45.50,
        category: 'food',
      }),
    });
    const exp1 = await res1.json();
    console.log(`Status: ${res1.status} (Expected: 201)`);
    console.log('Saved expense:', exp1._id, exp1.title, exp1.amount, exp1.category);
    if (res1.status !== 201) throw new Error('Test 1 failed');

    // Add another expense for summary testing
    await fetch(`${baseUrl}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Train Ticket',
        amount: 25.00,
        category: 'travel',
      }),
    });
    await fetch(`${baseUrl}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Dinner Pizza',
        amount: 30.00,
        category: 'food',
      }),
    });

    // 2. Test POST /api/expenses (Invalid validation)
    console.log('\nTest 2: POST /api/expenses (Invalid: short title, negative amount, bad category)');
    const res2 = await fetch(`${baseUrl}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'A',
        amount: -10,
        category: 'unknown_cat',
      }),
    });
    const err2 = await res2.json();
    console.log(`Status: ${res2.status} (Expected: 400)`);
    console.log('Error message received:', err2.message);
    if (res2.status !== 400) throw new Error('Test 2 failed');

    // 3. Test GET /api/expenses (all, newest first)
    console.log('\nTest 3: GET /api/expenses (All)');
    const res3 = await fetch(`${baseUrl}/api/expenses`);
    const allExpenses = await res3.json();
    console.log(`Status: ${res3.status} (Expected: 200)`);
    console.log(`Retrieved ${allExpenses.length} expenses. First item:`, allExpenses[0]?.title);
    if (res3.status !== 200 || allExpenses.length !== 3) throw new Error('Test 3 failed');

    // 4. Test GET /api/expenses?category=food
    console.log('\nTest 4: GET /api/expenses?category=food');
    const res4 = await fetch(`${baseUrl}/api/expenses?category=food`);
    const foodExpenses = await res4.json();
    console.log(`Status: ${res4.status} (Expected: 200)`);
    console.log(`Retrieved ${foodExpenses.length} food expenses (Expected: 2)`);
    if (res4.status !== 200 || foodExpenses.length !== 2) throw new Error('Test 4 failed');

    // 5. Test GET /api/expenses/summary ($group aggregation)
    console.log('\nTest 5: GET /api/expenses/summary');
    const res5 = await fetch(`${baseUrl}/api/expenses/summary`);
    const summary = await res5.json();
    console.log(`Status: ${res5.status} (Expected: 200)`);
    console.log('Summary result:', JSON.stringify(summary));
    // Food total should be 45.50 + 30.00 = 75.50
    const foodSummary = summary.find(s => s.category === 'food');
    console.log('Food total:', foodSummary?.total, '(Expected: 75.5)');
    if (res5.status !== 200 || !foodSummary || foodSummary.total !== 75.5) throw new Error('Test 5 failed');

    // 6. Test DELETE /api/expenses/:id
    console.log('\nTest 6: DELETE /api/expenses/:id (Valid ID)');
    const res6 = await fetch(`${baseUrl}/api/expenses/${exp1._id}`, {
      method: 'DELETE',
    });
    const delRes = await res6.json();
    console.log(`Status: ${res6.status} (Expected: 200)`);
    console.log('Delete message:', delRes.message);
    if (res6.status !== 200) throw new Error('Test 6 failed');

    // 7. Test DELETE /api/expenses/:id (Invalid ObjectID format - must not crash)
    console.log('\nTest 7: DELETE /api/expenses/invalid-id-12345 (Must return 404 and NOT crash)');
    const res7 = await fetch(`${baseUrl}/api/expenses/invalid-id-12345`, {
      method: 'DELETE',
    });
    const err7 = await res7.json();
    console.log(`Status: ${res7.status} (Expected: 404)`);
    console.log('404 response on invalid id:', err7.message);
    if (res7.status !== 404) throw new Error('Test 7 failed');

    // 8. Test DELETE /api/expenses/:id (Valid format but non-existent)
    console.log('\nTest 8: DELETE /api/expenses/:id (Non-existent ID)');
    const fakeId = new mongoose.Types.ObjectId();
    const res8 = await fetch(`${baseUrl}/api/expenses/${fakeId}`, {
      method: 'DELETE',
    });
    console.log(`Status: ${res8.status} (Expected: 404)`);
    if (res8.status !== 404) throw new Error('Test 8 failed');

    console.log('\n🎉 ALL 8 BACKEND API TESTS PASSED SUCCESSFULLY! 🎉');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Start test after a short delay
setTimeout(runTests, 2000);
