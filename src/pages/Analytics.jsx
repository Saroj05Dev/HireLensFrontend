import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  getJobFunnelApi, 
  getTimeToHireApi,
  getOrganizationTimeToHireApi
} from "./analytics.api";
import { getCandidatesByStageApi } from "./dashboard.api";
import { fetchJobs } from "../features/jobs/jobsSlice";
import Loader from "../components/ui/Loader";

const STAGE_ORDER = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

const STAGE_COLORS = {
  APPLIED: "#3B82F6",
  SCREENING: "#8B5CF6",
  INTERVIEW: "#F59E0B",
  OFFER: "#10B981",
  HIRED: "#059669",
  REJECTED: "#EF4444",
};

const Analytics = () => {
  const dispatch = useDispatch();
  const { list: jobs } = useSelector((state) => state.jobs);
  
  const [candidatesByStage, setCandidatesByStage] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobFunnel, setJobFunnel] = useState(null);
  const [jobTimeToHire, setJobTimeToHire] = useState(null);
  const [orgTimeToHire, setOrgTimeToHire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchJobs());
    fetchAnalytics();
  }, [dispatch]);

  useEffect(() => {
    if (selectedJob) {
      fetchJobAnalytics(selectedJob);
    }
  }, [selectedJob]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [stageData, timeData] = await Promise.all([
        getCandidatesByStageApi(),
        getOrganizationTimeToHireApi()
      ]);
      setCandidatesByStage(stageData);
      setOrgTimeToHire(timeData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobAnalytics = async (jobId) => {
    try {
      const [funnelData, timeData] = await Promise.all([
        getJobFunnelApi(jobId),
        getTimeToHireApi(jobId)
      ]);
      
      setJobFunnel(funnelData);
      setJobTimeToHire(timeData);
    } catch (err) {
      console.error("Failed to fetch job analytics:", err);
    }
  };

  // Calculate metrics
  const totalCandidates = candidatesByStage.reduce((sum, stage) => sum + stage.count, 0);
  const hiredCount = candidatesByStage.find(s => s._id === "HIRED")?.count || 0;
  const rejectedCount = candidatesByStage.find(s => s._id === "REJECTED")?.count || 0;
  const activeCount = totalCandidates - hiredCount - rejectedCount;
  
  const conversionRate = totalCandidates > 0 ? ((hiredCount / totalCandidates) * 100).toFixed(1) : 0;
  const rejectionRate = totalCandidates > 0 ? ((rejectedCount / totalCandidates) * 100).toFixed(1) : 0;

  // Calculate drop-off rates between stages
  const calculateDropOff = () => {
    const stageMap = {};
    candidatesByStage.forEach(stage => {
      stageMap[stage._id] = stage.count;
    });

    const dropOffs = [];
    for (let i = 0; i < STAGE_ORDER.length - 2; i++) {
      const currentStage = STAGE_ORDER[i];
      const nextStage = STAGE_ORDER[i + 1];
      
      const currentCount = stageMap[currentStage] || 0;
      const nextCount = stageMap[nextStage] || 0;
      
      if (currentCount > 0) {
        const dropOffRate = ((currentCount - nextCount) / currentCount * 100).toFixed(1);
        dropOffs.push({
          from: currentStage,
          to: nextStage,
          dropOffRate: parseFloat(dropOffRate),
          lost: currentCount - nextCount
        });
      }
    }
    
    return dropOffs.sort((a, b) => b.dropOffRate - a.dropOffRate);
  };

  const dropOffAnalysis = calculateDropOff();
  const highestDropOff = dropOffAnalysis[0];

  // Funnel visualization data
  const getFunnelData = () => {
    const orderedStages = STAGE_ORDER.filter(stage => stage !== "REJECTED");
    return orderedStages.map(stageName => {
      const stage = candidatesByStage.find(s => s._id === stageName);
      return {
        name: stageName,
        count: stage?.count || 0,
        color: STAGE_COLORS[stageName]
      };
    }).filter(stage => stage.count > 0);
  };

  const funnelData = getFunnelData();
  const maxCount = Math.max(...funnelData.map(s => s.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights into your hiring pipeline</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Candidates</h3>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalCandidates}</p>
          <p className="text-xs text-gray-500 mt-1">{activeCount} active in pipeline</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{hiredCount} hired from {totalCandidates}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Rejection Rate</h3>
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-red-600">{rejectionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{rejectedCount} rejected</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Avg Time to Hire</h3>
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {orgTimeToHire?.averageTimeToHireDays || "-"}
          </p>
          <p className="text-xs text-gray-500 mt-1">days on average</p>
        </div>
      </div>

      {/* Hiring Funnel Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Hiring Funnel</h2>
        
        {funnelData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No funnel data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {funnelData.map((stage, index) => {
              const widthPercentage = (stage.count / maxCount) * 100;
              const conversionFromPrevious = index > 0 
                ? ((stage.count / funnelData[index - 1].count) * 100).toFixed(1)
                : 100;
              
              return (
                <div key={stage.name} className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-32 shrink-0">
                      <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <div 
                          className="h-12 rounded-lg transition-all duration-500 flex items-center justify-between px-4"
                          style={{ 
                            width: `${widthPercentage}%`,
                            backgroundColor: stage.color,
                            minWidth: '120px'
                          }}
                        >
                          <span className="text-white font-bold">{stage.count}</span>
                          {index > 0 && (
                            <span className="text-white text-xs opacity-90">
                              {conversionFromPrevious}% conversion
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < funnelData.length - 1 && (
                    <div className="ml-32 pl-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drop-off Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Drop-off Analysis</h2>
          
          {dropOffAnalysis.length === 0 ? (
            <p className="text-gray-500 text-sm">No drop-off data available</p>
          ) : (
            <div className="space-y-3">
              {dropOffAnalysis.map((dropOff, index) => (
                <div 
                  key={`${dropOff.from}-${dropOff.to}`}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {dropOff.from} → {dropOff.to}
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Highest
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {dropOff.dropOffRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {dropOff.lost} candidate{dropOff.lost !== 1 ? 's' : ''} lost at this stage
                  </p>
                </div>
              ))}
            </div>
          )}

          {highestDropOff && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Insight
              </h3>
              <p className="text-sm text-blue-800">
                Focus on improving the {highestDropOff.from} to {highestDropOff.to} transition. 
                This is where you're losing the most candidates ({highestDropOff.dropOffRate}% drop-off).
              </p>
            </div>
          )}
        </div>

        {/* Stage Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stage Distribution</h2>
          
          <div className="space-y-3">
            {candidatesByStage.map((stage) => {
              const percentage = totalCandidates > 0 
                ? ((stage.count / totalCandidates) * 100).toFixed(1)
                : 0;
              
              return (
                <div key={stage._id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: STAGE_COLORS[stage._id] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{stage._id}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {stage.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: STAGE_COLORS[stage._id]
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job-Specific Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Job-Specific Analytics</h2>
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <select
              value={selectedJob || ""}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 md:px-4 py-2 pr-10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Select a job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {!selectedJob ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 mb-2">Select a job to view detailed analytics</p>
            <p className="text-sm text-gray-400">See funnel data and time-to-hire metrics for specific positions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Funnel */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Candidate Funnel</h3>
              {jobFunnel && Object.keys(jobFunnel.funnel).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(jobFunnel.funnel).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{stage}</span>
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No funnel data for this job</p>
              )}
            </div>

            {/* Time to Hire */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Time to Hire</h3>
              {jobTimeToHire && jobTimeToHire.hires.length > 0 ? (
                <div>
                  <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 mb-4">
                    <p className="text-sm text-purple-700 mb-1">Average Time to Hire</p>
                    <p className="text-4xl font-bold text-purple-900">
                      {jobTimeToHire.averageTimeToHireDays}
                      <span className="text-lg ml-2">days</span>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Individual Hires</p>
                    {jobTimeToHire.hires.map((hire, index) => (
                      <div key={hire.candidateId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Candidate {index + 1}</span>
                        <span className="text-sm font-medium text-gray-900">{hire.timeToHireDays} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hires yet for this job</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
