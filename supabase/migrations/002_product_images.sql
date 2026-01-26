-- KASIR Store: Product Images Table
-- Migration for multiple images per product

-- =====================
-- PRODUCT IMAGES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for product lookups and ordering
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images(product_id, position);

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view product images
CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (true);

-- Admins can insert product images
CREATE POLICY "Admins can insert product images"
  ON product_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update product images
CREATE POLICY "Admins can update product images"
  ON product_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete product images
CREATE POLICY "Admins can delete product images"
  ON product_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================
-- TRIGGERS
-- =====================

-- Apply updated_at trigger to product_images
CREATE TRIGGER update_product_images_updated_at
  BEFORE UPDATE ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
