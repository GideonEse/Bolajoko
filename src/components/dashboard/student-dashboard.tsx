'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import type { Receipt, ReceiptStatus } from '@/lib/types';
import { ReceiptUploadForm } from './receipt-upload-form';

const statusColors: Record<ReceiptStatus, string> = {
  Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/40',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700/40',
  Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40',
};

interface StudentDashboardProps {
  receipts: Receipt[];
  studentId: string;
}

export default function StudentDashboard({ receipts, studentId }: StudentDashboardProps) {
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-8">
        <div className="max-w-lg mx-auto">
          <ReceiptUploadForm studentId={studentId} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Submitted Receipts</CardTitle>
            <CardDescription>
              Track the status of your uploaded receipts here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">View Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.length > 0 ? receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.receiptId}</TableCell>
                    <TableCell>{receipt.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[receipt.status]}>
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{receipt.reason || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => { setActiveReceipt(receipt); setViewModalOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      You have not submitted any receipts yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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
                  <div><span className="font-semibold">Date:</span> {activeReceipt.date}</div>
                  <div className="flex items-center gap-1"><span className="font-semibold">Status:</span> <Badge variant="outline" className={statusColors[activeReceipt.status]}>{activeReceipt.status}</Badge></div>
                  {activeReceipt.status === 'Rejected' && <div><span className="font-semibold">Reason:</span> {activeReceipt.reason}</div>}
               </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
