import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, isWithinInterval, differenceInDays, parseISO, addDays } from 'date-fns';

interface ClientAnalyticsProps {
  clients: any[];
  appointments: any[];
  dateRange: { start: Date; end: Date };
}

const ClientAnalytics: React.FC<ClientAnalyticsProps> = ({ clients, appointments, dateRange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [retentionData, setRetentionData] = useState<any>({
    firstVisit: 0,
    secondVisit: 0,
    thirdVisit: 0,
    moreThanThree: 0
  });
  const [timeSinceLastVisit, setTimeSinceLastVisit] = useState<any[]>([]);
  const [bookingHeatmap, setBookingHeatmap] = useState<any[]>([]);
  
  useEffect(() => {
    calculateRetentionFunnel();
    calculateTimeSinceLastVisit();
    calculateBookingHeatmap();
  }, [clients, appointments, dateRange]);

  // Calculate retention funnel
  const calculateRetentionFunnel = () => {
    if (!appointments.length || !clients.length) {
      setRetentionData({
        firstVisit: 0,
        secondVisit: 0,
        thirdVisit: 0,
        moreThanThree: 0
      });
      return;
    }

    // Group appointments by client
    const clientVisits = new Map();
    
    appointments.forEach(appointment => {
      const clientId = appointment.clientId;
      if (!clientId) return;
      
      if (!clientVisits.has(clientId)) {
        clientVisits.set(clientId, {
          visits: 0,
          appointmentDates: []
        });
      }
      
      const clientData = clientVisits.get(clientId);
      clientData.visits += 1;
      if (appointment.date) {
        clientData.appointmentDates.push(new Date(appointment.date));
      }
    });
    
    // Count clients by visit number
    const visitCounts = {
      firstVisit: 0,
      secondVisit: 0,
      thirdVisit: 0,
      moreThanThree: 0,
      total: 0
    };
    
    clientVisits.forEach(client => {
      visitCounts.total += 1;
      
      if (client.visits === 1) {
        visitCounts.firstVisit += 1;
      } else if (client.visits === 2) {
        visitCounts.secondVisit += 1;
      } else if (client.visits === 3) {
        visitCounts.thirdVisit += 1;
      } else {
        visitCounts.moreThanThree += 1;
      }
    });
    
    // Calculate percentages
    const retentionData = {
      firstVisit: visitCounts.total > 0 ? (visitCounts.firstVisit / visitCounts.total) * 100 : 0,
      secondVisit: visitCounts.firstVisit > 0 ? (visitCounts.secondVisit / visitCounts.firstVisit) * 100 : 0,
      thirdVisit: visitCounts.secondVisit > 0 ? (visitCounts.thirdVisit / visitCounts.secondVisit) * 100 : 0,
      moreThanThree: visitCounts.thirdVisit > 0 ? (visitCounts.moreThanThree / visitCounts.thirdVisit) * 100 : 0
    };
    
    setRetentionData(retentionData);
  };

  // Calculate time since last visit
  const calculateTimeSinceLastVisit = () => {
    if (!appointments.length || !clients.length) {
      setTimeSinceLastVisit([]);
      return;
    }

    const today = new Date();
    const clientLastVisits = new Map();
    
    // Sort appointments by date (descending)
    const sortedAppointments = [...appointments].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Get the last visit date for each client
    sortedAppointments.forEach(appointment => {
      const clientId = appointment.clientId;
      if (!clientId || clientLastVisits.has(clientId)) return;
      
      const appointmentDate = new Date(appointment.date);
      if (appointmentDate <= today) {
        clientLastVisits.set(clientId, {
          clientId,
          clientName: appointment.clientName || 'Unknown Client',
          lastVisitDate: appointmentDate,
          daysSince: differenceInDays(today, appointmentDate)
        });
      }
    });
    
    // Convert to array and sort by days since last visit
    const clientsArray = Array.from(clientLastVisits.values());
    const sortedClients = clientsArray.sort((a, b) => b.daysSince - a.daysSince);
    
    setTimeSinceLastVisit(sortedClients.slice(0, 10)); // Get top 10
  };

  // Calculate booking heatmap
  const calculateBookingHeatmap = () => {
    if (!appointments.length) {
      setBookingHeatmap([]);
      return;
    }

    // Filter appointments within date range
    const filteredAppointments = appointments.filter(appointment =>
      isWithinInterval(new Date(appointment.date), {
        start: dateRange.start,
        end: dateRange.end
      })
    );

    // Initialize heatmap data
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hoursOfDay = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    
    const heatmapData = [];
    
    // Calculate appointment counts for each day and hour
    daysOfWeek.forEach((day, dayIndex) => {
      hoursOfDay.forEach(hour => {
        const hourStr = hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
        
        const count = filteredAppointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          const appointmentDay = appointmentDate.getDay();
          const appointmentHour = appointmentDate.getHours();
          
          return appointmentDay === dayIndex && appointmentHour === hour;
        }).length;
        
        heatmapData.push({
          day,
          hour: hourStr,
          count,
          dayIndex, // Used for sorting
          hourValue: hour // Used for sorting
        });
      });
    });
    
    setBookingHeatmap(heatmapData);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Data for retention funnel chart
  const retentionChartData = [
    { name: '1st Visit', value: retentionData.firstVisit },
    { name: '2nd Visit', value: retentionData.secondVisit },
    { name: 'Return Rate', value: retentionData.thirdVisit },
    { name: 'Loyal', value: retentionData.moreThanThree }
  ];
  
  // Colors for retention funnel chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Client Behavior Analytics</h3>
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
          {/* Retention Funnel */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Client Retention Funnel</h4>
            <div className="h-64">
              {appointments.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={retentionChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${parseFloat(value).toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="value" name="Retention Rate %">
                      {retentionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full bg-gray-50 rounded-md">
                  <p className="text-gray-500">No retention data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Time Since Last Visit */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Time Since Last Visit</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Since
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSinceLastVisit.length > 0 ? (
                    timeSinceLastVisit.map((client) => (
                      <tr key={client.clientId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {client.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(client.lastVisitDate, 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.daysSince > 90 ? 'bg-red-100 text-red-800' : 
                            client.daysSince > 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {client.daysSince} days
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm text-center text-gray-500">
                        No client visit data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Booking Heatmap */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Booking Heatmap by Time/Day</h4>
            <div className="overflow-x-auto">
              <div className="min-w-full py-2 align-middle inline-block">
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <div className="min-w-full">
                    {/* Heatmap Header */}
                    <div className="bg-gray-50 grid grid-cols-8 border-b border-gray-200">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </div>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Heatmap Body */}
                    <div className="bg-white divide-y divide-gray-200">
                      {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
                        const hourStr = hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
                        
                        return (
                          <div key={hour} className="grid grid-cols-8">
                            <div className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                              {hourStr}
                            </div>
                            
                            {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                              const cell = bookingHeatmap.find(
                                item => item.dayIndex === dayIndex && item.hourValue === hour
                              );
                              
                              const count = cell ? cell.count : 0;
                              const bgColor = count === 0 ? 'bg-gray-50' :
                                count < 3 ? 'bg-blue-100' :
                                count < 5 ? 'bg-blue-200' :
                                count < 8 ? 'bg-blue-300' :
                                count < 10 ? 'bg-blue-400' : 'bg-blue-500';
                              
                              const textColor = count > 5 ? 'text-white' : 'text-gray-800';
                              
                              return (
                                <div 
                                  key={dayIndex}
                                  className={`px-4 py-2 whitespace-nowrap text-xs text-center ${bgColor} ${textColor}`}
                                >
                                  {count}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex justify-end items-center">
              <span className="mr-2">Booking Density:</span>
              <span className="w-4 h-4 bg-gray-50 inline-block mr-1"></span>
              <span className="mr-2">0</span>
              <span className="w-4 h-4 bg-blue-100 inline-block mr-1"></span>
              <span className="mr-2">1-2</span>
              <span className="w-4 h-4 bg-blue-200 inline-block mr-1"></span>
              <span className="mr-2">3-4</span>
              <span className="w-4 h-4 bg-blue-300 inline-block mr-1"></span>
              <span className="mr-2">5-7</span>
              <span className="w-4 h-4 bg-blue-400 inline-block mr-1"></span>
              <span className="mr-2">8-9</span>
              <span className="w-4 h-4 bg-blue-500 inline-block mr-1"></span>
              <span>10+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAnalytics; 