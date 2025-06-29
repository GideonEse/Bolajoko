import type { User, Receipt, ReceiptStatus } from './types';

// This is now mutable to simulate a database
export let mockUsers: User[] = [
  {
    id: 'U0',
    name: 'Admin User',
    email: 'admin@receiptverse.com',
    role: 'admin',
    matricNumber: 'admin'
  }
];

// This is now mutable to simulate a database
export let mockReceipts: Receipt[] = [];


// --- Data Access Functions ---

export async function findUserByEmail(email: string): Promise<User | undefined> {
    return Promise.resolve(mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()));
}

export async function findUserByMatricNumber(matricNumber: string): Promise<User | undefined> {
    return Promise.resolve(mockUsers.find(u => u.matricNumber.toLowerCase() === matricNumber.toLowerCase()));
}

export async function findUserById(id: string): Promise<User | undefined> {
    return Promise.resolve(mockUsers.find(u => u.id === id));
}

export async function addUser(userData: Omit<User, 'id'>): Promise<User> {
  const newUser: User = {
    ...userData,
    id: `U${Date.now()}`, // Simple unique ID
  };
  mockUsers.push(newUser);
  return Promise.resolve(newUser);
}


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
