import { useEffect, useState } from "react";
import { teacherApi, studentApi, duplicateCheckApi, API_BASE_URL } from "../services/api";

function Students() {
  const [teachers, setTeachers] = useState([]);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [formTeacher, setFormTeacher] = useState({ name: "", classTeaching: "" });
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [isNewTeacher, setIsNewTeacher] = useState(true);
  const [students, setStudents] = useState([]);
  const [formStudent, setFormStudent] = useState({
    studentId: "",
    name: "",
    gender: "",
    dateJoined: "",
    location: "",
    madrassaLocation: "",
    shoeSize: "",
    cell: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState(""); // NEW: Search state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // PDF generation state
  // Transfer modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState(null);
  const [transferData, setTransferData] = useState({
    newUstadh: "",
    newClassTeaching: "",
    transferredBy: "",
    notes: "",
  });
  // Exclusion modal states
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [studentToExclude, setStudentToExclude] = useState(null);
  const [exclusionReason, setExclusionReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [exclusionType, setExclusionType] = useState("transfer");

  // Load teachers from backend
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const backendTeachers = await teacherApi.getAllTeachers();
        setTeachers(backendTeachers);
      } catch (error) {
        console.error("Failed to load teachers:", error);
        alert("Failed to load teachers from server. Please try again.");
      }
    };
    loadTeachers();
  }, []);

  // Load real student counts (still run in background but NOT displayed)
  useEffect(() => {
    const loadStudentCounts = async () => {
      if (teachers.length === 0) return;
      try {
        const updatedTeachers = await Promise.all(
          teachers.map(async (teacher) => {
            try {
              const count = await studentApi.countStudentsByTeacher(teacher.name);
              return { ...teacher, studentCount: count };
            } catch (err) {
              console.error(`Failed to load count for ${teacher.name}:`, err);
              return { ...teacher, studentCount: 0 };
            }
          })
        );
        setTeachers(updatedTeachers);
      } catch (error) {
        console.error("Failed to load teacher student counts:", error);
      }
    };
    loadStudentCounts();
  }, [teachers.length]);

  // Load students for current teacher (by name only - no class filter)
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

  // Add or select teacher - STRENGTHENED DUPLICATE CHECK + NUMBERS & & ONLY FOR CLASS
  const handleAddTeacher = async () => {
    if (!formTeacher.name || !formTeacher.classTeaching) {
      alert("Please fill both fields");
      return;
    }

    // Normalize input
    const rawName = formTeacher.name.trim();
    const inputName = rawName.toUpperCase();
    const normalizedInput = rawName.replace(/\s+/g, ' ').trim().toUpperCase();
    const inputClass = formTeacher.classTeaching.trim();

    // Validate class: only numbers and & allowed (e.g. 1&2&3)
    if (!/^[0-9&]+$/.test(inputClass)) {
      alert("Class Teaching must contain only numbers and & (e.g. 3, 1&2, 2&5). No letters, spaces, or other symbols allowed.");
      return;
    }

    // If editing existing teacher → SKIP similar-name check (allow class change)
    if (editingTeacherId) {
      try {
        const oldTeacher = teachers.find(t => t.id === editingTeacherId);
        const updatedTeacher = await teacherApi.updateTeacher(editingTeacherId, {
          name: inputName,
          classTeaching: inputClass
        });

        // Optional: move students' class label if needed (comment out if not wanted)
        // if (updatedTeacher.classTeaching !== oldTeacher.classTeaching) {
        //   const response = await fetch(
        //     `${API_BASE_URL}/students/update-class?ustadh=${encodeURIComponent(inputName)}&oldClassTeaching=${encodeURIComponent(oldTeacher.classTeaching)}&newClassTeaching=${encodeURIComponent(inputClass)}`,
        //     { method: 'PUT' }
        //   );
        //   if (!response.ok) {
        //     const err = await response.json();
        //     throw new Error(err.message || "Failed to move students to new class");
        //   }
        // }

        // Reload teachers list
        const refreshedTeachers = await teacherApi.getAllTeachers();
        setTeachers(refreshedTeachers);

        // Reload current teacher's students if affected
        if (currentTeacher && currentTeacher.id === editingTeacherId) {
          setCurrentTeacher(updatedTeacher);
          await loadStudentsForTeacher(inputName);
        }

        setEditingTeacherId(null);
        setFormTeacher({ name: "", classTeaching: "" });
        alert("Teacher updated successfully!");
      } catch (error) {
        console.error("Update error:", error);
        alert(error.message || "Failed to update teacher");
      }
      return;
    }

    // For NEW teacher or access → keep strong duplicate check
    const exactExists = teachers.find(
      (t) => {
        const tNameNormalized = t.name.trim().replace(/\s+/g, ' ').trim().toUpperCase();
        return tNameNormalized === normalizedInput && t.classTeaching.trim() === inputClass;
      }
    );

    if (exactExists) {
      setCurrentTeacher(exactExists);
      setIsNewTeacher(false);
      alert(`Welcome back ${exactExists.name}! Accessing class ${exactExists.classTeaching}.`);
      setFormTeacher({ name: "", classTeaching: "" });
      return;
    }

    const similarNameExists = teachers.find((t) => {
      const tNameNormalized = t.name.trim().replace(/\s+/g, ' ').trim().toUpperCase();
      return tNameNormalized === normalizedInput;
    });

    if (similarNameExists) {
      alert(
        `A teacher with very similar name "${similarNameExists.name}" already exists!\n\n` +
        `Please use the exact same name as before (${similarNameExists.name}) to avoid splitting your students.\n\n` +
        `If this is you, just select the existing entry above.`
      );
      return;
    }

    // New teacher registration
    if (isNewTeacher) {
      try {
        const newTeacher = await teacherApi.createTeacher({
          name: inputName,
          classTeaching: inputClass
        });
        const normalizedNew = { ...newTeacher, name: inputName };
        setTeachers([...teachers, normalizedNew]);
        setCurrentTeacher(normalizedNew);
        setFormTeacher({ name: "", classTeaching: "" });
        alert("New teacher registered! Now you can add your students.");
      } catch (error) {
        alert(error.message || "Failed to register teacher");
      }
    } else {
      try {
        const teacher = await teacherApi.accessTeacher(inputName, inputClass);
        const normalizedTeacher = { ...teacher, name: inputName };
        setCurrentTeacher(normalizedTeacher);
        const alreadyInList = teachers.find(t => t.id === teacher.id);
        if (!alreadyInList) {
          setTeachers([...teachers, normalizedTeacher]);
        }
        alert(`Welcome back ${normalizedTeacher.name}! Accessing class ${normalizedTeacher.classTeaching}.`);
        setFormTeacher({ name: "", classTeaching: "" });
      } catch (error) {
        alert(error.message || "Teacher not found. Please check your name and class.");
      }
    }
  };

  // Add/update student (unchanged)
  const handleSubmitStudent = async () => {
    if (
      !formStudent.studentId ||
      !formStudent.name ||
      !formStudent.gender ||
      !formStudent.dateJoined ||
      !formStudent.location ||
      !formStudent.madrassaLocation ||
      !formStudent.cell
    ) {
      alert("Please fill all required fields");
      return;
    }
    if (!editingId) {
      try {
        const duplicateCheck = await duplicateCheckApi.checkStudentId(formStudent.studentId);
        if (duplicateCheck.existsInStudents) {
          alert(
            `Cannot register: Student ID "${formStudent.studentId}" is already used in an ACTIVE student!\n` +
            `IDs must be unique forever across the entire system. Choose a completely new ID.`
          );
          return;
        }
        if (duplicateCheck.existsInExcluded) {
          alert(
            `Cannot register: Student ID "${formStudent.studentId}" is in the EXCLUDED list!\n` +
            `Excluded IDs are permanently blocked and cannot be reused.\n` +
            `Use a completely new ID.`
          );
          return;
        }
      } catch (error) {
        console.error("Error checking ID uniqueness:", error);
        alert("Failed to verify ID uniqueness. Cannot register right now.");
        return;
      }
    }
    const studentData = {
      ...formStudent,
      ustadh: currentTeacher.name,
      classTeaching: currentTeacher.classTeaching,
    };
    try {
      if (editingId) {
        const updatedStudent = await studentApi.updateStudent(editingId, studentData);
        const updated = students.map((s) =>
          s.id === editingId ? updatedStudent : s
        );
        setStudents(updated);
        setEditingId(null);
        alert("Student updated successfully!");
      } else {
        const response = await fetch(`${API_BASE_URL}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData),
        });
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {}
          const errorMessage = errorData?.message || 'Failed to create student';
          if (errorMessage.includes('already exists') || errorMessage.includes('Unique index') || errorMessage.includes('constraint') || errorMessage.includes('excluded')) {
            alert(
              `Cannot add student: ID "${formStudent.studentId}" is already used or was previously excluded!\n` +
              `IDs must be unique forever. Choose a completely new ID.`
            );
          } else {
            alert(errorMessage);
          }
          return;
        }
        const newStudent = await response.json();
        setStudents([...students, newStudent]);
        alert("Student added successfully!");
      }
      setFormStudent({
        studentId: "",
        name: "",
        gender: "",
        dateJoined: "",
        location: "",
        madrassaLocation: "",
        shoeSize: "",
        cell: "",
      });
    } catch (error) {
      alert("Network error: Could not connect to server.");
      console.error("Network error:", error);
    }
  };

  const handleEditStudent = (student) => {
    setFormStudent(student);
    setEditingId(student.id);
  };

  const handleTransferClick = (student) => {
    setStudentToTransfer(student);
    setTransferData({
      newUstadh: "",
      newClassTeaching: "",
      transferredBy: currentTeacher?.name || "",
      notes: `Transferred from ${student.ustadh} - ${student.classTeaching}`,
    });
    setShowTransferModal(true);
  };

  useEffect(() => {
    if (transferData.newUstadh) {
      const selectedTeacher = teachers.find(t => t.name === transferData.newUstadh);
      if (selectedTeacher) {
        setTransferData(prev => ({
          ...prev,
          newClassTeaching: selectedTeacher.classTeaching,
        }));
      }
    }
  }, [transferData.newUstadh, teachers]);

  const handleConfirmTransfer = async () => {
    if (!transferData.newUstadh) {
      alert("Please select new teacher");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/students/transfer/${studentToTransfer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUstadh: transferData.newUstadh,
          newClassTeaching: transferData.newClassTeaching,
          transferredBy: transferData.transferredBy,
          notes: transferData.notes
        }),
      });
      if (!response.ok) {
        let errorMessage = "Failed to transfer student";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
      const updatedStudents = students.filter((s) => s.id !== studentToTransfer.id);
      setStudents(updatedStudents);
      await loadStudentsForTeacher(currentTeacher.name);
      setShowTransferModal(false);
      setStudentToTransfer(null);
      setTransferData({
        newUstadh: "",
        newClassTeaching: "",
        transferredBy: "",
        notes: "",
      });
      alert(`Student transferred successfully to ${transferData.newUstadh} - ${transferData.newClassTeaching}`);
    } catch (error) {
      console.error("Transfer error:", error);
      alert(`Transfer failed: ${error.message}`);
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToExclude(student);
    setShowExcludeModal(true);
  };

  const handleConfirmExclusion = async () => {
    if (!exclusionReason.trim()) {
      alert("Please provide a reason for exclusion");
      return;
    }
    try {
      await studentApi.excludeStudent(
        studentToExclude.id,
        currentTeacher?.name || "Unknown",
        exclusionReason,
        exclusionType,
        additionalNotes
      );
      const updatedStudents = students.filter((s) => s.id !== studentToExclude.id);
      setStudents(updatedStudents);
      setShowExcludeModal(false);
      setStudentToExclude(null);
      setExclusionReason("");
      setAdditionalNotes("");
      setExclusionType("transfer");
      alert(`Student excluded successfully. Reason: ${exclusionReason}`);
    } catch (error) {
      alert(error.message || "Failed to exclude student");
    }
  };

  const handleEditTeacher = (teacher) => {
    setFormTeacher({ name: teacher.name, classTeaching: teacher.classTeaching });
    setEditingTeacherId(teacher.id);
    setIsNewTeacher(false);
  };

  const handleDeleteTeacher = async (id) => {
    const teacherToDelete = teachers.find(t => t.id === id);
    if (!teacherToDelete) return;
    try {
      const studentCount = await studentApi.countStudentsByTeacher(teacherToDelete.name);
      if (studentCount > 0) {
        alert(
          `Cannot delete teacher "${teacherToDelete.name}".\n\n` +
          `This teacher still has ${studentCount} active student${studentCount === 1 ? '' : 's'}.\n\n` +
          "Please transfer or exclude all students first."
        );
        return;
      }
      if (!window.confirm(
        `Delete teacher "${teacherToDelete.name}"?\n` +
        "This teacher has no active students.\n" +
        "This action cannot be undone."
      )) return;
      await teacherApi.deleteTeacher(id);
      const updatedTeachers = teachers.filter(t => t.id !== id);
      setTeachers(updatedTeachers);
      if (currentTeacher?.id === id) setCurrentTeacher(null);
      alert("Teacher deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete teacher");
    }
  };

  const myStudents = currentTeacher
    ? students.filter((s) => s.ustadh === currentTeacher.name)
    : [];

  // NEW: Filter students by search
  const filteredStudents = myStudents.filter((s) =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.cell?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Sort alphabetically by name (for PDF)
  const sortedStudents = [...filteredStudents].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  // Calculate gender counts (for PDF)
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
                  <h1 style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">BBIC Management — Class Roster</h1>
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

            <!-- Students Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed;">
              <thead>
                <tr style="background: #000; color: #fff;">
                  <th style="width: 4%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">#</th>
                  <th style="width: 10%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">ID Number</th>
                  <th style="width: 22%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Student Name</th>
                  <th style="width: 7%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">Gender</th>
                  <th style="width: 9%;  padding: 4px 3px; text-align: left;   border: 1px solid #000;">Date Joined</th>
                  <th style="width: 14%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Home Location</th>
                  <th style="width: 14%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Madrassa</th>
                  <th style="width: 6%;  padding: 4px 3px; text-align: center; border: 1px solid #000;">Shoe</th>
                  <th style="width: 14%; padding: 4px 3px; text-align: left;   border: 1px solid #000;">Cell Number</th>
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
                End of roster — ${sortedStudents.length} student(s) total
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
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const selectExistingTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setIsNewTeacher(false);
  };

  return (
    <div className="pt-10 md:pt-0 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Students Management</h1>

      {/* Teacher Selection / Registration */}
      {!currentTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4 text-lg sm:text-xl">
              {editingTeacherId ? "Update Teacher" : "New Teacher Registration"}
            </h2>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <input
                  placeholder="Teacher Name *"
                  value={formTeacher.name}
                  onChange={(e) => setFormTeacher({ ...formTeacher, name: e.target.value })}
                  className={`border p-2.5 rounded w-full text-sm sm:text-base ${editingTeacherId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={editingTeacherId !== null}
                />
                {editingTeacherId && (
                  <p className="text-xs text-amber-600 mt-1">
                    Teacher name cannot be changed after registration
                  </p>
                )}
              </div>
              <div>
                <input
                  placeholder="Class(es) (numbers & only) * e.g. 1&2"
                  value={formTeacher.classTeaching}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9&]+$/.test(value)) { // only digits and &
                      setFormTeacher({ ...formTeacher, classTeaching: value });
                    } else {
                      alert("Class must contain only numbers and & (e.g. 3, 1&2, 2&5). No letters, spaces, or other symbols.");
                    }
                  }}
                  className="border p-2.5 rounded w-full text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use numbers and & for multiple classes (e.g. 1&2&3)
                </p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="newTeacher"
                checked={isNewTeacher}
                onChange={(e) => setIsNewTeacher(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="newTeacher" className="text-sm sm:text-base text-gray-600">
                I am a new teacher (register me)
              </label>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              {isNewTeacher
                ? "Teacher names must be unique and permanent."
                : "Access your existing class by entering exact name and class."
              }
            </p>
            <button
              onClick={handleAddTeacher}
              className="bg-emerald-700 text-white px-4 py-2.5 rounded hover:bg-emerald-800 w-full text-sm sm:text-base"
            >
              {isNewTeacher ? "Register & Continue" : "Access My Class"}
            </button>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4 text-lg sm:text-xl">Access Existing Teacher</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">Select your name to access your class:</p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {teachers.map((t) => (
                <div
                  key={t.id}
                  className="border p-3 rounded-lg hover:bg-gray-50 cursor-pointer text-sm sm:text-base"
                  onClick={() => selectExistingTeacher(t)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-gray-600">Class(es): {t.classTeaching}</div>
                    </div>
                  </div>
                </div>
              ))}
              {teachers.length === 0 && (
                <div className="text-center text-gray-500 py-4 text-sm sm:text-base">
                  No teachers registered yet
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-4">
              Click on your name above to quickly access your class
            </p>
          </div>
        </div>
      )}

      {/* Student Management Section */}
      {currentTeacher && (
        <div className="mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div>
                <h2 className="font-semibold text-lg sm:text-xl">
                  {editingId ? "Update Student" : "Add Student"} for {currentTeacher.name} - {currentTeacher.classTeaching}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {isNewTeacher ? "New teacher mode" : "Existing teacher mode"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                  {loading ? "Loading..." : `Students: ${myStudents.length}`}
                </div>
                {/* UPDATED: More visible Switch Teacher button */}
                <button
                  onClick={() => {
                    setCurrentTeacher(null);
                    setFormTeacher({ name: "", classTeaching: "" });
                    setStudents([]);
                    setStudentSearch(""); // Clear search when switching
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Switch Teacher
                </button>
              </div>
            </div>

            {/* Student Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input
                placeholder="ID Number *"
                value={formStudent.studentId}
                onChange={(e) => setFormStudent({ ...formStudent, studentId: e.target.value })}
                className="border p-2.5 rounded w-full text-sm sm:text-base"
              />
              <input
                placeholder="Name & Surname *"
                value={formStudent.name}
                onChange={(e) => setFormStudent({ ...formStudent, name: e.target.value })}
                className="border p-2.5 rounded w-full text-sm sm:text-base"
              />
              <select
                value={formStudent.gender}
                onChange={(e) => setFormStudent({ ...formStudent, gender: e.target.value })}
                className="border p-2.5 rounded w-full text-sm sm:text-base"
              >
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="date"
                value={formStudent.dateJoined}
                onChange={(e) => setFormStudent({ ...formStudent, dateJoined: e.target.value })}
                className="border p-2.5 rounded w-full text-sm sm:text-base"
              />
              <input
                placeholder="Home Location *"
                value={formStudent.location}
                onChange={(e) => setFormStudent({ ...formStudent, location: e.target.value })}
                className="border p-2.5 rounded w-full text-sm sm:text-base"
              />
              <input
                placeholder="Madrassa Location *"
                value={formStudent.madrassaLocation}
                onChange={(e) => setFormStudent({ ...formStudent, madrassaLocation: e.target.value })}
                className="border p-2.5 rounded w-full text-sm sm:text-base"
              />
              <input
                placeholder="Child Shoe Size"
                value={formStudent.shoeSize}
                onChange={(e) => setFormStudent({ ...formStudent, shoeSize: e.target.value })}
                className="border p-2.5 rounded w-full text-sm sm:text-base"
              />
              <input
                placeholder="Cell Number *"
                value={formStudent.cell}
                onChange={(e) => setFormStudent({ ...formStudent, cell: e.target.value })}
                className="border p-2.5 rounded w-full text-sm sm:text-base"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              * ID numbers must be **globally unique forever** — cannot be reused even after exclusion.
            </p>
            <button
              onClick={handleSubmitStudent}
              className="bg-emerald-700 text-white px-4 py-2.5 rounded hover:bg-emerald-800 w-full sm:w-auto text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? "Processing..." : editingId ? "Update" : "Add Student"}
            </button>
          </div>

          {/* Current Teacher Students Table */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="font-semibold text-lg sm:text-xl">{currentTeacher.name}'s Students</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                  {loading ? "Loading..." : `Total: ${myStudents.length} students`}
                </div>
                {/* PDF Download Button */}
                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || loading || sortedStudents.length === 0}
                  className="flex items-center gap-2 bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                >
                  {isGeneratingPDF ? (
                    <>
                      <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="border p-2.5 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                <p className="mt-2 text-gray-600">Loading students...</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium">ID</th>
                        <th className="px-3 py-3 text-left text-xs font-medium">Name</th>
                        <th className="px-3 py-3 text-left text-xs font-medium">Gender</th>
                        <th className="px-3 py-3 text-left text-xs font-medium">Date Joined</th>
                        <th className="px-3 py-3 text-left text-xs font-medium">Home Loc</th>
                        <th className="px-3 py-3 text-left text-xs font-medium">Madrassa</th>
                        <th className="px-3 py-3 text-left text-xs font-medium">Shoe Size</th>
                        <th className="px-3 py-3 text-left text-xs font-medium">Cell</th>
                        <th className="px-3 py-3 text-left text-xs font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{s.studentId}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{s.name}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{s.gender}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{s.dateJoined}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{s.location}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{s.madrassaLocation}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{s.shoeSize || "-"}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">{s.cell}</td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm space-x-2">
                            <button onClick={() => handleEditStudent(s)} className="text-blue-600 hover:text-blue-800" disabled={loading}>
                              Update
                            </button>
                            <button onClick={() => handleTransferClick(s)} className="text-green-600 hover:text-green-800" disabled={loading}>
                              Transfer
                            </button>
                            <button onClick={() => handleDeleteClick(s)} className="text-red-600 hover:text-red-800" disabled={loading}>
                              Exclude
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && !loading && (
                        <tr>
                          <td colSpan="9" className="px-3 py-4 text-center text-gray-500 text-sm">
                            {studentSearch ? "No students found matching your search" : "No students added yet"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredStudents.map((s) => (
                    <div key={s.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{s.name}</p>
                            <p className="text-sm text-gray-600">ID: {s.studentId}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {s.gender}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Joined:</span> {s.dateJoined}</p>
                          <p><span className="font-medium">Home:</span> {s.location}</p>
                          <p><span className="font-medium">Madrassa:</span> {s.madrassaLocation}</p>
                          <p><span className="font-medium">Shoe Size:</span> {s.shoeSize || "-"}</p>
                          <p><span className="font-medium">Cell:</span> {s.cell}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                        <button
                          onClick={() => handleEditStudent(s)}
                          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                          disabled={loading}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleTransferClick(s)}
                          className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-xs font-medium"
                          disabled={loading}
                        >
                          Transfer
                        </button>
                        <button
                          onClick={() => handleDeleteClick(s)}
                          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
                          disabled={loading}
                        >
                          Exclude
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">
                      {studentSearch ? "No students found matching your search" : "No students added yet"}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* All Registered Teachers Table - HIDDEN WHEN TEACHER IS LOGGED IN */}
      {!currentTeacher && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4 text-lg sm:text-xl">All Registered Teachers</h2>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium">Teacher Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium">Class(es)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{t.name}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{t.classTeaching}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm space-x-3">
                      <button onClick={() => handleEditTeacher(t)} className="text-blue-600 hover:text-blue-800">
                        Update
                      </button>
                      <button onClick={() => handleDeleteTeacher(t.id)} className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-3 py-4 text-center text-gray-500 text-sm">
                      No teachers registered yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {teachers.map((t) => (
              <div key={t.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{t.name}</p>
                      <p className="text-sm text-gray-600">Class(es): {t.classTeaching}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleEditTeacher(t)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(t.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {teachers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No teachers registered yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && studentToTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]">
            <div className="p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Transfer Student</h3>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-700 text-sm sm:text-base">Student to transfer:</div>
                <div className="text-sm sm:text-base">{studentToTransfer.name} (ID: {studentToTransfer.studentId})</div>
                <div className="text-sm sm:text-base">Current: {studentToTransfer.ustadh} - {studentToTransfer.classTeaching}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Transfer to Teacher *</label>
                <select
                  value={transferData.newUstadh}
                  onChange={(e) => setTransferData({...transferData, newUstadh: e.target.value})}
                  className="w-full border p-2.5 rounded text-sm sm:text-base"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>{t.name} - {t.classTeaching}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Transferred By *</label>
                <input
                  type="text"
                  value={transferData.transferredBy}
                  onChange={(e) => setTransferData({...transferData, transferredBy: e.target.value})}
                  placeholder="Your name"
                  className="w-full border p-2.5 rounded text-sm sm:text-base"
                  defaultValue={currentTeacher?.name || ""}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={transferData.notes}
                  onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                  placeholder="Any additional information..."
                  className="w-full border p-2.5 rounded h-24 text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setStudentToTransfer(null);
                    setTransferData({ newUstadh: "", newClassTeaching: "", transferredBy: "", notes: "" });
                  }}
                  className="px-4 py-2.5 border rounded hover:bg-gray-100 text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  className="px-4 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 order-1 sm:order-2 text-sm sm:text-base"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exclusion Modal */}
      {showExcludeModal && studentToExclude && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]">
            <div className="p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Exclude Student</h3>
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <div className="font-medium text-red-700 text-sm sm:text-base">Student to exclude:</div>
                <div className="text-sm sm:text-base">{studentToExclude.name} (ID: {studentToExclude.studentId})</div>
                <div className="text-sm sm:text-base">Class: {studentToExclude.classTeaching} - Ustaadh: {studentToExclude.ustadh}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Exclusion Type *</label>
                <select
                  value={exclusionType}
                  onChange={(e) => setExclusionType(e.target.value)}
                  className="w-full border p-2.5 rounded text-sm sm:text-base"
                >
                  <option value="transfer">Transferred to another school</option>
                  <option value="dropped_out">Dropped out</option>
                  <option value="completed">Completed studies</option>
                  <option value="behavior">Behavioral issues</option>
                  <option value="attendance">Poor attendance</option>
                  <option value="family">Family reasons</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason for Exclusion *</label>
                <textarea
                  value={exclusionReason}
                  onChange={(e) => setExclusionReason(e.target.value)}
                  placeholder="Provide detailed reason for exclusion..."
                  className="w-full border p-2.5 rounded h-24 text-sm sm:text-base"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional information..."
                  className="w-full border p-2.5 rounded h-20 text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowExcludeModal(false);
                    setStudentToExclude(null);
                    setExclusionReason("");
                    setAdditionalNotes("");
                  }}
                  className="px-4 py-2.5 border rounded hover:bg-gray-100 text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmExclusion}
                  className="px-4 py-2.5 bg-red-600 text-white rounded hover:bg-red-700 order-1 sm:order-2 text-sm sm:text-base"
                >
                  Confirm Exclusion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;