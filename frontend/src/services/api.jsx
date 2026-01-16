// src/services/api.js

// Use environment variable for base URL (best for deployment)
// Local: create .env file with VITE_API_URL=http://localhost:8080/api
// Deployment: set VITE_API_URL=https://your-backend.onrender.com/api in Vercel/Render dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined");
}

// Teacher API calls
export const teacherApi = {
  // Get all teachers
  getAllTeachers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers`);
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  // Create new teacher
  createTeacher: async (teacherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  // Teacher access/login
  accessTeacher: async (name, classTeaching) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, classTeaching }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error accessing teacher:', error);
      throw error;
    }
  },

  // Update teacher
  updateTeacher: async (id, teacherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  // Delete teacher
  deleteTeacher: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },
};

// Student API calls (full - nothing removed)
export const studentApi = {
  getAllStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  getStudentsByTeacher: async (ustadh) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/by-teacher/${ustadh}`);
      if (!response.ok) throw new Error('Failed to fetch students for teacher');
      return await response.json();
    } catch (error) {
      console.error('Error fetching students by teacher:', error);
      throw error;
    }
  },

  getStudentsByTeacherAndClass: async (ustadh, classTeaching) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/by-teacher-class?ustadh=${ustadh}&classTeaching=${classTeaching}`);
      if (!response.ok) throw new Error('Failed to fetch students for teacher and class');
      return await response.json();
    } catch (error) {
      console.error('Error fetching students by teacher and class:', error);
      throw error;
    }
  },

  getStudentById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/by-id/${id}`);
      if (!response.ok) throw new Error('Failed to fetch student by ID');
      return await response.json();
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw error;
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  transferStudent: async (studentId, newUstadh, newClassTeaching, transferredBy, notes = "") => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/transfer/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newUstadh,
          newClassTeaching,
          transferredBy,
          notes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to transfer student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error transferring student:', error);
      throw error;
    }
  },

  excludeStudent: async (studentId, excludedBy, reason, exclusionType, additionalNotes = "") => {
    try {
      const response = await fetch(`${API_BASE_URL}/exclude/student/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          excludedBy,
          reason,
          exclusionType,
          additionalNotes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to exclude student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error excluding student:', error);
      throw error;
    }
  },

  countStudentsByTeacher: async (ustadh) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/count-by-teacher/${ustadh}`);
      if (!response.ok) throw new Error('Failed to count students');
      return await response.json();
    } catch (error) {
      console.error('Error counting students:', error);
      throw error;
    }
  },
};

// Excluded Student API calls (full - nothing removed)
export const excludedStudentApi = {
  getAllExcludedStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students`);
      if (!response.ok) throw new Error('Failed to fetch excluded students');
      return await response.json();
    } catch (error) {
      console.error('Error fetching excluded students:', error);
      throw error;
    }
  },

  getExcludedStudentsByTeacher: async (ustadh) => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students/by-teacher/${ustadh}`);
      if (!response.ok) throw new Error('Failed to fetch excluded students for teacher');
      return await response.json();
    } catch (error) {
      console.error('Error fetching excluded students by teacher:', error);
      throw error;
    }
  },

  getExcludedStudentsByTeacherAndClass: async (ustadh, classTeaching) => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students/by-teacher-class?ustadh=${ustadh}&classTeaching=${classTeaching}`);
      if (!response.ok) throw new Error('Failed to fetch excluded students for teacher and class');
      return await response.json();
    } catch (error) {
      console.error('Error fetching excluded students by teacher and class:', error);
      throw error;
    }
  },

  getExcludedStudentsThisMonth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students/this-month`);
      if (!response.ok) throw new Error('Failed to fetch excluded students this month');
      return await response.json();
    } catch (error) {
      console.error('Error fetching excluded students this month:', error);
      throw error;
    }
  },

  getExcludedStudentsByYear: async (year) => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students/by-year/${year}`);
      if (!response.ok) throw new Error('Failed to fetch excluded students for year');
      return await response.json();
    } catch (error) {
      console.error('Error fetching excluded students by year:', error);
      throw error;
    }
  },

  getExcludedStudentsStatisticsByYear: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students/statistics-by-year`);
      if (!response.ok) throw new Error('Failed to fetch excluded students statistics by year');
      return await response.json();
    } catch (error) {
      console.error('Error fetching excluded students statistics by year:', error);
      throw error;
    }
  },

  searchExcludedStudents: async (searchTerm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to search excluded students');
      return await response.json();
    } catch (error) {
      console.error('Error searching excluded students:', error);
      throw error;
    }
  },

  deleteExcludedStudent: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete excluded student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting excluded student:', error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/excluded-students/statistics`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },
};

