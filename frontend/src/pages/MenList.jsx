import { useEffect, useState } from "react";
import { menTeacherApi, menStudentApi } from "../services/api";

function MenList() {
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
    cell: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: Separate state for form submission

  // Load teachers and students from database
  useEffect(() => {
    loadTeachers();
    loadAllStudents();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await menTeacherApi.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to load men teachers:", error);
      alert("Failed to load men teachers from server.");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      const data = await menStudentApi.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Failed to load men students:", error);
      setStudents([]);
    }
  };

  const loadStudentsForTeacher = async (teacherName, classTeaching) => {
    try {
      const data = await menStudentApi.getStudentsByTeacherAndClass(teacherName, classTeaching);
      return data;
    } catch (error) {
      console.error("Failed to load students for teacher:", error);
      return [];
    }
  };

  // Function to count members for each teacher
  const getStudentCountForTeacher = (teacherName) => {
    return students.filter((s) => s.ustadh === teacherName).length;
  };

  // Step 1: Add or select teacher
  const handleAddTeacher = async () => {
    if (!formTeacher.name || !formTeacher.classTeaching) {
      alert("Please fill both fields");
      return;
    }

    if (editingTeacherId) {
      try {
        const updatedTeacher = await menTeacherApi.updateTeacher(editingTeacherId, formTeacher);
        
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

    // Check if teacher with same name AND class already exists locally
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
      // New teacher registration - check if name already exists
      const nameExists = teachers.find(
        (t) => t.name.toLowerCase() === formTeacher.name.toLowerCase()
      );

      if (nameExists) {
        alert(`Teacher "${formTeacher.name}" already exists! If this is you, please use the exact same name and class. Otherwise, use a different name.`);
        return;
      }

      try {
        const newTeacher = await menTeacherApi.createTeacher(formTeacher);
        setTeachers([...teachers, newTeacher]);
        setCurrentTeacher(newTeacher);
        setFormTeacher({ name: "", classTeaching: "" });
        alert("New teacher registered! Now you can add members.");
      } catch (error) {
        alert(error.message || "Failed to register teacher");
      }
    } else {
      try {
        const teacher = await menTeacherApi.accessTeacher(formTeacher.name, formTeacher.classTeaching);
        setCurrentTeacher(teacher);
        
        // Check if this teacher is already in our local list
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

  // Step 2: Add/update member - FIXED DUPLICATE CHECKING + DOUBLE-CLICK PROTECTION
  const handleSubmitStudent = async () => {
    // 🔒 PREVENT DOUBLE SUBMISSION
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate click");
      return;
    }

    if (
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
      // Normalize the name for comparison (trim spaces, uppercase)
      const normalizedName = formStudent.name.trim().toUpperCase();

      // Check if member with same name already exists GLOBALLY (case insensitive, trimmed)
      if (!editingId) {
        const duplicateExists = students.find(
          (s) => s.name.trim().toUpperCase() === normalizedName
        );

        if (duplicateExists) {
          alert(
            `Member "${formStudent.name}" already exists!\n\n` +
            `This name is already registered by: ${duplicateExists.ustadh}\n` +
            `Class: ${duplicateExists.classTeaching}\n\n` +
            `Please use a different name or check if this is a duplicate entry.`
          );
          setIsSubmitting(false); // 🔒 UNLOCK on error
          return;
        }
      } else {
        // When editing, check if the new name conflicts with another member (excluding current one)
        const duplicateExists = students.find(
          (s) => s.id !== editingId && s.name.trim().toUpperCase() === normalizedName
        );

        if (duplicateExists) {
          alert(
            `Cannot update: Member "${formStudent.name}" already exists!\n\n` +
            `This name is already registered by: ${duplicateExists.ustadh}\n` +
            `Class: ${duplicateExists.classTeaching}\n\n` +
            `Please use a different name.`
          );
          setIsSubmitting(false); // 🔒 UNLOCK on error
          return;
        }
      }

      // Generate a unique student ID based on timestamp
      const studentId = `M${Date.now()}`;

      const studentData = {
        ...formStudent,
        name: formStudent.name.trim(), // Trim the name before saving
        studentId: editingId ? formStudent.studentId : studentId,
        ustadh: currentTeacher.name,
        classTeaching: currentTeacher.classTeaching,
      };

      if (editingId) {
        const updatedStudent = await menStudentApi.updateStudent(editingId, studentData);
        const updated = students.map((s) =>
          s.id === editingId ? updatedStudent : s
        );
        setStudents(updated);
        setEditingId(null);
        alert("Member updated successfully!");
      } else {
        const newStudent = await menStudentApi.createStudent(studentData);
        setStudents([...students, newStudent]);
        alert("Member added successfully!");
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
      alert(error.message || "Failed to save member");
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
    if (!window.confirm("Delete this member?")) return;
    
    try {
      await menStudentApi.deleteStudent(id);
      const updatedStudents = students.filter((s) => s.id !== id);
      setStudents(updatedStudents);
      alert("Member deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete member");
    }
  };

  // Teacher edit/delete functions
  const handleEditTeacher = (teacher) => {
    setFormTeacher({ name: teacher.name, classTeaching: teacher.classTeaching });
    setEditingTeacherId(teacher.id);
    setIsNewTeacher(false);
  };

  const handleDeleteTeacher = async (id) => {
    const teacherToDelete = teachers.find(t => t.id === id);
    if (!teacherToDelete) return;

    // Check if teacher has any members
    const memberCount = getStudentCountForTeacher(teacherToDelete.name);

    if (memberCount > 0) {
      alert(
        `Cannot delete teacher "${teacherToDelete.name}".\n\n` +
        `This teacher still has ${memberCount} active member${memberCount === 1 ? '' : 's'}.\n\n` +
        "Please delete all members first before deleting the teacher."
      );
      return;
    }

    if (!window.confirm(
      `Delete teacher "${teacherToDelete.name}"?\n` +
      "This teacher has no active members.\n" +
      "This action cannot be undone."
    )) return;
    
    try {
      await menTeacherApi.deleteTeacher(id);
      
      // Remove teacher from local state
      const updatedTeachers = teachers.filter((t) => t.id !== id);
      setTeachers(updatedTeachers);
      
      if (currentTeacher?.id === id) setCurrentTeacher(null);
      alert("Teacher deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete teacher");
    }
  };

  // Filter members for current teacher
  const myStudents = currentTeacher
    ? students.filter((s) => s.ustadh === currentTeacher.name && s.classTeaching === currentTeacher.classTeaching)
    : [];

  // Function to switch to existing teacher
  const selectExistingTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setIsNewTeacher(false);
    setEditingTeacherId(null);
    setFormTeacher({ name: "", classTeaching: "" });
  };

  return (
    <div className="pt-10 pb-10 px-4 md:px-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Men's List Management</h1>

      {/* Step 1: Teacher registration/access */}
      {!currentTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left side: New Teacher Registration */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">New Teacher Registration</h2>
            <div className="grid grid-cols-1 gap-3 md:gap-4 mb-3 md:mb-4">
              <input
                placeholder="Teacher Name *"
                value={formTeacher.name}
                onChange={(e) => setFormTeacher({ ...formTeacher, name: e.target.value })}
                className="border p-2 rounded text-sm md:text-base"
              />
              <input
                placeholder="Class Teaching *"
                value={formTeacher.classTeaching}
                onChange={(e) => setFormTeacher({ ...formTeacher, classTeaching: e.target.value })}
                className="border p-2 rounded text-sm md:text-base"
              />
            </div>
            <div className="flex items-center mb-3 md:mb-4">
              <input
                type="checkbox"
                id="newTeacher"
                checked={isNewTeacher}
                onChange={(e) => setIsNewTeacher(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="newTeacher" className="text-xs md:text-sm text-gray-600">
                I am a new teacher (register me)
              </label>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              {isNewTeacher 
                ? "Teacher names must be unique. If you already exist, uncheck the box above."
                : "Access your existing class by entering exact name and class."
              }
            </p>
            <button
              onClick={handleAddTeacher}
              disabled={loading}
              className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 w-full disabled:opacity-50 text-sm md:text-base"
            >
              {loading ? "Processing..." : isNewTeacher ? "Register & Continue" : "Access My Class"}
            </button>
          </div>

          {/* Right side: Existing Teachers List */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Access Existing Teacher</h2>
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
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm md:text-base">{t.name}</div>
                            <div className="text-xs md:text-sm text-gray-600">Class: {t.classTeaching}</div>
                          </div>
                          <div className="text-xs md:text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                            {studentCount} member{studentCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {teachers.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-4 text-sm">
                      No teachers registered yet
                    </div>
                  )}
                </>
              )}
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
              Click on your name above to quickly access your class
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Add Members */}
      {currentTeacher && (
        <div className="mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
              <div>
                <h2 className="font-semibold text-base md:text-lg">
                  {editingId ? "Update Member" : "Add Member"} for {currentTeacher.name} - {currentTeacher.classTeaching}
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  {isNewTeacher ? "New teacher mode" : "Existing teacher mode"}
                </p>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="bg-emerald-100 text-emerald-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                  Members: {getStudentCountForTeacher(currentTeacher.name)}
                </div>
                <button
                  onClick={() => {
                    setCurrentTeacher(null);
                    setFormTeacher({ name: "", classTeaching: "" });
                  }}
                  className="text-gray-600 hover:text-gray-800 text-xs md:text-sm"
                >
                  Switch Teacher
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
              <input
                placeholder="Name & Surname *"
                name="name"
                value={formStudent.name}
                onChange={(e) => setFormStudent({ ...formStudent, name: e.target.value })}
                className="border p-2 rounded text-sm md:text-base"
              />
              <select
                name="gender"
                value={formStudent.gender}
                onChange={(e) => setFormStudent({ ...formStudent, gender: e.target.value })}
                className="border p-2 rounded text-sm md:text-base"
              >
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="date"
                name="dateJoined"
                value={formStudent.dateJoined}
                onChange={(e) => setFormStudent({ ...formStudent, dateJoined: e.target.value })}
                className="border p-2 rounded text-sm md:text-base"
              />
              <input
                placeholder="Location *"
                name="location"
                value={formStudent.location}
                onChange={(e) => setFormStudent({ ...formStudent, location: e.target.value })}
                className="border p-2 rounded text-sm md:text-base"
              />
              <input
                placeholder="Cell Number *"
                name="cell"
                value={formStudent.cell}
                onChange={(e) => setFormStudent({ ...formStudent, cell: e.target.value })}
                className="border p-2 rounded text-sm md:text-base"
              />
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
              * Member names must be unique across all classes (system-wide)
            </p>
            <button
              onClick={handleSubmitStudent}
              disabled={isSubmitting}
              className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto"
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
                editingId ? "Update" : "Add Member"
              )}
            </button>
          </div>

          {/* Teacher-specific table */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
              <h2 className="font-semibold text-base md:text-lg">{currentTeacher.name}'s Members</h2>
              <div className="bg-indigo-100 text-indigo-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                Total: {myStudents.length} member{myStudents.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Gender</th>
                    <th className="p-3 text-left">Date Joined</th>
                    <th className="p-3 text-left">Location</th>
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
                      <td className="p-3">{s.cell}</td>
                      <td className="p-3 space-x-2">
                        <button
                          onClick={() => handleEditStudent(s)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={loading}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {myStudents.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500">
                        No members added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {myStudents.map((s) => (
                <div key={s.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-600">ID: {s.studentId}</p>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
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

              {myStudents.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No members added yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Registry List with Member Counts */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">All Registered Teachers</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Loading teachers...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Teacher Name</th>
                    <th className="p-3 text-left">Class</th>
                    <th className="p-3 text-left">Members</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => {
                    const studentCount = getStudentCountForTeacher(t.name);
                    return (
                      <tr key={t.id} className="border-b">
                        <td className="p-3">{t.name}</td>
                        <td className="p-3">{t.classTeaching}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            studentCount === 0 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {studentCount} member{studentCount !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="p-3 space-x-2">
                          <button
                            onClick={() => handleEditTeacher(t)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={loading}
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t.id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={loading}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => selectExistingTeacher(t)}
                            className="text-emerald-600 hover:text-emerald-800"
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
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No teachers registered yet
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
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {studentCount} member{studentCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                      <button
                        onClick={() => handleEditTeacher(t)}
                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                        disabled={loading}
                      >
                        Update
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
                  No teachers registered yet
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MenList;