'use client';

import { useState, useRef, ChangeEvent } from 'react';
import axios from 'axios';

interface ReceiptData {
  invoiceNumber: string;
  date: string;
  productName: string;
  quantity: number;
  unit: string;
  confidence: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('Dosya boyutu 10MB\'dan küçük olmalıdır');
        return;
      }
      
      if (!selectedFile.type.startsWith('image/')) {
        alert('Sadece resim dosyaları yüklenebilir');
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setReceiptData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setReceiptData(response.data);
    } catch (error) {
      console.error('Yükleme hatası:', error);
      alert('İrsaliye işlenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!receiptData) return;
    
    setIsSaving(true);
    
    try {
      await axios.post('/api/save', receiptData);
      alert('İrsaliye başarıyla kaydedildi');
      // Reset form
      setFile(null);
      setPreviewUrl(null);
      setReceiptData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('İrsaliye kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (field: keyof ReceiptData, value: string | number) => {
    if (!receiptData) return;
    
    setReceiptData({
      ...receiptData,
      [field]: value,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <h1 className="text-3xl font-bold mb-8">İrsaliye Okuyucu</h1>
      
      {!previewUrl ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-5xl mb-4">📸</div>
          <p className="text-lg mb-2">Fotoğraf Yükle veya Çek</p>
          <p className="text-sm text-gray-500">Maksimum 10MB, sadece resim dosyaları</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-auto rounded-lg border"
            />
          </div>
          
          {!receiptData ? (
            <div className="flex flex-col items-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {isUploading ? 'İşleniyor...' : 'İrsaliyeyi Oku'}
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Çıkarılan Bilgiler</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İrsaliye No</label>
                  <input
                    type="text"
                    value={receiptData.invoiceNumber}
                    onChange={(e) => handleEdit('invoiceNumber', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${receiptData.confidence * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Güven: {(receiptData.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarih</label>
                  <input
                    type="text"
                    value={receiptData.date}
                    onChange={(e) => handleEdit('date', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mal/Ürün Adı</label>
                  <input
                    type="text"
                    value={receiptData.productName}
                    onChange={(e) => handleEdit('productName', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adet</label>
                    <input
                      type="number"
                      value={receiptData.quantity}
                      onChange={(e) => handleEdit('quantity', Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Birim</label>
                    <select
                      value={receiptData.unit}
                      onChange={(e) => handleEdit('unit', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="adet">Adet</option>
                      <option value="kg">Kilogram</option>
                      <option value="ton">Ton</option>
                      <option value="pcs">Pieces</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setReceiptData(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}