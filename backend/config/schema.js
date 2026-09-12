const db = require('./db');

// Lets code rely on newer columns while staying usable on databases where `npm run migrate`
// hasn't been run yet. Positive answers are cached for the life of the process; negative
// ones are re-checked after a minute.
const RECHECK_MS = 60 * 1000;
const columnCache = new Map();

const loadColumns = async (table) => {
  const cached = columnCache.get(table);
  if (cached && Date.now() - cached.at < RECHECK_MS) {
    return cached.columns;
  }

  const rows = await db.query(
    'SELECT column_name AS name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?',
    [table]
  );
  const columns = new Set(rows.map((row) => row.name || row.NAME || row.COLUMN_NAME));
  columnCache.set(table, { columns, at: Date.now() });
  return columns;
};

exports.getColumns = loadColumns;

exports.hasColumn = async (table, column) => {
  const columns = await loadColumns(table);
  return columns.has(column);
};
