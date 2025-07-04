import type { User, Receipt, ReceiptStatus } from './types';

// This is an in-memory "database". In a real application, this would be a persistent database.
// We use the 'global' object to persist data across hot reloads in development.
declare global {
  var mockUsers: User[] | undefined;
  var mockReceipts: Receipt[] | undefined;
}

const defaultUsers: User[] = [
    {
      id: 'U0',
      name: 'Admin User',
      role: 'admin',
      matricNumber: 'admin',
      password: 'admin',
    },
    {
      id: 'U1',
      name: 'John Doe',
      role: 'student',
      matricNumber: 'U21CS001',
      password: 'password',
    },
     {
      id: 'U2',
      name: 'Jane Smith',
      role: 'staff',
      matricNumber: 'S-ENG055',
      password: 'password',
    },
];

if (process.env.NODE_ENV === 'production') {
  global.mockUsers = defaultUsers;
  global.mockReceipts = [];
} else {
  if (!global.mockUsers) {
    global.mockUsers = defaultUsers;
  }
  if (!global.mockReceipts) {
    global.mockReceipts = [];
  }
}

export let mockUsers: User[] = global.mockUsers;
export let mockReceipts: Receipt[] = global.mockReceipts;


// --- Data Access Functions ---

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

export async function updateUser(userId: string, data: Partial<Pick<User, 'name' | 'password'>>): Promise<User | null> {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        const user = mockUsers[userIndex];
        // Create a new object to ensure reactivity and avoid direct mutation
        mockUsers[userIndex] = { ...user, ...data };
        return Promise.resolve(mockUsers[userIndex]);
    }
    return Promise.resolve(null);
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
