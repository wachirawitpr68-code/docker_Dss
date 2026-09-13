'use client';
import { useState, useEffect } from 'react';

const TABLES: Record<string, string[]> = {
  Customer: ['id', 'name', 'email'],
  Product: ['id', 'productName', 'currentPrice', 'stockQty'],
  Order: ['id', 'orderDate', 'customerId', 'paymentStatus'],
  OrderItem: ['id', 'orderId', 'productId', 'quantity', 'purchasePrice']
};

export default function DataViewer() {
  const [selectedTable, setSelectedTable] = useState('Customer');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (attr: string, value: string) => {
    setFilters(prev => ({ ...prev, [attr]: value }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, filters, limit })
      });
      const result = await res.json();
      setData(result.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedTable, limit]);

  return (
    <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">🔍 ค้นหาและเรียกดูข้อมูล (Data Explorer)</h2>
      
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-900">เลือกตาราง (Table):</label>
          <select 
            value={selectedTable} 
            onChange={(e) => {
              setSelectedTable(e.target.value);
              setFilters({}); // reset filters
            }}
            className="border border-gray-400 p-2 rounded-md bg-white text-gray-900 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {Object.keys(TABLES).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-900">จำนวนที่แสดง (Limit):</label>
          <select 
            value={limit} 
            onChange={e => setLimit(Number(e.target.value))} 
            className="border border-gray-400 p-2 rounded-md bg-white text-gray-900 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4 p-5 bg-gray-100 rounded-lg border border-gray-300 shadow-inner">
        {TABLES[selectedTable].map(attr => (
          <div key={attr}>
            <label className="block text-sm font-bold text-gray-800 mb-1">{attr}</label>
            <input 
              type="text" 
              placeholder={`พิมพ์คำค้นหา...`}
              value={filters[attr] || ''}
              onChange={(e) => handleFilterChange(attr, e.target.value)}
              className="border border-gray-400 p-2 w-full text-sm rounded-md bg-white text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div className="flex items-end">
          <button 
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm w-full font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            ค้นหาข้อมูล
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm mt-4 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-100 border-b border-gray-300">
            <tr>
              {TABLES[selectedTable].map(attr => (
                <th key={attr} className="py-3 px-4 font-bold text-gray-900 text-left">{attr}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-900 font-medium">กำลังค้นหาข้อมูล...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-900 font-medium">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50 transition-colors">
                  {TABLES[selectedTable].map(attr => (
                    <td key={attr} className="py-2 px-4 text-gray-900 font-medium">
                      {row[attr] !== null && row[attr] !== undefined ? String(row[attr]) : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm font-semibold text-gray-800 mt-3 text-right">แสดงข้อมูล {data.length} รายการ (จาก Limit {limit})</p>
    </div>
  );
}
