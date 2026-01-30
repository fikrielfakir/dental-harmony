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
        width="28" 
        height="34" 
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
      color: colorMap[formData.treatmentType.toLowerCase().replace(/\s+/g, "")] || "#cbd5e1",
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
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{t("patients.dentalChart.title")}</h3>
        <p className="text-[10px] text-muted-foreground font-medium">{t("patients.dentalChart.subtitle")}</p>
      </div>
      
      <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3">
        <div className="flex flex-col gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {/* Upper Teeth */}
          <div className="flex flex-col items-center min-w-[450px] mx-auto space-y-2">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500 border-y border-slate-200/60 py-0.5 px-2">{t("patients.dentalChart.upperArch")}</span>
            <div className="flex justify-center gap-0.5">
              <div className="flex gap-0.5">
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
              <div className="w-px bg-slate-200 mx-1.5 self-stretch" />
              <div className="flex gap-0.5">
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

          <div className="border-t border-dashed border-slate-200 w-full min-w-[450px] mx-auto" />

          {/* Lower Teeth */}
          <div className="flex flex-col items-center min-w-[450px] mx-auto space-y-2">
            <div className="flex justify-center gap-0.5">
              <div className="flex gap-0.5">
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
              <div className="w-px bg-slate-200 mx-1.5 self-stretch" />
              <div className="flex gap-0.5">
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
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-500 border-y border-slate-200/60 py-0.5 px-2">{t("patients.dentalChart.lowerArch")}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2.5 justify-center py-2 px-2 bg-white rounded-lg border border-slate-100 shadow-sm">
        {Object.entries(DENTAL_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1">
            <div 
              className="w-2.5 h-2.5 rounded-full border border-slate-200 shadow-inner" 
              style={{ backgroundColor: color }} 
            />
            <span className="text-[9px] font-medium text-gray-700">
              {t(`patients.dentalChart.status.${key}`, TOOTH_STATUS_LABELS[key as keyof typeof TOOTH_STATUS_LABELS] || key)}
            </span>
          </div>
        ))}
      </div>

      {/* Treatment History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
            {t("patients.dentalChart.history")}
            {patientEntries.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                {patientEntries.length} {t("patients.dentalChart.records")}
              </Badge>
            )}
          </h3>
        </div>
        
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          {patientEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-slate-50/30">
              <p className="text-xs font-medium">{t("common.noData")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto scrollbar-thin">
              {patientEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(entry => (
                  <div 
                    key={entry.id} 
                    className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-100 bg-white font-bold text-xs shadow-sm" style={{ color: entry.color === '#000000' ? '#000' : entry.color }}>
                          #{entry.toothNumber}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-gray-900">
                            {t(`patients.dentalChart.status.${entry.treatmentType.toLowerCase().replace(" ", "-")}`, entry.treatmentType)}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[9px] h-4 px-1 leading-none border-slate-200 text-slate-500">
                              {entry.surfaces.join(', ')}
                            </Badge>
                            <span className={`text-[9px] font-medium px-1.5 py-0 rounded-full h-4 flex items-center ${entry.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                              {t(`patients.dentalChart.${entry.status}`, entry.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <time className="text-[10px] font-medium text-slate-400">
                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
