'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import type { Receipt } from '@/lib/types';
import { getApprovedListAsCsv } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface StaffDashboardProps {
  receipts: Receipt[];
}

export default function StaffDashboard({ receipts }: StaffDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDownload = () => {
    startTransition(async () => {
      const csvData = await getApprovedListAsCsv();
      if (!csvData) {
        toast({
          title: 'No Data',
          description: 'There are no approved receipts to download.',
          variant: 'destructive',
        });
        return;
      }

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'approved_receipts.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Approved Receipts</CardTitle>
          <CardDescription>
            List of students who have successfully uploaded their receipts.
          </CardDescription>
        </div>
        <Button onClick={handleDownload} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" />
          )}
          Download Approved List
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Receipt ID</TableHead>
              <TableHead>Date Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length > 0 ? receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium">{receipt.studentName}</TableCell>
                <TableCell>{receipt.receiptId}</TableCell>
                <TableCell>{receipt.date}</TableCell>
              </TableRow>
            )) : (
                <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No approved receipts yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
