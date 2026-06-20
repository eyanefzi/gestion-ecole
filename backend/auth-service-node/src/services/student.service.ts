import axios from 'axios';

export class StudentService {
  private studentServiceUrl: string;

  constructor() {
    this.studentServiceUrl = process.env.STUDENT_SERVICE_URL || 'http://localhost:8083';
  }

  async createStudent(studentData: any) {
    try {
      const response = await axios.post(
        `${this.studentServiceUrl}/students`,
        studentData
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to create student:', error.message);
      throw error;
    }
  }

  async getStudent(userId: string) {
    try {
      const response = await axios.get(
        `${this.studentServiceUrl}/api/students/user/${userId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to get student:', error.message);
      throw error;
    }
  }

  async getStudentByEmail(email: string) {
    try {
      const response = await axios.get(
        `${this.studentServiceUrl}/students`
      );
      const students = response.data;
      return students.find((s: any) => s.email === email);
    } catch (error: any) {
      console.error('Failed to get students:', error.message);
      throw error;
    }
  }
}
