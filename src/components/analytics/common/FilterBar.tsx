import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

interface FilterBarProps {
  dateRange: { start: Date; end: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ start: Date; end: Date }>>;
  businessLocation: string;
  setBusinessLocation: React.Dispatch<React.SetStateAction<string>>;
  setLastWeek: () => void;
  setLastMonth: () => void;
  setCurrentWeek: () => void;
  setCurrentMonth: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  dateRange,
  setDateRange,
  businessLocation,
  setBusinessLocation,
  setLastWeek,
  setLastMonth,
  setCurrentWeek,
  setCurrentMonth
}) => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const businessesCollection = collection(db, 'businesses');
        const businessesSnapshot = await getDocs(businessesCollection);
        const businessesList = businessesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBusinesses(businessesList);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    fetchBusinesses();
  }, []);

  // Handle date changes
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setDateRange(prev => ({ ...prev, start: date }));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setDateRange(prev => ({ ...prev, end: date }));
    }
  };

  // Export data to CSV
  const exportData = () => {
    setIsExporting(true);
    // This is just a placeholder - we would implement actual export functionality here
    setTimeout(() => {
      setIsExporting(false);
      alert('Data exported to CSV');
    }, 1500);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2 md:mb-0">
          Dashboard Filters
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportData}
            disabled={isExporting}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export to CSV
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Picker */}
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <DatePicker
            id="start-date"
            selected={dateRange.start}
            onChange={handleStartDateChange}
            selectsStart
            startDate={dateRange.start}
            endDate={dateRange.end}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <DatePicker
            id="end-date"
            selected={dateRange.end}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={dateRange.start}
            endDate={dateRange.end}
            minDate={dateRange.start}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        {/* Business Location Selector */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Business Location
          </label>
          <select
            id="location"
            value={businessLocation}
            onChange={(e) => setBusinessLocation(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="all">All Locations</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quick Select
          </label>
          <div className="flex space-x-2">
            <button
              onClick={setLastWeek}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Last 7 Days
            </button>
            <button
              onClick={setLastMonth}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Last 30 Days
            </button>
            <button
              onClick={setCurrentMonth}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Current Filter Display */}
      <div className="mt-4 text-sm text-gray-500">
        <span className="font-medium">Current Range:</span>{' '}
        {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
        {businessLocation !== 'all' && (
          <>
            {' | '}
            <span className="font-medium">Location:</span>{' '}
            {businesses.find(b => b.id === businessLocation)?.name || businessLocation}
          </>
        )}
      </div>
    </div>
  );
};

export default FilterBar; 