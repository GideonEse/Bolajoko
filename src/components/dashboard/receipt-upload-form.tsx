'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleReceiptVerification, type VerificationState } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
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

export function ReceiptUploadForm() {
  const [state, formAction] = useFormState(handleReceiptVerification, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: 'Verification Complete',
        description: state.message,
        variant: state.data?.isValid ? 'default' : 'destructive',
      });
      formRef.current?.reset();
    } else if (state.status === 'error' && state.errors?._server) {
       toast({
        title: 'Verification Failed',
        description: state.errors._server[0],
        variant: 'destructive',
      });
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
          <div className="space-y-2">
            <Label htmlFor="receiptId">Receipt ID</Label>
            <Input id="receiptId" name="receiptId" placeholder="e.g., INV-12345" required />
            {state.errors?.receiptId && <p className="text-sm text-destructive">{state.errors.receiptId[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stamp">Stamp Description</Label>
            <Textarea id="stamp" name="stamp" placeholder="Describe the stamp on the receipt..." required />
             {state.errors?.stamp && <p className="text-sm text-destructive">{state.errors.stamp[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Signature Description</Label>
            <Textarea id="signature" name="signature" placeholder="Describe the signature on the receipt..." required />
            {state.errors?.signature && <p className="text-sm text-destructive">{state.errors.signature[0]}</p>}
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
