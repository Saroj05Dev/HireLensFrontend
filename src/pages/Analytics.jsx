const Analytics = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
      <p className="text-gray-600 mb-6">Hiring metrics and insights</p>
      
      {/* Placeholder for analytics content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Time to Hire</h3>
          <p className="text-3xl font-bold text-gray-900">-</p>
          <p className="text-xs text-gray-500 mt-1">Average days</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900">-</p>
          <p className="text-xs text-gray-500 mt-1">Applied to Hired</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Drop-off Stage</h3>
          <p className="text-3xl font-bold text-gray-900">-</p>
          <p className="text-xs text-gray-500 mt-1">Most common</p>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Funnel</h3>
        <p className="text-gray-500 text-sm">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );
};

export default Analytics;
