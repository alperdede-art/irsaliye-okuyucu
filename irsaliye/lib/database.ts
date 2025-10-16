// Database implementation with Vercel Postgres support
// This implementation will automatically use Vercel Postgres when DATABASE_URL is set
// and fall back to in-memory storage for development

interface ReceiptRecord {
  id: number;
  invoiceNumber: string;
  date: string;
  productName: string;
  quantity: number;
  unit: string;
  confidence: number;
  imageUrl: string;
  createdAt: string;
}

// In-memory storage for development
let records: ReceiptRecord[] = [];
let nextId = 1;

// Check if we're running on Vercel with a database URL
const hasDatabase = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;

// Database functions
async function initDatabase() {
  if (!hasDatabase) return;
  
  try {
    const { Client } = await import('@vercel/postgres');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    
    // Create table if it doesn't exist
    await client.query(`
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
      )
    `);
    
    await client.end();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize database on module load
initDatabase().catch(console.error);

export async function saveReceipt(receiptData: any): Promise<ReceiptRecord> {
  if (hasDatabase) {
    try {
      const { Client } = await import('@vercel/postgres');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      
      await client.connect();
      
      const result = await client.query(
        `INSERT INTO receipts (invoice_number, date, product_name, quantity, unit, confidence, image_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [
          receiptData.invoiceNumber,
          receiptData.date,
          receiptData.productName,
          receiptData.quantity,
          receiptData.unit,
          receiptData.confidence,
          '/placeholder-image.jpg',
        ]
      );
      
      await client.end();
      return result.rows[0];
    } catch (error) {
      console.error('Database save error:', error);
      throw error;
    }
  } else {
    // Fallback to in-memory storage
    const newRecord: ReceiptRecord = {
      id: nextId++,
      invoiceNumber: receiptData.invoiceNumber,
      date: receiptData.date,
      productName: receiptData.productName,
      quantity: receiptData.quantity,
      unit: receiptData.unit,
      confidence: receiptData.confidence,
      imageUrl: "/placeholder-image.jpg",
      createdAt: new Date().toISOString()
    };
    
    records.push(newRecord);
    return newRecord;
  }
}

export async function getAllReceipts(): Promise<ReceiptRecord[]> {
  if (hasDatabase) {
    try {
      const { Client } = await import('@vercel/postgres');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      
      await client.connect();
      
      const result = await client.query(
        'SELECT * FROM receipts ORDER BY created_at DESC'
      );
      
      await client.end();
      return result.rows;
    } catch (error) {
      console.error('Database fetch error:', error);
      throw error;
    }
  } else {
    // Fallback to in-memory storage
    return [...records];
  }
}

export async function getReceiptById(id: number): Promise<ReceiptRecord | undefined> {
  if (hasDatabase) {
    try {
      const { Client } = await import('@vercel/postgres');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      
      await client.connect();
      
      const result = await client.query(
        'SELECT * FROM receipts WHERE id = $1',
        [id]
      );
      
      await client.end();
      return result.rows[0];
    } catch (error) {
      console.error('Database fetch error:', error);
      throw error;
    }
  } else {
    // Fallback to in-memory storage
    return records.find(record => record.id === id);
  }
}

export async function updateReceipt(id: number, updates: Partial<ReceiptRecord>): Promise<ReceiptRecord | null> {
  if (hasDatabase) {
    try {
      const { Client } = await import('@vercel/postgres');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      
      await client.connect();
      
      const fields = [];
      const values = [];
      let index = 1;
      
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt') {
          fields.push(`${snakeCase(key)} = $${index}`);
          values.push(value);
          index++;
        }
      }
      
      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      values.push(id);
      
      const result = await client.query(
        `UPDATE receipts SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
        values
      );
      
      await client.end();
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  } else {
    // Fallback to in-memory storage
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) {
      return null;
    }
    
    records[index] = { ...records[index], ...updates };
    return records[index];
  }
}

export async function deleteReceipt(id: number): Promise<boolean> {
  if (hasDatabase) {
    try {
      const { Client } = await import('@vercel/postgres');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      
      await client.connect();
      
      const result = await client.query(
        'DELETE FROM receipts WHERE id = $1',
        [id]
      );
      
      await client.end();
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    }
  } else {
    // Fallback to in-memory storage
    const initialLength = records.length;
    records = records.filter(record => record.id !== id);
    return records.length < initialLength;
  }
}

function snakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}