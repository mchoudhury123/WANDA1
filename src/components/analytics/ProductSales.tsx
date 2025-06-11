import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, isWithinInterval } from 'date-fns';

interface ProductSalesProps {
  products: any[];
  staff: any[];
  dateRange: { start: Date; end: Date };
}

const ProductSales: React.FC<ProductSalesProps> = ({ products, staff, dateRange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [productSalesData, setProductSalesData] = useState<any[]>([]);
  const [staffSalesData, setStaffSalesData] = useState<any[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<any[]>([]);
  const [stockTurnover, setStockTurnover] = useState<any[]>([]);

  useEffect(() => {
    calculateProductSales();
    calculateStaffSales();
    calculateRevenueBreakdown();
    calculateStockTurnover();
  }, [products, staff, dateRange]);

  // Calculate product sales
  const calculateProductSales = () => {
    if (!products.length) {
      setProductSalesData([]);
      return;
    }

    // For simplicity, assuming products contain sales data
    // In a real app, we'd fetch sales data from a separate collection
    const productData = products.map(product => {
      // Filter sales within date range
      const salesInRange = (product.sales || []).filter((sale: any) =>
        isWithinInterval(new Date(sale.date), {
          start: dateRange.start,
          end: dateRange.end
        })
      );
      
      // Calculate total sales
      const totalSales = salesInRange.reduce(
        (sum: number, sale: any) => sum + (sale.quantity || 0),
        0
      );
      
      // Calculate total revenue
      const totalRevenue = salesInRange.reduce(
        (sum: number, sale: any) => sum + ((sale.quantity || 0) * (product.price || 0)),
        0
      );
      
      return {
        id: product.id,
        name: product.name || 'Unknown Product',
        category: product.category || 'Uncategorized',
        price: product.price || 0,
        totalSales,
        totalRevenue,
        stock: product.stock || 0
      };
    });
    
    // Sort by total revenue
    const sortedProducts = productData.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    setProductSalesData(sortedProducts);
  };

  // Calculate staff sales
  const calculateStaffSales = () => {
    if (!products.length || !staff.length) {
      setStaffSalesData([]);
      return;
    }

    // Initialize sales data for each staff member
    const staffSales = staff.map(staffMember => ({
      id: staffMember.id,
      name: staffMember.name || 'Unknown Staff',
      totalSales: 0,
      totalRevenue: 0,
      productsSold: new Set()
    }));
    
    // For each product, add its sales to the respective staff member
    products.forEach(product => {
      (product.sales || []).forEach((sale: any) => {
        // Check if sale is within date range
        if (!isWithinInterval(new Date(sale.date), {
          start: dateRange.start,
          end: dateRange.end
        })) {
          return;
        }
        
        // Find the staff member
        const staffIndex = staffSales.findIndex(s => s.id === sale.staffId);
        if (staffIndex === -1) return;
        
        // Update staff sales data
        staffSales[staffIndex].totalSales += (sale.quantity || 0);
        staffSales[staffIndex].totalRevenue += ((sale.quantity || 0) * (product.price || 0));
        staffSales[staffIndex].productsSold.add(product.id);
      });
    });
    
    // Convert Sets to counts and sort by revenue
    const processedStaffSales = staffSales.map(staff => ({
      ...staff,
      uniqueProducts: staff.productsSold.size,
      productsSold: undefined
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    setStaffSalesData(processedStaffSales);
  };

  // Calculate revenue breakdown (services vs retail)
  const calculateRevenueBreakdown = () => {
    // In a real app, we'd fetch appointment revenue from a separate source
    // Here we're using dummy data for demonstration
    const serviceRevenue = 15000; // Example service revenue
    
    // Calculate retail revenue from products
    const retailRevenue = productSalesData.reduce(
      (sum, product) => sum + product.totalRevenue,
      0
    );
    
    const totalRevenue = serviceRevenue + retailRevenue;
    
    setRevenueBreakdown([
      {
        name: 'Services',
        value: serviceRevenue,
        percentage: totalRevenue > 0 ? (serviceRevenue / totalRevenue) * 100 : 0,
        color: '#4f46e5'
      },
      {
        name: 'Retail Products',
        value: retailRevenue,
        percentage: totalRevenue > 0 ? (retailRevenue / totalRevenue) * 100 : 0,
        color: '#10b981'
      }
    ]);
  };

  // Calculate stock turnover rate
  const calculateStockTurnover = () => {
    if (!productSalesData.length) {
      setStockTurnover([]);
      return;
    }
    
    // Calculate turnover rate for each product
    const turnoverData = productSalesData.map(product => {
      const initialStock = (product.stock || 0) + product.totalSales;
      const turnoverRate = initialStock > 0 ? (product.totalSales / initialStock) * 100 : 0;
      
      return {
        id: product.id,
        name: product.name,
        currentStock: product.stock || 0,
        sold: product.totalSales,
        turnoverRate,
        status: turnoverRate > 50 ? 'High' : turnoverRate > 20 ? 'Medium' : 'Low'
      };
    });
    
    setStockTurnover(turnoverData);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Custom colors for the charts
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Format currency
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-screen max-w-[98vw] mx-auto px-1">
      {/* Header */}
      <div className="px-2 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Sales (Retail)</h3>
        <button
          onClick={toggleCollapse}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-2">
          {/* Product Sales by Staff */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Product Sales by Staff</h4>
            <div className="h-80">
              {staffSalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={staffSalesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'totalRevenue') return [`$${Number(value).toFixed(2)}`, 'Revenue'];
                      return [value, 'Products Sold'];
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="totalSales" name="Products Sold" fill="#4f46e5" />
                    <Bar yAxisId="right" dataKey="totalRevenue" name="Revenue ($)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                  <p className="text-gray-500">No staff sales data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue Breakdown: Services vs Retail</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="h-60">
                {revenueBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                    <p className="text-gray-500">No revenue data available</p>
                  </div>
                )}
              </div>

              {/* Revenue Stats */}
              <div className="bg-gray-50 p-4 rounded-md flex flex-col justify-center">
                {revenueBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                      <p className="text-xl font-semibold">
                        ${(revenueBreakdown[0].value + revenueBreakdown[1].value).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Service Revenue</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="h-2.5 rounded-full bg-indigo-600" 
                            style={{ width: `${revenueBreakdown[0].percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">
                          ${revenueBreakdown[0].value.toFixed(2)} ({revenueBreakdown[0].percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Retail Revenue</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="h-2.5 rounded-full bg-emerald-600" 
                            style={{ width: `${revenueBreakdown[1].percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap">
                          ${revenueBreakdown[1].value.toFixed(2)} ({revenueBreakdown[1].percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No revenue data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Stock Turnover Rate */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Stock Turnover Rate</h4>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turnover Rate
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockTurnover.length > 0 ? (
                    stockTurnover.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {product.currentStock}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {product.sold}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {product.turnoverRate.toFixed(1)}%
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'High' ? 'bg-green-100 text-green-800' : 
                            product.status === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-sm text-center text-gray-500">
                        No stock data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSales; 