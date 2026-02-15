import { useEffect, useState } from "react";
import { ustaadApi } from "../services/api";

function UstaadsSummary() {
  const [ustaads, setUstaads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load ustaads from database
  const loadUstaads = async () => {
    setLoading(true);
    try {
      const data = await ustaadApi.getAll();
      setUstaads(data);
    } catch (error) {
      console.error("Failed to load ustaads:", error);
      alert("Failed to load ustaads from server.");
      setUstaads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUstaads();
   
    // Refresh every 30 seconds
    const interval = setInterval(loadUstaads, 30000);
   
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-10 pb-10 px-4 md:px-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
        Ustaads Summary
      </h1>

      {/* Total Ustaads */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-4 md:mb-6 w-full md:w-1/3">
        <p className="text-xs md:text-sm text-gray-500">Total Ustaads</p>
        <p className="text-2xl md:text-3xl font-bold text-blue-900">
          {loading ? "..." : ustaads.length}
        </p>
      </div>

      {/* Ustaads Table (READ ONLY) */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h2 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">
          Registered Ustaads
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Loading ustaads...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Full Name</th>
                    <th className="p-3 text-left">Class Teaching</th>
                    <th className="p-3 text-left">Center</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left"># Students</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {ustaads.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="p-3">{u.fullName}</td>
                      <td className="p-3">{u.classTeaching}</td>
                      <td className="p-3">{u.center}</td>
                      <td className="p-3">{u.phone}</td>
                      <td className="p-3">{u.numStudents}</td>
                    </tr>
                  ))}

                  {ustaads.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-4 text-center text-gray-500"
                      >
                        No Ustaads registered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {ustaads.map((u) => (
                <div key={u.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{u.fullName}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {u.numStudents} students
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 pt-2">
                      <p><span className="font-medium">Class Teaching:</span> {u.classTeaching}</p>
                      <p><span className="font-medium">Center:</span> {u.center}</p>
                      <p><span className="font-medium">Phone:</span> {u.phone}</p>
                    </div>
                  </div>
                </div>
              ))}

              {ustaads.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  No Ustaads registered yet
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UstaadsSummary;