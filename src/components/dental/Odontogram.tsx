import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store";
import { DentalChartEntry, ToothSurface } from "@/types";
import { DENTAL_COLORS, FDI_NUMBERING, TOOTH_STATUS_LABELS } from "@/constants/dental";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface OdontogramProps {
  patientId: string;
}

const SURFACES: ToothSurface[] = ['O', 'M', 'D', 'B', 'L'];
const SURFACE_LABELS: Record<ToothSurface, string> = {
  'O': 'Occlusal',
  'M': 'Mesial',
  'D': 'Distal',
  'B': 'Buccal',
  'L': 'Lingual'
};

const ToothSVG = ({ 
  fdiNumber, 
  entries, 
  onClick,
  isUpper
}: { 
  fdiNumber: number; 
  entries: DentalChartEntry[]; 
  onClick: () => void;
  isUpper: boolean;
}) => {
  const toothEntries = entries.filter(e => e.toothNumber === fdiNumber);
  const latestEntry = toothEntries.length > 0 ? toothEntries[toothEntries.length - 1] : null;
  const baseColor = latestEntry?.color || "#ffffff";
  const isExtracted = latestEntry?.treatmentType === 'extraction';
  const strokeColor = "#374151";

  const getSurfaceColor = (surface: ToothSurface): string => {
    const surfaceEntry = toothEntries.find(e => e.surfaces.includes(surface));
    return surfaceEntry?.color || "#ffffff";
  };

  return (
    <div 
      className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform group"
      onClick={onClick}
    >
      <span className={`text-[10px] font-bold ${isUpper ? 'mb-1' : 'order-2 mt-1'} text-gray-700`}>
        {fdiNumber}
      </span>
      <svg 
        width="36" 
        height="44" 
        viewBox="0 0 36 44"
        className="drop-shadow-sm group-hover:drop-shadow-md transition-all"
      >
        {isExtracted ? (
          <>
            <rect x="3" y="3" width="30" height="38" rx="5" fill="#f1f5f9" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="6" y1="6" x2="30" y2="38" stroke="#ef4444" strokeWidth="2" />
            <line x1="30" y1="6" x2="6" y2="38" stroke="#ef4444" strokeWidth="2" />
          </>
        ) : (
          <>
            <rect x="3" y="3" width="30" height="38" rx="5" fill={baseColor} stroke={strokeColor} strokeWidth="1.5" />
            
            {/* Occlusal (center) */}
            <rect x="12" y="14" width="12" height="12" fill={getSurfaceColor('O')} stroke={strokeColor} strokeWidth="0.75" />
            
            {/* Mesial (left) */}
            <polygon points="3,3 12,14 12,26 3,41" fill={getSurfaceColor('M')} stroke={strokeColor} strokeWidth="0.5" />
            
            {/* Distal (right) */}
            <polygon points="33,3 24,14 24,26 33,41" fill={getSurfaceColor('D')} stroke={strokeColor} strokeWidth="0.5" />
            
            {/* Buccal (top for upper, bottom for lower) */}
            {isUpper ? (
              <polygon points="3,3 12,14 24,14 33,3" fill={getSurfaceColor('B')} stroke={strokeColor} strokeWidth="0.5" />
            ) : (
              <polygon points="3,41 12,26 24,26 33,41" fill={getSurfaceColor('B')} stroke={strokeColor} strokeWidth="0.5" />
            )}
            
            {/* Lingual (bottom for upper, top for lower) */}
            {isUpper ? (
              <polygon points="3,41 12,26 24,26 33,41" fill={getSurfaceColor('L')} stroke={strokeColor} strokeWidth="0.5" />
            ) : (
              <polygon points="3,3 12,14 24,14 33,3" fill={getSurfaceColor('L')} stroke={strokeColor} strokeWidth="0.5" />
            )}
          </>
        )}
      </svg>
      {toothEntries.length > 0 && !isExtracted && (
        <div className={`w-2 h-2 rounded-full bg-primary ${isUpper ? '' : 'order-3'}`} />
      )}
    </div>
  );
};

