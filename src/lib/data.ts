import type { User, Receipt } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'student', universityId: 'S12345' },
  { id: '2', name: 'Bob Williams', email: 'bob@example.com', role: 'student', universityId: 'S67890' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'staff', universityId: 'T001' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'admin', universityId: 'A001' },
];

export const mockReceipts: Receipt[] = [
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
