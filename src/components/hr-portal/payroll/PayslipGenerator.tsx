import React, { useState } from 'react';
import { Employee, Payroll } from '../../../types/hr-portal';

interface PayslipGeneratorProps {
  payroll: Payroll;
  employee: Partial<Employee> | undefined;
  onProcess: (payrollId: string) => void;
}

const PayslipGenerator: React.FC<PayslipGeneratorProps> = ({
  payroll,
  employee,
  onProcess
}) => {
  const [downloading, setDownloading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Handle process payroll button click
  const handleProcess = () => {
    setProcessing(true);
    onProcess(payroll.id);
  };

  // Handle download PDF button click
  const handleDownload = () => {
    setDownloading(true);
    
    // Simulate PDF generation and download
    setTimeout(() => {
      setDownloading(false);
      alert('Payslip PDF would be downloaded in a real application.');
    }, 1500);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!employee) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-gray-500">Select an employee and calculate payroll to view payslip.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Payslip Preview</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            disabled={downloading || payroll.status === 'draft'}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-primary focus:shadow-outline-primary active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          {payroll.status === 'draft' && (
            <button
              onClick={handleProcess}
              disabled={processing}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-black bg-primary hover:bg-primary-dark focus:outline-none focus:border-primary-dark focus:shadow-outline-primary active:bg-primary-dark transition ease-in-out duration-150 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Process Payroll'
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {/* Payslip Header */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">PAYSLIP</h3>
            <p className="text-sm text-gray-600">
              Pay Period: {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Employee Information</h4>
              <p className="text-sm text-gray-800">
                <span className="font-medium">Name:</span> {employee.firstName} {employee.lastName}
              </p>
              <p className="text-sm text-gray-800">
                <span className="font-medium">Role:</span> {employee.role}
              </p>
              <p className="text-sm text-gray-800">
                <span className="font-medium">ID:</span> {employee.id}
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Information</h4>
              <p className="text-sm text-gray-800">
                <span className="font-medium">Payment Method:</span> Direct Deposit
              </p>
              <p className="text-sm text-gray-800">
                <span className="font-medium">Payment Date:</span> {new Date(payroll.periodEnd).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-800">
                <span className="font-medium">Payroll Status:</span> {payroll.status === 'processed' ? 'Processed' : payroll.status === 'canceled' ? 'Canceled' : 'Draft'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Earnings */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-200">Earnings</h4>
          <div className="grid grid-cols-2 mb-4">
            <div className="py-1">
              <span className="text-sm text-gray-600">Base Salary</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">{formatCurrency(payroll.baseSalary)}</span>
            </div>
            
            <div className="py-1">
              <span className="text-sm text-gray-600">Commissions</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">{formatCurrency(payroll.commissions)}</span>
            </div>
            
            <div className="py-1">
              <span className="text-sm text-gray-600">Tips</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">{formatCurrency(payroll.tips)}</span>
            </div>
            
            <div className="py-1 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800">Total Gross</span>
            </div>
            <div className="py-1 text-right border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">{formatCurrency(payroll.totalGross)}</span>
            </div>
          </div>
        </div>
        
        {/* Deductions and Taxes */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-200">Deductions & Taxes</h4>
          <div className="grid grid-cols-2 mb-4">
            <div className="py-1">
              <span className="text-sm text-gray-600">Federal Tax</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">-{formatCurrency(payroll.taxes.federal)}</span>
            </div>
            
            <div className="py-1">
              <span className="text-sm text-gray-600">State Tax</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">-{formatCurrency(payroll.taxes.state)}</span>
            </div>
            
            <div className="py-1">
              <span className="text-sm text-gray-600">Social Security</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">-{formatCurrency(payroll.taxes.socialSecurity)}</span>
            </div>
            
            <div className="py-1">
              <span className="text-sm text-gray-600">Medicare</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">-{formatCurrency(payroll.taxes.medicare)}</span>
            </div>
            
            <div className="py-1">
              <span className="text-sm text-gray-600">Health Insurance</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">-{formatCurrency(payroll.deductions.health)}</span>
            </div>
            
            <div className="py-1">
              <span className="text-sm text-gray-600">Retirement</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-sm text-gray-900">-{formatCurrency(payroll.deductions.retirement)}</span>
            </div>
            
            {payroll.deductions.other > 0 && (
              <>
                <div className="py-1">
                  <span className="text-sm text-gray-600">Other Deductions</span>
                </div>
                <div className="py-1 text-right">
                  <span className="text-sm text-gray-900">-{formatCurrency(payroll.deductions.other)}</span>
                </div>
              </>
            )}
            
            <div className="py-1 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-800">Total Deductions</span>
            </div>
            <div className="py-1 text-right border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">-{formatCurrency(payroll.totalGross - payroll.totalNet)}</span>
            </div>
          </div>
        </div>
        
        {/* Net Pay Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="grid grid-cols-2">
            <div className="py-1">
              <span className="text-base font-semibold text-gray-900">NET PAY</span>
            </div>
            <div className="py-1 text-right">
              <span className="text-base font-bold text-gray-900">{formatCurrency(payroll.totalNet)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipGenerator; 