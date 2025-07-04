'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { verifyReceipt, type VerifyReceiptOutput } from '@/ai/flows/verify-receipt';
import { revalidatePath } from 'next/cache';
import { 
    addReceipt, 
    updateReceipt, 
    getReceipts,
    addUser,
    findUserByMatricNumber,
    findUserById,
    updateUser,
} from './data';
import type { Role, User } from './types';

export async function login(formData: FormData) {
  const role = formData.get('role') as string;
  const matricNumber = formData.get('matricNumber') as string;
  const password = formData.get('password') as string;
  
  const user = await findUserByMatricNumber(matricNumber);

  if (user && user.role === role && user.password === password) {
    redirect(`/dashboard?role=${user.role}&userId=${user.id}`);
  } else {
    redirect('/?error=Invalid credentials. Please try again.');
  }
}

export async function register(formData: FormData) {
    const name = formData.get('name') as string;
    const matricNumber = formData.get('matricNumber') as string;
    const role = formData.get('role') as Role;
    const password = formData.get('password') as string;

    if(!name || !matricNumber || !role || !password) {
        redirect('/register?error=Please fill all fields');
        return;
    }

    const existingUser = await findUserByMatricNumber(matricNumber);
    if (existingUser) {
        redirect('/register?error=User with this Matric Number already exists');
        return;
    }

    const newUser = await addUser({
        name,
        matricNumber,
        role,
        password,
    });
    
    redirect(`/dashboard?role=${newUser.role}&userId=${newUser.id}`);
}

const receiptSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required.'),
  date: z.string().min(1, 'Date is required.'),
  studentId: z.string().min(1, 'Student ID is missing.'),
  receiptImage: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Receipt image is required.')
    .refine((file) => file.size < 4 * 1024 * 1024, 'Image must be less than 4MB.')
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Only .jpg, .png, and .webp formats are supported.'),
});

export type VerificationState = {
  status: 'success' | 'error' | 'idle';
  message: string;
  data?: VerifyReceiptOutput;
  errors?: {
    receiptId?: string[];
    date?: string[];
    receiptImage?: string[];
    studentId?: string[];
    _server?: string[];
  };
};

export async function handleReceiptVerification(
  prevState: VerificationState,
  formData: FormData
): Promise<VerificationState> {
  if (!process.env.GOOGLE_API_KEY) {
    console.error('GOOGLE_API_KEY is not set in the environment.');
    return {
      status: 'error',
      message: 'Configuration Error: The Google API Key is missing. Please create a .env file in the project root and add your GOOGLE_API_KEY. You can get a key from Google AI Studio.',
      errors: { _server: ['Missing API Key.'] },
    };
  }
  
  const validatedFields = receiptSchema.safeParse({
    receiptId: formData.get('receiptId'),
    date: formData.get('date'),
    receiptImage: formData.get('receiptImage'),
    studentId: formData.get('studentId'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Please check your input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const student = await findUserById(validatedFields.data.studentId);
  if (!student) {
     return {
      status: 'error',
      message: 'Invalid user.',
      errors: { _server: ['Could not find student record.'] },
    };
  }

  const { receiptImage, ...otherFields } = validatedFields.data;

  try {
    const buffer = Buffer.from(await receiptImage.arrayBuffer());
    const dataURI = `data:${receiptImage.type};base64,${buffer.toString('base64')}`;

    const result = await verifyReceipt({
      receiptImage: dataURI,
      receiptId: otherFields.receiptId,
      date: otherFields.date,
    });

    if (result.isValid) {
      await addReceipt({
        studentId: student.id,
        studentName: student.name,
        receiptId: otherFields.receiptId,
        date: otherFields.date,
      }, dataURI);

      revalidatePath('/dashboard');

      return {
        status: 'success',
        message: 'Receipt passed verification and has been submitted for approval.',
        data: result,
      };
    } else {
       return {
        status: 'error',
        message: `Receipt is invalid. Reason: ${result.reason || 'AI could not validate the receipt.'}`,
        data: result,
      };
    }
  } catch (error) {
    console.error('Verification failed:', error);
    return {
      status: 'error',
      message: 'Verification failed. This is likely a connection issue. Please ensure your Genkit server is running with `npm run genkit:dev` in a separate terminal.',
      errors: { _server: ['Failed to connect to the verification service.'] },
    };
  }
}


export async function approveReceipt(id: string) {
  try {
    await updateReceipt(id, 'Approved');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to approve receipt:', error);
    return { success: false, message: 'Failed to approve receipt.' };
  }
}

export async function rejectReceipt(id: string, reason: string) {
  if (!reason) {
    return { success: false, message: 'A reason is required for rejection.' };
  }
  try {
    await updateReceipt(id, 'Rejected', reason);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to reject receipt:', error);
    return { success: false, message: 'Failed to reject receipt.' };
  }
}

export async function getApprovedListAsCsv(): Promise<string> {
  const receipts = await getReceipts();
  const approvedReceipts = receipts.filter(r => r.status === 'Approved');

  if (approvedReceipts.length === 0) {
    return '';
  }

  const headers = ['Student Name', 'Receipt ID', 'Date Submitted'];
  const rows = approvedReceipts.map(r => [r.studentName, r.receiptId, r.date]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => `"${row.join('","')}"`)
  ].join('\n');
  
  return csvContent;
}

export async function getUserData(userId: string): Promise<User | null> {
  const user = await findUserById(userId);
  return user ?? null;
}

const userSettingsSchema = z.object({
  userId: z.string().min(1, 'User ID is missing.'),
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type UserSettingsState = {
  status: 'success' | 'error' | 'idle';
  message: string;
  errors?: {
    userId?: string[];
    name?: string[];
    password?: string[];
    confirmPassword?: string[];
    _server?: string[];
  };
};

export async function updateUserSettings(
  prevState: UserSettingsState,
  formData: FormData
): Promise<UserSettingsState> {
  const validatedFields = userSettingsSchema.safeParse({
    userId: formData.get('userId'),
    name: formData.get('name'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Please check your input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { userId, name, password } = validatedFields.data;
  
  try {
    const updateData: { name: string; password?: string } = { name };
    if (password) {
      updateData.password = password;
    }
    
    await updateUser(userId, updateData);

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard'); 

    return {
      status: 'success',
      message: 'Your settings have been updated successfully.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      status: 'error',
      message,
      errors: { _server: [message] },
    };
  }
}
