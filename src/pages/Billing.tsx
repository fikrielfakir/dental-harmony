import { useState } from "react";
import { 
  Plus, Search, Download, Filter, 
  Receipt, CreditCard, FileText, 
  TrendingUp, AlertCircle, History,
  MoreVertical, CheckCircle2, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store";
import { Invoice, Quotation } from "@/types";

const Billing = () => {
  const { patients, invoices, addInvoice, quotations, addQuotation } = useStore();
  const [activeTab, setActiveTab] = useState("invoices");
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddQuotationOpen, setIsAddQuotationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    patientId: "",
    amount: "",
    status: "pending" as any,
  });

  const resetForm = () => {
    setFormData({
      patientId: "",
      amount: "",
      status: "pending",
    });
  };

  const handleCreateInvoice = () => {
    const invoice: Invoice = {
      id: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      patientId: formData.patientId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      items: [],
      totalAmount: parseFloat(formData.amount),
      taxAmount: 0,
      discountAmount: 0,
      paymentStatus: formData.status,
      payments: [],
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addInvoice(invoice);
    setIsAddInvoiceOpen(false);
    resetForm();
  };

  const handleCreateQuotation = () => {
    const quotation: Quotation = {
      id: `QUO-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      patientId: formData.patientId,
      quotationNumber: `QUO-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      items: [],
      totalAmount: parseFloat(formData.amount),
      status: 'draft',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addQuotation(quotation);
    setIsAddQuotationOpen(false);
    resetForm();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const patient = patients.find(p => p.id === inv.patientId);
    const name = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : "";
    return name.includes(searchQuery.toLowerCase()) || inv.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredQuotations = quotations.filter((quo) => {
    const patient = patients.find(p => p.id === quo.patientId);
    const name = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : "";
    return name.includes(searchQuery.toLowerCase()) || quo.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalOutstanding = invoices
    .filter(inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'overdue')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const monthlyRevenue = invoices
    .filter(inv => inv.paymentStatus === 'paid' && new Date(inv.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Financials</h1>
          <p className="text-muted-foreground">Manage invoices, treatment estimates, and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary">
                <Plus className="h-4 w-4 mr-2" /> New Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsAddInvoiceOpen(true)}>Create Invoice</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddQuotationOpen(true)}>Create Quotation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" /> Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" /> Revenue (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Pending Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.paymentStatus === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" /> Draft Estimates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by patient name or ID..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:w-32">
          <Filter className="h-4 w-4 mr-2" /> Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotations">Estimates</TabsTrigger>
          <TabsTrigger value="payments">History</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>View and track all patient billing records</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices found</TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const patient = patients.find(p => p.id === inv.patientId);
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                          <TableCell className="font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : "N/A"}</TableCell>
                          <TableCell>${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>{new Date(inv.invoiceDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={inv.paymentStatus === 'paid' ? 'default' : inv.paymentStatus === 'pending' ? 'secondary' : 'destructive'}>
                              {inv.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Treatment Estimates</CardTitle>
              <CardDescription>Manage draft and accepted quotations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No estimates found</TableCell>
                    </TableRow>
                  ) : (
                    filteredQuotations.map((quo) => {
                      const patient = patients.find(p => p.id === quo.patientId);
                      return (
                        <TableRow key={quo.id}>
                          <TableCell className="font-mono text-xs">{quo.quotationNumber}</TableCell>
                          <TableCell className="font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : "N/A"}</TableCell>
                          <TableCell>${quo.totalAmount.toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline">{quo.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Convert</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Invoice Dialog */}
      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Enter invoice details for a patient record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={formData.patientId} onValueChange={(val) => setFormData({...formData, patientId: val})}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddInvoiceOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={!formData.patientId || !formData.amount}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Quotation Dialog */}
      <Dialog open={isAddQuotationOpen} onOpenChange={setIsAddQuotationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Treatment Estimate</DialogTitle>
            <DialogDescription>Create a quotation for a planned procedure.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={formData.patientId} onValueChange={(val) => setFormData({...formData, patientId: val})}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estimated Total ($)</Label>
              <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddQuotationOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateQuotation} disabled={!formData.patientId || !formData.amount}>Create Estimate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;