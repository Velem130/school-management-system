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
  const [teacherCountsLoading, setTeacherCountsLoading] = useState(false);

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

  // Load real student counts for all teachers
  useEffect(() => {
    const loadStudentCounts = async () => {
      if (teachers.length === 0) return;
      
      setTeacherCountsLoading(true);
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
      } finally {
        setTeacherCountsLoading(false);
      }
    };

    loadStudentCounts();
  }, [teachers.length]);

  // Load students for current teacher
  useEffect(() => {
    if (currentTeacher) {
      loadStudentsForTeacher(currentTeacher.name, currentTeacher.classTeaching);
    }
  }, [currentTeacher]);

  const loadStudentsForTeacher = async (teacherName, classTeaching) => {
    setLoading(true);
    try {
      const teacherStudents = await studentApi.getStudentsByTeacherAndClass(teacherName, classTeaching);
      setStudents(teacherStudents);
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Add or select teacher
  const handleAddTeacher = async () => {
    if (!formTeacher.name || !formTeacher.classTeaching) {
      alert("Please fill both fields");
      return;
    }

    if (editingTeacherId) {
      try {
        const oldTeacher = teachers.find(t => t.id === editingTeacherId);
        const updatedTeacher = await teacherApi.updateTeacher(editingTeacherId, formTeacher);

        // If classTeaching changed → update all students' classTeaching
        if (updatedTeacher.classTeaching !== oldTeacher.classTeaching) {
          await fetch(`${API_BASE_URL}/students/update-class?ustadh=${encodeURIComponent(updatedTeacher.name)}&oldClassTeaching=${encodeURIComponent(oldTeacher.classTeaching)}&newClassTeaching=${encodeURIComponent(updatedTeacher.classTeaching)}`, {
            method: 'PUT',
          });
        }

        const updatedTeachers = teachers.map((t) =>
          t.id === editingTeacherId ? updatedTeacher : t
        );
        setTeachers(updatedTeachers);
        setCurrentTeacher(updatedTeacher);
        setEditingTeacherId(null);
        setFormTeacher({ name: "", classTeaching: "" });
        alert("Teacher updated successfully!");
      } catch (error) {
        alert(error.message || "Failed to update teacher");
      }
      return;
    }

    const exactExists = teachers.find(
      (t) =>
        t.name.toLowerCase() === formTeacher.name.toLowerCase() &&
        t.classTeaching === formTeacher.classTeaching
    );
    if (exactExists) {
      setCurrentTeacher(exactExists);
      setIsNewTeacher(false);
      alert(`Welcome back ${formTeacher.name}! Accessing class ${formTeacher.classTeaching}.`);
      setFormTeacher({ name: "", classTeaching: "" });
      return;
    }

    if (isNewTeacher) {
      const nameExists = teachers.find(
        (t) => t.name.toLowerCase() === formTeacher.name.toLowerCase()
      );
      if (nameExists) {
        alert(`Teacher "${formTeacher.name}" already exists! If this is you, please use the exact same name and class. Otherwise, use a different name.`);
        return;
      }
      try {
        const newTeacher = await teacherApi.createTeacher(formTeacher);
        setTeachers([...teachers, newTeacher]);
        setCurrentTeacher(newTeacher);
        setFormTeacher({ name: "", classTeaching: "" });
        alert("New teacher registered! Now you can add your students.");
      } catch (error) {
        alert(error.message || "Failed to register teacher");
      }
    } else {
      try {
        const teacher = await teacherApi.accessTeacher(formTeacher.name, formTeacher.classTeaching);
        setCurrentTeacher(teacher);
        const alreadyInList = teachers.find(t => t.id === teacher.id);
        if (!alreadyInList) {
          setTeachers([...teachers, teacher]);
        }
        alert(`Welcome back ${teacher.name}! Accessing class ${teacher.classTeaching}.`);
        setFormTeacher({ name: "", classTeaching: "" });
      } catch (error) {
        alert(error.message || "Teacher not found. Please check your name and class.");
      }
    }
  };

  // Add/update student - STRICT GLOBAL ID CHECK
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

    // Strict check BEFORE creating/updating (only for NEW students)
    if (!editingId) {
      try {
        const duplicateCheck = await duplicateCheckApi.checkStudentId(formStudent.studentId);

        // Check active students
        if (duplicateCheck.existsInStudents) {
          alert(
            `Cannot register: Student ID "${formStudent.studentId}" is already used in an ACTIVE student!\n` +
            `IDs must be unique forever across the entire system. Choose a completely new ID.`
          );
          return;
        }

        // Check excluded students - permanent block
        if (duplicateCheck.existsInExcluded) {
          alert(
            `Cannot register: Student ID "${formStudent.studentId}" is in the EXCLUDED list!\n` +
            `Excluded IDs are permanently blocked and cannot be reused (even after exclusion).\n` +
            `Use a completely new ID.`
          );
          return;
        }

      } catch (error) {
        console.error("Error checking ID uniqueness across system:", error);
        alert("Failed to verify if this ID is unique. Cannot register right now.");
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
        // FIXED: Using API_BASE_URL instead of localhost
        const response = await fetch(`${API_BASE_URL}/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (jsonErr) {
            // no JSON
          }
          const errorMessage = errorData?.message || 'Failed to create student';

          if (
            errorMessage.includes('already exists') ||
            errorMessage.includes('Unique index') ||
            errorMessage.includes('constraint') ||
            errorMessage.includes('excluded')
          ) {
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
      alert("Network error: Could not connect to server. Please check if backend is running.");
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

  // Auto-set newClassTeaching when teacher changes
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

  // FIXED TRANSFER FUNCTION - uses full backend URL to bypass Vite proxy
  const handleConfirmTransfer = async () => {
    if (!transferData.newUstadh) {
      alert("Please select new teacher");
      return;
    }

    try {
      // Using API_BASE_URL
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
        } catch (e) {
          // ignore if no JSON
        }
        throw new Error(errorMessage);
      }

      // Instant UI update
      const updatedStudents = students.filter((s) => s.id !== studentToTransfer.id);
      setStudents(updatedStudents);

      // Reload fresh data from backend (prevents ghost students on refresh)
      await loadStudentsForTeacher(currentTeacher.name, currentTeacher.classTeaching);

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
          "Please transfer or exclude all students first before deleting the teacher."
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
    ? students.filter((s) => s.ustadh === currentTeacher.name && s.classTeaching === currentTeacher.classTeaching)
    : [];

  const selectExistingTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setIsNewTeacher(false);
  };

  return (
    <div className="pt-10 md:pt-0">
      <h1 className="text-2xl font-bold mb-6">Students Management</h1>

      {/* Teacher Selection / Registration */}
      {!currentTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">
              {editingTeacherId ? "Update Teacher" : "New Teacher Registration"}
            </h2>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <input
                  placeholder="Teacher Name *"
                  value={formTeacher.name}
                  onChange={(e) => setFormTeacher({ ...formTeacher, name: e.target.value })}
                  className={`border p-2 rounded w-full ${editingTeacherId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={editingTeacherId !== null}
                />
                {editingTeacherId && (
                  <p className="text-xs text-amber-600 mt-1">
                    Teacher name cannot be changed after registration (to avoid data mismatch)
                  </p>
                )}
              </div>
              <input
                placeholder="Class Teaching *"
                value={formTeacher.classTeaching}
                onChange={(e) => setFormTeacher({ ...formTeacher, classTeaching: e.target.value })}
                className="border p-2 rounded"
              />
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="newTeacher"
                checked={isNewTeacher}
                onChange={(e) => setIsNewTeacher(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="newTeacher" className="text-sm text-gray-600">
                I am a new teacher (register me)
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {isNewTeacher
                ? "Teacher names must be unique and permanent. If you already exist, uncheck the box."
                : "Access your existing class by entering exact name and class."
              }
            </p>
            <button
              onClick={handleAddTeacher}
              className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 w-full"
            >
              {isNewTeacher ? "Register & Continue" : "Access My Class"}
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">Access Existing Teacher</h2>
            <p className="text-sm text-gray-500 mb-4">Select your name to access your class:</p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {teachers.map((t) => (
                <div
                  key={t.id}
                  className="border p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => selectExistingTeacher(t)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-gray-600">Class: {t.classTeaching}</div>
                    </div>
                    <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {teacherCountsLoading ? "..." : (t.studentCount ?? 0)}
                    </div>
                  </div>
                </div>
              ))}
              {teachers.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No teachers registered yet
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Click on your name above to quickly access your class
            </p>
          </div>
        </div>
      )}

      {/* Student Management Section */}
      {currentTeacher && (
        <div className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg">
                  {editingId ? "Update Student" : "Add Student"} for {currentTeacher.name} - {currentTeacher.classTeaching}
                </h2>
                <p className="text-sm text-gray-500">
                  {isNewTeacher ? "New teacher mode" : "Existing teacher mode"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  {loading ? "Loading..." : `Students: ${myStudents.length}`}
                </div>
                <button
                  onClick={() => {
                    setCurrentTeacher(null);
                    setFormTeacher({ name: "", classTeaching: "" });
                    setStudents([]);
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Switch Teacher
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                placeholder="ID Number *"
                value={formStudent.studentId}
                onChange={(e) => setFormStudent({ ...formStudent, studentId: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="Name & Surname *"
                value={formStudent.name}
                onChange={(e) => setFormStudent({ ...formStudent, name: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={formStudent.gender}
                onChange={(e) => setFormStudent({ ...formStudent, gender: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="date"
                value={formStudent.dateJoined}
                onChange={(e) => setFormStudent({ ...formStudent, dateJoined: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="Home Location *"
                value={formStudent.location}
                onChange={(e) => setFormStudent({ ...formStudent, location: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="Madrassa Location *"
                value={formStudent.madrassaLocation}
                onChange={(e) => setFormStudent({ ...formStudent, madrassaLocation: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="Child Shoe Size"
                value={formStudent.shoeSize}
                onChange={(e) => setFormStudent({ ...formStudent, shoeSize: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="Cell Number *"
                value={formStudent.cell}
                onChange={(e) => setFormStudent({ ...formStudent, cell: e.target.value })}
                className="border p-2 rounded"
              />
            </div>

            <p className="text-sm text-gray-500 mb-4">
              * ID numbers must be **globally unique forever** — cannot be reused even after exclusion.
            </p>

            <button
              onClick={handleSubmitStudent}
              className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800"
              disabled={loading}
            >
              {loading ? "Processing..." : editingId ? "Update" : "Add Student"}
            </button>
          </div>

          {/* Current Teacher Students Table */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">{currentTeacher.name}'s Students</h2>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {loading ? "Loading..." : `Total: ${myStudents.length} students`}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                <p className="mt-2 text-gray-600">Loading students...</p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Gender</th>
                    <th className="p-3 text-left">Date Joined</th>
                    <th className="p-3 text-left">Home Location</th>
                    <th className="p-3 text-left">Madrassa</th>
                    <th className="p-3 text-left">Shoe Size</th>
                    <th className="p-3 text-left">Cell</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myStudents.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-3">{s.studentId}</td>
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">{s.gender}</td>
                      <td className="p-3">{s.dateJoined}</td>
                      <td className="p-3">{s.location}</td>
                      <td className="p-3">{s.madrassaLocation}</td>
                      <td className="p-3">{s.shoeSize}</td>
                      <td className="p-3">{s.cell}</td>
                      <td className="p-3 space-x-2">
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
                  {myStudents.length === 0 && !loading && (
                    <tr>
                      <td colSpan="9" className="p-4 text-center text-gray-500">
                        No students added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* All Registered Teachers Table with Real Counts */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-4">All Registered Teachers</h2>
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Teacher Name</th>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Students</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.classTeaching}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {teacherCountsLoading ? "..." : (t.studentCount ?? 0)}
                  </span>
                </td>
                <td className="p-3 space-x-3">
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
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No teachers registered yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && studentToTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Transfer Student</h3>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-700">Student to transfer:</div>
                <div>{studentToTransfer.name} (ID: {studentToTransfer.studentId})</div>
                <div>Current: {studentToTransfer.ustadh} - {studentToTransfer.classTeaching}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Transfer to Teacher *</label>
                <select
                  value={transferData.newUstadh}
                  onChange={(e) => setTransferData({...transferData, newUstadh: e.target.value})}
                  className="w-full border p-2 rounded"
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
                  className="w-full border p-2 rounded"
                  defaultValue={currentTeacher?.name || ""}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={transferData.notes}
                  onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                  placeholder="Any additional information..."
                  className="w-full border p-2 rounded h-20"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setStudentToTransfer(null);
                    setTransferData({ newUstadh: "", newClassTeaching: "", transferredBy: "", notes: "" });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Exclude Student</h3>
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <div className="font-medium text-red-700">Student to exclude:</div>
                <div>{studentToExclude.name} (ID: {studentToExclude.studentId})</div>
                <div>Class: {studentToExclude.classTeaching} - Ustaadh: {studentToExclude.ustadh}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Exclusion Type *</label>
                <select
                  value={exclusionType}
                  onChange={(e) => setExclusionType(e.target.value)}
                  className="w-full border p-2 rounded"
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
                  className="w-full border p-2 rounded h-24"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional information..."
                  className="w-full border p-2 rounded h-20"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowExcludeModal(false);
                    setStudentToExclude(null);
                    setExclusionReason("");
                    setAdditionalNotes("");
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmExclusion}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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