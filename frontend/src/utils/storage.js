// Utility functions for localStorage fallback
export const storage = {
  // Teachers
  getTeachers: () => {
    try {
      return JSON.parse(localStorage.getItem('teachers')) || [];
    } catch (error) {
      console.error('Error reading teachers from localStorage:', error);
      return [];
    }
  },

  saveTeachers: (teachers) => {
    try {
      localStorage.setItem('teachers', JSON.stringify(teachers));
    } catch (error) {
      console.error('Error saving teachers to localStorage:', error);
    }
  },

  // Students
  getStudents: () => {
    try {
      return JSON.parse(localStorage.getItem('students')) || [];
    } catch (error) {
      console.error('Error reading students from localStorage:', error);
      return [];
    }
  },

  saveStudents: (students) => {
    try {
      localStorage.setItem('students', JSON.stringify(students));
    } catch (error) {
      console.error('Error saving students to localStorage:', error);
    }
  },

  // Excluded Students
  getExcludedStudents: () => {
    try {
      return JSON.parse(localStorage.getItem('excludedStudents')) || [];
    } catch (error) {
      console.error('Error reading excluded students:', error);
      return [];
    }
  },

  saveExcludedStudent: (student) => {
    try {
      const excluded = storage.getExcludedStudents();
      excluded.push(student);
      localStorage.setItem('excludedStudents', JSON.stringify(excluded));
    } catch (error) {
      console.error('Error saving excluded student:', error);
    }
  },

  // Clear all data (for testing)
  clearAll: () => {
    localStorage.removeItem('teachers');
    localStorage.removeItem('students');
    localStorage.removeItem('excludedStudents');
  },
};