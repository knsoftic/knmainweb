const db = require('./src/config/db');

async function updateAddress() {
  try {
    const address = 'KN Softic, Faisalabad, Pakistan';
    await db.query(`
      UPDATE settings 
      SET 
        company_address = ?,
        office_address = ?,
        contact_address = ?
      WHERE id = 1
    `, [address, address, address]);
    console.log('Address updated to Faisalabad!');
  } catch (err) {
    console.error('Error updating address:', err);
  }
  process.exit(0);
}
updateAddress();
