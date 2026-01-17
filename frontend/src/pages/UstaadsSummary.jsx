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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Ustaads Summary
      </h1>

      {/* Total Ustaads */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 w-full md:w-1/3">
        <p className="text-sm text-gray-500">Total Ustaads</p>
        <p className="text-3xl font-bold text-blue-900">
          {loading ? "..." : ustaads.length}
        </p>
      </div>

      {/* Ustaads Table (READ ONLY) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">
          Registered Ustaads
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600">Loading ustaads...</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default UstaadsSummary;



