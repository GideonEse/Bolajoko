import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockReceipts } from '@/lib/data';
import { FileDown } from 'lucide-react';

export default function StaffDashboard() {
  const approvedReceipts = mockReceipts.filter(r => r.status === 'Approved');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Approved Receipts</CardTitle>
          <CardDescription>
            List of students who have successfully uploaded their receipts.
          </CardDescription>
        </div>
        <Button>
          <FileDown className="mr-2 h-4 w-4" />
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
            {approvedReceipts.length > 0 ? approvedReceipts.map((receipt) => (
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
