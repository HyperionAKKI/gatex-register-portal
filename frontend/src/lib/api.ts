export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export interface StudentRegistrationData {
  studentName: string;
  rollNumber: string;
  schoolName: string;
  photos: string[];
  goodUniform: string;
  badUniform: string;
}

export const registerStudent = async (data: StudentRegistrationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.studentName,
        rollNumber: data.rollNumber,
        schoolName: data.schoolName,
        photos: data.photos,
        goodUniform: data.goodUniform,
        badUniform: data.badUniform,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to register student");
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering student:", error);
    throw error;
  }
};
