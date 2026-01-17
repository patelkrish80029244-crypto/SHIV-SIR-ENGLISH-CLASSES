
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HOLIDAY';

export interface Batch {
  id: string;
  name: string;
  class?: string;
  timing?: string;
  createdAt: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  updatedAt: number; // For "Last updated at" tracking
}

export interface DemandBill {
  id: string;
  userId: string;
  month: string;
  year: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID';
  createdAt: number;
}

export interface PaymentSettings {
  qrCode: string; // Base64 string
  upiId: string;
  phone: string;
  bankInfo?: string;
}

export interface User {
  id: string;
  fullName: string;
  rollNumber?: string;
  fatherName?: string;
  batchId?: string;
  password?: string;
  role: UserRole;
  status: ApprovalStatus;
  monthlyFee: number;
  createdAt: number;
}

export interface Homework {
  id: string;
  batchId: string;
  title: string;
  content: string;
  imageUrl?: string; // Support for photos
  date: string;
  createdAt: number;
}

export interface HomeworkCompletion {
  homeworkId: string;
  userId: string;
  completedAt: number;
}

export interface Announcement {
  id: string;
  batchId: string;
  title: string;
  content: string;
  date: string;
}

export interface AppState {
  users: User[];
  batches: Batch[];
  homework: Homework[];
  homeworkCompletions: HomeworkCompletion[];
  announcements: Announcement[];
  attendance: AttendanceRecord[];
  bills: DemandBill[];
  paymentSettings: PaymentSettings;
  currentUser: User | null;
}
