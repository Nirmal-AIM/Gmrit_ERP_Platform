const bcrypt = require('bcryptjs');

// Test password hashing
const password = 'Admin@123';

// Generate a new hash
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('\n=== Password Hash Generator ===\n');
    console.log('Password:', password);
    console.log('\nGenerated Hash:');
    console.log(hash);
    console.log('\n=== SQL Query to Update Admin User ===\n');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@erp.com';`);
    console.log('\n');

    // Test if the hash works
    bcrypt.compare(password, hash, (err, result) => {
        console.log('Hash verification test:', result ? '✅ PASS' : '❌ FAIL');
        console.log('\n');
    });
});
