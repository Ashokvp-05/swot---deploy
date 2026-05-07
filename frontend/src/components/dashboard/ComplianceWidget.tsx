"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, FileText } from "lucide-react"

export default function ComplianceWidget() {
    return (
        <Card className="shadow-sm border border-border/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Compliance & Readiness
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <div className="space-y-0.5">
                            <div className="text-sm font-medium">Profile Completion</div>
                            <div className="text-xs text-muted-foreground">Personal & Banking details</div>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">100%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <div className="space-y-0.5">
                            <div className="text-sm font-medium">IT Security Policy</div>
                            <div className="text-xs text-muted-foreground">Action Required: Acknowledge</div>
                        </div>
                    </div>
                    <button className="text-xs font-medium text-primary hover:underline">Review Link</button>
                </div>
            </CardContent>
        </Card>
    )
}
