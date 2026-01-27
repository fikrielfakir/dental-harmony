import React, { useState } from "react";
import { useStore } from "@/store";
import { DentalChartEntry, ToothSurface } from "@/types";
import { DENTAL_COLORS, FDI_NUMBERING } from "@/constants/dental";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OdontogramProps {
  patientId: string;
}

const ToothSVG = ({ 
  fdiNumber, 
  entries, 
  onClick 
}: { 
  fdiNumber: number; 
  entries: DentalChartEntry[]; 
  onClick: () => void 
}) => {
  const latestEntry = entries.find(e => e.toothNumber === fdiNumber);
  const color = latestEntry?.color || "#fff";
  const strokeColor = "#333";

  return (
    <div 
      className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <span className="text-[10px] font-bold mb-1">{fdiNumber}</span>
      <svg width="30" height="40" viewBox="0 0 30 40">
        <rect 
          x="2" y="2" width="26" height="36" rx="4" 
          fill={color} 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />
        {/* Simplified surface indicators */}
        <rect x="10" y="10" width="10" height="10" fill="none" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="2" y1="2" x2="10" y2="10" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="28" y1="2" x2="20" y2="10" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="2" y1="38" x2="10" y2="20" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="28" y1="38" x2="20" y2="20" stroke={strokeColor} strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export const Odontogram = ({ patientId }: OdontogramProps) => {
  const { dentalChart, addDentalChartEntry } = useStore();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    treatmentType: "filling",
    status: "completed" as "planned" | "completed",
    notes: "",
    surfaces: [] as ToothSurface[],
  });

  const patientEntries = dentalChart.filter(e => e.patientId === patientId);

  const handleSave = () => {
    if (selectedTooth === null) return;

    const colorMap: Record<string, string> = {
      filling: DENTAL_COLORS.filling,
      cavity: DENTAL_COLORS.cavity,
      crown: DENTAL_COLORS.crown,
      extraction: DENTAL_COLORS.extraction,
      rootcanal: DENTAL_COLORS.rootCanal,
      healthy: DENTAL_COLORS.healthy,
    };

    const newEntry: DentalChartEntry = {
      id: crypto.randomUUID(),
      patientId,
      toothNumber: selectedTooth,
      surfaces: formData.surfaces,
      treatmentType: formData.treatmentType,
      status: formData.status,
      notes: formData.notes,
      date: new Date().toISOString(),
      color: colorMap[formData.treatmentType.toLowerCase().replace(" ", "")] || "#cbd5e1",
    };

    addDentalChartEntry(newEntry);
    setSelectedTooth(null);
    setFormData({ treatmentType: "filling", status: "completed", notes: "", surfaces: [] });
  };

  return (
    <div className="space-y-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex flex-col gap-8">
        {/* Upper Teeth */}
        <div className="flex justify-center gap-1 sm:gap-2">
          <div className="flex gap-1 sm:gap-2">
            {FDI_NUMBERING.upperRight.map(n => (
              <ToothSVG key={n} fdiNumber={n} entries={patientEntries} onClick={() => setSelectedTooth(n)} />
            ))}
          </div>
          <div className="w-px bg-slate-300 mx-2" />
          <div className="flex gap-1 sm:gap-2">
            {FDI_NUMBERING.upperLeft.map(n => (
              <ToothSVG key={n} fdiNumber={n} entries={patientEntries} onClick={() => setSelectedTooth(n)} />
            ))}
          </div>
        </div>

        {/* Lower Teeth */}
        <div className="flex justify-center gap-1 sm:gap-2">
          <div className="flex gap-1 sm:gap-2">
            {FDI_NUMBERING.lowerRight.map(n => (
              <ToothSVG key={n} fdiNumber={n} entries={patientEntries} onClick={() => setSelectedTooth(n)} />
            ))}
          </div>
          <div className="w-px bg-slate-300 mx-2" />
          <div className="flex gap-1 sm:gap-2">
            {FDI_NUMBERING.lowerLeft.map(n => (
              <ToothSVG key={n} fdiNumber={n} entries={patientEntries} onClick={() => setSelectedTooth(n)} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-slate-200">
        {Object.entries(DENTAL_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs font-medium capitalize">{key}</span>
          </div>
        ))}
      </div>

      <Dialog open={selectedTooth !== null} onOpenChange={(open) => !open && setSelectedTooth(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Treatment for Tooth #{selectedTooth}</DialogTitle>
            <DialogDescription>Record a new treatment or condition for this tooth.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Treatment Type</Label>
              <Select value={formData.treatmentType} onValueChange={(v) => setFormData({...formData, treatmentType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="cavity">Caries / Cavity</SelectItem>
                  <SelectItem value="filling">Filling</SelectItem>
                  <SelectItem value="crown">Crown</SelectItem>
                  <SelectItem value="extraction">Extraction</SelectItem>
                  <SelectItem value="rootcanal">Root Canal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTooth(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-8 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">Treatment History</h3>
        <ScrollArea className="h-[200px] border rounded-md p-4 bg-white">
          {patientEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No treatment records for this patient.</p>
          ) : (
            <div className="space-y-4">
              {patientEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                <div key={entry.id} className="flex justify-between items-start border-b pb-2 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Tooth #{entry.toothNumber}</Badge>
                      <span className="font-medium text-sm">{entry.treatmentType}</span>
                    </div>
                    {entry.notes && <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>}
                  </div>
                  <div className="text-right">
                    <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
                      {entry.status}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
