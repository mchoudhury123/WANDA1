import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, isWithinInterval } from 'date-fns';

interface StaffPerformanceProps {
  appointments: any[];
  staff: any[];
  dateRange: { start: Date; end: Date };
}

const StaffPerformance: React.FC<StaffPerformanceProps> = ({ appointments, staff, dateRange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [utilizationRates, setUtilizationRates] = useState<any[]>([]);
  const [noShowData, setNoShowData] = useState<any[]>([]);
  const [retentionData, setRetentionData] = useState<any[]>([]);
  const [sortField, setSortField] = useState<string>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    calculatePerformanceData();
    calculateUtilizationRates();
    calculateNoShows();
    calculateClientRetention();
  }, [appointments, staff, dateRange, sortField, sortDirection]);

  // Calculate revenue per staff
  const calculatePerformanceData = () => {
    if (!appointments.length || !staff.length) {
      setPerformanceData([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Group by staff
    const staffData = new Map();
    
    // Initialize all staff first
    staff.forEach(staffMember => {
      staffData.set(staffMember.id, {
        id: staffMember.id,
        name: staffMember.name || 'Unknown Staff',
        revenue: 0,
        appointments: 0,
        services: new Set()
      });
    });
    
    // Process appointments
    filteredAppointments.forEach(appointment => {
      const staffId = appointment.staffId;
      if (!staffId || !staffData.has(staffId)) return;
      
      const data = staffData.get(staffId);
      data.revenue += (appointment.price || 0);
      data.appointments += 1;
      if (appointment.serviceId) {
        data.services.add(appointment.serviceId);
      }
    });
    
    // Calculate averages and convert sets to counts
    const staffArray = Array.from(staffData.values()).map(data => ({
      ...data,
      averageRevenue: data.appointments > 0 ? data.revenue / data.appointments : 0,
      serviceCount: data.services.size,
      services: undefined // Remove the Set from the final object
    }));
    
    // Sort the data
    const sortedStaff = [...staffArray].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      if (sortDirection === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
    
    setPerformanceData(sortedStaff);
  };

  // Calculate utilization rates
  const calculateUtilizationRates = () => {
    if (!appointments.length || !staff.length) {
      setUtilizationRates([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Calculate utilization for each staff member
    const utilization = staff.map(staffMember => {
      // Get booked hours
      const staffAppointments = filteredAppointments.filter(
        appointment => appointment.staffId === staffMember.id
      );
      
      const bookedHours = staffAppointments.reduce((total, appointment) => {
        // Calculate appointment duration in hours
        const duration = appointment.duration || 60; // Default to 60 minutes
        return total + (duration / 60);
      }, 0);
      
      // Get available hours (from rota)
      // This is a simplified calculation - in a real app we'd use the rota data
      const availableHours = staffMember.hoursPerWeek || 40; // Default to 40 hours per week
      const weeksInRange = 2; // Simplified - would normally calculate from date range
      const totalAvailableHours = availableHours * weeksInRange;
      
      // Calculate utilization rate
      const utilizationRate = totalAvailableHours > 0 
        ? (bookedHours / totalAvailableHours) * 100 
        : 0;
      
      return {
        id: staffMember.id,
        name: staffMember.name || 'Unknown Staff',
        bookedHours,
        availableHours: totalAvailableHours,
        utilizationRate: Math.min(utilizationRate, 100) // Cap at 100%
      };
    });
    
    setUtilizationRates(utilization);
  };

  // Calculate no-shows, late starts, cancellations
  const calculateNoShows = () => {
    if (!appointments.length || !staff.length) {
      setNoShowData([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Initialize data for each staff member
    const noShows = staff.map(staffMember => {
      const staffAppointments = filteredAppointments.filter(
        appointment => appointment.staffId === staffMember.id
      );
      
      const noShowCount = staffAppointments.filter(
        appointment => appointment.status === 'no-show'
      ).length;
      
      const lateStartCount = staffAppointments.filter(
        appointment => appointment.status === 'late'
      ).length;
      
      const cancellationCount = staffAppointments.filter(
        appointment => appointment.status === 'cancelled'
      ).length;
      
      const totalAppointments = staffAppointments.length;
      
      return {
        id: staffMember.id,
        name: staffMember.name || 'Unknown Staff',
        noShows: noShowCount,
        lateStarts: lateStartCount,
        cancellations: cancellationCount,
        totalAppointments,
        issueRate: totalAppointments > 0 
          ? ((noShowCount + lateStartCount + cancellationCount) / totalAppointments) * 100 
          : 0
      };
    });
    
    setNoShowData(noShows);
  };

  // Calculate client retention per staff
  const calculateClientRetention = () => {
    if (!appointments.length || !staff.length) {
      setRetentionData([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Calculate retention for each staff member
    const retention = staff.map(staffMember => {
      const staffAppointments = filteredAppointments.filter(
        appointment => appointment.staffId === staffMember.id
      );
      
      // Group appointments by client
      const clientVisits = new Map();
      
      staffAppointments.forEach(appointment => {
        const clientId = appointment.clientId;
        if (!clientId) return;
        
        if (!clientVisits.has(clientId)) {
          clientVisits.set(clientId, {
            visits: 0,
            isReturning: false
          });
        }
        
        const clientData = clientVisits.get(clientId);
        clientData.visits += 1;
        clientData.isReturning = clientData.visits > 1;
      });
      
      const clientsArray = Array.from(clientVisits.values());
      const totalClients = clientsArray.length;
      const returningClients = clientsArray.filter(client => client.isReturning).length;
      
      return {
        id: staffMember.id,
        name: staffMember.name || 'Unknown Staff',
        totalClients,
        returningClients,
        retentionRate: totalClients > 0 ? (returningClients / totalClients) * 100 : 0
      };
    });
    
    setRetentionData(retention);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort indicator
  const getSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Staff Performance & Utilization</h3>
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
          {/* Revenue per Staff Chart */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue by Staff Member</h4>
            <div className="h-64">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue ($)" fill="#4f46e5">
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                  <p className="text-gray-500">No staff performance data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Utilization Rate */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Staff Utilization Rate (Booked Hours / Rota Hours)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {utilizationRates.map((staff) => (
                    <tr key={staff.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {staff.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.bookedHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.availableHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[150px]">
                            <div 
                              className={`h-2.5 rounded-full ${
                                staff.utilizationRate > 80 ? 'bg-green-500' : 
                                staff.utilizationRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${staff.utilizationRate}%` }}
                            />
                          </div>
                          <span>{staff.utilizationRate.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* No-shows, Late Starts, and Cancellations */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Appointment Issues by Staff</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('noShows')}
                    >
                      No-Shows {getSortIndicator('noShows')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('lateStarts')}
                    >
                      Late Starts {getSortIndicator('lateStarts')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('cancellations')}
                    >
                      Cancellations {getSortIndicator('cancellations')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('issueRate')}
                    >
                      Issue Rate {getSortIndicator('issueRate')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {noShowData.map((staff) => (
                    <tr key={staff.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {staff.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.noShows}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.lateStarts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.cancellations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.issueRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Retention per Staff */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Client Retention by Staff</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Clients
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Returning Clients
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('retentionRate')}
                    >
                      Retention Rate {getSortIndicator('retentionRate')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {retentionData.map((staff) => (
                    <tr key={staff.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {staff.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.totalClients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.returningClients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[150px]">
                            <div 
                              className={`h-2.5 rounded-full ${
                                staff.retentionRate > 70 ? 'bg-green-500' : 
                                staff.retentionRate > 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${staff.retentionRate}%` }}
                            />
                          </div>
                          <span>{staff.retentionRate.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPerformance; 