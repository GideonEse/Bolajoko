export type Role = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  universityId: string;
}

export type ReceiptStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Receipt {
  id: string;
  studentId: string;
  studentName: string;
  receiptId: string;
  date: string;
  status: ReceiptStatus;
  imageUrl: string;
  reason?: string;
}
