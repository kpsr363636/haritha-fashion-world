-- Add expired flag to loyalty_transactions for expiry scheduler
ALTER TABLE loyalty_transactions ADD COLUMN IF NOT EXISTS expired BOOLEAN NOT NULL DEFAULT FALSE;

-- Add is_active flag to product_variants if missing (used by low-stock query)
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
