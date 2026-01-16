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

  // Delete teacher function
  const handleDeleteTeacher = async (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    const teacherStudents = students.filter(s => s.ustadh === teacher.name);
    
    if (teacherStudents.length > 0) {
      if (!window.confirm(`This Ustaadh has ${teacherStudents.length} learner(s). Deleting will also remove all associated learners. Are you sure?`)) {
        return;
      }
      
      // Remove students associated with this teacher
      for (const student of teacherStudents) {
        try {
          await adultStudentApi.deleteStudent(student.id);
        } catch (error) {
          console.error("Failed to delete student:", error);
        }
      }
      
      // Update local state
      const updatedStudents = students.filter(s => s.ustadh !== teacher.name);
      setStudents(updatedStudents);
    } else {
      if (!window.confirm("Delete this Adult Ustaadh?")) {
        return;
      }
    }
    
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

  // Step 2: Add / Update Adult Student
  const handleSubmitStudent = async () => {
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

    // Check if student with same ID number already exists
    const idExists = students.find(
      (s) => s.studentId === formStudent.studentId
    );

    if (idExists && !editingId) {
      alert(`Adult learner with ID number "${formStudent.studentId}" is already registered!`);
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
      return;
    }

    const studentData = {
      ...formStudent,
      ustadh: currentTeacher.name,
      classTeaching: currentTeacher.classTeaching,
    };

    try {
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

  // Function to switch to existing teacher
  const selectExistingTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setIsNewTeacher(false);
    setEditingTeacherId(null);
    setFormTeacher({ name: "", classTeaching: "" });
  };

  return (
    <div className="p-4 md:p-8">
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
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="bg-emerald-100 text-emerald-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                  Adult Learners: {getStudentCountForTeacher(currentTeacher.name)}
                </div>
                <button
                  onClick={() => {
                    setCurrentTeacher(null);
                    setFormTeacher({ name: "", classTeaching: "" });
                  }}
                  className="text-gray-600 hover:text-gray-800 text-xs md:text-sm"
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
              disabled={loading}
              className="bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50 text-sm md:text-base w-full sm:w-auto"
            >
              {loading ? "Processing..." : editingId ? "Update" : "Add"}
            </button>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
              <h2 className="font-semibold text-base md:text-lg">
                {currentTeacher.name}'s Adult Learners
              </h2>
              <div className="bg-purple-100 text-purple-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                Total: {myStudents.length} learner{myStudents.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="overflow-x-auto">
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
                  {myStudents.map((s) => (
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
                  {myStudents.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500 text-sm">
                        No adult learners yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* All Registered Adult Ustaadhs Table with Actions */}
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
          <div className="overflow-x-auto">
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
        )}
        <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
          Note: Editing a Ustaadh will update their name/class for all associated learners.
        </p>
      </div>
    </div>
  );
}

export default AdultClasses;

