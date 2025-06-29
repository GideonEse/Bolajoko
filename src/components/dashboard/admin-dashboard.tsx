'use client'; // For onClick handlers

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockReceipts as initialReceipts } from '@/lib/data';
import type { Receipt, ReceiptStatus } from '@/lib/types';
import { Check, X, Eye } from 'lucide-react';
import { useState } from 'react';

const statusColors: Record<ReceiptStatus, string> = {
  Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/40',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700/40',
  Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40',
};

export default function AdminDashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);

  // In a real app, this would be a server action to update status
  const handleStatusChange = (id: string, status: ReceiptStatus) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, status } : r));
    console.log(`Receipt ${id} status changed to ${status}`);
  };

  return (
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
              <TableHead>Actions</TableHead>
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
                  <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      {receipt.status === 'Pending' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(receipt.id, 'Approved')} className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600">
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(receipt.id, 'Rejected')} className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600">
                            <X className="mr-2 h-4 w-4" /> Reject
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
  );
}
