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
      setStudents(teacherStudents);
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

  // Generate PDF function with Pagination Fix
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Create a hidden container for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '297mm'; // Match A4 Landscape width
      pdfContainer.style.padding = '20px';
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Build the PDF content
      pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 10px; color: white;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">BBIC Management</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Class Roster</p>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Teacher</p>
              <h2 style="margin: 5px 0 0 0; font-size: 24px; color: #1f2937;">${currentTeacher.name}</h2>
            </div>
            <div style="flex: 1; text-align: right;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Class(es)</p>
              <h3 style="margin: 5px 0 0 0; font-size: 20px; color: #1f2937;">${currentTeacher.classTeaching}</h3>
            </div>
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #d1d5db;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">Total Students</p>
                <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #059669;">${students.length}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">Generated</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #1f2937;">${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #059669; color: white;">
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">#</th>
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">ID Number</th>
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">Name</th>
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">Gender</th>
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">Joined</th>
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">Home</th>
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">Madrassa</th>
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">Shoe</th>
              <th style="padding: 12px 8px; text-align: left; border: 1px solid #047857;">Cell</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, index) => `
              <tr style="background: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb;">${index + 1}</td>
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb;">${student.studentId}</td>
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb; font-weight: 500;">${student.name}</td>
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb;">${student.gender}</td>
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb;">${student.dateJoined}</td>
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb;">${student.location}</td>
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb;">${student.madrassaLocation}</td>
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb;">${student.shoeSize || '-'}</td>
                <td style="padding: 10px 8px; border: 1px solid #e5e7eb;">${student.cell}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">This document is confidential and for authorized use only</p>
          <p style="margin: 5px 0 0 0;">Generated by BBIC Management System • ${new Date().toLocaleString()}</p>
        </div>
      `;
      
      document.body.appendChild(pdfContainer);
      
      // Use windowHeight/Width to ensure html2canvas captures the full hidden element
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight
      });
      
      document.body.removeChild(pdfContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = 297; 
      const pageHeight = 210;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content exceeds one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `${currentTeacher.name.replace(/\s+/g, '_')}_Class_Roster_${new Date().toISOString().split('T')[0]}.pdf`;
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
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Download Class Roster (PDF)</h1>

      {!currentTeacher ? (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4 text-lg sm:text-xl">Select Your Class</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">Choose a teacher to generate their class roster PDF:</p>
          
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
          {teachers.length === 0 && <div className="text-center text-gray-500 py-8">No teachers registered yet</div>}
        </div>
      ) : (
        <div>
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">{currentTeacher.name}</h2>
                <p className="text-emerald-100 mt-1">Class: {currentTeacher.classTeaching}</p>
                <p className="text-emerald-100 text-sm mt-2">
                  {loading ? "Loading..." : `${students.length} student${students.length !== 1 ? 's' : ''} enrolled`}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || loading || students.length === 0}
                  className="flex items-center justify-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isGeneratingPDF ? "Generating..." : "Download PDF"}
                </button>
                <button
                  onClick={() => { setCurrentTeacher(null); setStudents([]); }}
                  className="bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-900 transition-colors"
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
                      <th className="p-3 text-left">Gender</th>
                      <th className="p-3 text-left">Joined</th>
                      <th className="p-3 text-left">Home</th>
                      <th className="p-3 text-left">Madrassa</th>
                      <th className="p-3 text-left">Shoe</th>
                      <th className="p-3 text-left">Cell</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, index) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{s.studentId}</td>
                        <td className="p-3 font-medium">{s.name}</td>
                        <td className="p-3">{s.gender}</td>
                        <td className="p-3">{s.dateJoined}</td>
                        <td className="p-3">{s.location}</td>
                        <td className="p-3">{s.madrassaLocation}</td>
                        <td className="p-3">{s.shoeSize || '-'}</td>
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