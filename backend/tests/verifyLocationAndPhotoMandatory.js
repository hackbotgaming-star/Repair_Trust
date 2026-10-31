const assert = require('assert');

async function run() {
  console.log('Testing reverse geocoding API...');
  const geoRes = await fetch('http://localhost:5000/api/v1/complaints/reverse-geocode?lat=12.6623&lng=77.4504');
  const geo = await geoRes.json();
  console.log('Reverse geocode result:', geo);
  assert.strictEqual(geo.success, true);
  assert.strictEqual(geo.data.rawRoad, 'Kanakapura Road');
  assert.strictEqual(geo.data.locality, 'Jakkasandra');
  assert.strictEqual(geo.data.street, 'Kanakapura Road, Jakkasandra');

  console.log('Testing mandatory photo upload rejection...');
  const boundary = '----WebKitFormBoundaryTestMandatory';
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nPothole / Damaged Road\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nTesting without photo\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="street"\r\n\r\nKanakapura Road\r\n`),
    Buffer.from(`--${boundary}--\r\n`)
  ]);

  const res = await fetch('http://localhost:5000/api/v1/complaints', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body
  });

  const data = await res.json();
  console.log('Submission without photo response (Status ' + res.status + '):', data);
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message.includes('Photo evidence is mandatory'), true);

  console.log('✅ ALL LOCATION REVERSE GEOCODING AND MANDATORY PHOTO TESTS PASSED!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
