-- Database schema for the İrsaliye Okuyucu application

-- Create the receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on invoice_number for faster searches
CREATE INDEX IF NOT EXISTS idx_receipts_invoice_number ON receipts(invoice_number);

-- Create an index on product_name for faster searches
CREATE INDEX IF NOT EXISTS idx_receipts_product_name ON receipts(product_name);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);