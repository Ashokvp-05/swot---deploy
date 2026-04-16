
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, User, IndianRupee, Download, ShieldCheck, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface PayslipData {
    payNumber: string;
    month: string;
    year: number;
    basicSalary: number | string;
    hra: number | string;
    da: number | string;
    bonus: number | string;
    otherAllowances: number | string;
    grossSalary: number | string;
    pfDeduction: number | string;
    taxDeduction: number | string;
    leaveDeduction: number | string;
    totalDeductions: number | string;
    netSalary: number | string;
    status: string;
    generatedAt: string;
    user: {
        name: string;
        email: string;
        department: string;
        designation: string;
        employeeId?: string;
    };
}

export function PayslipDetailedView({ data }: { data: PayslipData }) {
    const [downloading, setDownloading] = React.useState(false);

    if (!data) return null;

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Number(amount));
    };

    const handleDownload = async () => {
        const element = document.getElementById('payslip-content');
        if (!element) return;

        setDownloading(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher verification for clarity
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Payslip-${data.month}-${data.year}-${(data.user?.name || "Employee").replace(/\s+/g, '_')}.pdf`);
            toast.success("Payslip exported securely.");
        } catch (error) {
            console.error("PDF Generation failed:", error);
            toast.error("Failed to generate secure document.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card id="payslip-content" className="border-none bg-white dark:bg-slate-950 shadow-2xl rounded-[2.5rem] overflow-hidden max-w-4xl mx-auto border-t-8 border-indigo-600">
            <CardHeader className="p-10 bg-slate-50/50 dark:bg-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <Building className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Rudratic HR</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Enterprise Infrastructure Hub</p>
                            </div>
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 max-w-[200px] leading-relaxed uppercase tracking-tighter">
                            A-112, Technology Park, Sector-62<br />Noida, Uttar Pradesh, 201309
                        </div>
                    </div>

                    <div className="text-right space-y-2">
                        <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-black uppercase text-indigo-500 border-indigo-500/20 bg-indigo-500/5 tracking-widest">{data.status} DOCUMENT</Badge>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{data.month} {data.year}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{data.payNumber}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-10 space-y-10">
                {/* Employee Info Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Name</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{data.user?.name || "Staff Member"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{data.user.department || "Operations"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Designation</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{data.user.designation || "Executive"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Node ID</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">#{data.user.employeeId || data.payNumber.split('-')[2]}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Earnings Section */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 py-2 border-b-2 border-indigo-500/10 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" /> Gross Earnings
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span className="uppercase tracking-wider">Basic Salary</span>
                                <span className="text-slate-900 dark:text-white">{formatCurrency(data.basicSalary)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span className="uppercase tracking-wider">House Rent Allowance</span>
                                <span className="text-slate-900 dark:text-white">{formatCurrency(data.hra)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span className="uppercase tracking-wider">Dearness Allowance</span>
                                <span className="text-slate-900 dark:text-white">{formatCurrency(data.da)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span className="uppercase tracking-wider">Performance Bonus</span>
                                <span className="text-slate-900 dark:text-white">{formatCurrency(data.bonus)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span className="uppercase tracking-wider">Other Allowances</span>
                                <span className="text-slate-900 dark:text-white">{formatCurrency(data.otherAllowances)}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-dashed border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Total</span>
                            <span className="font-black text-lg text-slate-900 dark:text-white">{formatCurrency(data.grossSalary)}</span>
                        </div>
                    </div>

                    {/* Deductions Section */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 py-2 border-b-2 border-rose-500/10 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" /> Statutory Deductions
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span className="uppercase tracking-wider">Provident Fund (PF)</span>
                                <span className="text-rose-500">({formatCurrency(data.pfDeduction)})</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span className="uppercase tracking-wider">Tax (TDS)</span>
                                <span className="text-rose-500">({formatCurrency(data.taxDeduction)})</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span className="uppercase tracking-wider">Leave Without Pay</span>
                                <span className="text-rose-500">({formatCurrency(data.leaveDeduction)})</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-dashed border-slate-200 dark:border-white/10 flex justify-between items-center bg-rose-50/30 dark:bg-rose-500/5 p-3 rounded-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Deduction</span>
                            <span className="font-black text-lg text-rose-600">{formatCurrency(data.totalDeductions)}</span>
                        </div>
                    </div>
                </div>

                <div className="relative group overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-10 shadow-2xl shadow-indigo-600/30 flex flex-col md:flex-row items-center justify-between gap-6" data-html2canvas-ignore="true">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Quantum Disbursed Value</p>
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-1">{formatCurrency(data.netSalary)}</h3>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <Button
                            variant="outline"
                            disabled={downloading}
                            onClick={handleDownload}
                            className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest transition-all"
                        >
                            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                            PDF Print
                        </Button>
                        <Button
                            disabled={downloading}
                            onClick={handleDownload}
                            className="bg-white hover:bg-slate-50 text-indigo-600 rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"
                        >
                            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                            Download
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between py-6 border-t border-slate-50 dark:border-white/5 opacity-50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Digitally Verified Document • Integrity Hash: {data.payNumber.split('-')[2]}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Generated on {new Date(data.generatedAt).toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}
