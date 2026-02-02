import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, FileText, Filter, Upload } from "lucide-react";
import { toast } from 'material-react-toastify';
import { useState } from "react";

const initialReports = [
  { id: 1, name: "Endowment Performance FY25 Q2.pdf", type: "PDF", size: "2.4 MB", uploadedBy: "Finance Team", date: "2024-10-12" },
  { id: 2, name: "Alumni Giving Donor List.csv", type: "CSV", size: "850 KB", uploadedBy: "Advancement Services", date: "2024-10-10" },
  { id: 3, name: "Campaign Pledge Status.pdf", type: "PDF", size: "1.2 MB", uploadedBy: "Major Gifts", date: "2024-10-08" },
  { id: 4, name: "Event Attendance - Gala.csv", type: "CSV", size: "450 KB", uploadedBy: "Events Team", date: "2024-10-05" },
  { id: 5, name: "Proposal Pipeline Export.xlsx", type: "Excel", size: "1.8 MB", uploadedBy: "CFR", date: "2024-10-01" },
];

export default function ReportsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [reports, setReports] = useState(initialReports);
  const [isOpen, setIsOpen] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Get file details
    const formData = new FormData(e.target as HTMLFormElement);
    const file = formData.get("file") as File;
    const desc = formData.get("desc") as string;

    if (!file) {
        setIsUploading(false);
        return;
    }

    // Simulate upload delay
    setTimeout(() => {
        const newReport = {
            id: Date.now(),
            name: file.name,
            type: file.name.split('.').pop()?.toUpperCase() || "FILE",
            size: (file.size / 1024 / 1024).toFixed(1) + " MB",
            uploadedBy: "Me",
            date: new Date().toISOString().split('T')[0]
        };

        setReports([newReport, ...reports]);
        setIsUploading(false);
        setIsOpen(false); // Close modal
        
        toast.success(`File Uploaded Successfully: ${file.name}`);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Reports Workspace</h1>
                <p className="text-muted-foreground">Manage and share institutional reports.</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Report
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Report</DialogTitle>
                        <DialogDescription>
                            Upload CSV or PDF files to share with the team.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">File</Label>
                            <Input id="file" name="file" type="file" accept=".csv,.pdf,.xlsx" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input id="desc" name="desc" placeholder="e.g. Q3 Financials" />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isUploading}>
                                {isUploading ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Files</CardTitle>
                    <CardDescription>Access the latest uploaded reports.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((file) => (
                            <TableRow key={file.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    {file.type === "PDF" ? (
                                        <FileText className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                                    )}
                                    {file.name}
                                </TableCell>
                                <TableCell><Badge variant="outline">{file.type}</Badge></TableCell>
                                <TableCell className="text-muted-foreground">{file.size}</TableCell>
                                <TableCell>{file.uploadedBy}</TableCell>
                                <TableCell className="text-muted-foreground">{file.date}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        toast.info(`Downloading ${file.name}...`);
                                        // Simulate download
                                        setTimeout(() => {
                                             toast.success(`${file.name} has been saved to your downloads.`);
                                        }, 1000);
                                    }}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
