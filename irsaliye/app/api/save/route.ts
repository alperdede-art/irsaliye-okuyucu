import { NextRequest } from 'next/server';
import { saveReceipt } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const receiptData = await request.json();
    
    // Save to database
    const savedRecord = await saveReceipt(receiptData);
    
    return new Response(JSON.stringify(savedRecord), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save error:', error);
    return new Response(JSON.stringify({ error: 'İrsaliye kaydedilirken bir hata oluştu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}