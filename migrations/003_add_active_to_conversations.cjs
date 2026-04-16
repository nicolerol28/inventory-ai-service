exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE conversations
    DROP COLUMN IF EXISTS active;
  `);
};
