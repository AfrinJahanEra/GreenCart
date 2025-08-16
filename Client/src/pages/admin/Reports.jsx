import { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';
import html2pdf from 'html2pdf.js';
import lowLightImg from '../../assets/ardella.jpeg';
import petFriendlyImg from '../../assets/margent.jpeg';
import airPurifyingImg from '../../assets/snake.jpeg';
import beginnerFriendlyImg from '../../assets/Blosom.jpeg';

const Reports = () => {
  const { users } = useOutletContext();
  const [reportType, setReportType] = useState('sales');
  const reportRef = useRef();

  // Sample report data - in a real app, this would come from an API
  const reports = {
    sales: [
      {
        id: 1,
        plantId: 101,
        plantName: 'Monstera Deliciosa',
        plantImage: airPurifyingImg,
        customerId: 201,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        message: 'Customer was very interested in air-purifying plants',
        date: '2023-06-15',
        amount: 45
      },
      {
        id: 2,
        plantId: 102,
        plantName: 'Snake Plant',
        plantImage: lowLightImg,
        customerId: 202,
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        message: 'Customer needed low-maintenance plants for office',
        date: '2023-06-14',
        amount: 35
      }
    ],
    deliveries: [
      {
        id: 1,
        plantId: 101,
        plantImage: airPurifyingImg,
        customerName: 'John Doe',
        deliveryAgent: 'Mike Brown',
        message: 'Delivered successfully, customer satisfied',
        date: '2023-06-15',
        status: 'Delivered'
      },
      {
        id: 2,
        plantId: 102,
        plantImage: lowLightImg,
        customerName: 'Jane Smith',
        deliveryAgent: 'Sarah Wilson',
        message: 'Package left at front door as requested',
        date: '2023-06-14',
        status: 'Delivered'
      }
    ],
    inquiries: [
      {
        id: 1,
        plantId: 103,
        plantImage: petFriendlyImg,
        customerName: 'Emily Davis',
        message: 'Asked about toxicity to cats',
        date: '2023-06-15',
        status: 'Responded'
      },
      {
        id: 2,
        plantId: 104,
        plantImage: beginnerFriendlyImg,
        customerName: 'David Miller',
        message: 'Inquired about watering schedule',
        date: '2023-06-14',
        status: 'Pending'
      }
    ]
  };

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `${reportType}-report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Reports & Analytics</h1>
        <button
          onClick={handleDownloadPDF}
          className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors flex items-center gap-2 w-full md:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export PDF
        </button>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex border-b border-gray-200 w-max md:w-full">
          <button
            onClick={() => setReportType('sales')}
            className={`px-4 py-2 font-medium ${reportType === 'sales' ? 'text-[#224229] border-b-2 border-[#224229]' : 'text-gray-500 hover:text-[#224229]'}`}
          >
            Sales Reports
          </button>
          <button
            onClick={() => setReportType('deliveries')}
            className={`px-4 py-2 font-medium ${reportType === 'deliveries' ? 'text-[#224229] border-b-2 border-[#224229]' : 'text-gray-500 hover:text-[#224229]'}`}
          >
            Delivery Reports
          </button>
          <button
            onClick={() => setReportType('inquiries')}
            className={`px-4 py-2 font-medium ${reportType === 'inquiries' ? 'text-[#224229] border-b-2 border-[#224229]' : 'text-gray-500 hover:text-[#224229]'}`}
          >
            Customer Inquiries
          </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: theme.colors.primary }}>
            {reportType === 'sales' && 'Sales Reports'}
            {reportType === 'deliveries' && 'Delivery Reports'}
            {reportType === 'inquiries' && 'Customer Inquiries'}
          </h2>
          
          {reportType === 'sales' && (
            <div className="space-y-6">
              {reports.sales.map(report => (
                <div key={report.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/4">
                      <img 
                        src={report.plantImage} 
                        alt={report.plantName} 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="w-full md:w-3/4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: theme.colors.primary }}>{report.plantName}</h3>
                          <p className="text-gray-600">Plant ID: {report.plantId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${report.amount}</p>
                          <p className="text-gray-600">{report.date}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium mb-1">Customer Details</h4>
                        <p>{report.customerName}</p>
                        <p className="text-gray-600">{report.customerEmail}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Sales Notes</h4>
                        <p className="bg-gray-50 p-3 rounded-lg">{report.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reportType === 'deliveries' && (
            <div className="space-y-6">
              {reports.deliveries.map(report => (
                <div key={report.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/4">
                      <img 
                        src={report.plantImage} 
                        alt={`Plant ${report.plantId}`} 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="w-full md:w-3/4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: theme.colors.primary }}>Delivery #{report.id}</h3>
                          <p className="text-gray-600">Plant ID: {report.plantId}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                          <p className="text-gray-600">{report.date}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-1">Customer</h4>
                          <p>{report.customerName}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Delivery Agent</h4>
                          <p>{report.deliveryAgent}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Delivery Notes</h4>
                        <p className="bg-gray-50 p-3 rounded-lg">{report.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reportType === 'inquiries' && (
            <div className="space-y-6">
              {reports.inquiries.map(report => (
                <div key={report.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/4">
                      <img 
                        src={report.plantImage} 
                        alt={`Plant ${report.plantId}`} 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="w-full md:w-3/4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: theme.colors.primary }}>Inquiry #{report.id}</h3>
                          <p className="text-gray-600">Plant ID: {report.plantId}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'Responded' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                          <p className="text-gray-600">{report.date}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium mb-1">Customer</h4>
                        <p>{report.customerName}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Customer Message</h4>
                        <p className="bg-gray-50 p-3 rounded-lg">{report.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reports[reportType].length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No reports available for this category
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.primary }}>Summary Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="border p-4 rounded-lg">
            <h4 className="text-gray-500 text-sm mb-2">Total Sales</h4>
            <p className="text-xl sm:text-2xl font-bold">
              ${reports.sales.reduce((total, report) => total + report.amount, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">{reports.sales.length} transactions</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h4 className="text-gray-500 text-sm mb-2">Completed Deliveries</h4>
            <p className="text-xl sm:text-2xl font-bold">
              {reports.deliveries.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">100% success rate</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h4 className="text-gray-500 text-sm mb-2">Customer Inquiries</h4>
            <p className="text-xl sm:text-2xl font-bold">
              {reports.inquiries.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {reports.inquiries.filter(r => r.status === 'Responded').length} responded
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;