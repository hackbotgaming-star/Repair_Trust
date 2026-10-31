const test = require('node:test');
const assert = require('node:assert');
const { validateMagicBytes } = require('../src/services/evidenceScreeningService');

test('validateMagicBytes correctly recognizes JPEG, PNG, and WebM buffers', () => {
  // JPEG magic: FF D8 FF
  const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  assert.strictEqual(validateMagicBytes(jpegBuffer), true);

  // PNG magic: 89 50 4E 47 0D 0A 1A 0A
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.strictEqual(validateMagicBytes(pngBuffer), true);

  // WebM magic: 1A 45 DF A3
  const webmBuffer = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81]);
  assert.strictEqual(validateMagicBytes(webmBuffer), true);

  // Fake executable/text buffer posing as image
  const maliciousBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
  assert.strictEqual(validateMagicBytes(maliciousBuffer), false);
});
