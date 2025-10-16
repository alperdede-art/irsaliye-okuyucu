import { NextRequest } from 'next/server';
import { getAllReceipts } from '@/lib/database';

export async function GET() {
  try {
    const records = await getAllReceipts();
    
    // Create CSV content
    const headers = ['İrsaliye No', 'Tarih', 'Ürün Adı', 'Adet', 'Birim', 'Güven'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        `"${record.invoiceNumber}"`,
        `"${record.date}"`,
        `"${record.productName}"`,
        record.quantity,
        `"${record.unit}"`,
        record.confidence.toFixed(2)
      ].join(','))
    ].join('\n');
    
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename="irsaliye_kayitlari.csv"'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response('CSV dışa aktarılırken bir hata oluştu', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}