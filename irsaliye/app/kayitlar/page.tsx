'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ReceiptRecord {
  id: number;
  invoiceNumber: string;
  date: string;
  productName: string;
  quantity: number;
  unit: string;
  confidence: number;
  imageUrl: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<ReceiptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ReceiptRecord>>({});

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/records');
      setRecords(response.data);
    } catch (error) {
      console.error('Kayıtlar alınırken hata oluştu:', error);
      alert('Kayıtlar alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    
    try {
      await axios.delete(`/api/records/${id}`);
      fetchRecords(); // Refresh the list
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Kayıt silinirken bir hata oluştu');
    }
  };

  const handleEdit = (record: ReceiptRecord) => {
    setEditingId(record.id);
    setEditData({ ...record });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    try {
      await axios.put(`/api/records/${editingId}`, editData);
      setEditingId(null);
      setEditData({});
      fetchRecords(); // Refresh the list
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Kayıt güncellenirken bir hata oluştu');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleExport = () => {
    window.location.href = '/api/export.csv';
  };

  const filteredRecords = records.filter(record => 
    record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Kayıtlı İrsaliyeler</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="İrsaliye No veya Ürün Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
            />
            <svg 
              className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleExport}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            CSV İndir
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz kayıt bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">İrsaliye No</th>
                <th className="py-3 px-4 text-left">Tarih</th>
                <th className="py-3 px-4 text-left">Ürün Adı</th>
                <th className="py-3 px-4 text-left">Adet</th>
                <th className="py-3 px-4 text-left">Birim</th>
                <th className="py-3 px-4 text-left">Güven</th>
                <th className="py-3 px-4 text-left">Görsel</th>
                <th className="py-3 px-4 text-left">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  {editingId === record.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editData.invoiceNumber || ''}
                          onChange={(e) => setEditData({...editData, invoiceNumber: e.target.value})}
                          className="border rounded p-1 w-full"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editData.date || ''}
                          onChange={(e) => setEditData({...editData, date: e.target.value})}
                          className="border rounded p-1 w-full"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editData.productName || ''}
                          onChange={(e) => setEditData({...editData, productName: e.target.value})}
                          className="border rounded p-1 w-full"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={editData.quantity || ''}
                          onChange={(e) => setEditData({...editData, quantity: Number(e.target.value)})}
                          className="border rounded p-1 w-full"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editData.unit || ''}
                          onChange={(e) => setEditData({...editData, unit: e.target.value})}
                          className="border rounded p-1 w-full"
                        >
                          <option value="adet">Adet</option>
                          <option value="kg">Kilogram</option>
                          <option value="ton">Ton</option>
                          <option value="pcs">Pieces</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {(editData.confidence || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <img 
                          src={record.imageUrl} 
                          alt="İrsaliye" 
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">{record.invoiceNumber}</td>
                      <td className="py-3 px-4">{record.date}</td>
                      <td className="py-3 px-4">{record.productName}</td>
                      <td className="py-3 px-4">{record.quantity}</td>
                      <td className="py-3 px-4">{record.unit}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(record.confidence || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span>{(record.confidence || 0).toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <img 
                          src={record.imageUrl} 
                          alt="İrsaliye" 
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}