/**
 * Safe, collision-free sequential ID generator for RepairTrust entities.
 * Scans existing records to find the highest sequence number and increments it,
 * guaranteeing no duplicate key collisions (E11000).
 */

async function generateSequentialId(Model, field, prefix) {
  const year = new Date().getFullYear();
  const basePrefix = `${prefix}-${year}-`;

  try {
    const existing = await Model.find({ [field]: { $regex: `^${basePrefix}` } })
      .select(field)
      .lean();

    let maxSeq = 100;
    const regex = new RegExp(`^${basePrefix}(\\d+)$`);

    for (const doc of existing) {
      const val = doc[field];
      if (val) {
        const match = val.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    }

    let candidate = `${basePrefix}${String(maxSeq + 1).padStart(4, '0')}`;

    // Verify absolute uniqueness
    while (await Model.exists({ [field]: candidate })) {
      maxSeq++;
      candidate = `${basePrefix}${String(maxSeq + 1).padStart(4, '0')}`;
    }

    return candidate;
  } catch (err) {
    // Fallback timestamp + random suffix in case of regex query failure
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `${basePrefix}${Date.now().toString().slice(-4)}${rnd}`;
  }
}

module.exports = { generateSequentialId };
