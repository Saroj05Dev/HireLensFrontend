const STAGES = [
    "Applied",
    "Screening",
    "Interview",
    "Offer",
    "Hired", 
];

const PipelineBoard = () => {
  return (
    <div>
      <h2 className="font-semibold mb-4">Candidate Pipeline</h2>

      <div className="flex gap-4 overflow-x-auto">
        {STAGES.map((stage) => (
            <div
                key={stage}
                className="min-w-55 bg-gray-100 rounded p-3"
            >
                <h3 className="text-sm font-semibold mb-2">{stage}</h3>

                <div className="text-xs text-gray-500">
                    No candidates yet
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}

export default PipelineBoard
