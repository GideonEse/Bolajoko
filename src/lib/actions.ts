'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { verifyReceipt, type VerifyReceiptOutput } from '@/ai/flows/verify-receipt';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const role = formData.get('role') as string;
  redirect(`/dashboard?role=${role || 'student'}`);
}

export async function register(formData: FormData) {
    // In a real app, you would save the user to the database here.
    const role = formData.get('role') as string;
    console.log('New user registered:', {
        name: formData.get('name'),
        email: formData.get('email'),
        universityId: formData.get('universityId'),
        role: role,
    });
    redirect(`/dashboard?role=${role || 'student'}`);
}

const receiptSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required.'),
  stamp: z.string().min(1, 'Stamp description is required.'),
  signature: z.string().min(1, 'Signature description is required.'),
  date: z.string().min(1, 'Date is required.'),
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
    stamp?: string[];
    signature?: string[];
    date?: string[];
    receiptImage?: string[];
    _server?: string[];
  };
};

export async function handleReceiptVerification(
  prevState: VerificationState,
  formData: FormData
): Promise<VerificationState> {
  const validatedFields = receiptSchema.safeParse({
    receiptId: formData.get('receiptId'),
    stamp: formData.get('stamp'),
    signature: formData.get('signature'),
    date: formData.get('date'),
    receiptImage: formData.get('receiptImage'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Please check your input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { receiptImage, ...otherFields } = validatedFields.data;

  try {
    const buffer = Buffer.from(await receiptImage.arrayBuffer());
    const dataURI = `data:${receiptImage.type};base64,${buffer.toString('base64')}`;

    const result = await verifyReceipt({
      receiptImage: dataURI,
      ...otherFields,
    });

    // Here you would typically save the receipt and its verification status to a database.
    console.log('Verification Result:', result);
    
    revalidatePath('/dashboard');

    return {
      status: 'success',
      message: `Receipt ${result.isValid ? 'approved' : 'rejected'}. Reason: ${result.reason || 'N/A'}`,
      data: result,
    };
  } catch (error) {
    console.error('Verification failed:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred during verification.',
      errors: { _server: ['Failed to connect to the verification service.'] },
    };
  }
}
