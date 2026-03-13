import { useEffect, useState } from "react";
import { teacherApi, studentApi } from "../services/api";

function StudentDistribution() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [distributionType, setDistributionType] = useState("food_hamper"); // food_hamper or shoes
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [distributions, setDistributions] = useState({}); // Store distribution records
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // PDF generation state

  // Load teachers and students
  useEffect(() => {
    loadTeachers();
    loadAllStudents();
    loadDistributions();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await teacherApi.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to load teachers:", error);
      alert("Failed to load teachers from server.");
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      const data = await studentApi.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
    }
  };

  const loadDistributions = () => {
    // Load from localStorage
    const saved = localStorage.getItem('studentDistributions');
    if (saved) {
      setDistributions(JSON.parse(saved));
    }
  };

  const saveDistributions = (newDistributions) => {
    localStorage.setItem('studentDistributions', JSON.stringify(newDistributions));
    setDistributions(newDistributions);
  };

  // Filter students by selected teacher
  const teacherStudents = selectedTeacher
    ? students.filter((s) => s.ustadh === selectedTeacher.name)
    : [];

  // Filter by search
  const filteredStudents = teacherStudents.filter((s) =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.location?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Sort alphabetically
  const sortedStudents = filteredStudents.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  // Toggle distribution (tick/untick)
  const handleToggleDistribution = (studentId) => {
    const key = `${studentId}_${distributionType}`;
    const newDistributions = { ...distributions };

    if (newDistributions[key]) {
      // Untick - remove record
      delete newDistributions[key];
    } else {
      // Tick - add record with current date/time
      newDistributions[key] = {
        studentId,
        distributionType,
        distributedAt: new Date().toISOString(),
        distributedBy: selectedTeacher?.name || "Admin",
      };
    }

    saveDistributions(newDistributions);
  };

  // Check if student received this distribution type
  const hasReceived = (studentId) => {
    const key = `${studentId}_${distributionType}`;
    return !!distributions[key];
  };

  // Get distribution details
  const getDistributionDetails = (studentId) => {
    const key = `${studentId}_${distributionType}`;
    return distributions[key];
  };

  // Count students who received items (current teacher)
  const receivedCount = sortedStudents.filter(s => hasReceived(s.id)).length;

  // Global statistics - ALL students regardless of teacher
  const globalReceivedCount = students.filter(s => hasReceived(s.id)).length;
  const globalPendingCount = students.length - globalReceivedCount;
  const globalCompletionRate = students.length > 0
    ? Math.round((globalReceivedCount / students.length) * 100)
    : 0;

  // Clear all distributions for current type (with confirmation)
  const handleClearAll = () => {
    if (!window.confirm(
      `Clear all ${distributionType === 'food_hamper' ? 'Food Hamper' : 'Shoes'} distributions for ${selectedTeacher?.name || 'all students'}?\n\n` +
      `This will remove ${receivedCount} distribution records.\n` +
      `This action cannot be undone.`
    )) return;

    const newDistributions = { ...distributions };
    sortedStudents.forEach(student => {
      const key = `${student.id}_${distributionType}`;
      delete newDistributions[key];
    });

    saveDistributions(newDistributions);
    alert("Distribution records cleared successfully!");
  };

  // Generate PDF for current teacher's distribution list
  const generatePDF = async () => {
    if (!selectedTeacher) {
      alert("Please select a teacher first");
      return;
    }

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
      if (sortedStudents.length > ITEMS_FIRST_PAGE) {
        totalPages = 1 + Math.ceil((sortedStudents.length - ITEMS_FIRST_PAGE) / ITEMS_OTHER_PAGES);
      }

      const distributionLabel = distributionType === 'food_hamper' ? 'Food Hampers' : 'Shoes';
      const receivedStudents = sortedStudents.filter(s => hasReceived(s.id));
      const pendingStudents = sortedStudents.filter(s => !hasReceived(s.id));

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        const startIdx = pageNum === 0
          ? 0
          : ITEMS_FIRST_PAGE + (pageNum - 1) * ITEMS_OTHER_PAGES;
        const endIdx = pageNum === 0
          ? Math.min(ITEMS_FIRST_PAGE, sortedStudents.length)
          : Math.min(startIdx + ITEMS_OTHER_PAGES, sortedStudents.length);
        const pageStudents = sortedStudents.slice(startIdx, endIdx);

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
              <div style="border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                  <div>
                    <h1 style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">BBIC Management — ${distributionLabel} Distribution</h1>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #000;">
                      Teacher: <strong>${selectedTeacher.name}</strong> &nbsp;|&nbsp;
                      Class: <strong>${selectedTeacher.classTeaching}</strong> &nbsp;|&nbsp;
                      Total: <strong>${sortedStudents.length}</strong> &nbsp;|&nbsp;
                      Received: <strong style="color: #059669;">${receivedStudents.length}</strong> &nbsp;|&nbsp;
                      Pending: <strong style="color: #dc2626;">${pendingStudents.length}</strong> &nbsp;|&nbsp;
                      Date: <strong>${new Date().toLocaleDateString()}</strong>
                    </p>
                  </div>
                  <p style="margin: 0; font-size: 9px; color: #555;">Page 1 of ${totalPages}</p>
                </div>
              </div>
            ` : `
              <!-- Subsequent page mini header -->
              <div style="border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                <p style="margin: 0; font-size: 9px; color: #000;"><strong>${selectedTeacher.name}</strong> — ${distributionLabel} (continued)</p>
                <p style="margin: 0; font-size: 9px; color: #555;">Page ${pageNum + 1} of ${totalPages}</p>
              </div>
            `}

            <!-- Students Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed;">
              <thead>
                <tr style="background: #000; color: #fff;">
                  <th style="width: 5%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">#</th>
                  <th style="width: 12%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">ID Number</th>
                  <th style="width: 28%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Student Name</th>
                  <th style="width: 8%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">Gender</th>
                  <th style="width: 17%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Location</th>
                  <th style="width: 10%; padding: 4px 3px; text-align: center; border: 1px solid #000;">Status</th>
                  <th style="width: 20%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                ${pageStudents.map((student, index) => {
                  const globalIndex = startIdx + index + 1;
                  const received = hasReceived(student.id);
                  const details = getDistributionDetails(student.id);
                  const rowBg = received ? '#d1fae5' : (globalIndex % 2 === 0 ? '#f9fafb' : '#ffffff');
                  
                  return `
                    <tr style="background: ${rowBg};">
                      <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${globalIndex}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${student.studentId || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc; font-weight: 600;">${student.name || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${student.gender || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${student.location || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">
                        <span style="background: ${received ? '#059669' : '#6b7280'}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 8px; font-weight: 600;">
                          ${received ? '✓ Received' : 'Pending'}
                        </span>
                      </td>
                      <td style="padding: 3px; border: 1px solid #ccc; font-size: 8px;">
                        ${details ? `${new Date(details.distributedAt).toLocaleDateString()} ${new Date(details.distributedAt).toLocaleTimeString()}` : '-'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            ${pageNum === totalPages - 1 ? `
              <p style="margin-top: 6px; font-size: 8px; color: #555; text-align: right;">
                Distribution Summary: ${receivedStudents.length} received, ${pendingStudents.length} pending — ${sortedStudents.length} student(s) total
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

      const fileName = `${selectedTeacher.name.replace(/\s+/g, '_')}_${distributionLabel.replace(/\s+/g, '_')}_Distribution_${new Date().toISOString().split('T')[0]}.pdf`;
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
    <div className="pt-10 pb-10 px-4 md:px-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Student Distribution Tracking</h1>

      {/* Global Statistics Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-3">
          📊 Global Distribution Stats - {distributionType === 'food_hamper' ? '🛒 Food Hampers' : '👟 Shoes'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl md:text-3xl font-bold">{students.length}</div>
            <div className="text-xs md:text-sm opacity-90">Total Students</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-200">{globalReceivedCount}</div>
            <div className="text-xs md:text-sm opacity-90">Received</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-200">{globalPendingCount}</div>
            <div className="text-xs md:text-sm opacity-90">Pending</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-200">{globalCompletionRate}%</div>
            <div className="text-xs md:text-sm opacity-90">Completion</div>
          </div>
        </div>
      </div>

      {/* Teacher Selection & Distribution Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Select Teacher */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-3 text-base md:text-lg">Select Teacher/Class</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
                <p className="mt-2 text-gray-600 text-sm">Loading teachers...</p>
              </div>
            ) : (
              <>
                {teachers.map((t) => {
                  const studentCount = students.filter(s => s.ustadh === t.name).length;
                  const isSelected = selectedTeacher?.id === t.id;

                  return (
                    <div
                      key={t.id}
                      className={`border p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-100 border-emerald-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTeacher(t)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm md:text-base">{t.name}</div>
                          <div className="text-xs md:text-sm text-gray-600">Class: {t.classTeaching}</div>
                        </div>
                        <div className="text-xs md:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {studentCount} students
                        </div>
                      </div>
                    </div>
                  );
                })}
                {teachers.length === 0 && (
                  <div className="text-center text-gray-500 py-4 text-sm">
                    No teachers registered yet
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Select Distribution Type */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-3 text-base md:text-lg">Distribution Type</h2>
          <div className="space-y-3">
            <div
              className={`border p-4 rounded-lg cursor-pointer transition-all ${
                distributionType === 'food_hamper'
                  ? 'bg-orange-100 border-orange-500'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setDistributionType('food_hamper')}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">🛒</div>
                <div>
                  <div className="font-semibold text-base">Food Hampers</div>
                  <div className="text-sm text-gray-600">Track food hamper distributions</div>
                </div>
              </div>
            </div>

            <div
              className={`border p-4 rounded-lg cursor-pointer transition-all ${
                distributionType === 'shoes'
                  ? 'bg-blue-100 border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setDistributionType('shoes')}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">👟</div>
                <div>
                  <div className="font-semibold text-base">Shoes</div>
                  <div className="text-sm text-gray-600">Track shoe distributions</div>
                </div>
              </div>
            </div>
          </div>

          {selectedTeacher && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Selected:</div>
              <div className="text-base font-semibold">{selectedTeacher.name} - {selectedTeacher.classTeaching}</div>
              <div className="text-sm text-gray-600 mt-1">
                {distributionType === 'food_hamper' ? '🛒 Food Hampers' : '👟 Shoes'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Distribution List */}
      {selectedTeacher && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            <div>
              <h2 className="font-semibold text-base md:text-lg">
                {selectedTeacher.name}'s Students - {distributionType === 'food_hamper' ? 'Food Hampers' : 'Shoes'}
              </h2>
              <p className="text-sm text-gray-600">
                {receivedCount} of {teacherStudents.length} students received
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {/* PDF Download Button */}
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF || sortedStudents.length === 0}
                className="flex items-center gap-2 bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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

              {receivedCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Clear All ({receivedCount})
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search by name, ID, or location..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="border p-2.5 rounded w-full text-sm md:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 opacity-0 cursor-not-allowed"
                      disabled
                    />
                  </th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Gender</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">Shoe Size</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student) => {
                  const received = hasReceived(student.id);
                  const details = getDistributionDetails(student.id);

                  return (
                    <tr key={student.id} className={`border-b ${received ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={received}
                          onChange={() => handleToggleDistribution(student.id)}
                          className="h-5 w-5 cursor-pointer text-emerald-600"
                        />
                      </td>
                      <td className="p-3">{student.studentId}</td>
                      <td className="p-3 font-medium">{student.name}</td>
                      <td className="p-3">{student.gender}</td>
                      <td className="p-3">{student.location}</td>
                      <td className="p-3 text-center">{student.shoeSize || '-'}</td>
                      <td className="p-3">
                        {received ? (
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            ✓ Received
                          </span>
                        ) : (
                          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {details ? (
                          <div className="text-xs">
                            <div>{new Date(details.distributedAt).toLocaleDateString()}</div>
                            <div className="text-gray-500">{new Date(details.distributedAt).toLocaleTimeString()}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sortedStudents.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      {studentSearch ? "No students found matching your search" : "No students in this class"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {sortedStudents.map((student) => {
              const received = hasReceived(student.id);
              const details = getDistributionDetails(student.id);

              return (
                <div
                  key={student.id}
                  className={`border rounded-lg p-4 ${received ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={received}
                      onChange={() => handleToggleDistribution(student.id)}
                      className="h-5 w-5 cursor-pointer text-emerald-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                        </div>
                        {received ? (
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            ✓ Received
                          </span>
                        ) : (
                          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        <p><span className="font-medium">Gender:</span> {student.gender}</p>
                        <p><span className="font-medium">Location:</span> {student.location}</p>
                        <p><span className="font-medium">Shoe Size:</span> {student.shoeSize || '-'}</p>
                        {details && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="font-medium text-green-700">Distributed:</p>
                            <p>{new Date(details.distributedAt).toLocaleDateString()} at {new Date(details.distributedAt).toLocaleTimeString()}</p>
                            <p className="text-xs">By: {details.distributedBy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {sortedStudents.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {studentSearch ? "No students found matching your search" : "No students in this class"}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {sortedStudents.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{teacherStudents.length}</div>
                  <div className="text-xs text-gray-600">Total Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{receivedCount}</div>
                  <div className="text-xs text-gray-600">Received</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">{teacherStudents.length - receivedCount}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {teacherStudents.length > 0 ? Math.round((receivedCount / teacherStudents.length) * 100) : 0}%
                  </div>
                  <div className="text-xs text-gray-600">Completion</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions when no teacher selected */}
      {!selectedTeacher && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">Get Started</h3>
          <p className="text-gray-600">
            Select a teacher/class and distribution type above to start tracking distributions
          </p>
        </div>
      )}
    </div>
  );
}

export default StudentDistribution;