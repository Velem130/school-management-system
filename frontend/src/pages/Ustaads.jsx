import { useEffect, useState } from "react";
import { ustaadApi } from "../services/api";

function Ustaads() {
  const [ustaads, setUstaads] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    classTeaching: "",
    center: "",
    phone: "",
    numStudents: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load ustaads from database
  useEffect(() => {
    loadUstaads();
  }, []);

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

  const saveUstaads = async (data) => {
    setUstaads(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      !form.fullName ||
      !form.classTeaching ||
      !form.center ||
      !form.phone ||
      !form.numStudents
    ) {
      alert("Please fill all fields");
      return;
    }

    // Convert numStudents to number
    const ustaadData = {
      ...form,
      numStudents: parseInt(form.numStudents) || 0
    };

    try {
      if (editingId) {
        // Update existing ustaad
        const updated = await ustaadApi.update(editingId, ustaadData);
        const updatedList = ustaads.map((u) =>
          u.id === editingId ? updated : u
        );
        saveUstaads(updatedList);
        setEditingId(null);
        alert("Ustaad updated successfully!");
      } else {
        // Create new ustaad
        const newUstaad = await ustaadApi.create(ustaadData);
        saveUstaads([...ustaads, newUstaad]);
        alert("Ustaad added successfully!");
      }

      // Reset form
      setForm({
        fullName: "",
        classTeaching: "",
        center: "",
        phone: "",
        numStudents: "",
      });
    } catch (error) {
      alert(error.message || "Failed to save ustaad");
    }
  };

  const handleEdit = (ustaad) => {
    setForm({
      fullName: ustaad.fullName,
      classTeaching: ustaad.classTeaching,
      center: ustaad.center,
      phone: ustaad.phone,
      numStudents: ustaad.numStudents.toString(),
    });
    setEditingId(ustaad.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Ustaad?")) return;
    
    try {
      await ustaadApi.delete(id);
      const updatedList = ustaads.filter((u) => u.id !== id);
      saveUstaads(updatedList);
      alert("Ustaad deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete ustaad");
    }
  };

  return (
    <div className="pt-10 md:pt-0">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Ustaads Management
      </h1>

      {/* Add / Update Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="font-semibold mb-4">
          {editingId ? "Update Ustaad" : "Add Ustaad"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <input
            name="fullName"
            placeholder="Full Name *"
            value={form.fullName}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="classTeaching"
            placeholder="Class Teaching *"
            value={form.classTeaching}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="center"
            placeholder="Center *"
            value={form.center}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="phone"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="numStudents"
            type="number"
            placeholder="Number of Students *"
            value={form.numStudents}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <p className="text-sm text-gray-500 mb-4">
          * Ustaad names must be unique. Editing allows name changes.
        </p>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? "Processing..." : editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">All Registered Ustaads</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600">Loading ustaads...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Full Name</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Center</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left"># Students</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ustaads.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.classTeaching}</td>
                  <td className="p-3">{u.center}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {u.numStudents}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={loading}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {ustaads.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-4 text-center text-gray-500"
                  >
                    No Ustaads added yet
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

export default Ustaads;

