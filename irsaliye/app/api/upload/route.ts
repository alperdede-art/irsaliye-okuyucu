import { NextRequest } from 'next/server';
import { extractReceiptData } from '@/lib/ocr';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'Dosya bulunamadı' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Dosya boyutu 10MB\'dan büyük olamaz' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' 
        }
      });
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Sadece resim dosyaları kabul edilir' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Process the image with OCR
    const receiptData = await extractReceiptData(file);
    
    return new Response(JSON.stringify(receiptData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    return new Response(JSON.stringify({ error: 'İrsaliye işlenirken bir hata oluştu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}