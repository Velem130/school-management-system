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

  // Step 2: Add/update member
  const handleSubmitStudent = async () => {
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

    // Generate a unique student ID based on timestamp
    const studentId = `M${Date.now()}`;

    // Check if member with same name already exists (case insensitive)
    const studentExists = students.find(
      (s) => 
        s.name.toLowerCase() === formStudent.name.toLowerCase()
    );

    if (studentExists && !editingId) {
      alert(`Member "${formStudent.name}" is already registered!`);
      return;
    }

    const studentData = {
      ...formStudent,
      studentId: editingId ? formStudent.studentId : studentId,
      ustadh: currentTeacher.name,
      classTeaching: currentTeacher.classTeaching,
    };

    try {
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
    if (!window.confirm("Delete this teacher? All their members will also be removed!")) return;
    
    try {
      await menTeacherApi.deleteTeacher(id);
      
      // Remove teacher from local state
      const updatedTeachers = teachers.filter((t) => t.id !== id);
      setTeachers(updatedTeachers);
      
      // Remove students of this teacher from local state
      const teacherToDelete = teachers.find(t => t.id === id);
      if (teacherToDelete) {
        const updatedStudents = students.filter((s) => s.ustadh !== teacherToDelete.name);
        setStudents(updatedStudents);
      }
      
      if (currentTeacher?.id === id) setCurrentTeacher(null);
      alert("Teacher and their members deleted successfully!");
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
    <div>
      <h1 className="text-2xl font-bold mb-6">Men's List Management</h1>

      {/* Step 1: Teacher registration/access */}
      {!currentTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side: New Teacher Registration */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">New Teacher Registration</h2>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <input
                placeholder="Teacher Name *"
                value={formTeacher.name}
                onChange={(e) => setFormTeacher({ ...formTeacher, name: e.target.value })}
                className="border p-2 rounded"
              />
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
                ? "Teacher names must be unique. If you already exist, uncheck the box above."
                : "Access your existing class by entering exact name and class."
              }
            </p>
            <button
              onClick={handleAddTeacher}
              disabled={loading}
              className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 w-full disabled:opacity-50"
            >
              {loading ? "Processing..." : isNewTeacher ? "Register & Continue" : "Access My Class"}
            </button>
          </div>

          {/* Right side: Existing Teachers List */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">Access Existing Teacher</h2>
            <p className="text-sm text-gray-500 mb-4">Select your name to access your class:</p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
                  <p className="mt-2 text-gray-600">Loading teachers...</p>
                </div>
              ) : (
                <>
                  {teachers.map((t) => {
                    const studentCount = getStudentCountForTeacher(t.name);
                    return (
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
                          <div className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                            {studentCount} member{studentCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {teachers.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-4">
                      No teachers registered yet
                    </div>
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Click on your name above to quickly access your class
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Add Members */}
      {currentTeacher && (
        <div className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-lg">
                  {editingId ? "Update Member" : "Add Member"} for {currentTeacher.name} - {currentTeacher.classTeaching}
                </h2>
                <p className="text-sm text-gray-500">
                  {isNewTeacher ? "New teacher mode" : "Existing teacher mode"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  Members: {getStudentCountForTeacher(currentTeacher.name)}
                </div>
                <button
                  onClick={() => {
                    setCurrentTeacher(null);
                    setFormTeacher({ name: "", classTeaching: "" });
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Switch Teacher
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                placeholder="Name & Surname *"
                name="name"
                value={formStudent.name}
                onChange={(e) => setFormStudent({ ...formStudent, name: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                name="gender"
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
                name="dateJoined"
                value={formStudent.dateJoined}
                onChange={(e) => setFormStudent({ ...formStudent, dateJoined: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="Location *"
                name="location"
                value={formStudent.location}
                onChange={(e) => setFormStudent({ ...formStudent, location: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="Cell Number *"
                name="cell"
                value={formStudent.cell}
                onChange={(e) => setFormStudent({ ...formStudent, cell: e.target.value })}
                className="border p-2 rounded"
              />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              * Member names must be unique across all classes
            </p>
            <button
              onClick={handleSubmitStudent}
              disabled={loading}
              className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? "Processing..." : editingId ? "Update" : "Add Member"}
            </button>
          </div>

          {/* Teacher-specific table */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">{currentTeacher.name}'s Members</h2>
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                Total: {myStudents.length} member{myStudents.length !== 1 ? 's' : ''}
              </div>
            </div>
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
        </div>
      )}

      {/* Teacher Registry List with Member Counts */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="font-semibold mb-4">All Registered Teachers</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-600">Loading teachers...</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default MenList;