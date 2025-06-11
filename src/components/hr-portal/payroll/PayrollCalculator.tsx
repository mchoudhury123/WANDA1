import React, { useState } from 'react';
import { Employee } from '../../../types/hr-portal';

interface PayrollCalculatorProps {
  employees: Partial<Employee>[];
  payrollPeriod: {
    startDate: string;
    endDate: string;
  };
  onCalculate: (employeeId: string, calculations: any) => void;
}

const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({
  employees,
  payrollPeriod,
  onCalculate
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate commissions for selected employee (in a real app, this would come from API)
  const calculateCommissions = (employeeId: string): number => {
    // Sample data - in a real app, this would be calculated from actual service data
    const commissionRates = {
      '101': 852.75, // Sophie Taylor (Senior Stylist)
      '102': 0, // Alex Rodriguez (Salon Manager)
      '103': 423.50, // Emma Johnson (Junior Stylist)
      '104': 625.00, // David Miller (Barber)
      '105': 715.25, // Amanda Chen (Esthetician)
    };
    
    return commissionRates[employeeId as keyof typeof commissionRates] || 0;
  };

  // Calculate tips for selected employee (in a real app, this would come from API)
  const calculateTips = (employeeId: string): number => {
    // Sample data - in a real app, this would be calculated from actual service data
    const tipAmounts = {
      '101': 427.50, // Sophie Taylor (Senior Stylist)
      '102': 0, // Alex Rodriguez (Salon Manager)
      '103': 215.00, // Emma Johnson (Junior Stylist)
      '104': 345.75, // David Miller (Barber)
      '105': 278.50, // Amanda Chen (Esthetician)
    };
    
    return tipAmounts[employeeId as keyof typeof tipAmounts] || 0;
  };

  // Handle calculation button click
  const handleCalculate = () => {
    if (!selectedEmployeeId || baseSalary < 0) return;
    
    setLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      const commissions = calculateCommissions(selectedEmployeeId);
      const tips = calculateTips(selectedEmployeeId);
      
      // Calculate deductions (in a real app, these would be based on employee data and tax rules)
      const federalTax = baseSalary * 0.15;
      const stateTax = baseSalary * 0.05;
      const socialSecurity = (baseSalary + commissions) * 0.062;
      const medicare = (baseSalary + commissions) * 0.0145;
      
      const healthInsurance = 85.75;
      const retirement = baseSalary * 0.04;
      
      const totalGross = baseSalary + commissions + tips;
      const totalDeductions = federalTax + stateTax + socialSecurity + medicare + healthInsurance + retirement;
      const totalNet = totalGross - totalDeductions;
      
      const calculations = {
        baseSalary,
        commissions,
        tips,
        deductions: {
          health: healthInsurance,
          retirement,
          other: 0
        },
        taxes: {
          federal: federalTax,
          state: stateTax,
          socialSecurity,
          medicare
        },
        totalGross,
        totalNet,
        periodStart: payrollPeriod.startDate,
        periodEnd: payrollPeriod.endDate
      };
      
      onCalculate(selectedEmployeeId, calculations);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Payroll Calculator</h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee
            </label>
            <select
              id="employee"
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">Select an employee</option>
              {employees
                .filter(emp => emp.status === 'active')
                .map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} - {employee.role}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700 mb-1">
                Base Salary / Hourly Rate
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  id="baseSalary"
                  className="block w-full pl-7 pr-12 py-2 rounded-md border border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="0.00"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="hoursWorked" className="block text-sm font-medium text-gray-700 mb-1">
                Hours Worked (for hourly employees)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                id="hoursWorked"
                className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="0"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleCalculate}
              disabled={!selectedEmployeeId || baseSalary <= 0 || loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </>
              ) : (
                'Calculate Payroll'
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 text-sm text-gray-500">
        <p>Payroll Period: {new Date(payrollPeriod.startDate).toLocaleDateString()} - {new Date(payrollPeriod.endDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default PayrollCalculator; 