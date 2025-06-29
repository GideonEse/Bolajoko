'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Receipt, ReceiptStatus } from '@/lib/types';
import { Check, X, Eye, Loader2 } from 'lucide-react';
import { approveReceipt, rejectReceipt } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusColors: Record<ReceiptStatus, string> = {
  Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/40',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700/40',
  Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40',
};

export default function AdminDashboard({ receipts }: { receipts: Receipt[] }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const result = await approveReceipt(id);
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.success ? 'Receipt has been approved.' : result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };

  const handleRejectSubmit = () => {
    if (!activeReceipt) return;
    startTransition(async () => {
      const result = await rejectReceipt(activeReceipt.id, rejectionReason);
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.success ? 'Receipt has been rejected.' : result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        setRejectModalOpen(false);
        setActiveReceipt(null);
        setRejectionReason('');
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Receipt Verification</CardTitle>
          <CardDescription>
            Review and verify receipts submitted by students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.receiptId}</TableCell>
                  <TableCell>{receipt.studentName}</TableCell>
                  <TableCell>{receipt.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[receipt.status]}>
                      {receipt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => { setActiveReceipt(receipt); setViewModalOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {receipt.status === 'Pending' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleApprove(receipt.id)} disabled={isPending} className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setActiveReceipt(receipt); setRejectModalOpen(true); }} disabled={isPending} className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Receipt Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>View Receipt</DialogTitle>
            <DialogDescription>Details for receipt ID: {activeReceipt?.receiptId}</DialogDescription>
          </DialogHeader>
          {activeReceipt && (
             <div className="space-y-4">
               <div className="relative w-full h-96">
                <Image src={activeReceipt.imageUrl} alt={`Receipt ${activeReceipt.receiptId}`} layout="fill" objectFit="contain" data-ai-hint="receipt document"/>
               </div>
               <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">Student:</span> {activeReceipt.studentName}</div>
                  <div><span className="font-semibold">Date:</span> {activeReceipt.date}</div>
                  <div className="flex items-center gap-1"><span className="font-semibold">Status:</span> <Badge variant="outline" className={statusColors[activeReceipt.status]}>{activeReceipt.status}</Badge></div>
                  {activeReceipt.status === 'Rejected' && <div><span className="font-semibold">Reason:</span> {activeReceipt.reason}</div>}
               </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Receipt Dialog */}
      <Dialog open={isRejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Receipt</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this receipt.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea id="reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g., Image is blurry, details are unclear."/>
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleRejectSubmit} disabled={isPending || !rejectionReason}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
