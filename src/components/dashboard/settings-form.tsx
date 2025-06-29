'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { type User } from '@/lib/types';
import { updateUserSettings, type UserSettingsState } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        'Save Changes'
      )}
    </Button>
  );
}

const initialState: UserSettingsState = {
  status: 'idle',
  message: '',
};

export function UserSettingsForm({ user }: { user: User }) {
  const [state, formAction] = useActionState(updateUserSettings, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === 'idle') return;

    toast({
      title: state.status === 'success' ? 'Success' : 'Error',
      description: state.message,
      variant: state.status === 'error' ? 'destructive' : 'default',
    });

    if (state.status === 'success') {
      if (formRef.current) {
        const passwordInput = formRef.current.querySelector<HTMLInputElement>('input[name="password"]');
        const confirmPasswordInput = formRef.current.querySelector<HTMLInputElement>('input[name="confirmPassword"]');
        if (passwordInput) passwordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
      }
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Account Settings</CardTitle>
        <CardDescription>
          Update your name and password here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
            {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricNumber">Matric Number</Label>
            <Input id="matricNumber" name="matricNumber" value={user.matricNumber} readOnly disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password (optional)</Label>
            <Input id="password" name="password" type="password" placeholder="Leave blank to keep current password" />
            {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" />
            {state.errors?.confirmPassword && <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
