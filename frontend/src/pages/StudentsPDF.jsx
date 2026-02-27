import { useEffect, useState } from "react";
import { teacherApi, studentApi } from "../services/api";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function StudentsPDF() {
  const [teachers, setTeachers] = useState([]);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Load teachers
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const backendTeachers = await teacherApi.getAllTeachers();
        setTeachers(backendTeachers);
      } catch (error) {
        console.error("Failed to load teachers:", error);
        alert("Failed to load teachers from server.");
      }
    };
    loadTeachers();
  }, []);

  // Load students for current teacher
  useEffect(() => {
    if (currentTeacher) {
      loadStudentsForTeacher(currentTeacher.name);
    }
  }, [currentTeacher]);

  const loadStudentsForTeacher = async (teacherName) => {
    setLoading(true);
    try {
      const teacherStudents = await studentApi.getStudentsByTeacher(teacherName);
      const sortedStudents = teacherStudents.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
      setStudents(sortedStudents);
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const selectExistingTeacher = (teacher) => {
    setCurrentTeacher(teacher);
  };

  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;

  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 297;
      const ITEMS_FIRST_PAGE = 28;
      const ITEMS_OTHER_PAGES = 38;

      // Calculate total pages
      let totalPages = 1;
      if (students.length > ITEMS_FIRST_PAGE) {
        totalPages = 1 + Math.ceil((students.length - ITEMS_FIRST_PAGE) / ITEMS_OTHER_PAGES);
      }

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        const startIdx = pageNum === 0
          ? 0
          : ITEMS_FIRST_PAGE + (pageNum - 1) * ITEMS_OTHER_PAGES;
        const endIdx = pageNum === 0
          ? Math.min(ITEMS_FIRST_PAGE, students.length)
          : Math.min(startIdx + ITEMS_OTHER_PAGES, students.length);
        const pageStudents = students.slice(startIdx, endIdx);

        const pdfContainer = document.createElement('div');
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.width = '297mm';
        pdfContainer.style.padding = '5mm 10mm';
        pdfContainer.style.backgroundColor = 'white';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        pdfContainer.style.color = '#000';

        pdfContainer.innerHTML = `
          <div style="width: 100%; max-width: 277mm; margin: 0 auto;">

            ${pageNum === 0 ? `
              <!-- Compact Header -->
              <div style="border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                  <h1 style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">BBIC Management — Class Roster</h1>
                  <p style="margin: 2px 0 0 0; font-size: 10px; color: #000;">
                    Teacher: <strong>${currentTeacher.name}</strong> &nbsp;|&nbsp;
                    Class: <strong>${currentTeacher.classTeaching}</strong> &nbsp;|&nbsp;
                    Total: <strong>${students.length}</strong> &nbsp;|&nbsp;
                    Male: <strong>${maleCount}</strong> &nbsp;|&nbsp;
                    Female: <strong>${femaleCount}</strong> &nbsp;|&nbsp;
                    Date: <strong>${new Date().toLocaleDateString()}</strong>
                  </p>
                </div>
                <p style="margin: 0; font-size: 9px; color: #555;">Page 1 of ${totalPages}</p>
              </div>
            ` : `
              <!-- Subsequent page mini header -->
              <div style="border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                <p style="margin: 0; font-size: 9px; color: #000;"><strong>${currentTeacher.name}</strong> — ${currentTeacher.classTeaching} (continued)</p>
                <p style="margin: 0; font-size: 9px; color: #555;">Page ${pageNum + 1} of ${totalPages}</p>
              </div>
            `}

            <!-- Students Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed;">
              <thead>
                <tr style="background: #000; color: #fff;">
                  <th style="width: 4%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">#</th>
                  <th style="width: 10%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">ID Number</th>
                  <th style="width: 20%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Student Name</th>
                  <th style="width: 6%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">Gender</th>
                  <th style="width: 8%;  padding: 4px 3px; text-align: left;   border: 1px solid #000;">Date Joined</th>
                  <th style="width: 14%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Home Location</th>
                  <th style="width: 16%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Madrassa</th>
                  <th style="width: 5%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">Shoe</th>
                  <th style="width: 17%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Cell Number</th>
                </tr>
              </thead>
              <tbody>
                ${pageStudents.map((student, index) => {
                  const globalIndex = startIdx + index + 1;
                  const rowBg = globalIndex % 2 === 0 ? '#f2f2f2' : '#ffffff';
                  return `
                    <tr style="background: ${rowBg};">
                      <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${globalIndex}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${student.studentId || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc; font-weight: 600;">${student.name || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${student.gender || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${student.dateJoined || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${student.location || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${student.madrassaLocation || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc; text-align: center;">${student.shoeSize || '-'}</td>
                      <td style="padding: 3px; border: 1px solid #ccc;">${student.cell || '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            ${pageNum === totalPages - 1 ? `
              <p style="margin-top: 6px; font-size: 8px; color: #555; text-align: right;">
                End of roster — ${students.length} student(s) total
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
          windowWidth: 1200
        });

        document.body.removeChild(pdfContainer);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (pageNum > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      const fileName = `${currentTeacher.name.replace(/\s+/g, '_')}_Class_${currentTeacher.classTeaching}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      alert('PDF generated successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="pt-10 pb-10 px-4 md:px-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Download Class Roster (PDF)</h1>

      {!currentTeacher ? (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4 text-lg sm:text-xl">Select Your Class</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="border border-gray-200 p-4 rounded-lg hover:bg-emerald-50 hover:border-emerald-500 cursor-pointer transition-all duration-200"
                onClick={() => selectExistingTeacher(t)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">{t.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Class: {t.classTeaching}</p>
                  </div>
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">{currentTeacher.name}</h2>
                <p className="text-emerald-100 mt-1">Class: {currentTeacher.classTeaching}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || loading || students.length === 0}
                  className="flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50 shadow-md"
                >
                  {isGeneratingPDF ? "Generating..." : "Download PDF"}
                </button>
                <button
                  onClick={() => { setCurrentTeacher(null); setStudents([]); }}
                  className="flex items-center justify-center gap-2 bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-900 transition-colors"
                >
                  Change Teacher
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
            <h3 className="font-semibold mb-4 text-lg">Class Preview</h3>
            {loading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Cell</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, index) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{s.studentId}</td>
                        <td className="p-3 font-medium">{s.name}</td>
                        <td className="p-3">{s.cell}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsPDF;