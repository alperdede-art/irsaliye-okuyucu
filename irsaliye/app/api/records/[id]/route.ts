import { NextRequest } from 'next/server';
import { getReceiptById, updateReceipt, deleteReceipt } from '@/lib/database';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Geçersiz ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const updates = await request.json();
    const updatedRecord = await updateReceipt(id, updates);
    
    if (!updatedRecord) {
      return new Response(JSON.stringify({ error: 'Kayıt bulunamadı' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(updatedRecord), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update error:', error);
    return new Response(JSON.stringify({ error: 'Kayıt güncellenirken bir hata oluştu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Geçersiz ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const deleted = await deleteReceipt(id);
    
    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Kayıt bulunamadı' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ message: 'Kayıt silindi' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(JSON.stringify({ error: 'Kayıt silinirken bir hata oluştu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}