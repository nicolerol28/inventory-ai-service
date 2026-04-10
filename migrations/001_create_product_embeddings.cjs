exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS product_embeddings (
      id          BIGSERIAL PRIMARY KEY,
      product_id  BIGINT NOT NULL UNIQUE,
      content     TEXT NOT NULL,
      embedding   vector(768),
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS product_embeddings_embedding_idx
      ON product_embeddings
      USING hnsw (embedding vector_cosine_ops);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS product_embeddings_embedding_idx;
    DROP TABLE IF EXISTS product_embeddings;
  `);
};