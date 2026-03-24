const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome to HireLens! 🎉</p>
      
      {/* Dashboard content will be built next */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Open Jobs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Candidates</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Pending Interviews</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