export const Odontogram = ({ patientId }: OdontogramProps) => {
  const { t } = useTranslation();
  const { dentalChart, addDentalChartEntry, deleteDentalChartEntry } = useStore();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    treatmentType: "filling",
    status: "completed" as "planned" | "completed",
    notes: "",
    surfaces: [] as ToothSurface[],
  });

  const patientEntries = dentalChart.filter(e => e.patientId === patientId);

  const toggleSurface = (surface: ToothSurface) => {
    setFormData(prev => ({
      ...prev,
      surfaces: prev.surfaces.includes(surface)
        ? prev.surfaces.filter(s => s !== surface)
        : [...prev.surfaces, surface]
    }));
  };

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
      surfaces: formData.surfaces.length > 0 ? formData.surfaces : ['O'],
      treatmentType: formData.treatmentType,
      status: formData.status,
      notes: formData.notes,
      date: new Date().toISOString(),
      color: colorMap[formData.treatmentType.toLowerCase().replace(" ", "").replace("-", "")] || "#cbd5e1",
    };

    addDentalChartEntry(newEntry);
    setSelectedTooth(null);
    setFormData({ treatmentType: "filling", status: "completed", notes: "", surfaces: [] });
  };

  const handleDelete = (id: string) => {
    deleteDentalChartEntry(id);
  };

  const getToothHistory = (toothNumber: number) => {
    return patientEntries.filter(e => e.toothNumber === toothNumber);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t("patients.dentalChart.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("patients.dentalChart.subtitle")}</p>
      </div>
      
      <div className="flex flex-col gap-6 overflow-x-auto pb-4">
        {/* Upper Teeth */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-muted-foreground mb-2">{t("patients.dentalChart.upperArch")}</span>
          <div className="flex justify-center gap-0.5 sm:gap-1">
            <div className="flex gap-0.5 sm:gap-1">
              {FDI_NUMBERING.upperRight.map(n => (
                <ToothSVG 
                  key={n} 
                  fdiNumber={n} 
                  entries={patientEntries} 
                  onClick={() => setSelectedTooth(n)}
                  isUpper={true}
                />
              ))}
            </div>
            <div className="w-px bg-slate-300 mx-1 sm:mx-2 self-stretch" />
            <div className="flex gap-0.5 sm:gap-1">
              {FDI_NUMBERING.upperLeft.map(n => (
                <ToothSVG 
                  key={n} 
                  fdiNumber={n} 
                  entries={patientEntries} 
                  onClick={() => setSelectedTooth(n)}
                  isUpper={true}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-300" />

        {/* Lower Teeth */}
        <div className="flex flex-col items-center">
          <div className="flex justify-center gap-0.5 sm:gap-1">
            <div className="flex gap-0.5 sm:gap-1">
              {FDI_NUMBERING.lowerRight.map(n => (
                <ToothSVG 
                  key={n} 
                  fdiNumber={n} 
                  entries={patientEntries} 
                  onClick={() => setSelectedTooth(n)}
                  isUpper={false}
                />
              ))}
            </div>
            <div className="w-px bg-slate-300 mx-1 sm:mx-2 self-stretch" />
            <div className="flex gap-0.5 sm:gap-1">
              {FDI_NUMBERING.lowerLeft.map(n => (
                <ToothSVG 
                  key={n} 
                  fdiNumber={n} 
                  entries={patientEntries} 
                  onClick={() => setSelectedTooth(n)}
                  isUpper={false}
                />
              ))}
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground mt-2">{t("patients.dentalChart.lowerArch")}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-200">
        {Object.entries(DENTAL_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div 
              className="w-4 h-4 rounded border border-slate-300" 
              style={{ backgroundColor: color }} 
            />
            <span className="text-xs font-medium text-gray-600">
              {t(`patients.dentalChart.status.${key}`, TOOTH_STATUS_LABELS[key as keyof typeof TOOTH_STATUS_LABELS] || key)}
            </span>
          </div>
        ))}
      </div>

      {/* Treatment Dialog */}
      <Dialog open={selectedTooth !== null} onOpenChange={(open) => !open && setSelectedTooth(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {selectedTooth}
              </span>
              {t("patients.dentalChart.tooth")} #{selectedTooth}
            </DialogTitle>
            <DialogDescription>{t("patients.dentalChart.subtitle")}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Surface Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t("patients.dentalChart.surfaces")}</Label>
              <div className="flex flex-wrap gap-2">
                {SURFACES.map(surface => (
                  <label 
                    key={surface}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
                      ${formData.surfaces.includes(surface) 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-white border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    <Checkbox 
                      checked={formData.surfaces.includes(surface)}
                      onCheckedChange={() => toggleSurface(surface)}
                    />
                    <span className="text-sm font-medium">{surface}</span>
                    <span className="text-xs text-muted-foreground">({t(`patients.dentalChart.surfaceLabels.${surface}`, SURFACE_LABELS[surface])})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Treatment Type */}
            <div className="space-y-2">
              <Label>{t("appointments.type")}</Label>
              <Select value={formData.treatmentType} onValueChange={(v) => setFormData({...formData, treatmentType: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DENTAL_COLORS.healthy }} />
                      {t("patients.dentalChart.status.healthy")}
                    </div>
                  </SelectItem>
                  <SelectItem value="cavity">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DENTAL_COLORS.cavity }} />
                      {t("patients.dentalChart.status.caries")}
                    </div>
                  </SelectItem>
                  <SelectItem value="filling">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DENTAL_COLORS.filling }} />
                      {t("patients.dentalChart.status.filling")}
                    </div>
                  </SelectItem>
                  <SelectItem value="crown">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DENTAL_COLORS.crown }} />
                      {t("patients.dentalChart.status.crown")}
                    </div>
                  </SelectItem>
                  <SelectItem value="extraction">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DENTAL_COLORS.extraction }} />
                      {t("patients.dentalChart.status.extracted")}
                    </div>
                  </SelectItem>
                  <SelectItem value="rootcanal">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DENTAL_COLORS.rootCanal }} />
                      {t("patients.dentalChart.status.root-canal")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>{t("appointments.status")}</Label>
              <Select value={formData.status} onValueChange={(v: "planned" | "completed") => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">{t("common.planned", "Planned")}</SelectItem>
                  <SelectItem value="completed">{t("patients.dentalChart.completed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{t("common.notes", "Notes")}</Label>
              <Textarea 
                placeholder={t("common.notesPlaceholder", "Add any additional notes...")}
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
              />
            </div>

            {/* Existing treatments for this tooth */}
            {selectedTooth && getToothHistory(selectedTooth).length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-sm text-muted-foreground">{t("patients.dentalChart.history")}</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {getToothHistory(selectedTooth).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{t(`patients.dentalChart.status.${entry.treatmentType.toLowerCase().replace(" ", "-")}`, entry.treatmentType)}</span>
                        <Badge variant="outline" className="text-[10px]">{entry.surfaces.join(', ')}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTooth(null)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Treatment History */}
      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {t("patients.dentalChart.history")}
          {patientEntries.length > 0 && (
            <Badge variant="secondary" className="text-xs">{patientEntries.length} {t("patients.dentalChart.records")}</Badge>
          )}
        </h3>
        <ScrollArea className="h-[200px] border rounded-lg p-4 bg-white">
          {patientEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("common.noData")}
            </p>
          ) : (
            <div className="space-y-3">
              {patientEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(entry => (
                  <div 
                    key={entry.id} 
                    className="flex justify-between items-start p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className="font-bold"
                          style={{ borderColor: entry.color, color: entry.color === '#000000' ? '#000' : entry.color }}
                        >
                          {t("patients.dentalChart.tooth")} #{entry.toothNumber}
                        </Badge>
                        <span className="font-medium text-sm capitalize">{t(`patients.dentalChart.status.${entry.treatmentType.toLowerCase().replace(" ", "-")}`, entry.treatmentType)}</span>
                        <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
                          {t(`patients.dentalChart.${entry.status}`, entry.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {t("patients.dentalChart.surfaces")}: {entry.surfaces.join(', ')}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{entry.notes}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
