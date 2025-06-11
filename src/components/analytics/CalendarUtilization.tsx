import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, addDays, eachDayOfInterval, isWithinInterval, getDay } from 'date-fns';

interface CalendarUtilizationProps {
  staff: any[];
  appointments: any[];
  dateRange: { start: Date; end: Date };
}

const CalendarUtilization: React.FC<CalendarUtilizationProps> = ({ staff, appointments, dateRange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [utilizationData, setUtilizationData] = useState<any[]>([]);
  const [staffBookingData, setStaffBookingData] = useState<any[]>([]);
  const [peakTimesData, setPeakTimesData] = useState<any[]>([]);

  useEffect(() => {
    calculateCalendarUtilization();
    calculateStaffBookingStatus();
    calculatePeakTimes();
  }, [staff, appointments, dateRange]);

  // Calculate calendar utilization
  const calculateCalendarUtilization = () => {
    if (!staff.length || !appointments.length) {
      setUtilizationData([]);
      return;
    }

    // Calculate data for each staff member
    const utilization = staff.map(staffMember => {
      // Filter appointments for this staff member
      const staffAppointments = appointments.filter(
        appointment => appointment.staffId === staffMember.id
      );
      
      // Filter appointments within date range
      const filteredAppointments = staffAppointments.filter(appointment =>
        isWithinInterval(new Date(appointment.date), {
          start: dateRange.start,
          end: dateRange.end
        })
      );
      
      // Calculate booked hours
      const bookedHours = filteredAppointments.reduce((total, appointment) => {
        const duration = appointment.duration || 60; // Default to 60 minutes
        return total + (duration / 60);
      }, 0);
      
      // Get available hours from Google Calendar
      // This is a simplified calculation - in a real app we'd fetch this from Google Calendar API
      const availableHours = staffMember.googleCalendarHours || staffMember.hoursPerWeek || 40;
      
      // Calculate utilization percentage
      const utilizationRate = availableHours > 0 
        ? (bookedHours / availableHours) * 100 
        : 0;
      
      return {
        id: staffMember.id,
        name: staffMember.name || 'Unknown Staff',
        bookedHours,
        availableHours,
        utilizationRate: Math.min(utilizationRate, 100), // Cap at 100%
        freeHours: Math.max(availableHours - bookedHours, 0)
      };
    });
    
    setUtilizationData(utilization);
  };

  // Calculate staff booking status
  const calculateStaffBookingStatus = () => {
    if (!staff.length || !utilizationData.length) {
      setStaffBookingData([]);
      return;
    }
    
    // Categorize staff based on booking status
    const overbookedStaff = utilizationData.filter(data => data.utilizationRate >= 90);
    const wellBookedStaff = utilizationData.filter(data => data.utilizationRate >= 70 && data.utilizationRate < 90);
    const underbookedStaff = utilizationData.filter(data => data.utilizationRate < 70);
    
    setStaffBookingData([
      {
        status: 'Overbooked',
        count: overbookedStaff.length,
        staffList: overbookedStaff.map(s => s.name).join(', '),
        color: '#ef4444' // red
      },
      {
        status: 'Well Booked',
        count: wellBookedStaff.length,
        staffList: wellBookedStaff.map(s => s.name).join(', '),
        color: '#22c55e' // green
      },
      {
        status: 'Underbooked',
        count: underbookedStaff.length,
        staffList: underbookedStaff.map(s => s.name).join(', '),
        color: '#3b82f6' // blue
      }
    ]);
  };

  // Calculate peak booking times
  const calculatePeakTimes = () => {
    if (!appointments.length) {
      setPeakTimesData([]);
      return;
    }
    
    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );
    
    // Group by day of week
    const dayCountMap = new Map();
    
    // Initialize counts for each day
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach((day, index) => {
      dayCountMap.set(day, {
        name: day,
        count: 0,
        dayIndex: index
      });
    });
    
    // Count appointments for each day
    filteredAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const dayIndex = getDay(appointmentDate);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
      
      const dayData = dayCountMap.get(dayName);
      dayData.count += 1;
    });
    
    // Convert to array and sort by count
    const peakDays = Array.from(dayCountMap.values()).sort((a, b) => b.count - a.count);
    
    setPeakTimesData(peakDays);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Google Calendar Utilization</h3>
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
          {/* Available vs Booked Hours */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available vs Booked Hours</h4>
            <div className="h-64">
              {utilizationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={utilizationData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => `${value.toFixed(1)} hours`} />
                    <Legend />
                    <Bar dataKey="bookedHours" name="Booked Hours" stackId="a" fill="#4f46e5" />
                    <Bar dataKey="freeHours" name="Available Hours" stackId="a" fill="#e5e7eb" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                  <p className="text-gray-500">No utilization data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Staff Booking Status */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Staff Booking Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {staffBookingData.map((item) => (
                <div 
                  key={item.status} 
                  className="bg-gray-50 p-4 rounded-md border-l-4"
                  style={{ borderLeftColor: item.color }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">{item.status}</h5>
                      <p className="text-xs text-gray-500 mt-1">{item.staffList || 'None'}</p>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Booking Times */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Peak Booking Days</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Peak Days Chart */}
              <div className="h-64">
                {peakTimesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={peakTimesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Appointments" fill="#3b82f6">
                        {peakTimesData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? '#3b82f6' : // Most popular - blue
                                  index === 1 ? '#6366f1' : // Second - indigo
                                  index === 2 ? '#8b5cf6' : // Third - purple
                                  '#d1d5db'} // Rest - gray
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                    <p className="text-gray-500">No peak time data available</p>
                  </div>
                )}
              </div>

              {/* Marketing Recommendations */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Marketing Focus Recommendations</h5>
                <div className="space-y-3">
                  {peakTimesData.length > 0 ? (
                    <>
                      <div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Busiest Day
                          </span>
                          <span className="text-sm text-gray-500">
                            {peakTimesData[0].name} ({peakTimesData[0].count} appts)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Consider premium pricing or extending hours
                        </p>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Slowest Days
                          </span>
                          <span className="text-sm text-gray-500">
                            {peakTimesData[peakTimesData.length - 1].name} ({peakTimesData[peakTimesData.length - 1].count} appts)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Target for promotions and marketing campaigns
                        </p>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-3">
                        <span className="text-sm font-medium text-gray-700">Suggested Actions</span>
                        <ul className="mt-2 space-y-1">
                          <li className="text-xs text-gray-600 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Run promotions on {peakTimesData[peakTimesData.length - 1].name} and {peakTimesData[peakTimesData.length - 2].name}
                          </li>
                          <li className="text-xs text-gray-600 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Consider special packages for off-peak times
                          </li>
                          <li className="text-xs text-gray-600 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Optimize staff scheduling based on peak days
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center">No recommendations available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarUtilization; 