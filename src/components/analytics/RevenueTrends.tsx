import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, getDay, isWithinInterval } from 'date-fns';

interface RevenueTrendsProps {
  appointments: any[];
  services: any[];
  dateRange: { start: Date; end: Date };
}

const RevenueTrends: React.FC<RevenueTrendsProps> = ({ appointments, services, dateRange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [servicePerformance, setServicePerformance] = useState<any[]>([]);
  const [clientSpendData, setClientSpendData] = useState<any>({
    averageSpend: 0,
    highestPaying: [],
    conversionRate: 0
  });

  useEffect(() => {
    calculateRevenueData();
    calculateServicePerformance();
    calculateClientSpendAnalytics();
  }, [appointments, services, dateRange, viewMode]);

  // Calculate revenue data based on view mode
  const calculateRevenueData = () => {
    if (!appointments.length) {
      setRevenueData([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    let data: any[] = [];

    if (viewMode === 'daily') {
      // Generate all days in the range
      const days = eachDayOfInterval({
        start: dateRange.start,
        end: dateRange.end
      });

      // Initialize data for each day
      data = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayAppointments = filteredAppointments.filter(
          appointment => format(new Date(appointment.date), 'yyyy-MM-dd') === dayStr
        );

        const totalRevenue = dayAppointments.reduce(
          (sum: number, appointment: any) => sum + (appointment.price || 0),
          0
        );

        return {
          date: format(day, 'MMM dd'),
          revenue: totalRevenue,
          appointments: dayAppointments.length
        };
      });
    } else if (viewMode === 'weekly') {
      // Group by week
      const weeks = new Map();
      
      filteredAppointments.forEach(appointment => {
        const date = new Date(appointment.date);
        const weekStart = startOfWeek(date);
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        
        if (!weeks.has(weekKey)) {
          weeks.set(weekKey, {
            date: `Week of ${format(weekStart, 'MMM dd')}`,
            revenue: 0,
            appointments: 0
          });
        }
        
        const weekData = weeks.get(weekKey);
        weekData.revenue += (appointment.price || 0);
        weekData.appointments += 1;
      });
      
      data = Array.from(weeks.values());
    } else {
      // Group by month
      const months = new Map();
      
      filteredAppointments.forEach(appointment => {
        const date = new Date(appointment.date);
        const monthKey = format(date, 'yyyy-MM');
        
        if (!months.has(monthKey)) {
          months.set(monthKey, {
            date: format(date, 'MMM yyyy'),
            revenue: 0,
            appointments: 0
          });
        }
        
        const monthData = months.get(monthKey);
        monthData.revenue += (appointment.price || 0);
        monthData.appointments += 1;
      });
      
      data = Array.from(months.values());
    }

    setRevenueData(data);
  };

  // Calculate service performance
  const calculateServicePerformance = () => {
    if (!appointments.length || !services.length) {
      setServicePerformance([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Group by service
    const serviceData = new Map();
    
    filteredAppointments.forEach(appointment => {
      const serviceId = appointment.serviceId;
      if (!serviceId) return;
      
      if (!serviceData.has(serviceId)) {
        const service = services.find(s => s.id === serviceId);
        serviceData.set(serviceId, {
          id: serviceId,
          name: service ? service.name : 'Unknown Service',
          revenue: 0,
          count: 0
        });
      }
      
      const data = serviceData.get(serviceId);
      data.revenue += (appointment.price || 0);
      data.count += 1;
    });
    
    // Convert to array and sort by revenue
    const servicesArray = Array.from(serviceData.values());
    const sortedServices = servicesArray.sort((a, b) => b.revenue - a.revenue);
    
    setServicePerformance(sortedServices);
  };

  // Calculate client spend analytics
  const calculateClientSpendAnalytics = () => {
    if (!appointments.length) {
      setClientSpendData({
        averageSpend: 0,
        highestPaying: [],
        conversionRate: 0
      });
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Group by client
    const clientSpends = new Map();
    
    filteredAppointments.forEach(appointment => {
      const clientId = appointment.clientId;
      if (!clientId) return;
      
      if (!clientSpends.has(clientId)) {
        clientSpends.set(clientId, {
          id: clientId,
          name: appointment.clientName || 'Unknown Client',
          totalSpend: 0,
          visits: 0,
          isFirstVisit: appointment.isFirstVisit || false
        });
      }
      
      const clientData = clientSpends.get(clientId);
      clientData.totalSpend += (appointment.price || 0);
      clientData.visits += 1;
    });
    
    // Calculate average spend
    const clientsArray = Array.from(clientSpends.values());
    const totalSpend = clientsArray.reduce((sum, client) => sum + client.totalSpend, 0);
    const totalVisits = clientsArray.reduce((sum, client) => sum + client.visits, 0);
    const averageSpend = totalVisits > 0 ? totalSpend / totalVisits : 0;
    
    // Get top 5 highest paying clients
    const highestPaying = clientsArray
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);
    
    // Calculate first-time vs returning client conversion
    const firstTimeVisits = clientsArray.filter(client => client.isFirstVisit).length;
    const returningClients = clientsArray.filter(client => client.visits > 1).length;
    const conversionRate = firstTimeVisits > 0 ? (returningClients / firstTimeVisits) * 100 : 0;
    
    setClientSpendData({
      averageSpend,
      highestPaying,
      conversionRate
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Revenue & Booking Trends</h3>
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
          {/* View Mode Selector */}
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Revenue Chart */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue Over Time</h4>
            <div className="h-64">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue ($)" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                  <p className="text-gray-500">No revenue data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Performance */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Service Performance</h4>
            {servicePerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {servicePerformance.slice(0, 5).map((service, index) => (
                      <tr key={service.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name}
                          {index === 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Top Seller
                            </span>
                          )}
                          {index === servicePerformance.length - 1 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Low Performer
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${service.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-500 text-center">No service data available</p>
              </div>
            )}
          </div>

          {/* Client Spend Analytics */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Client Spend Analytics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Average Spend per Visit</p>
                <p className="text-xl font-semibold">${clientSpendData.averageSpend.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-1">First-Time Conversion Rate</p>
                <p className="text-xl font-semibold">{clientSpendData.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Top Client Spend</p>
                {clientSpendData.highestPaying.length > 0 ? (
                  <p className="text-xl font-semibold">
                    ${clientSpendData.highestPaying[0]?.totalSpend.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xl font-semibold">$0.00</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueTrends; 