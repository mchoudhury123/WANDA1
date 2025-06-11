import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Analytics Section Components
import RevenueTrends from './RevenueTrends';
import StaffPerformance from './StaffPerformance';
import ClientAnalytics from './ClientAnalytics';
import MarketingInsights from './MarketingInsights';
import CalendarUtilization from './CalendarUtilization';
import ProductSales from './ProductSales';

// Common components
import FilterBar from './common/FilterBar';
import LoadingSpinner from '../common/LoadingSpinner';

const AnalyticsDashboard: React.FC = () => {
  // State for global filters
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [businessLocation, setBusinessLocation] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<any>({
    appointments: [],
    staff: [],
    services: [],
    clients: [],
    products: [],
    promotions: []
  });

  // Fetch data when filters change
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Fetch appointments
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('date', '>=', dateRange.start),
          where('date', '<=', dateRange.end),
          ...(businessLocation !== 'all' ? [where('businessId', '==', businessLocation)] : []),
          orderBy('date', 'desc')
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch staff
        const staffQuery = query(
          collection(db, 'staff'),
          ...(businessLocation !== 'all' ? [where('businessId', '==', businessLocation)] : [])
        );
        const staffSnapshot = await getDocs(staffQuery);
        const staffData = staffSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch services
        const servicesQuery = query(
          collection(db, 'services'),
          ...(businessLocation !== 'all' ? [where('businessId', '==', businessLocation)] : [])
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch clients
        const clientsQuery = query(
          collection(db, 'clients'),
          ...(businessLocation !== 'all' ? [where('businessId', '==', businessLocation)] : [])
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch products
        const productsQuery = query(
          collection(db, 'products'),
          ...(businessLocation !== 'all' ? [where('businessId', '==', businessLocation)] : [])
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch promotions
        const promotionsQuery = query(
          collection(db, 'promotions'),
          ...(businessLocation !== 'all' ? [where('businessId', '==', businessLocation)] : [])
        );
        const promotionsSnapshot = await getDocs(promotionsQuery);
        const promotionsData = promotionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAnalyticsData({
          appointments: appointmentsData,
          staff: staffData,
          services: servicesData,
          clients: clientsData,
          products: productsData,
          promotions: promotionsData
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange, businessLocation]);

  // Time range presets
  const setLastWeek = () => {
    const end = new Date();
    const start = subDays(end, 7);
    setDateRange({ start, end });
  };

  const setLastMonth = () => {
    const end = new Date();
    const start = subDays(end, 30);
    setDateRange({ start, end });
  };

  const setCurrentWeek = () => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    setDateRange({ start, end });
  };

  const setCurrentMonth = () => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    setDateRange({ start, end });
  };

  return (
    <div className="analytics-dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-sm text-gray-500">
          Comprehensive business analytics and performance metrics
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar 
        dateRange={dateRange}
        setDateRange={setDateRange}
        businessLocation={businessLocation}
        setBusinessLocation={setBusinessLocation}
        setLastWeek={setLastWeek}
        setLastMonth={setLastMonth}
        setCurrentWeek={setCurrentWeek}
        setCurrentMonth={setCurrentMonth}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Revenue & Booking Trends */}
          <RevenueTrends 
            appointments={analyticsData.appointments} 
            services={analyticsData.services} 
            dateRange={dateRange}
          />

          {/* Staff Performance & Utilization */}
          <StaffPerformance 
            appointments={analyticsData.appointments}
            staff={analyticsData.staff}
            dateRange={dateRange}
          />

          {/* Client Behavior Analytics */}
          <ClientAnalytics 
            clients={analyticsData.clients}
            appointments={analyticsData.appointments}
            dateRange={dateRange}
          />

          {/* Marketing & Upsell Insights */}
          <MarketingInsights 
            promotions={analyticsData.promotions}
            appointments={analyticsData.appointments}
            dateRange={dateRange}
          />

          {/* Google Calendar Utilization */}
          <CalendarUtilization 
            staff={analyticsData.staff}
            appointments={analyticsData.appointments}
            dateRange={dateRange}
          />

          {/* Product Sales */}
          <ProductSales 
            products={analyticsData.products}
            staff={analyticsData.staff}
            dateRange={dateRange}
          />
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 