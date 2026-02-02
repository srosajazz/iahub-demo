import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, MoreHorizontal, Search, User } from "lucide-react";
import { toast } from 'material-react-toastify';
import { useState } from "react";

// Fake Donor Data
const initialDonors = [
  { id: 1, name: "Eleanor Rigby", status: "Active", type: "Alumni '98", totalGiving: "$450,000", lastGift: "2024-09-15", capacity: "High" },
  { id: 2, name: "Desmond Jones", status: "Lapsed", type: "Parent", totalGiving: "$12,500", lastGift: "2023-01-10", capacity: "Medium" },
  { id: 3, name: "Molly Singer", status: "Active", type: "Friend", totalGiving: "$1.2M", lastGift: "2024-10-02", capacity: "Very High" },
  { id: 4, name: "Jude Lawless", status: "Stewardship", type: "Alumni '05", totalGiving: "$85,000", lastGift: "2024-08-20", capacity: "Medium" },
  { id: 5, name: "Maxwell Edison", status: "Prospect", type: "Corporation", totalGiving: "$0", lastGift: "N/A", capacity: "High" },
  { id: 6, name: "Prudence Farrow", status: "Active", type: "Trustee", totalGiving: "$2.5M", lastGift: "2024-10-10", capacity: "Ultra High" },
];

export default function DonorsPage() {
  const [donors, setDonors] = useState(initialDonors);
  const [isOpen, setIsOpen] = useState(false);

  const handleAddDonor = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newDonor = {
        id: Date.now(),
        name: formData.get("name") as string,
        type: formData.get("type") as string,
        status: formData.get("status") as string,
        totalGiving: formData.get("totalGiving") as string || "$0",
        lastGift: formData.get("lastGift") as string || "N/A",
        capacity: formData.get("capacity") as string
    };

    setDonors([newDonor, ...donors]);
    setIsOpen(false);
    toast.success(`${newDonor.name} has been added to the portfolio.`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Donor Portfolio</h1>
                <p className="text-muted-foreground">Manage relationships and track giving history.</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <User className="mr-2 h-4 w-4" />
                        Add Donor
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Donor</DialogTitle>
                        <DialogDescription>
                            Enter the details of the new donor to add to your portfolio.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddDonor} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required placeholder="e.g. John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Input id="type" name="type" required placeholder="e.g. Alumni '05" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Input id="status" name="status" required placeholder="e.g. Active" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input id="capacity" name="capacity" required placeholder="e.g. High" />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="totalGiving">Total Giving</Label>
                                <Input id="totalGiving" name="totalGiving" placeholder="e.g. $1,000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastGift">Last Gift Date</Label>
                                <Input id="lastGift" name="lastGift" type="date" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit">Add Donor</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="flex items-center space-x-2 w-1/3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search donors..." className="h-9" />
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
                            <TableHead>Donor Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Giving</TableHead>
                            <TableHead>Last Gift</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {donors.map((donor) => (
                            <TableRow key={donor.id}>
                                <TableCell className="font-medium">{donor.name}</TableCell>
                                <TableCell>{donor.type}</TableCell>
                                <TableCell>
                                    <Badge variant={donor.status === "Active" ? "default" : "secondary"}>
                                        {donor.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{donor.totalGiving}</TableCell>
                                <TableCell className="text-muted-foreground">{donor.lastGift}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={donor.capacity.includes("High") ? "border-emerald-500 text-emerald-600" : ""}>
                                        {donor.capacity}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
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
