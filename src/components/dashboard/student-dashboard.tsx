import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockReceipts } from '@/lib/data';
import type { ReceiptStatus } from '@/lib/types';
import { ReceiptUploadForm } from './receipt-upload-form';

const statusColors: Record<ReceiptStatus, string> = {
  Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/40',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700/40',
  Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40',
};

export default function StudentDashboard() {
  const studentReceipts = mockReceipts.filter(r => r.studentId === '1'); // Mock: show receipts for Alice

  return (
    <div className="space-y-8">
      <div className="max-w-lg mx-auto">
        <ReceiptUploadForm />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentReceipts.length > 0 ? studentReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.receiptId}</TableCell>
                  <TableCell>{receipt.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[receipt.status]}>
                      {receipt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{receipt.reason || 'N/A'}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    You have not submitted any receipts yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
