import React, { useState, useEffect } from 'react';
import HRPortalLayout from '../../components/hr-portal/layout/HRPortalLayout';
import { Employee, PerformanceReview, CustomerFeedback } from '../../types/hr-portal';

const PerformancePage: React.FC = () => {
  const [employees, setEmployees] = useState<Partial<Employee>[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Sample data loading
  useEffect(() => {
    setTimeout(() => {
      setEmployees(sampleEmployees);
      setReviews(sampleReviews);
      setFeedback(sampleFeedback);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter reviews by selected employee
  const filteredReviews = selectedEmployeeId
    ? reviews.filter(review => review.employeeId === selectedEmployeeId)
    : reviews;

  // Filter feedback by selected employee
  const filteredFeedback = selectedEmployeeId
    ? feedback.filter(f => f.employeeId === selectedEmployeeId)
    : feedback;

  // Calculate average ratings for an employee
  const getAverageRatings = (employeeId: string) => {
    const employeeReviews = reviews.filter(r => r.employeeId === employeeId);
    if (employeeReviews.length === 0) return null;

    return {
      technicalSkills: employeeReviews.reduce((sum, r) => sum + r.ratings.technicalSkills, 0) / employeeReviews.length,
      customerService: employeeReviews.reduce((sum, r) => sum + r.ratings.customerService, 0) / employeeReviews.length,
      teamwork: employeeReviews.reduce((sum, r) => sum + r.ratings.teamwork, 0) / employeeReviews.length,
      reliability: employeeReviews.reduce((sum, r) => sum + r.ratings.reliability, 0) / employeeReviews.length,
      productivity: employeeReviews.reduce((sum, r) => sum + r.ratings.productivity, 0) / employeeReviews.length,
      overall: employeeReviews.reduce((sum, r) => sum + r.ratings.overall, 0) / employeeReviews.length,
    };
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <HRPortalLayout activeTab="performance">
      <div className="py-6 px-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Performance Management</h1>
        <p className="text-gray-600 mb-8">Track employee performance, reviews, and customer feedback</p>

        {/* Filter Controls */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <label htmlFor="employeeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Employee
              </label>
              <select
                id="employeeFilter"
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-black font-medium rounded-md transition-colors duration-200"
              onClick={() => {
                // In a real app, this would open a modal to create a new review
                alert('This would open a form to create a new performance review');
              }}
            >
              New Performance Review
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Reviews */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Performance Reviews</h2>
              </div>
              
              {filteredReviews.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredReviews.map((review) => {
                    const employee = employees.find(e => e.id === review.employeeId);
                    const reviewer = employees.find(e => e.id === review.reviewerId);
                    
                    return (
                      <div key={review.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Review Period: {formatDate(review.period.start)} - {formatDate(review.period.end)}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                              By: {reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Unknown Reviewer'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Ratings */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Ratings</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Technical Skills</span>
                                <span className="text-xs font-medium text-gray-700">{review.ratings.technicalSkills}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${(review.ratings.technicalSkills / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Customer Service</span>
                                <span className="text-xs font-medium text-gray-700">{review.ratings.customerService}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${(review.ratings.customerService / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Teamwork</span>
                                <span className="text-xs font-medium text-gray-700">{review.ratings.teamwork}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${(review.ratings.teamwork / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Reliability</span>
                                <span className="text-xs font-medium text-gray-700">{review.ratings.reliability}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${(review.ratings.reliability / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Productivity</span>
                                <span className="text-xs font-medium text-gray-700">{review.ratings.productivity}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${(review.ratings.productivity / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Overall</span>
                                <span className="text-xs font-medium text-gray-700">{review.ratings.overall}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full" 
                                  style={{ width: `${(review.ratings.overall / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Feedback and Goals */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                              {review.feedback}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Goals</h4>
                            <ul className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md list-disc list-inside space-y-1">
                              {review.goals.map((goal, index) => (
                                <li key={index}>{goal}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Employee Response */}
                        {review.employeeResponse && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Employee Response</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                              {review.employeeResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-600">No Reviews Found</h3>
                  <p className="text-gray-500 mt-1">
                    {selectedEmployeeId 
                      ? 'This employee does not have any performance reviews yet.' 
                      : 'No performance reviews have been created yet.'}
                  </p>
                </div>
              )}
            </div>

            {/* Customer Feedback & Statistics */}
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>
                
                {selectedEmployeeId ? (
                  <div>
                    {(() => {
                      const employee = employees.find(e => e.id === selectedEmployeeId);
                      const ratings = getAverageRatings(selectedEmployeeId);
                      const employeeFeedback = feedback.filter(f => f.employeeId === selectedEmployeeId);
                      const avgFeedbackRating = employeeFeedback.length > 0
                        ? employeeFeedback.reduce((sum, f) => sum + f.rating, 0) / employeeFeedback.length
                        : 0;
                      
                      return (
                        <>
                          <div className="mb-4">
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                              {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                            </h3>
                            <p className="text-sm text-gray-500">{employee?.role}</p>
                          </div>
                          
                          {ratings ? (
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-500">Overall Performance</span>
                                  <span className="text-sm font-medium text-gray-700">{ratings.overall.toFixed(1)}/5</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(ratings.overall / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-500">Customer Satisfaction</span>
                                  <span className="text-sm font-medium text-gray-700">{avgFeedbackRating.toFixed(1)}/5</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(avgFeedbackRating / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <div className="flex justify-between text-sm">
                                  <span>Reviews: {reviews.filter(r => r.employeeId === selectedEmployeeId).length}</span>
                                  <span>Feedback: {employeeFeedback.length}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No performance data available for this employee.</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Select an employee to view their performance summary.</p>
                  </div>
                )}
              </div>
              
              {/* Customer Feedback */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Customer Feedback</h2>
                </div>
                
                {filteredFeedback.length > 0 ? (
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {filteredFeedback.map((f) => {
                      const employee = employees.find(e => e.id === f.employeeId);
                      return (
                        <div key={f.id} className="p-4">
                          <div className="flex justify-between mb-1">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg 
                                  key={i}
                                  className={`h-4 w-4 ${i < f.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(f.date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {f.comment && (
                            <p className="text-sm text-gray-600 mt-1">{f.comment}</p>
                          )}
                          
                          <div className="mt-2 flex justify-between text-xs">
                            <span className="text-gray-500">
                              Service: {f.serviceType}
                            </span>
                            <span className="text-gray-500">
                              By: {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-600">No Feedback Found</h3>
                    <p className="text-gray-500 mt-1">
                      {selectedEmployeeId 
                        ? 'This employee has not received any customer feedback yet.' 
                        : 'No customer feedback has been recorded yet.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </HRPortalLayout>
  );
};

export default PerformancePage;

// Sample data
const sampleEmployees: Partial<Employee>[] = [
  {
    id: '101',
    firstName: 'Sophie',
    lastName: 'Taylor',
    role: 'Senior Stylist',
    department: 'Hair',
    status: 'active'
  },
  {
    id: '102',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    role: 'Salon Manager',
    department: 'Management',
    status: 'active'
  },
  {
    id: '103',
    firstName: 'Emma',
    lastName: 'Johnson',
    role: 'Junior Stylist',
    department: 'Hair',
    status: 'active'
  },
  {
    id: '104',
    firstName: 'David',
    lastName: 'Miller',
    role: 'Barber',
    department: 'Hair',
    status: 'active'
  }
];

const sampleReviews: PerformanceReview[] = [
  {
    id: '1',
    employeeId: '101',
    reviewerId: '102',
    date: '2024-06-25',
    period: {
      start: '2024-01-01',
      end: '2024-06-30'
    },
    ratings: {
      technicalSkills: 4.5,
      customerService: 4.8,
      teamwork: 4.2,
      reliability: 4.6,
      productivity: 4.4,
      overall: 4.5
    },
    feedback: 'Sophie continues to be one of our strongest stylists. Her technical skills are outstanding, and clients frequently request her by name. She has shown great leadership with junior stylists.',
    goals: [
      'Complete advanced color certification by end of Q3',
      'Mentor at least one junior stylist',
      'Increase client retention rate to 85%'
    ],
    employeeResponse: 'I appreciate the positive feedback and am excited to work toward these goals. I\'ve already signed up for the advanced color certification program.',
    status: 'completed'
  },
  {
    id: '2',
    employeeId: '103',
    reviewerId: '102',
    date: '2024-06-20',
    period: {
      start: '2024-01-01',
      end: '2024-06-30'
    },
    ratings: {
      technicalSkills: 3.5,
      customerService: 4.2,
      teamwork: 4.0,
      reliability: 3.8,
      productivity: 3.5,
      overall: 3.8
    },
    feedback: 'Emma has shown good progress since joining us. Her customer service skills are excellent, and she has a great attitude. Technical skills still need some development, which is expected at this stage.',
    goals: [
      'Complete basic color technique training',
      'Improve technical precision in cutting',
      'Build a regular client base of at least 10 clients'
    ],
    status: 'acknowledged'
  },
  {
    id: '3',
    employeeId: '104',
    reviewerId: '102',
    date: '2024-06-22',
    period: {
      start: '2024-01-01',
      end: '2024-06-30'
    },
    ratings: {
      technicalSkills: 4.3,
      customerService: 4.0,
      teamwork: 3.8,
      reliability: 4.5,
      productivity: 4.2,
      overall: 4.2
    },
    feedback: 'David is a strong technical barber with exceptional skills in traditional and modern cuts. He maintains a loyal client base and is extremely reliable. Could improve on teamwork and customer experience aspects.',
    goals: [
      'Complete advanced beard styling certification',
      'Improve communication with front desk staff',
      'Participate in at least one community event'
    ],
    status: 'completed'
  }
];

const sampleFeedback: CustomerFeedback[] = [
  {
    id: '1',
    appointmentId: 'appt1',
    employeeId: '101',
    rating: 5,
    comment: 'Sophie is amazing! Best haircut I\'ve ever had. She really listened to what I wanted and offered great suggestions.',
    date: '2024-06-28',
    serviceType: 'Haircut & Style'
  },
  {
    id: '2',
    appointmentId: 'appt2',
    employeeId: '101',
    rating: 5,
    comment: 'Perfect color! Sophie mixed the exact shade I was looking for. Very happy with the results!',
    date: '2024-06-25',
    serviceType: 'Hair Coloring'
  },
  {
    id: '3',
    appointmentId: 'appt3',
    employeeId: '103',
    rating: 4,
    comment: 'Emma did a good job with my haircut. She was friendly and attentive.',
    date: '2024-06-26',
    serviceType: 'Haircut'
  },
  {
    id: '4',
    appointmentId: 'appt4',
    employeeId: '104',
    rating: 5,
    comment: 'David is the best barber in town! Perfect fade and beard trim.',
    date: '2024-06-27',
    serviceType: 'Men\'s Cut & Beard Trim'
  },
  {
    id: '5',
    appointmentId: 'appt5',
    employeeId: '104',
    rating: 4,
    comment: 'Great haircut, but had to wait a bit past my appointment time.',
    date: '2024-06-23',
    serviceType: 'Men\'s Cut'
  },
  {
    id: '6',
    appointmentId: 'appt6',
    employeeId: '103',
    rating: 3,
    comment: 'Hair styling was okay, but not exactly what I asked for.',
    date: '2024-06-20',
    serviceType: 'Blowout & Style'
  }
]; 