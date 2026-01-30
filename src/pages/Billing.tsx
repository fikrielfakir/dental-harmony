import { useState } from "react";
import { 
  Plus, Search, Download, Filter, 
  Receipt, CreditCard, FileText, 
  TrendingUp, AlertCircle, History,
  MoreVertical, CheckCircle2, Clock,
  ArrowUpRight, ListChecks
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Invoice, Quotation, PaymentMethod, PaymentStatus } from "@/types";
import { Progress } from "@/components/ui/progress";

const Billing = () => {
  const { 
    patients, 
    invoices, 
    addInvoice, 
    updateInvoice, 
    deleteInvoice, 
    quotations, 
    addQuotation,
    appointments,
    recordPayment,
    generateInvoiceFromAppointment
  } = useStore();
  
  const [activeTab, setActiveTab] = useState("invoices");
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddQuotationOpen, setIsAddQuotationOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAutoBillingOpen, setIsAutoBillingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    patientId: "",
    amount: "",
    status: "pending" as PaymentStatus,
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    method: "cash" as PaymentMethod,
    notes: ""
  });

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleDownloadPDF = (invoice: Invoice) => {
    const patient = patients.find(p => p.id === invoice.patientId);
    const content = 
      "INVOICE: " + invoice.invoiceNumber + "\n" +
      "Date: " + new Date(invoice.invoiceDate).toLocaleDateString() + "\n" +
      "Patient: " + (patient ? (patient.firstName + " " + patient.lastName) : 'N/A') + "\n" +
      "Total Amount: $" + invoice.totalAmount.toFixed(2) + "\n" +
      "Paid Amount: $" + (invoice.totalAmount - (invoice.remainingBalance ?? invoice.totalAmount)).toFixed(2) + "\n" +
      "Remaining Balance: $" + (invoice.remainingBalance ?? invoice.totalAmount).toFixed(2) + "\n" +
      "Status: " + invoice.paymentStatus.toUpperCase();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = invoice.invoiceNumber + ".txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      amount: "",
      status: "pending",
    });
  };

  const handleCreateInvoice = () => {
    const newId = "INV-" + new Date().getFullYear() + "-" + String(invoices.length + 1).padStart(3, '0');
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      patientId: formData.patientId,
      invoiceNumber: newId,
      items: [],
      totalAmount: parseFloat(formData.amount),
      taxAmount: 0,
      discountAmount: 0,
      paymentStatus: formData.status,
      payments: [],
      remainingBalance: parseFloat(formData.amount),
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addInvoice(invoice);
    setIsAddInvoiceOpen(false);
    resetForm();
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    recordPayment(selectedInvoice.id, {
      amount: parseFloat(paymentFormData.amount),
      paymentMethod: paymentFormData.method,
      notes: paymentFormData.notes
    });
    setIsPaymentModalOpen(false);
    setPaymentFormData({ amount: "", method: "cash", notes: "" });
  };

  const handleCreateQuotation = () => {
    const newId = "QUO-" + new Date().getFullYear() + "-" + String(quotations.length + 1).padStart(3, '0');
    const quotation: Quotation = {
      id: crypto.randomUUID(),
      patientId: formData.patientId,
      quotationNumber: newId,
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
    const name = patient ? (patient.firstName + " " + patient.lastName).toLowerCase() : "";
    return name.includes(searchQuery.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const unbilledAppointments = appointments.filter(a => 
    a.status === 'completed' && !invoices.some(i => i.appointmentId === a.id)
  );

  const totalOutstanding = invoices
    .reduce((sum, inv) => sum + (inv.remainingBalance ?? inv.totalAmount), 0);

  const monthlyRevenue = invoices
    .flatMap(inv => inv.payments)
    .filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Financials</h1>
          <p className="text-muted-foreground">Manage invoices, treatment estimates, and partial payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex" onClick={() => setIsAutoBillingOpen(true)}>
            <ListChecks className="h-4 w-4 mr-2" /> Auto-Billing ({unbilledAppointments.length})
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
              <AlertCircle className="h-4 w-4 text-destructive" /> Total Receivables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" /> Payments Received (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Partial Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.paymentStatus === 'partial').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-blue-500" /> Unbilled Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unbilledAppointments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by patient name or invoice #..." 
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
              <CardDescription>Track full and partial payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found</TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const patient = patients.find(p => p.id === inv.patientId);
                      const paidAmount = inv.totalAmount - (inv.remainingBalance ?? inv.totalAmount);
                      const percent = (paidAmount / inv.totalAmount) * 100;
                      
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                          <TableCell className="font-medium">{patient ? (patient.firstName + " " + patient.lastName) : "N/A"}</TableCell>
                          <TableCell>${inv.totalAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-destructive font-medium">${(inv.remainingBalance ?? inv.totalAmount).toLocaleString()}</TableCell>
                          <TableCell className="w-[100px]">
                            <Progress value={percent} className="h-2" />
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              inv.paymentStatus === 'paid' ? 'default' : 
                              inv.paymentStatus === 'partial' ? 'secondary' : 
                              inv.paymentStatus === 'overpaid' ? 'outline' : 
                              inv.paymentStatus === 'pending' ? 'destructive' : 'default'
                            } className={cn(
                              inv.paymentStatus === 'paid' && "bg-emerald-500 hover:bg-emerald-600",
                              inv.paymentStatus === 'partial' && "bg-amber-500 hover:bg-amber-600",
                              inv.paymentStatus === 'pending' && "bg-rose-500 hover:bg-rose-600"
                            )}>
                              {inv.paymentStatus.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedInvoice(inv);
                                  setIsDetailOpen(true);
                                }}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedInvoice(inv);
                                  setPaymentFormData({ ...paymentFormData, amount: (inv.remainingBalance ?? inv.totalAmount).toString() });
                                  setIsPaymentModalOpen(true);
                                }}>Record Payment</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadPDF(inv)}>Download PDF</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => deleteInvoice(inv.id)}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
            <DialogDescription>
              Create a manual invoice for a patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select 
                value={formData.patientId} 
                onValueChange={(val) => setFormData({...formData, patientId: val})}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input 
                id="amount"
                type="number" 
                placeholder="0.00"
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val: PaymentStatus) => setFormData({...formData, status: val})}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
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
            <DialogTitle>Create New Quotation</DialogTitle>
            <DialogDescription>
              Create a treatment estimate for a patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="q-patient">Patient</Label>
              <Select 
                value={formData.patientId} 
                onValueChange={(val) => setFormData({...formData, patientId: val})}
              >
                <SelectTrigger id="q-patient">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-amount">Estimated Amount ($)</Label>
              <Input 
                id="q-amount"
                type="number" 
                placeholder="0.00"
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddQuotationOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateQuotation} disabled={!formData.patientId || !formData.amount}>Create Quotation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a full or partial payment for {selectedInvoice?.invoiceNumber}. 
              Remaining: ${(selectedInvoice?.remainingBalance ?? 0).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Payment Amount ($)</Label>
              <Input 
                type="number" 
                value={paymentFormData.amount} 
                onChange={(e) => setPaymentFormData({...paymentFormData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={paymentFormData.method} 
                onValueChange={(val: PaymentMethod) => setPaymentFormData({...paymentFormData, method: val})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input 
                placeholder="Optional payment notes..."
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={!paymentFormData.amount}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Billing Modal */}
      <Dialog open={isAutoBillingOpen} onOpenChange={setIsAutoBillingOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Invoices from Treatments</DialogTitle>
            <DialogDescription>
              The following completed appointments haven't been billed yet.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unbilledAppointments.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">All treatments billed</TableCell></TableRow>
                ) : (
                  unbilledAppointments.map(a => {
                    const p = patients.find(pat => pat.id === a.patientId);
                    return (
                      <TableRow key={a.id}>
                        <TableCell>{new Date(a.startTime).toLocaleDateString()}</TableCell>
                        <TableCell>{p ? (p.firstName + " " + p.lastName) : "Unknown"}</TableCell>
                        <TableCell><Badge variant="outline">{a.appointmentType}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => generateInvoiceFromAppointment(a.id)}>Bill Now</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAutoBillingOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog with Payment History */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invoice Details & History</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoiceNumber} - Created on {selectedInvoice && new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <Label className="text-muted-foreground">Total Amount</Label>
                  <p className="text-xl font-bold">${selectedInvoice.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Remaining Balance</Label>
                  <p className="text-xl font-bold text-destructive">${(selectedInvoice.remainingBalance ?? selectedInvoice.totalAmount).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><History className="h-4 w-4" /> Payment History</Label>
                {selectedInvoice.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No payments recorded yet.</p>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableBody>
                        {selectedInvoice.payments.map((p, idx) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-xs">{new Date(p.paymentDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-sm font-medium">${p.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground uppercase">{p.paymentMethod}</TableCell>
                            <TableCell className="text-xs italic">{p.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {selectedInvoice.creditNotes && selectedInvoice.creditNotes.length > 0 && (
                <div className="space-y-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <Label className="text-blue-700 flex items-center gap-2">🔹 Credit Notes Issued</Label>
                  {selectedInvoice.creditNotes.map(cn => (
                    <div key={cn.id} className="flex justify-between items-center text-sm">
                      <span>{cn.reason}</span>
                      <span className="font-bold text-blue-700">${cn.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
            {selectedInvoice && (
              <Button onClick={() => handleDownloadPDF(selectedInvoice)}>Export History</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;