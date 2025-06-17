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

// Import our custom styles
import '../../styles/sui-overflow.css';

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

  // Calculate quick stats
  const totalAppointments = analyticsData.appointments.length;
  const totalRevenue = analyticsData.appointments.reduce((sum: number, apt: any) => sum + (apt.total || 0), 0);
  const activeStaff = analyticsData.staff.filter((s: any) => s.status === 'active').length;
  const totalClients = analyticsData.clients.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Colorful Header with 3D Effect */}
      <div className="sui-header">
        <div className="container mx-auto px-6">
          <div className="sui-animate-in">
            <h1>📊 Analytics Dashboard</h1>
            <p>Comprehensive business insights with powerful analytics</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-12">
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

        {/* Quick Stats Grid */}
        <div className="sui-grid sui-grid-4 mb-8">
          <div className="sui-stat-card sui-animate-in">
            <div className="sui-stat-icon purple">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="sui-stat-value">{totalAppointments}</div>
            <div className="sui-stat-label">Total Appointments</div>
          </div>

          <div className="sui-stat-card sui-animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="sui-stat-icon green">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="sui-stat-value">${totalRevenue.toLocaleString()}</div>
            <div className="sui-stat-label">Total Revenue</div>
          </div>

          <div className="sui-stat-card sui-animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="sui-stat-icon orange">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="sui-stat-value">{activeStaff}</div>
            <div className="sui-stat-label">Active Staff</div>
          </div>

          <div className="sui-stat-card sui-animate-in" style={{ animationDelay: '0.3s' }}>
            <div className="sui-stat-icon pink">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="sui-stat-value">{totalClients}</div>
            <div className="sui-stat-label">Total Clients</div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="sui-loading">
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          <div className="sui-grid sui-grid-2">
            {/* Revenue & Booking Trends */}
            <div className="sui-card purple sui-animate-in" style={{ animationDelay: '0.4s' }}>
              <RevenueTrends 
                appointments={analyticsData.appointments} 
                services={analyticsData.services} 
                dateRange={dateRange}
              />
            </div>

            {/* Staff Performance & Utilization */}
            <div className="sui-card green sui-animate-in" style={{ animationDelay: '0.5s' }}>
              <StaffPerformance 
                appointments={analyticsData.appointments}
                staff={analyticsData.staff}
                dateRange={dateRange}
              />
            </div>

            {/* Client Behavior Analytics */}
            <div className="sui-card orange sui-animate-in" style={{ animationDelay: '0.6s' }}>
              <ClientAnalytics 
                clients={analyticsData.clients}
                appointments={analyticsData.appointments}
                dateRange={dateRange}
              />
            </div>

            {/* Marketing & Upsell Insights */}
            <div className="sui-card pink sui-animate-in" style={{ animationDelay: '0.7s' }}>
              <MarketingInsights 
                promotions={analyticsData.promotions}
                appointments={analyticsData.appointments}
                dateRange={dateRange}
              />
            </div>

            {/* Calendar Utilization */}
            <div className="sui-card purple sui-animate-in" style={{ animationDelay: '0.8s' }}>
              <CalendarUtilization 
                appointments={analyticsData.appointments}
                staff={analyticsData.staff}
                dateRange={dateRange}
              />
            </div>

            {/* Product Sales */}
            <div className="sui-card green sui-animate-in" style={{ animationDelay: '0.9s' }}>
              <ProductSales 
                products={analyticsData.products}
                appointments={analyticsData.appointments}
                dateRange={dateRange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 