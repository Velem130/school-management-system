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
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: Separate state for form submission
  const [search, setSearch] = useState(""); // NEW: Search state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // NEW: PDF generation state

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
    // 🔒 PREVENT DOUBLE SUBMISSION
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate click");
      return;
    }

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

    // 🔒 LOCK THE BUTTON IMMEDIATELY
    setIsSubmitting(true);

    try {
      // Convert numStudents to number
      const ustaadData = {
        ...form,
        numStudents: parseInt(form.numStudents) || 0
      };

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
    } finally {
      // 🔒 ALWAYS UNLOCK when done (success or error)
      setIsSubmitting(false);
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

  // NEW: Filter ustaads by search
  const filteredUstaads = ustaads.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.classTeaching?.toLowerCase().includes(search.toLowerCase()) ||
    u.center?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort alphabetically by name
  const sortedUstaads = filteredUstaads.sort((a, b) =>
    a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' })
  );

  // Generate PDF function - COMPACT DESIGN
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const ITEMS_FIRST_PAGE = 30;
      const ITEMS_OTHER_PAGES = 38;

      // Calculate total pages
      let totalPages = 1;
      if (sortedUstaads.length > ITEMS_FIRST_PAGE) {
        totalPages = 1 + Math.ceil((sortedUstaads.length - ITEMS_FIRST_PAGE) / ITEMS_OTHER_PAGES);
      }

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        const startIdx = pageNum === 0
          ? 0
          : ITEMS_FIRST_PAGE + (pageNum - 1) * ITEMS_OTHER_PAGES;
        const endIdx = pageNum === 0
          ? Math.min(ITEMS_FIRST_PAGE, sortedUstaads.length)
          : Math.min(startIdx + ITEMS_OTHER_PAGES, sortedUstaads.length);
        const pageUstaads = sortedUstaads.slice(startIdx, endIdx);

        const pdfContainer = document.createElement('div');
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.width = '210mm';
        pdfContainer.style.padding = '5mm 10mm';
        pdfContainer.style.backgroundColor = 'white';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        pdfContainer.style.color = '#000';

        pdfContainer.innerHTML = `
          <div style="width: 100%; max-width: 190mm; margin: 0 auto;">

            ${pageNum === 0 ? `
              <!-- Compact Header -->
              <div style="border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                  <h1 style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">BBIC Management — Ustaads Registry</h1>
                  <p style="margin: 2px 0 0 0; font-size: 10px; color: #000;">
                    Total Ustaads: <strong>${sortedUstaads.length}</strong> &nbsp;|&nbsp;
                    Date: <strong>${new Date().toLocaleDateString()}</strong>
                  </p>
                </div>
                <p style="margin: 0; font-size: 9px; color: #555;">Page 1 of ${totalPages}</p>
              </div>
            ` : `
              <!-- Subsequent page mini header -->
              <div style="border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                <p style="margin: 0; font-size: 9px; color: #000;"><strong>Ustaads Registry</strong> (continued)</p>
                <p style="margin: 0; font-size: 9px; color: #555;">Page ${pageNum + 1} of ${totalPages}</p>
              </div>
            `}

            <!-- Ustaads Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed;">
              <thead>
                <tr style="background: #000; color: #fff;">
                  <th style="width: 5%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">#</th>
                  <th style="width: 30%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Full Name</th>
                  <th style="width: 15%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Class Teaching</th>
                  <th style="width: 25%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Center</th>
                  <th style="width: 18%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Phone</th>
                  <th style="width: 7%;  padding: 4px 3px; text-align: center; border: 1px solid #000;"># Kids</th>
                </tr>
              </thead>
              <tbody>
                ${pageUstaads.map((ustaad, index) => {
                  const globalIndex = startIdx + index + 1;
                  const rowBg = globalIndex % 2 === 0 ? '#f2f2f2' : '#ffffff';
                  return `
                    <tr style="background: ${rowBg};">
                      <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${globalIndex}</td>
                      <td style="padding: 3px; border: 1px solid #ccc; font-weight: 600;">${ustaad.fullName || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${ustaad.classTeaching || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${ustaad.center || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${ustaad.phone || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${ustaad.numStudents || 0}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            ${pageNum === totalPages - 1 ? `
              <p style="margin-top: 6px; font-size: 8px; color: #555; text-align: right;">
                End of registry — ${sortedUstaads.length} Ustaad(s) total
              </p>
            ` : ''}

          </div>
        `;

        document.body.appendChild(pdfContainer);
        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(pdfContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1000
        });

        document.body.removeChild(pdfContainer);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (pageNum > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      const fileName = `Ustaads_Registry_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      alert('PDF generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="pt-10 md:pt-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Ustaads Management
        </h1>
        <button
          onClick={generatePDF}
          disabled={isGeneratingPDF || loading || sortedUstaads.length === 0}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isGeneratingPDF ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

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
          disabled={isSubmitting}
          className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            editingId ? "Update" : "Add"
          )}
        </button>
      </div>

      {/* Total Ustaads Count - NEW ADDITION */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Total Registered Ustaads: 
          <span className="ml-2 text-emerald-700 text-2xl font-bold">
            {ustaads.length}
          </span>
        </h3>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">All Registered Ustaads</h3>
        
        {/* NEW: Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search by name, class, center, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2.5 rounded w-full text-sm md:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600">Loading ustaads...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                  {sortedUstaads.map((u) => (
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

                  {sortedUstaads.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-4 text-center text-gray-500"
                      >
                        {search ? "No ustaads found matching your search" : "No Ustaads added yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {sortedUstaads.map((u) => (
                <div key={u.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{u.fullName}</p>
                        <p className="text-sm text-gray-600">{u.classTeaching}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {u.numStudents} students
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Center:</span> {u.center}</p>
                      <p><span className="font-medium">Phone:</span> {u.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(u)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                      disabled={loading}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {sortedUstaads.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  {search ? "No ustaads found matching your search" : "No Ustaads added yet"}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Ustaads;