// Ustaad API calls (full)
export const ustaadApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ustaads`);
      if (!response.ok) throw new Error('Failed to fetch ustaads');
      return await response.json();
    } catch (error) {
      console.error('Error fetching ustaads:', error);
      throw error;
    }
  },

  create: async (ustaad) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ustaads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ustaad),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create ustaad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating ustaad:', error);
      throw error;
    }
  },

  update: async (id, ustaad) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ustaads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ustaad),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update ustaad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating ustaad:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ustaads/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete ustaad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting ustaad:', error);
      throw error;
    }
  },
};

// Adult Teacher API calls (full)
export const adultTeacherApi = {
  getAllTeachers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-teachers`);
      if (!response.ok) throw new Error('Failed to fetch adult teachers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching adult teachers:', error);
      throw error;
    }
  },

  createTeacher: async (teacherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create adult teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating adult teacher:', error);
      throw error;
    }
  },

  accessTeacher: async (name, classTeaching) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-teachers/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, classTeaching }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error accessing adult teacher:', error);
      throw error;
    }
  },

  updateTeacher: async (id, teacherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-teachers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update adult teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating adult teacher:', error);
      throw error;
    }
  },

  deleteTeacher: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-teachers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete adult teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting adult teacher:', error);
      throw error;
    }
  },
};

// Adult Student API calls (full)
export const adultStudentApi = {
  getAllStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-students`);
      if (!response.ok) throw new Error('Failed to fetch adult students');
      return await response.json();
    } catch (error) {
      console.error('Error fetching adult students:', error);
      throw error;
    }
  },

  getStudentsByTeacher: async (ustadh) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-students/by-teacher/${ustadh}`);
      if (!response.ok) throw new Error('Failed to fetch adult students for teacher');
      return await response.json();
    } catch (error) {
      console.error('Error fetching adult students by teacher:', error);
      throw error;
    }
  },

  getStudentsByTeacherAndClass: async (ustadh, classTeaching) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-students/by-teacher-class?ustadh=${ustadh}&classTeaching=${classTeaching}`);
      if (!response.ok) throw new Error('Failed to fetch adult students for teacher and class');
      return await response.json();
    } catch (error) {
      console.error('Error fetching adult students by teacher and class:', error);
      throw error;
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create adult student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating adult student:', error);
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update adult student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating adult student:', error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-students/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete adult student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting adult student:', error);
      throw error;
    }
  },

  countStudentsByTeacher: async (ustadh) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adult-students/count-by-teacher/${ustadh}`);
      if (!response.ok) throw new Error('Failed to count adult students');
      const data = await response.json();
      return data || 0;
    } catch (error) {
      console.error('Error counting adult students:', error);
      throw error;
    }
  },
};

// Men's List Teacher API calls - FULLY ADDED (this was missing)
export const menTeacherApi = {
  getAllTeachers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-teachers`);
      if (!response.ok) throw new Error('Failed to fetch men teachers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching men teachers:', error);
      throw error;
    }
  },

  createTeacher: async (teacherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create men teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating men teacher:', error);
      throw error;
    }
  },

  accessTeacher: async (name, classTeaching) => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-teachers/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, classTeaching }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error accessing men teacher:', error);
      throw error;
    }
  },

  updateTeacher: async (id, teacherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-teachers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update men teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating men teacher:', error);
      throw error;
    }
  },

  deleteTeacher: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-teachers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete men teacher');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting men teacher:', error);
      throw error;
    }
  },
};

// Men's List Student API calls - FULLY ADDED (this was missing)
export const menStudentApi = {
  getAllStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-students`);
      if (!response.ok) throw new Error('Failed to fetch men students');
      return await response.json();
    } catch (error) {
      console.error('Error fetching men students:', error);
      throw error;
    }
  },

  getStudentsByTeacherAndClass: async (ustadh, classTeaching) => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-students/by-teacher-class?ustadh=${encodeURIComponent(ustadh)}&classTeaching=${encodeURIComponent(classTeaching)}`);
      if (!response.ok) throw new Error('Failed to fetch men students for teacher and class');
      return await response.json();
    } catch (error) {
      console.error('Error fetching men students by teacher and class:', error);
      throw error;
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create men student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating men student:', error);
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update men student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating men student:', error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/men-students/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete men student');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting men student:', error);
      throw error;
    }
  },
};

// Duplicate Check API (for Students.jsx only)
export const duplicateCheckApi = {
  // Check if student ID exists in regular students or excluded students
  checkStudentId: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-duplicate/student/${studentId}`);
      if (!response.ok) throw new Error('Failed to check student ID');
      return await response.json();
    } catch (error) {
      console.error('Error checking student ID:', error);
      throw error;
    }
  },

  // Check if name exists (with optional student ID)
  checkName: async (name, studentId = '') => {
    try {
      const url = `${API_BASE_URL}/check-duplicate/name?name=${encodeURIComponent(name)}${studentId ? `&studentId=${encodeURIComponent(studentId)}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to check name');
      return await response.json();
    } catch (error) {
      console.error('Error checking name:', error);
      throw error;
    }
  },
};

// Dashboard Statistics API
export const dashboardApi = {
  // Get all statistics for dashboard
  getDashboardStats: async () => {
    try {
      const [students, ustaads, adultStudents, menStudents, excludedStats] = await Promise.all([
        studentApi.getAllStudents(),
        ustaadApi.getAll(),
        adultStudentApi.getAllStudents(),
        menStudentApi.getAllStudents(),
        excludedStudentApi.getStatistics(),
      ]);

      return {
        totalLearners: students.length,
        activeUstaads: ustaads.length,
        adultClasses: adultStudents.length,
        menList: menStudents.length,
        excludedKids: excludedStats.totalExcluded || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};

// Export the base URL
export { API_BASE_URL };