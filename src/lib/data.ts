import type { User, Receipt, ReceiptStatus } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'student', matricNumber: 'S12345' },
  { id: '2', name: 'Bob Williams', email: 'bob@example.com', role: 'student', matricNumber: 'S67890' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'staff', matricNumber: 'T001' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'admin', matricNumber: 'A001' },
];

// This is now mutable to simulate a database
export let mockReceipts: Receipt[] = [
  {
    id: 'R001',
    studentId: '1',
    studentName: 'Alice Johnson',
    receiptId: 'INV-2024-001',
    date: '2024-07-15',
    status: 'Approved',
    imageUrl: 'https://placehold.co/400x600.png',
    reason: '',
  },
  {
    id: 'R002',
    studentId: '2',
    studentName: 'Bob Williams',
    receiptId: 'INV-2024-002',
    date: '2024-07-16',
    status: 'Pending',
    imageUrl: 'https://placehold.co/400x600.png',
    reason: '',
  },
  {
    id: 'R003',
    studentId: '1',
    studentName: 'Alice Johnson',
    receiptId: 'INV-2024-003',
    date: '2024-07-18',
    status: 'Rejected',
    imageUrl: 'https://placehold.co/400x600.png',
    reason: 'Signature does not match records.',
  },
   {
    id: 'R004',
    studentId: '2',
    studentName: 'Bob Williams',
    receiptId: 'INV-2024-004',
    date: '2024-07-20',
    status: 'Approved',
    imageUrl: 'https://placehold.co/400x600.png',
    reason: '',
  },
];


// --- Data Access Functions ---

export async function getReceipts(): Promise<Receipt[]> {
  // In a real app, this would be a database call.
  return Promise.resolve(mockReceipts);
}

export async function getReceiptsByStudentId(studentId: string): Promise<Receipt[]> {
  return Promise.resolve(mockReceipts.filter(r => r.studentId === studentId));
}

export async function addReceipt(receiptData: Omit<Receipt, 'id' | 'status' | 'reason' | 'imageUrl'>, imageUrl: string): Promise<Receipt> {
  const newReceipt: Receipt = {
    ...receiptData,
    id: `R${Date.now()}`, // More unique ID
    status: 'Pending',
    imageUrl, // Use the provided data URI
    reason: '',
  };
  mockReceipts.unshift(newReceipt); // Add to the start of the list
  return Promise.resolve(newReceipt);
}

export async function updateReceipt(id: string, newStatus: ReceiptStatus, reason?: string): Promise<Receipt | null> {
  const receiptIndex = mockReceipts.findIndex(r => r.id === id);
  if (receiptIndex > -1) {
    mockReceipts[receiptIndex].status = newStatus;
    mockReceipts[receiptIndex].reason = reason || (newStatus === 'Approved' ? '' : mockReceipts[receiptIndex].reason);
    return Promise.resolve(mockReceipts[receiptIndex]);
  }
  return Promise.resolve(null);
}
