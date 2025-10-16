import { NextRequest } from 'next/server';
import { getAllReceipts } from '@/lib/database';

export async function GET() {
  try {
    const records = await getAllReceipts();
    
    return new Response(JSON.stringify(records), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Fetch records error:', error);
    return new Response(JSON.stringify({ error: 'Kayıtlar alınırken bir hata oluştu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}