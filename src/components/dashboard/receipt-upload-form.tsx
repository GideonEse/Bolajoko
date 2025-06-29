'use client';

import { useFormStatus } from 'react-dom';
import { handleReceiptVerification, type VerificationState } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
        </>
      ) : (
        <>
          <UploadCloud className="mr-2 h-4 w-4" /> Verify & Upload Receipt
        </>
      )}
    </Button>
  );
}

const initialState: VerificationState = {
  status: 'idle',
  message: '',
};

export function ReceiptUploadForm({ studentId }: { studentId: string }) {
  const [state, formAction] = useActionState(handleReceiptVerification, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === 'idle') return;

    const variant = state.status === 'error' || state.data?.isValid === false ? 'destructive' : 'default';
    
    toast({
      title: state.status === 'success' ? 'Verification Complete' : 'Verification Failed',
      description: state.message,
      variant: variant,
    });
    
    if (state.status === 'success') {
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upload Receipt</CardTitle>
        <CardDescription>
          Fill in the details and upload a photo of your receipt for verification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="studentId" value={studentId} />
          <div className="space-y-2">
            <Label htmlFor="receiptId">Receipt ID</Label>
            <Input id="receiptId" name="receiptId" placeholder="e.g., INV-12345" required />
            {state.errors?.receiptId && <p className="text-sm text-destructive">{state.errors.receiptId[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date on Receipt</Label>
            <Input id="date" name="date" type="date" required />
            {state.errors?.date && <p className="text-sm text-destructive">{state.errors.date[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptImage">Receipt Image</Label>
            <Input id="receiptImage" name="receiptImage" type="file" accept="image/png, image/jpeg, image/webp" required />
            {state.errors?.receiptImage && <p className="text-sm text-destructive">{state.errors.receiptImage[0]}</p>}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
