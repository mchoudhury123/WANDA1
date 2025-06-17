import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import '../../../styles/sui-overflow.css';

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
    <div className="sui-card mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span className="sui-icon-3d">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            </span>
            Dashboard Filters
          </h2>
          <p className="text-gray-600">Customize your analytics view with smart filters</p>
        </div>
        <button
          onClick={exportData}
          disabled={isExporting}
          className={`sui-cube-button green ${isExporting ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to CSV
            </>
          )}
        </button>
      </div>

      <div className="sui-grid sui-grid-4 gap-6">
        {/* Date Range Picker */}
        <div>
          <label htmlFor="start-date" className="block text-sm font-semibold text-gray-700 mb-3">
            📅 Start Date
          </label>
          <DatePicker
            id="start-date"
            selected={dateRange.start}
            onChange={handleStartDateChange}
            selectsStart
            startDate={dateRange.start}
            endDate={dateRange.end}
            className="sui-input"
            placeholderText="Select start date"
          />
        </div>
        
        <div>
          <label htmlFor="end-date" className="block text-sm font-semibold text-gray-700 mb-3">
            📅 End Date
          </label>
          <DatePicker
            id="end-date"
            selected={dateRange.end}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={dateRange.start}
            endDate={dateRange.end}
            minDate={dateRange.start}
            className="sui-input"
            placeholderText="Select end date"
          />
        </div>

        {/* Business Location Selector */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-3">
            🏢 Business Location
          </label>
          <select
            id="location"
            value={businessLocation}
            onChange={(e) => setBusinessLocation(e.target.value)}
            className="sui-select"
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
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ⚡ Quick Select
          </label>
          <div className="flex flex-col gap-2">
            <button
              onClick={setLastWeek}
              className="sui-cube-button purple text-xs py-2 px-3"
            >
              Last 7 Days
            </button>
            <button
              onClick={setLastMonth}
              className="sui-cube-button orange text-xs py-2 px-3"
            >
              Last 30 Days
            </button>
            <button
              onClick={setCurrentMonth}
              className="sui-cube-button pink text-xs py-2 px-3"
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Current Filter Display */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="sui-icon-3d text-xs">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span className="font-semibold text-gray-800">Current Selection</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">📅 Date Range:</span>{' '}
          <span className="bg-white px-2 py-1 rounded-md border">
            {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
          </span>
          {businessLocation !== 'all' && (
            <>
              {' '} | {' '}
              <span className="font-medium">🏢 Location:</span>{' '}
              <span className="bg-white px-2 py-1 rounded-md border">
                {businesses.find(b => b.id === businessLocation)?.name || businessLocation}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar; 