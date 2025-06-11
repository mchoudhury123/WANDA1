import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format, isWithinInterval } from 'date-fns';

interface MarketingInsightsProps {
  promotions: any[];
  appointments: any[];
  dateRange: { start: Date; end: Date };
}

const MarketingInsights: React.FC<MarketingInsightsProps> = ({ promotions, appointments, dateRange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [promoPerformance, setPromoPerformance] = useState<any[]>([]);
  const [upsellRate, setUpsellRate] = useState<number>(0);
  const [packageUsage, setPackageUsage] = useState<any[]>([]);

  useEffect(() => {
    calculatePromoPerformance();
    calculateUpsellRate();
    calculatePackageUsage();
  }, [promotions, appointments, dateRange]);

  // Calculate promotion performance
  const calculatePromoPerformance = () => {
    if (!promotions.length || !appointments.length) {
      setPromoPerformance([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Calculate performance for each promotion
    const performanceData = promotions.map(promo => {
      // Count appointments using this promo
      const promoAppointments = filteredAppointments.filter(
        appointment => appointment.promoId === promo.id
      );
      
      // Calculate conversion rate (appointments / views)
      const views = promo.viewCount || 100; // Default to 100 views if not available
      const conversions = promoAppointments.length;
      const conversionRate = views > 0 ? (conversions / views) * 100 : 0;
      
      // Calculate revenue from this promo
      const revenue = promoAppointments.reduce(
        (sum, appointment) => sum + (appointment.price || 0),
        0
      );
      
      return {
        id: promo.id,
        name: promo.name || 'Unnamed Promotion',
        code: promo.code || '',
        views,
        conversions,
        conversionRate,
        revenue
      };
    });
    
    // Sort by conversion rate
    const sortedPerformance = performanceData.sort((a, b) => b.conversionRate - a.conversionRate);
    
    setPromoPerformance(sortedPerformance);
  };

  // Calculate upsell rate
  const calculateUpsellRate = () => {
    if (!appointments.length) {
      setUpsellRate(0);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Count appointments with add-ons
    const appointmentsWithAddons = filteredAppointments.filter(
      appointment => appointment.addons && appointment.addons.length > 0
    );
    
    // Calculate percentage
    const rate = filteredAppointments.length > 0 
      ? (appointmentsWithAddons.length / filteredAppointments.length) * 100 
      : 0;
    
    setUpsellRate(rate);
  };

  // Calculate package usage
  const calculatePackageUsage = () => {
    if (!appointments.length) {
      setPackageUsage([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Count package appointments vs regular appointments
    const packageAppointments = filteredAppointments.filter(
      appointment => appointment.isPackage
    );
    
    const regularAppointments = filteredAppointments.filter(
      appointment => !appointment.isPackage
    );
    
    // Calculate redemption rate
    const totalPackages = 100; // Example - would normally come from actual data
    const redemptionRate = totalPackages > 0 
      ? (packageAppointments.length / totalPackages) * 100 
      : 0;
    
    // Prepare data for pie chart
    const usageData = [
      {
        name: 'Package Appointments',
        value: packageAppointments.length,
        color: '#4f46e5'
      },
      {
        name: 'Regular Appointments',
        value: regularAppointments.length,
        color: '#94a3b8'
      }
    ];
    
    setPackageUsage(usageData);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Custom colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9146FF'];

  // Format as percentage
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Marketing & Upsell Insights</h3>
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
        <div className="p-4">
          {/* Promo Performance */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Promotion Performance</h4>
            {promoPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promotion
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversion Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promoPerformance.map((promo, index) => (
                      <tr key={promo.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {promo.name}
                          {index === 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Top Performer
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {promo.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {promo.conversions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  promo.conversionRate > 10 ? 'bg-green-500' : 
                                  promo.conversionRate > 5 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} 
                                style={{ width: `${Math.min(promo.conversionRate * 2, 100)}%` }}
                              />
                            </div>
                            <span>{promo.conversionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${promo.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-500 text-center">No promotion data available</p>
              </div>
            )}
          </div>

          {/* Upsell Rate */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Upsell Rate</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-1">Percentage of bookings with add-ons</p>
                <div className="relative h-36 w-36">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-3xl font-bold">{upsellRate.toFixed(1)}%</p>
                  </div>
                  <svg 
                    viewBox="0 0 36 36" 
                    className="block m-auto max-w-full max-h-full transform -rotate-90"
                  >
                    <path 
                      className="fill-none stroke-gray-200 stroke-[2.8]"
                      d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path 
                      className="fill-none stroke-indigo-600 stroke-[2.8] stroke-round"
                      d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                      strokeDasharray={`${upsellRate}, 100`}
                    />
                  </svg>
                </div>
                <div className="mt-2 text-sm">
                  <span className={`font-medium ${
                    upsellRate > 25 ? 'text-green-600' : 
                    upsellRate > 15 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {upsellRate > 25 ? 'Excellent' : upsellRate > 15 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Usage */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Package Usage</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Package vs Regular Appointments */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h5 className="text-xs font-medium text-gray-500 mb-3">Appointment Types</h5>
                <div className="h-48">
                  {packageUsage.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={packageUsage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {packageUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Appointments']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">No package data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Package Redemption Stats */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h5 className="text-xs font-medium text-gray-500 mb-3">Package Redemption</h5>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Packages Sold</p>
                    <p className="text-xl font-semibold">100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Packages Redeemed</p>
                    <p className="text-xl font-semibold">
                      {packageUsage.length > 0 ? packageUsage[0].value : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Redemption Rate</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            packageUsage.length > 0 && packageUsage[0].value > 75 ? 'bg-green-500' : 
                            packageUsage.length > 0 && packageUsage[0].value > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${packageUsage.length > 0 ? packageUsage[0].value : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {packageUsage.length > 0 ? `${packageUsage[0].value}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingInsights; 