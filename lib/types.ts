export interface StudentMarks {
  rollNo: string
  name: string
  course: "F" | "E" | "AB"
  marks: Record<string, string | number>
}

export interface Student {
  rollNo: string
  name: string
  email: string
}
