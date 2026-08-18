"use client";

export default function SalesMappingChart() {
  const regions = [
    { name: "North America", color: "bg-[#002c5c]", value: "High" },
    { name: "Europe", color: "bg-[#81c341]", value: "Medium" },
    { name: "Asia Pacific", color: "bg-[#002c5c]", value: "High" },
    { name: "Middle East", color: "bg-[#81c341]", value: "Very High" },
    { name: "South America", color: "bg-[#002c5c]", value: "Medium" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Student Distribution by Region</h3>
      <div className="relative w-full h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
        {/* World Map Placeholder */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🌍</span>
          </div>
          <p className="text-xs text-gray-500">World Map Visualization</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {regions.map((region, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${region.color}`}></div>
              <span className="text-xs text-gray-700">{region.name}</span>
            </div>
            <span className="text-xs font-medium text-gray-900">{region.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

