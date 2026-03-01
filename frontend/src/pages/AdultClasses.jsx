import { useEffect, useState } from "react";
import { adultTeacherApi, adultStudentApi } from "../services/api";

function AdultClasses() {
  const [teachers, setTeachers] = useState([]);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [formTeacher, setFormTeacher] = useState({
    name: "",
    classTeaching: "",
  });
  const [isNewTeacher, setIsNewTeacher] = useState(true);

  const [students, setStudents] = useState([]);
  const [formStudent, setFormStudent] = useState({
    studentId: "",
    name: "",
    gender: "",
    dateJoined: "",
    location: "",
    cell: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState(""); // NEW: Search state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // NEW: PDF generation state

  useEffect(() => {
    loadTeachers();
    loadAllStudents();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await adultTeacherApi.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to load adult teachers:", error);
      alert("Failed to load adult teachers from server.");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      const data = await adultStudentApi.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Failed to load adult students:", error);
      setStudents([]);
    }
  };

  const loadStudentsForTeacher = async (teacherName, classTeaching) => {
    try {
      const data = await adultStudentApi.getStudentsByTeacherAndClass(teacherName, classTeaching);
      return data;
    } catch (error) {
      console.error("Failed to load students for teacher:", error);
      return [];
    }
  };

  // Function to count adult learners for each teacher
  const getStudentCountForTeacher = (teacherName) => {
    return students.filter((s) => s.ustadh === teacherName).length;
  };

  // Step 1: Add / Select Adult Ustaadh
  const handleAddTeacher = async () => {
    if (!formTeacher.name || !formTeacher.classTeaching) {
      alert("Please enter name and class");
      return;
    }

    // Check if teacher with same name AND class already exists
    const exactExists = teachers.find(
      (t) =>
        t.name.toLowerCase() === formTeacher.name.toLowerCase() &&
        t.classTeaching === formTeacher.classTeaching
    );

    if (exactExists) {
      // Existing teacher accessing their class
      setCurrentTeacher(exactExists);
      setIsNewTeacher(false);
      alert(`Welcome back ${formTeacher.name}! Accessing class ${formTeacher.classTeaching}.`);
      setFormTeacher({ name: "", classTeaching: "" });
      return;
    }

    if (isNewTeacher) {
      // New teacher registration - check if name already exists
      const nameExists = teachers.find(
        (t) => t.name.toLowerCase() === formTeacher.name.toLowerCase()
      );

      if (nameExists) {
        alert(`Adult Ustaadh "${formTeacher.name}" already exists! If this is you, please use the exact same name and class. Otherwise, use a different name.`);
        return;
      }

      // Register new teacher
      try {
        const newTeacher = await adultTeacherApi.createTeacher(formTeacher);
        setTeachers([...teachers, newTeacher]);
        setCurrentTeacher(newTeacher);
        setFormTeacher({ name: "", classTeaching: "" });
        alert("New Adult Ustaadh registered! Now you can add adult learners.");
      } catch (error) {
        alert(error.message || "Failed to register adult teacher");
      }
    } else {
      // Try to access existing teacher
      try {
        const teacher = await adultTeacherApi.accessTeacher(formTeacher.name, formTeacher.classTeaching);
        setCurrentTeacher(teacher);
        
        // Check if this teacher is already in our local list
        const alreadyInList = teachers.find(t => t.id === teacher.id);
        if (!alreadyInList) {
          setTeachers([...teachers, teacher]);
        }
        
        alert(`Welcome back ${teacher.name}! Accessing class ${teacher.classTeaching}.`);
        setFormTeacher({ name: "", classTeaching: "" });
      } catch (error) {
        alert(error.message || "Adult teacher not found. Please check your name and class.");
      }
    }
  };

  // Edit teacher function
  const handleEditTeacher = (teacher) => {
    setFormTeacher({
      name: teacher.name,
      classTeaching: teacher.classTeaching
    });
    setEditingTeacherId(teacher.id);
    setIsNewTeacher(true);
    
    // Scroll to the top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update teacher function
  const handleUpdateTeacher = async () => {
    if (!formTeacher.name || !formTeacher.classTeaching) {
      alert("Please enter name and class");
      return;
    }

    try {
      const updatedTeacher = await adultTeacherApi.updateTeacher(editingTeacherId, formTeacher);
      
      const updatedTeachers = teachers.map((t) =>
        t.id === editingTeacherId ? updatedTeacher : t
      );
      setTeachers(updatedTeachers);
      
      // Update students associated with this teacher
      const teacherToUpdate = teachers.find(t => t.id === editingTeacherId);
      if (teacherToUpdate) {
        const updatedStudents = students.map((s) =>
          s.ustadh === teacherToUpdate.name
            ? { ...s, ustadh: formTeacher.name, classTeaching: formTeacher.classTeaching }
            : s
        );
        
        // Update each student in backend
        for (const student of updatedStudents) {
          if (student.ustadh === formTeacher.name) {
            await adultStudentApi.updateStudent(student.id, student);
          }
        }
        
        setStudents(updatedStudents);
      }
      
      setFormTeacher({ name: "", classTeaching: "" });
      setEditingTeacherId(null);
      alert("Adult Ustaadh updated successfully!");
    } catch (error) {
      alert(error.message || "Failed to update adult teacher");
    }
  };

  // Delete teacher function with security check
  const handleDeleteTeacher = async (teacherId) => {
    const teacherToDelete = teachers.find(t => t.id === teacherId);
    if (!teacherToDelete) return;

    // Check if teacher has any learners
    const learnerCount = getStudentCountForTeacher(teacherToDelete.name);

    if (learnerCount > 0) {
      alert(
        `Cannot delete Adult Ustaadh "${teacherToDelete.name}".\n\n` +
        `This Ustaadh still has ${learnerCount} active learner${learnerCount === 1 ? '' : 's'}.\n\n` +
        "Please delete all learners first before deleting the Ustaadh."
      );
      return;
    }

    if (!window.confirm(
      `Delete Adult Ustaadh "${teacherToDelete.name}"?\n` +
      "This Ustaadh has no active learners.\n" +
      "This action cannot be undone."
    )) return;
    
    try {
      await adultTeacherApi.deleteTeacher(teacherId);
      const updatedTeachers = teachers.filter(t => t.id !== teacherId);
      setTeachers(updatedTeachers);
      
      // If current teacher is being deleted, clear current teacher
      if (currentTeacher && currentTeacher.id === teacherId) {
        setCurrentTeacher(null);
      }
      
      alert("Adult Ustaadh deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete adult teacher");
    }
  };

  // Step 2: Add / Update Adult Student - WITH DOUBLE-CLICK PROTECTION
  const handleSubmitStudent = async () => {
    // 🔒 PREVENT DOUBLE SUBMISSION
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate click");
      return;
    }

    if (
      !formStudent.studentId ||
      !formStudent.name ||
      !formStudent.gender ||
      !formStudent.dateJoined ||
      !formStudent.location ||
      !formStudent.cell
    ) {
      alert("Please fill all required fields");
      return;
    }

    // 🔒 LOCK THE BUTTON IMMEDIATELY
    setIsSubmitting(true);

    try {
      // Check if student with same ID number already exists
      const idExists = students.find(
        (s) => s.studentId === formStudent.studentId
      );

      if (idExists && !editingId) {
        alert(`Adult learner with ID number "${formStudent.studentId}" is already registered!`);
        setIsSubmitting(false); // 🔒 UNLOCK on error
        return;
      }

      // Check if student with same name AND ID already exists (case insensitive)
      const studentExists = students.find(
        (s) => 
          s.name.toLowerCase() === formStudent.name.toLowerCase() &&
          s.studentId === formStudent.studentId
      );

      if (studentExists && !editingId) {
        alert(`Adult learner "${formStudent.name}" with ID "${formStudent.studentId}" is already registered!`);
        setIsSubmitting(false); // 🔒 UNLOCK on error
        return;
      }

      const studentData = {
        ...formStudent,
        ustadh: currentTeacher.name,
        classTeaching: currentTeacher.classTeaching,
      };

      if (editingId) {
        const updatedStudent = await adultStudentApi.updateStudent(editingId, studentData);
        const updated = students.map((s) =>
          s.id === editingId ? updatedStudent : s
        );
        setStudents(updated);
        setEditingId(null);
        alert("Adult learner updated successfully!");
      } else {
        const newStudent = await adultStudentApi.createStudent(studentData);
        setStudents([...students, newStudent]);
        alert("Adult learner added successfully!");
      }

      setFormStudent({
        studentId: "",
        name: "",
        gender: "",
        dateJoined: "",
        location: "",
        cell: "",
      });
    } catch (error) {
      alert(error.message || "Failed to save adult student");
    } finally {
      // 🔒 ALWAYS UNLOCK when done (success or error)
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student) => {
    setFormStudent(student);
    setEditingId(student.id);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete this adult learner?")) return;
    
    try {
      await adultStudentApi.deleteStudent(id);
      const updatedStudents = students.filter((s) => s.id !== id);
      setStudents(updatedStudents);
      alert("Adult learner deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete adult student");
    }
  };

  const myStudents = currentTeacher
    ? students.filter(
        (s) =>
          s.ustadh === currentTeacher.name &&
          s.classTeaching === currentTeacher.classTeaching
      )
    : [];

  // NEW: Filter students by search
  const filteredStudents = myStudents.filter((s) =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.cell?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Sort alphabetically by name
  const sortedStudents = filteredStudents.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  // Calculate gender counts
  const maleCount = sortedStudents.filter(s => s.gender === 'Male').length;
  const femaleCount = sortedStudents.filter(s => s.gender === 'Female').length;

  // Generate PDF function - COMPACT DESIGN
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
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
      if (sortedStudents.length > ITEMS_FIRST_PAGE) {
        totalPages = 1 + Math.ceil((sortedStudents.length - ITEMS_FIRST_PAGE) / ITEMS_OTHER_PAGES);
      }

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
                  <h1 style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">BBIC Management — Adult Class Roster</h1>
                  <p style="margin: 2px 0 0 0; font-size: 10px; color: #000;">
                    Teacher: <strong>${currentTeacher.name}</strong> &nbsp;|&nbsp;
                    Class: <strong>${currentTeacher.classTeaching}</strong> &nbsp;|&nbsp;
                    Total: <strong>${sortedStudents.length}</strong> &nbsp;|&nbsp;
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

            <!-- Learners Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed;">
              <thead>
                <tr style="background: #000; color: #fff;">
                  <th style="width: 4%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">#</th>
                  <th style="width: 12%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">ID Number</th>
                  <th style="width: 28%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Learner Name</th>
                  <th style="width: 8%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">Gender</th>
                  <th style="width: 10%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Date Joined</th>
                  <th style="width: 18%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Location</th>
                  <th style="width: 20%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Cell Number</th>
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
                      <td style="padding: 3px; border: 1px solid #ccc;">${student.cell || '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            ${pageNum === totalPages - 1 ? `
              <p style="margin-top: 6px; font-size: 8px; color: #555; text-align: right;">
                End of roster — ${sortedStudents.length} learner(s) total
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
      
      const fileName = `${currentTeacher.name.replace(/\s+/g, '_')}_Adult_Class_${currentTeacher.classTeaching}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      alert('PDF generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Function to switch to existing teacher
  const selectExistingTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setIsNewTeacher(false);
    setEditingTeacherId(null);
    setFormTeacher({ name: "", classTeaching: "" });
  };

  return (
    <div className="pt-10 pb-10 px-4 md:px-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Adult Classes</h1>

      {/* Teacher registration/update form */}
      {(!currentTeacher || editingTeacherId) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Left side: Teacher Registration/Update */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-3 md:mb-4 text-lg">
              {editingTeacherId ? "Update Adult Ustaadh" : "New Adult Ustaadh Registration"}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:gap-4 mb-3 md:mb-4">
              <input
                placeholder="Adult Ustaadh Name *"
                value={formTeacher.name}
                onChange={(e) =>
                  setFormTeacher({ ...formTeacher, name: e.target.value })
                }
                className="border p-2 rounded text-sm md:text-base"
              />
              <input
                placeholder="Class Teaching *"
                value={formTeacher.classTeaching}
                onChange={(e) =>
                  setFormTeacher({
                    ...formTeacher,
                    classTeaching: e.target.value,
                  })
                }
                className="border p-2 rounded text-sm md:text-base"
              />
            </div>
            {!editingTeacherId && (
              <div className="flex items-center mb-3 md:mb-4">
                <input
                  type="checkbox"
                  id="newTeacher"
                  checked={isNewTeacher}
                  onChange={(e) => setIsNewTeacher(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="newTeacher" className="text-xs md:text-sm text-gray-600">
                  I am a new Adult Ustaadh (register me)
                </label>
              </div>
            )}
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              {editingTeacherId 
                ? "Update the Ustaadh details below"
                : isNewTeacher 
                  ? "Ustaadh names must be unique. If you already exist, uncheck the box above."
                  : "Access your existing class by entering exact name and class."
              }
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={editingTeacherId ? handleUpdateTeacher : handleAddTeacher}
                disabled={loading}
                className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 flex-1 disabled:opacity-50 text-sm md:text-base"
              >
                {loading ? "Processing..." : editingTeacherId ? "Update Ustaadh" : isNewTeacher ? "Register & Continue" : "Access My Class"}
              </button>
              {editingTeacherId && (
                <button
                  onClick={() => {
                    setEditingTeacherId(null);
                    setFormTeacher({ name: "", classTeaching: "" });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm md:text-base"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Right side: Existing Teachers List (only when not editing) */}
          {!editingTeacherId && (
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
              <h2 className="font-semibold mb-3 md:mb-4 text-lg">Access Existing Adult Ustaadh</h2>
              <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">Select your name to access your class:</p>
              <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
                    <p className="mt-2 text-gray-600 text-sm">Loading teachers...</p>
                  </div>
                ) : (
                  <>
                    {teachers.map((t) => {
                      const studentCount = getStudentCountForTeacher(t.name);
                      return (
                        <div 
                          key={t.id} 
                          className="border p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => selectExistingTeacher(t)}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                            <div className="flex-1">
                              <div className="font-medium text-sm md:text-base">{t.name}</div>
                              <div className="text-xs md:text-sm text-gray-600">Class: {t.classTeaching}</div>
                            </div>
                            <div className="text-xs md:text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {studentCount} learner{studentCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {teachers.length === 0 && !loading && (
                      <div className="text-center text-gray-500 py-4 text-sm">
                        No adult ustaadhs registered yet
                      </div>
                    )}
                  </>
                )}
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
                Click on your name above to quickly access your class
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Add Adult Learners */}
      {currentTeacher && !editingTeacherId && (
        <>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
              <div>
                <h2 className="font-semibold text-base md:text-lg">
                  {editingId ? "Update Adult Learner" : "Add Adult Learner"} – {currentTeacher.classTeaching}
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  {isNewTeacher ? "New ustaadh mode" : "Existing ustaadh mode"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="bg-emerald-100 text-emerald-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                  Adult Learners: {getStudentCountForTeacher(currentTeacher.name)}
                </div>
                {/* UPDATED: More visible Switch button */}
                <button
                  onClick={() => {
                    setCurrentTeacher(null);
                    setFormTeacher({ name: "", classTeaching: "" });
                    setStudentSearch(""); // Clear search when switching
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Switch Ustaadh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
              <input
                placeholder="ID Number *"
                value={formStudent.studentId}
                onChange={(e) =>
                  setFormStudent({
                    ...formStudent,
                    studentId: e.target.value,
                  })
                }
                className="border p-2 rounded text-sm md:text-base"
              />
              <input
                placeholder="Full Name *"
                value={formStudent.name}
                onChange={(e) =>
                  setFormStudent({ ...formStudent, name: e.target.value })
                }
                className="border p-2 rounded text-sm md:text-base"
              />
              <select
                value={formStudent.gender}
                onChange={(e) =>
                  setFormStudent({ ...formStudent, gender: e.target.value })
                }
                className="border p-2 rounded text-sm md:text-base"
              >
                <option value="">Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="date"
                value={formStudent.dateJoined}
                onChange={(e) =>
                  setFormStudent({
                    ...formStudent,
                    dateJoined: e.target.value,
                  })
                }
                className="border p-2 rounded text-sm md:text-base"
              />
              <input
                placeholder="Location *"
                value={formStudent.location}
                onChange={(e) =>
                  setFormStudent({ ...formStudent, location: e.target.value })
                }
                className="border p-2 rounded text-sm md:text-base"
              />
              <input
                placeholder="Cell Number *"
                value={formStudent.cell}
                onChange={(e) =>
                  setFormStudent({ ...formStudent, cell: e.target.value })
                }
                className="border p-2 rounded text-sm md:text-base"
              />
            </div>

            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              * ID numbers and adult learner names must be unique across all classes
            </p>

            <button
              onClick={handleSubmitStudent}
              disabled={isSubmitting}
              className="bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto"
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

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
              <h2 className="font-semibold text-base md:text-lg">
                {currentTeacher.name}'s Adult Learners
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="bg-purple-100 text-purple-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                  Total: {myStudents.length} learner{myStudents.length !== 1 ? 's' : ''}
                </div>
                {/* NEW: PDF Download Button */}
                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || loading || sortedStudents.length === 0}
                  className="flex items-center gap-2 bg-purple-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm font-medium"
                >
                  {isGeneratingPDF ? (
                    <>
                      <svg className="animate-spin h-3 w-3 md:h-4 md:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* NEW: Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 Search by name, ID, or cell number..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="border p-2.5 rounded w-full text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs md:text-sm min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Gender</th>
                    <th className="p-2">Joined</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Cell</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-2">{s.studentId}</td>
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.gender}</td>
                      <td className="p-2">{s.dateJoined}</td>
                      <td className="p-2">{s.location}</td>
                      <td className="p-2">{s.cell}</td>
                      <td className="p-2 space-x-1 md:space-x-2">
                        <button
                          onClick={() => handleEditStudent(s)}
                          className="text-blue-600 hover:text-blue-800 text-xs md:text-sm"
                          disabled={loading}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="text-red-600 hover:text-red-800 text-xs md:text-sm"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sortedStudents.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500 text-sm">
                        {studentSearch ? "No learners found matching your search" : "No adult learners yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {sortedStudents.map((s) => (
                <div key={s.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-600">ID: {s.studentId}</p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {s.gender}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Joined:</span> {s.dateJoined}</p>
                      <p><span className="font-medium">Location:</span> {s.location}</p>
                      <p><span className="font-medium">Cell:</span> {s.cell}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEditStudent(s)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                      disabled={loading}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {sortedStudents.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {studentSearch ? "No learners found matching your search" : "No adult learners yet"}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* All Registered Adult Ustaadhs Table - HIDDEN WHEN TEACHER IS LOGGED IN */}
      {!currentTeacher && !editingTeacherId && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mt-6 md:mt-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            <h2 className="font-semibold text-base md:text-lg">All Registered Adult Ustaadhs</h2>
            <div className="text-xs md:text-sm text-gray-500">
              Total: {teachers.length} Ustaadh{teachers.length !== 1 ? 's' : ''}
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              <p className="mt-2 text-gray-600 text-sm md:text-base">Loading adult ustaadhs...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs md:text-sm min-w-[600px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Class</th>
                      <th className="p-2">Adult Learners</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t) => {
                      const studentCount = getStudentCountForTeacher(t.name);
                      return (
                        <tr key={t.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{t.name}</td>
                          <td className="p-2">{t.classTeaching}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              studentCount === 0 
                                ? 'bg-gray-100 text-gray-600' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {studentCount} learner{studentCount !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="p-2 space-x-1 md:space-x-2">
                            <button
                              onClick={() => handleEditTeacher(t)}
                              className="text-blue-600 hover:text-blue-800 text-xs md:text-sm"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(t.id)}
                              className="text-red-600 hover:text-red-800 text-xs md:text-sm"
                              disabled={loading}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => selectExistingTeacher(t)}
                              className="text-emerald-600 hover:text-emerald-800 text-xs md:text-sm"
                              disabled={loading}
                            >
                              Access
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {teachers.length === 0 && !loading && (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">
                          No adult ustaadhs registered
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {teachers.map((t) => {
                  const studentCount = getStudentCountForTeacher(t.name);
                  return (
                    <div key={t.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{t.name}</p>
                            <p className="text-sm text-gray-600">Class: {t.classTeaching}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            studentCount === 0 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {studentCount} learner{studentCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                        <button
                          onClick={() => handleEditTeacher(t)}
                          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(t.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
                          disabled={loading}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => selectExistingTeacher(t)}
                          className="bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700 disabled:opacity-50 text-xs font-medium"
                          disabled={loading}
                        >
                          Access
                        </button>
                      </div>
                    </div>
                  );
                })}

                {teachers.length === 0 && !loading && (
                  <div className="p-8 text-center text-gray-500">
                    No adult ustaadhs registered
                  </div>
                )}
              </div>
            </>
          )}
          <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
            Note: Editing a Ustaadh will update their name/class for all associated learners.
          </p>
        </div>
      )}
    </div>
  );
}

export default AdultClasses;