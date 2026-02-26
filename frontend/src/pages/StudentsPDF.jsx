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
      const ITEMS_PER_PAGE = 15; 
      const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        const pdfContainer = document.createElement('div');
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.width = '297mm';
        pdfContainer.style.padding = '10mm';
        pdfContainer.style.backgroundColor = 'white';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        
        const startIdx = pageNum * ITEMS_PER_PAGE;
        const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, students.length);
        const pageStudents = students.slice(startIdx, endIdx);

        pdfContainer.innerHTML = `
          <div style="width: 100%; max-width: 277mm; margin: 0 auto;">
            
            ${pageNum === 0 ? `
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 20px; border-radius: 10px; color: white;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold;">BBIC Management</h1>
                  <p style="margin: 5px 0 0 0; font-size: 16px;">Class Roster - Page 1 of ${totalPages}</p>
                </div>
              </div>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">Teacher</p>
                    <h2 style="margin: 5px 0 0 0; font-size: 20px; color: #1f2937;">${currentTeacher.name}</h2>
                  </div>
                  <div style="text-align: right;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">Class(es)</p>
                    <h3 style="margin: 5px 0 0 0; font-size: 18px; color: #1f2937;">${currentTeacher.classTeaching}</h3>
                  </div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #d1d5db;">
                  <div style="display: flex; justify-content: space-between;">
                    <div><p style="margin: 0; color: #6b7280; font-size: 10px;">Total Students</p><p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #059669;">${students.length}</p></div>
                    <div style="text-align: center;"><p style="margin: 0; color: #6b7280; font-size: 10px;">Male Students</p><p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #3b82f6;">${maleCount}</p></div>
                    <div style="text-align: center;"><p style="margin: 0; color: #6b7280; font-size: 10px;">Female Students</p><p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #ec4899;">${femaleCount}</p></div>
                    <div><p style="margin: 0; color: #6b7280; font-size: 10px;">Generated</p><p style="margin: 5px 0 0 0; font-size: 12px; color: #1f2937;">${new Date().toLocaleDateString()}</p></div>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed;">
              <thead>
                ${pageNum === 0 ? `
                  <tr style="background: #059669; color: white;">
                    <th style="width: 3%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">#</th>
                    <th style="width: 10%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">ID Number</th>
                    <th style="width: 18%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">Name</th>
                    <th style="width: 6%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">Gender</th>
                    <th style="width: 8%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">Joined</th>
                    <th style="width: 15%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">Home</th>
                    <th style="width: 15%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">Madrassa</th>
                    <th style="width: 5%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">Shoe</th>
                    <th style="width: 20%; padding: 8px 4px; text-align: left; border: 1px solid #047857;">Cell</th>
                  </tr>
                ` : ''}
              </thead>
              <tbody>
                ${pageStudents.map((student, index) => {
                  const globalIndex = startIdx + index + 1;
                  return `
                    <tr style="background: ${globalIndex % 2 === 0 ? '#f9fafb' : 'white'};">
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb;">${globalIndex}</td>
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb;">${student.studentId || '-'}</td>
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb; font-weight: 500;">${student.name || '-'}</td>
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb;">${student.gender || '-'}</td>
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb;">${student.dateJoined || '-'}</td>
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb;">${student.location || '-'}</td>
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb;">${student.madrassaLocation || '-'}</td>
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb;">${student.shoeSize || '-'}</td>
                      <td style="padding: 6px 4px; border: 1px solid #e5e7eb;">${student.cell || '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
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