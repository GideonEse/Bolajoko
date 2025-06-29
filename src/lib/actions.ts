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
    findUserById
} from './data';
import type { Role } from './types';

export async function login(formData: FormData) {
  const role = formData.get('role') as string;
  const matricNumber = formData.get('matricNumber') as string;
  
  // Find user by matric number
  const user = await findUserByMatricNumber(matricNumber);

  // In a real app, you would also verify the password here.
  // For this prototype, we'll just check if the user exists and the role matches.
  if (user && user.role === role) {
    redirect(`/dashboard?role=${user.role}&userId=${user.id}`);
  } else {
    // In a real app, you'd show an error message.
    // For now, we just redirect back to the login page.
    redirect('/');
  }
}

export async function register(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const matricNumber = formData.get('matricNumber') as string;
    const role = formData.get('role') as Role;
    const password = formData.get('password') as string;

    if(!name || !email || !matricNumber || !role || !password) {
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
        email,
        matricNumber,
        role,
    });
    
    // Automatically log in the user after registration
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
      message: 'An unexpected error occurred during verification.',
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
