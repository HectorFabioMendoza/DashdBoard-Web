import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Database, 
  RefreshCw, 
  User,
  PieChart,
  Calendar,
  Search,
  Lock,
  Unlock,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon,
  BarChart3,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Crown,
  TrendingUp,
  TrendingDown,
  Package,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  Cell
} from 'recharts';

const CORRECT_PASSWORD = "JR2026"; // Contraseña de seguridad modificable

const MESES_CONFIG = [
  { id: 'Sep25', label: 'Sep 25', color: '#8b5cf6' }, // Morado
  { id: 'Oct25', label: 'Oct 25', color: '#00a3e0' }, // Cyan
  { id: 'Nov25', label: 'Nov 25', color: '#00ab84' }, // Teal
  { id: 'Dic25', label: 'Dic 25', color: '#6366f1' }, // Indigo
  { id: 'Enero', label: 'Ene 26', color: '#a855f7' }, // Morado brillante
  { id: 'Febrero', label: 'Feb 26', color: '#f97316' }, // Naranja
  { id: 'Marzo', label: 'Mar 26', color: '#ec4899' }, // Rosado/Fucsia
  { id: 'Abril', label: 'Abr 26', color: '#3182ce' }, // Azul
  { id: 'Mayo', label: 'May 26', color: '#10b981' },  // Verde
  { id: 'Junio', label: 'Jun 26', color: '#f43f5e' },  // Fucsia brillante
  { id: 'Julio', label: 'Jul 26', color: '#06b6d4' },  // Turquesa
  { id: 'Agosto', label: 'Ago 26', color: '#eab308' },  // Amarillo
  { id: 'Septiembre', label: 'Sep 26', color: '#8b5cf6' },
  { id: 'Octubre', label: 'Oct 26', color: '#00a3e0' },
  { id: 'Noviembre', label: 'Nov 26', color: '#00ab84' },
  { id: 'Diciembre', label: 'Dic 26', color: '#6366f1' }
];

// Helper to get Month ID from serial
const getMonthIdFromSerial = (serial: number): string | null => {
  if (isNaN(serial) || !serial) return null;
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  if (year === 2025) {
    if (month === 8) return 'Sep25';
    if (month === 9) return 'Oct25';
    if (month === 10) return 'Nov25';
    if (month === 11) return 'Dic25';
  } else if (year === 2026) {
    const months2026 = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    if (month >= 0 && month < 12) {
      return months2026[month];
    }
  }
  return null;
};

// Helper to get Month ID from row
const getMonthIdFromRow = (row: any): string | null => {
  return getMonthIdFromSerial(Number(row.fecha));
};

// Helper to get Month Label
const getMonthLabel = (monthId: string): string => {
  const found = MESES_CONFIG.find(m => m.id === monthId);
  return found ? found.label : monthId;
};

// Función para mapear nombres completos a formato corto "Primer Nombre + Primer Apellido"
const getShortNameWithLastName = (fullName: string) => {
  const mapping: Record<string, string> = {
    "JULIAN DAVID JARAMILLO": "JULIAN JARAMILLO",
    "MIGUEL ANGEL AGUDELO RAMIREZ": "MIGUEL AGUDELO",
    "JULIO ROMULO PEREZ": "JULIO PEREZ",
    "DIEGO ALEJANDRO TABA": "DIEGO TABA",
    "CLAUDIA PATRICIA CASTILLO": "CLAUDIA CASTILLO",
    "ALEXANDER BUITRAGO": "ALEXANDER BUITRAGO",
    "JHON STIVEN MENDOZA": "JHON MENDOZA",
    "JESUS EMILIO RAMIREZ": "JESUS RAMIREZ",
    "MIGUEL ANGEL ARENAS": "MIGUEL ARENAS",
    "REVELO": "REVELO",
    "PRINCIPAL": "PRINCIPAL"
  };
  if (mapping[fullName]) return mapping[fullName];
  
  const parts = fullName.split(' ').filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[2] || parts[1] || ''}`.trim();
  }
  return fullName;
};

// Función para capitalizar nombres a formato premium
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Función para convertir fecha serial de Excel a formato de texto DD/MM/AAAA
const formatExcelDate = (serial: number): string => {
  if (!serial) return '-';
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const jsDate = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  const day = String(jsDate.getUTCDate()).padStart(2, '0');
  const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
  const year = jsDate.getUTCFullYear();
  return `${day}/${month}/${year}`;
};


// Formateador financiero premium en Millones de COP ($X.XXX M / $XXX.XXX)
const formatMillionsValue = (valInMillions: number) => {
  const absVal = Math.abs(valInMillions);
  if (absVal >= 1.0) { // 1 Million or more
    const maxDec = absVal < 100 ? 1 : 0;
    return `$${valInMillions.toLocaleString('es-CO', {
      minimumFractionDigits: maxDec,
      maximumFractionDigits: maxDec
    })} M`;
  }
  if (absVal > 0.0) { // Less than 1 Million but greater than 0
    const valInPesos = valInMillions * 1000000;
    return `$${Math.round(valInPesos).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
  return "$0 M";
};

const formatMillionsCOP = (valInPesos: number) => {
  return formatMillionsValue(valInPesos / 1000000);
};

// Helper para parsear archivos de Excel en segundo plano usando un Web Worker
const parseExcelInWorker = (url: string, sheetName: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/excel.worker.js');
    worker.postMessage({ url, sheetName });
    
    worker.onmessage = (e) => {
      const { success, rows, error } = e.data;
      worker.terminate();
      if (success) {
        resolve(rows);
      } else {
        reject(new Error(error));
      }
    };
    
    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
  });
};

const formatAverageQty = (num: number) => {
  const parts = (Math.round(num * 10) / 10).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(',');
};

interface Advisor {
  id: string;
  name: string;
  Sep25: number;
  Oct25: number;
  Nov25: number;
  Dic25: number;
  Enero: number;
  Febrero: number;
  Marzo: number;
  Abril: number;
  Mayo?: number;
  Junio?: number;
  Julio?: number;
  Agosto?: number;
  Total_2026_Unicos: number;
  Total_General_Unicos: number;
}

// COMPONENTE DE TOOLTIP CUSTOMIZADO Y EJECUTIVO
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isDarkMode: boolean;
  type: 'cobertura-grupal' | 'cobertura-individual' | 'ventas' | 'lineas' | 'articulos' | 'inventario';
}

const CustomTooltip = ({ active, payload, label, isDarkMode, type }: CustomTooltipProps) => {
  if (active && payload && payload.length && payload[0]) {
    if ((type === 'ventas' || type === 'lineas' || type === 'articulos' || type === 'inventario') && !payload[0].payload) {
      return null;
    }
    return (
      <div className={`p-4 border rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 font-sans text-xs ${
        isDarkMode 
          ? 'bg-[#0f172a]/95 border-gray-800 text-gray-200 shadow-black/60' 
          : 'bg-white/95 border-gray-200/80 text-gray-800 shadow-slate-350/20 shadow-lg'
      }`}>
        {type === 'cobertura-grupal' && (
          <div className="space-y-1.5 font-semibold">
            <p className={`font-black uppercase tracking-widest text-[12px] border-b pb-1 mb-2 ${
              isDarkMode ? 'border-gray-800 text-gray-100' : 'border-gray-100 text-gray-900'
            }`}>
              Asesor: {label}
            </p>
            {payload.map((entry, idx) => (
              <p key={idx} className="flex items-center gap-4 justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.fill || entry.color }} />
                  {entry.name}:
                </span>
                <span className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {entry.value} <span className="text-[12px] font-normal text-gray-400">Clientes</span>
                </span>
              </p>
            ))}
          </div>
        )}

        {type === 'cobertura-individual' && (
          <div className="space-y-1.5 font-semibold">
            <p className={`font-black uppercase tracking-widest text-[12px] border-b pb-1 mb-2 ${
              isDarkMode ? 'border-gray-800 text-gray-100' : 'border-gray-100 text-gray-900'
            }`}>
              Periodo: {label}
            </p>
            <p className="flex items-center gap-6 justify-between">
              <span className="text-gray-400">Clientes Atendidos:</span>
              <span className="font-black text-sky-500 text-sm">
                {payload[0].value}
              </span>
            </p>
          </div>
        )}

        {type === 'ventas' && (
          <div className="space-y-1.5 font-semibold">
            <p className={`font-black uppercase tracking-widest text-[12px] border-b pb-1 mb-2 ${
              isDarkMode ? 'border-gray-800 text-gray-100' : 'border-gray-100 text-gray-900'
            }`}>
              Vendedor: {label}
            </p>
            <p className="flex items-center gap-6 justify-between">
              <span className="text-gray-400">Ventas Facturadas:</span>
              <span className="font-black text-emerald-500 text-[13px]">
                {formatMillionsCOP(payload[0].payload.salesRaw)}
              </span>
            </p>
            <p className="flex items-center gap-6 justify-between">
              <span className="text-gray-400">Clientes Activos:</span>
              <span className="font-black text-sky-500">
                {payload[0].payload.activeClients}
              </span>
            </p>
            <p className="flex items-center gap-6 justify-between">
              <span className="text-gray-400">Ticket Promedio:</span>
              <span className="font-black text-amber-500">
                {formatMillionsCOP(payload[0].payload.ticketAverage)}
              </span>
            </p>
            <p className={`flex items-center gap-6 justify-between border-t pt-1.5 ${
              isDarkMode ? 'border-gray-800' : 'border-gray-100'
            }`}>
              <span className="text-gray-400">Participación:</span>
              <span className="font-black text-indigo-400">
                {payload[0].payload.percentage}%
              </span>
            </p>
          </div>
        )}

        {type === 'lineas' && (
          <div className="space-y-1.5 font-semibold">
            <p className={`font-black uppercase tracking-widest text-[12px] border-b pb-1 mb-2 ${
              isDarkMode ? 'border-gray-800 text-gray-100' : 'border-gray-100 text-gray-900'
            }`}>
              Marca / Línea:
            </p>
            <p style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="font-black uppercase text-xs mb-2">
              {payload[0].payload.name}
            </p>
            <p className="flex items-center gap-6 justify-between border-t pt-1.5 border-gray-800/20">
              <span className="text-gray-400">Ventas Totales:</span>
              <span className="font-black text-emerald-500 text-[13px]">
                {formatMillionsCOP(payload[0].payload.salesRaw)}
              </span>
            </p>
          </div>
        )}

        {type === 'articulos' && (
          <div className="space-y-1.5 font-semibold">
            <p className={`font-black uppercase tracking-widest text-[12px] border-b pb-1 mb-2 ${
              isDarkMode ? 'border-gray-800 text-gray-100' : 'border-gray-100 text-gray-900'
            }`}>
              Artículo:
            </p>
            <p style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="font-black uppercase text-xs mb-1.5 truncate max-w-[200px]" title={payload[0].payload.name}>
              {payload[0].payload.name}
            </p>
            <p className="text-[10px] font-black text-slate-500 mb-2">
              REF: {payload[0].payload.articleRef}
            </p>
            <p className="flex items-center gap-6 justify-between border-t pt-1.5 border-gray-800/20">
              <span className="text-gray-400">Total Ventas:</span>
              <span className="font-black text-pink-500 text-[13px]">
                {formatMillionsCOP(payload[0].payload.salesRaw)}
              </span>
            </p>
            <p className="flex items-center gap-6 justify-between">
              <span className="text-gray-400">Cantidad Vendida:</span>
              <span className="font-black text-sky-500">
                {payload[0].payload.qty}
              </span>
            </p>
            <p className="flex items-center gap-6 justify-between">
              <span className="text-gray-400">Precio Promedio:</span>
              <span className="font-black text-amber-500">
                {formatMillionsCOP(payload[0].payload.avgPrice)}
              </span>
            </p>
          </div>
        )}

        {type === 'inventario' && (
          <div className="space-y-1.5 font-semibold">
            <p className={`font-black uppercase tracking-widest text-[12px] border-b pb-1 mb-2 ${
              isDarkMode ? 'border-gray-800 text-gray-100' : 'border-gray-100 text-gray-900'
            }`}>
              Línea: {label}
            </p>
            {payload.map((entry, idx) => (
              <p key={idx} className="flex items-center gap-4 justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.fill || entry.color }} />
                  {entry.name}:
                </span>
                <span className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {entry.value} <span className="text-[12px] font-normal text-gray-400">Artículos</span>
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CarteraSellersTooltip = ({ active, payload, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    const formatCOP = (val: number) => {
      return `$${Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    };
    const data = payload[0].payload;
    return (
      <div className={`p-4 border rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 font-sans text-xs ${
        isDarkMode 
          ? 'bg-[#0f172a]/95 border-gray-800 text-gray-200 shadow-black/60' 
          : 'bg-white/95 border-gray-200/80 text-gray-800 shadow-slate-350/20 shadow-lg'
      }`}>
        <p className={`font-black uppercase tracking-widest text-[12px] border-b pb-1 mb-2 ${
          isDarkMode ? 'border-gray-800 text-gray-100' : 'border-gray-100 text-gray-900'
        }`}>
          Vendedor: {data.vendedor}
        </p>
        <div className="space-y-1 font-semibold">
          <p className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#10b981]" />
              Corriente:
            </span>
            <span className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCOP(data.corriente)}
            </span>
          </p>
          <p className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#facc15]" />
              1-30 días:
            </span>
            <span className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCOP(data.range1_30)}
            </span>
          </p>
          <p className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#fb923c]" />
              31-60 días:
            </span>
            <span className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCOP(data.range31_60)}
            </span>
          </p>
          <p className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#ea580c]" />
              61-90 días:
            </span>
            <span className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCOP(data.range61_90)}
            </span>
          </p>
          <p className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#dc2626]" />
              &gt;90 días:
            </span>
            <span className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCOP(data.rangeOver90)}
            </span>
          </p>
          <p className="flex items-center gap-4 justify-between border-t pt-1.5 mt-1 border-gray-800/20 font-black">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Total Cartera:
            </span>
            <span className={isDarkMode ? 'text-[#a5b4fc]' : 'text-[#4f46e5]'}>
              {formatCOP(data.total)}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// --- SPARKLINE Y BENTO GRID HELPERS ---
interface SparklineProps {
  data: number[];
  color: string;
}

const Sparkline = ({ data, color }: SparklineProps) => {
  if (!data || data.length < 2) return null;
  const width = 80;
  const height = 18;
  const padding = 3;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, idx) => {
    const x = padding + (idx * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - ((val - min) * (height - 2 * padding)) / range;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="flex items-center justify-center h-full w-full">
      <svg width={width} height={height} className="overflow-visible">
        {/* Sparkline path - 2px minimalist */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Final node marker */}
        {(() => {
          const x = padding + ((data.length - 1) * (width - 2 * padding)) / (data.length - 1);
          const y = height - padding - ((data[data.length - 1] - min) * (height - 2 * padding)) / range;
          return <circle cx={x} cy={y} r="2" fill={color} />;
        })()}
      </svg>
    </div>
  );
};

const getCellClass = (value: number, avg: number, isDarkMode: boolean) => {
  if (avg === 0) {
    return value > 0 
      ? (isDarkMode 
          ? 'bg-[#14532D]/40 text-[#4ADE80] font-extrabold shadow-sm border border-[#16A34A]/25'
          : 'bg-[#DCFCE7] text-[#15803D] font-extrabold shadow-sm border border-[#16A34A]/25')
      : (isDarkMode 
          ? 'bg-[#78350F]/40 text-[#FCD34D] font-extrabold shadow-sm border border-[#F59E0B]/25'
          : 'bg-[#FEF3C7] text-[#B45309] font-extrabold shadow-sm border border-[#F59E0B]/25');
  }

  const deviation = (value - avg) / avg;

  if (deviation > 0.04) {
    return isDarkMode 
      ? 'bg-[#14532D]/40 text-[#4ADE80] font-extrabold shadow-sm border border-[#16A34A]/25'
      : 'bg-[#DCFCE7] text-[#15803D] font-extrabold shadow-sm border border-[#16A34A]/25';
  } else if (deviation < -0.04) {
    return isDarkMode
      ? 'bg-[#7F1D1D]/40 text-[#FCA5A5] font-extrabold shadow-sm border border-[#EF4444]/25'
      : 'bg-[#FEE2E2] text-[#B91C1C] font-extrabold shadow-sm border border-[#EF4444]/25';
  } else {
    return isDarkMode
      ? 'bg-[#78350F]/40 text-[#FCD34D] font-extrabold shadow-sm border border-[#F59E0B]/25'
      : 'bg-[#FEF3C7] text-[#B45309] font-extrabold shadow-sm border border-[#F59E0B]/25';
  }
};


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Por defecto modo claro

  // Estados dinámicos cargados del Excel
  const [advisorsData, setAdvisorsData] = useState<Advisor[]>([]);
  const [rawExcelRows, setRawExcelRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [lastUpdateDate, setLastUpdateDate] = useState('');
  const [lastDatabaseSync, setLastDatabaseSync] = useState('');

  // Nuevos estados para el archivo "Ventas por linea.xlsx"
  const [rawLinesRows, setRawLinesRows] = useState<any[]>([]);
  const [linesLoading, setLinesLoading] = useState(true);

  // Estados para el archivo "Inventario.xlsx"
  const [rawInventoryRows, setRawInventoryRows] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryLineFilter, setInventoryLineFilter] = useState('TODAS');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('TODOS');
  const [inventoryListPage, setInventoryListPage] = useState(1);
  const [inventoryPageSize, setInventoryPageSize] = useState(50);

  // Estados para el archivo "Cartera.xlsx"
  const [rawCarteraClientes, setRawCarteraClientes] = useState<any[]>([]);
  const [rawCarteraDocumentos, setRawCarteraDocumentos] = useState<any[]>([]);
  const [carteraLoading, setCarteraLoading] = useState(true);
  const [carteraSearchQuery, setCarteraSearchQuery] = useState('');
  const [carteraVendedorFilter, setCarteraVendedorFilter] = useState('TODOS');
  const [carteraStatusFilter, setCarteraStatusFilter] = useState('TODOS'); // 'TODOS' | 'MORA' | 'CORRIENTE'
  const [carteraAgingFilter, setCarteraAgingFilter] = useState<'TODOS' | 'current' | 'range1_30' | 'range31_60' | 'range61_90' | 'rangeOver90'>('TODOS');
  const [carteraSelectedCliente, setCarteraSelectedCliente] = useState<any | null>(null);
  const [carteraListPage, setCarteraListPage] = useState(1);
  const [carteraPageSize, setCarteraPageSize] = useState(30);
  const [carteraSortColumn, setCarteraSortColumn] = useState<'nombre' | 'prioridadScore' | 'cupo_asignado' | 'saldo_total' | 'saldo_vencido' | 'mora_maxima'>('prioridadScore');
  const [carteraSortDirection, setCarteraSortDirection] = useState<'asc' | 'desc'>('desc');
  const [carteraExcludedClientes, setCarteraExcludedClientes] = useState<string[]>([]);
  const [carteraKpisCollapsed, setCarteraKpisCollapsed] = useState(false);

  const [selectedMonths, setSelectedMonths] = useState<string[]>(MESES_CONFIG.map(m => m.id));
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'cobertura' | 'ventas' | 'unicos' | 'frecuencia' | 'tendencias' | 'asesor' | 'lineas' | 'articulos' | 'inventario' | 'cartera'>('cobertura');

  const MAESTRA_MESES = useMemo(() => {
    const chronologicalOrder = ['Sep25', 'Oct25', 'Nov25', 'Dic25', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto'];
    if (advisorsData.length === 0) {
      return ['Sep25', 'Oct25', 'Nov25', 'Dic25', 'Enero', 'Febrero', 'Marzo', 'Abril'];
    }
    return chronologicalOrder.filter(monthId => {
      return advisorsData.some(adv => {
        const val = (adv as any)[monthId];
        return typeof val === 'number' && val > 0;
      });
    });
  }, [advisorsData]);

  const selectedMaestraMonths = useMemo(() => {
    return selectedMonths.filter(m => MAESTRA_MESES.includes(m));
  }, [selectedMonths, MAESTRA_MESES]);

  const tableMonths = useMemo(() => {
    // Ordenar los meses seleccionados cronológicamente según MESES_CONFIG
    return [...selectedMaestraMonths].sort((a, b) => {
      const idxA = MESES_CONFIG.findIndex(m => m.id === a);
      const idxB = MESES_CONFIG.findIndex(m => m.id === b);
      return idxA - idxB;
    });
  }, [selectedMaestraMonths]);

  const activeDatasetMonths = useMemo(() => {
    const months = new Set<string>();
    const chronologicalOrder = ['Sep25', 'Oct25', 'Nov25', 'Dic25', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto'];
    chronologicalOrder.forEach(m => {
      const hasData = advisorsData.some(adv => typeof (adv as any)[m] === 'number' && ((adv as any)[m] as number) > 0);
      if (hasData) {
        months.add(m);
      }
    });

    rawLinesRows.forEach(row => {
      const monthId = getMonthIdFromRow(row);
      if (monthId) {
        months.add(monthId);
      }
    });

    return months;
  }, [advisorsData, rawLinesRows]);

  const visibleMonthsConfig = useMemo(() => {
    if (activeDatasetMonths.size === 0) {
      return MESES_CONFIG.filter(m => ['Sep25', 'Oct25', 'Nov25', 'Dic25', 'Enero', 'Febrero', 'Marzo', 'Abril'].includes(m.id));
    }
    return MESES_CONFIG.filter(m => activeDatasetMonths.has(m.id));
  }, [activeDatasetMonths]);

  // Agrupar los meses visibles por año
  const monthsByYear = useMemo(() => {
    const groups: Record<string, typeof visibleMonthsConfig> = {};
    visibleMonthsConfig.forEach(m => {
      const parts = m.label.split(' ');
      const yearSuffix = parts[parts.length - 1]; // "25" o "26"
      const yearName = yearSuffix === '25' ? '2025' : '2026';
      if (!groups[yearName]) {
        groups[yearName] = [];
      }
      groups[yearName].push(m);
    });
    return groups;
  }, [visibleMonthsConfig]);

  // Prefiltrar automáticamente los últimos 3 o 4 meses según la presencia del mes en curso
  const [hasPrefiltered, setHasPrefiltered] = useState(false);
  useEffect(() => {
    if (!hasPrefiltered && !loading && !linesLoading && visibleMonthsConfig.length > 0) {
      const monthsSpanish = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const currentMonthIndex = new Date().getMonth(); // 0 = Enero, 5 = Junio
      const currentMonthName = monthsSpanish[currentMonthIndex];
      
      const hasCurrentMonth = visibleMonthsConfig.some(m => m.id === currentMonthName);
      const sliceCount = hasCurrentMonth ? -4 : -3;
      
      const defaultSelected = visibleMonthsConfig.slice(sliceCount).map(m => m.id);
      setSelectedMonths(defaultSelected);
      setHasPrefiltered(true);
    }
  }, [visibleMonthsConfig, loading, linesLoading, hasPrefiltered]);


  const lastMonth = tableMonths[tableMonths.length - 1];
  const prevMonth = tableMonths[tableMonths.length - 2];
  const lastMonthLabel = lastMonth ? getMonthLabel(lastMonth).split(' ')[0] : '';
  const prevMonthLabel = prevMonth ? getMonthLabel(prevMonth).split(' ')[0] : '';
  const variationHeaderLabel = lastMonth && prevMonth ? `Variación ${lastMonthLabel} vs ${prevMonthLabel}` : 'Variación';

  // Estados de navegación del nuevo Sidebar SaaS
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Estado para la gráfica individual de tendencia
  const [selectedIndividualVendor, setSelectedIndividualVendor] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Estados para la pestaña de Frecuencia de Compra - Detalle Operativo de Clientes
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<'Saludable' | 'Atención' | 'Riesgo' | 'Perdido' | 'TODOS'>('TODOS');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientListPage, setClientListPage] = useState(1);

  // Estados locales para las nuevas pestañas (Líneas y Artículos)
  const [lineSearchQuery, setLineSearchQuery] = useState('');
  const [selectedCommercialLines, setSelectedCommercialLines] = useState<string[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedLineFilter, setSelectedLineFilter] = useState('TODAS');
  const [selectedClientFilter, setSelectedClientFilter] = useState('TODOS');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientFilterSearchQuery, setClientFilterSearchQuery] = useState('');
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [articleListPage, setArticleListPage] = useState(1);

  // Estado para el candado de seguridad de datos financieros (Ventas por Vendedor y Tendencias)
  const [isFinancialDataUnlocked, setIsFinancialDataUnlocked] = useState(false);
  const [showFinancialUnlockModal, setShowFinancialUnlockModal] = useState(false);
  const [financialPassword, setFinancialPassword] = useState('');
  const [financialPasswordError, setFinancialPasswordError] = useState('');

  const handleFinancialLockToggle = () => {
    if (isFinancialDataUnlocked) {
      setIsFinancialDataUnlocked(false);
      if (activeTab === 'ventas' || activeTab === 'tendencias') {
        setActiveTab('cobertura');
      }
    } else {
      setFinancialPassword('');
      setFinancialPasswordError('');
      setShowFinancialUnlockModal(true);
    }
  };



  // 1. Cargar el Excel local de forma automática al iniciar la página
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchAndParseExcel = async () => {
      try {
        setLoading(true);

        // Intentar cargar la fecha de última sincronización desde la base de datos
        try {
          const syncResponse = await fetch('/last_update.json?t=' + Date.now());
          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            if (syncData && syncData.last_update) {
              setLastDatabaseSync(syncData.last_update);
            }
          }
        } catch (syncError) {
          console.warn('No se pudo obtener la fecha de sincronización del archivo last_update.json:', syncError);
        }

        const rows = await parseExcelInWorker('/1Maestra de clientes2026.xlsx?t=' + Date.now(), 'Maestra de Clientes');
        setRawExcelRows(rows);

        // Calcular la fecha del último registro
        if (rows && rows.length > 0) {
          let maxSerial = 0;
          rows.forEach((r: any) => {
            const f = Number(r.fecha);
            if (f && f > maxSerial) {
              maxSerial = f;
            }
          });
          if (maxSerial > 0) {
            setLastUpdateDate(formatExcelDate(maxSerial));
          }
        }

        // Agrupación y mapeo dinámico de datos de asesores
        const advisorsMap: Record<string, {
          id: string;
          name: string;
          Sep25: Set<string>;
          Oct25: Set<string>;
          Nov25: Set<string>;
          Dic25: Set<string>;
          Enero: Set<string>;
          Febrero: Set<string>;
          Marzo: Set<string>;
          Abril: Set<string>;
          Mayo: Set<string>;
          Junio: Set<string>;
          Julio: Set<string>;
          Agosto: Set<string>;
          clients2026: Set<string>;
          clientsGeneral: Set<string>;
          [key: string]: string | Set<string>;
        }> = {};

        rows.forEach(row => {
          let rawVendedor = row.vendedor;
          if (!rawVendedor) return;
          
          rawVendedor = rawVendedor.trim();
          let id = rawVendedor.substring(0, 2);
          let name = rawVendedor.substring(3).trim();
          
          if (id === '01') {
            id = 'PR';
            name = 'PRINCIPAL';
          }
          
          if (!advisorsMap[id]) {
            advisorsMap[id] = {
              id,
              name,
              Sep25: new Set(),
              Oct25: new Set(),
              Nov25: new Set(),
              Dic25: new Set(),
              Enero: new Set(),
              Febrero: new Set(),
              Marzo: new Set(),
              Abril: new Set(),
              Mayo: new Set(),
              Junio: new Set(),
              Julio: new Set(),
              Agosto: new Set(),
              clients2026: new Set(),
              clientsGeneral: new Set()
            };
          }
          
          const clientCode = row.cod_client ? String(row.cod_client).trim() : '';
          if (clientCode === '222222222222' || clientCode === '222222') return;
          const mes = row.Mes;
          const tipo = row.Tipo;
          if (!clientCode || !mes || !tipo) return;
          
          if (!['FE', 'CT'].includes(tipo)) return;

          const mappedMonth = getMonthIdFromRow(row);
          if (mappedMonth && advisorsMap[id][mappedMonth]) {
            (advisorsMap[id][mappedMonth] as Set<string>).add(clientCode);
          }
          
          const is2026Month = !['Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].includes(mes);
          if (is2026Month) {
            advisorsMap[id].clients2026.add(clientCode);
          }
          
          advisorsMap[id].clientsGeneral.add(clientCode);
        });

        // Convertimos a array compatible
        const advisorsArray = Object.values(advisorsMap).map(adv => {
          return {
            id: adv.id,
            name: adv.name,
            Sep25: adv.Sep25.size,
            Oct25: adv.Oct25.size,
            Nov25: adv.Nov25.size,
            Dic25: adv.Dic25.size,
            Enero: adv.Enero.size,
            Febrero: adv.Febrero.size,
            Marzo: adv.Marzo.size,
            Abril: adv.Abril.size,
            Mayo: adv.Mayo.size,
            Junio: adv.Junio.size,
            Julio: adv.Julio.size,
            Agosto: adv.Agosto.size,
            Total_2026_Unicos: adv.clients2026.size,
            Total_General_Unicos: adv.clientsGeneral.size
          };
        }).sort((a, b) => b.Total_2026_Unicos - a.Total_2026_Unicos);

        setAdvisorsData(advisorsArray);
        setSelectedVendors(advisorsArray.map(a => a.name));
        setSelectedIndividualVendor(advisorsArray[0]?.name || '');
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setLoadingError(err.message || 'Error al descargar o leer la Maestra de Clientes en Excel.');
        setLoading(false);
      }
    };

    fetchAndParseExcel();
  }, [reloadTrigger, isLoggedIn]);

  // 1b. Cargar el Excel de Ventas por línea en segundo plano
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchAndParseLinesExcel = async () => {
      try {
        setLinesLoading(true);
        const rows = await parseExcelInWorker('/Ventas por linea.xlsx?t=' + Date.now(), 'IN38C_1_VtasxVendedor_LINEA_Doc');
        setRawLinesRows(rows);
        const uniqueLines = Array.from(new Set(rows.map((r: any) => String(r.code01 || 'Sin Descripción'))));
        setSelectedCommercialLines(uniqueLines as string[]);
        const uniqueArticles = Array.from(new Set(rows.map((r: any) => String(r.articulo || 'Sin Nombre'))));
        setSelectedArticles(uniqueArticles as string[]);
        setLinesLoading(false);
      } catch (err: any) {
        console.error('Error al cargar Ventas por línea:', err);
        setLinesLoading(false);
      }
    };

    fetchAndParseLinesExcel();
  }, [reloadTrigger, isLoggedIn]);

  // Cargar el Excel de Inventario en segundo plano
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchAndParseInventoryExcel = async () => {
      try {
        setInventoryLoading(true);
        const rows = await parseExcelInWorker('/Inventario.xlsx?t=' + Date.now(), 'Inventario');
        setRawInventoryRows(rows);
        setInventoryLoading(false);
      } catch (err: any) {
        console.error('Error al cargar Inventario:', err);
        setInventoryLoading(false);
      }
    };

    fetchAndParseInventoryExcel();
  }, [reloadTrigger, isLoggedIn]);

  // Cargar el Excel de Cartera en segundo plano
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchAndParseCarteraExcel = async () => {
      try {
        setCarteraLoading(true);
        const clientesRows = await parseExcelInWorker('/Cartera.xlsx?t=' + Date.now(), 'Resumen_Clientes');
        const documentosRows = await parseExcelInWorker('/Cartera.xlsx?t=' + Date.now(), 'Detalle_Documentos');
        setRawCarteraClientes(clientesRows);
        setRawCarteraDocumentos(documentosRows);
        setCarteraLoading(false);
      } catch (err: any) {
        console.error('Error al cargar Cartera:', err);
        setCarteraLoading(false);
      }
    };

    fetchAndParseCarteraExcel();
  }, [reloadTrigger, isLoggedIn]);

  // Verificar estado de sesión y tema guardados localmente
  useEffect(() => {
    const session = localStorage.getItem('jr_session');
    if (session === 'active') {
      setIsLoggedIn(true);
    }
    const savedTheme = localStorage.getItem('jr_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Sincronizar clase 'dark' con el elemento raíz para estilos Tailwind y variables CSS
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
      if (rememberMe) {
        localStorage.setItem('jr_session', 'active');
      }
    } else {
      setLoginError('Contraseña incorrecta. Inténtalo de nuevo.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    localStorage.removeItem('jr_session');
  };

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    localStorage.setItem('jr_theme', nextTheme ? 'dark' : 'light');
  };

  const downloadClientsExcel = () => {
    if (filteredClients.length === 0) return;

    // Preparar datos para Excel
    const data = filteredClients.map(c => ({
      'Código': c.clientCode,
      'Nombre del Cliente': c.clientName,
      'Asesor Responsable': c.sellerName,
      'Última Compra': formatExcelDate(c.lastDateSerial),
      'Estado': c.category,
      'Días de Inactividad': c.inactivityDays
    }));

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

    // Descargar
    XLSX.writeFile(workbook, `Clientes_${selectedRiskCategory}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getDynamicUnique = (advisor: Advisor, months: string[]) => {
    if (months.length === 0) return 0;
    
    const hasOnly2026 = months.every(m => ['Enero', 'Febrero', 'Marzo', 'Abril'].includes(m));
    const hasAllMonths = months.length === 8;
    const hasNoSep = months.length === 7 && !months.includes('Sep25');

    if (hasOnly2026 && months.length === 4) {
      return advisor.Total_2026_Unicos;
    }
    if (hasAllMonths) {
      return advisor.Total_General_Unicos;
    }
    if (hasNoSep) {
      return Math.round(advisor.Total_General_Unicos * 0.94);
    }

    const sumVal = months.reduce((a, b) => a + (Number((advisor as any)[b]) || 0), 0);
    const maxVal = Math.max(...months.map(m => Number((advisor as any)[m]) || 0));
    const scale = maxVal + (sumVal - maxVal) * 0.32;
    return Math.round(Math.min(scale, advisor.Total_General_Unicos));
  };

  const processedAdvisors = useMemo(() => {
    return advisorsData.map(adv => {
      const dynamicCoverage = getDynamicUnique(adv, selectedMaestraMonths);
      return {
        ...adv,
        dynamicCoverage
      };
    }).filter(adv => 
      selectedVendors.includes(adv.name) &&
      adv.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.dynamicCoverage - a.dynamicCoverage) as (Advisor & { dynamicCoverage: number })[];
  }, [selectedMaestraMonths, selectedVendors, searchQuery, advisorsData]);

  // 2b. LÓGICA DE FILTRADO Y CÁLCULO PARA LA SEGUNDA FUENTE (Ventas por Línea y Artículos)
  
  // Transacciones base filtradas por los filtros globales de la barra lateral (Meses y Vendedores)
  const filteredLinesTransactions = useMemo(() => {
    if (!rawLinesRows || rawLinesRows.length === 0) return [];

    const cleanVendorNameLocal = (v?: any) => {
      if (!v) return '';
      return String(v).replace(/^\d+\s+/, '').trim().toUpperCase();
    };

    const getMonthIdFromSerialLocal = (serial: number) => {
      return getMonthIdFromSerial(serial);
    };

    const vendorsSet = new Set(selectedVendors);
    const monthsSet = new Set(selectedMonths);

    return rawLinesRows.filter(row => {
      const vName = cleanVendorNameLocal(row.vendedor);
      const monthId = getMonthIdFromSerialLocal(row.fecha);
      const passesVendor = vendorsSet.has(vName);
      const passesMonth = monthId && monthsSet.has(monthId);
      return passesVendor && passesMonth;
    });
  }, [rawLinesRows, selectedVendors, selectedMonths]);

  // --- CÁLCULOS DEL MÓDULO DE INVENTARIOS ---
  
  // Calcular velocidad de venta por producto utilizando las transacciones filtradas por la barra lateral
  const productSalesVelocityMap = useMemo(() => {
    // 1. Encontrar el serial de fecha más alto en todo el dataset para determinar el mes actual en curso
    let maxSerial = 0;
    if (rawLinesRows && rawLinesRows.length > 0) {
      rawLinesRows.forEach(row => {
        const s = Number(row.fecha);
        if (s > maxSerial) maxSerial = s;
      });
    }

    let currentMonthId: string | null = null;
    let currentMonthProportion = 1.0;

    if (maxSerial > 0) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const latestDate = new Date(excelEpoch.getTime() + maxSerial * 24 * 60 * 60 * 1000);
      currentMonthId = getMonthIdFromSerial(maxSerial);
      if (currentMonthId) {
        const day = latestDate.getUTCDate();
        const year = latestDate.getUTCFullYear();
        const month = latestDate.getUTCMonth(); // 0-indexed
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        // Asegurar que al menos contamos 1 día para evitar división por cero
        currentMonthProportion = Math.max(1, day) / totalDaysInMonth;
      }
    }

    // 2. Contar meses únicos en el set filtrado
    const months = new Set<string>();
    filteredLinesTransactions.forEach(row => {
      const monthId = getMonthIdFromRow(row);
      if (monthId) months.add(monthId);
    });

    // 3. Sumar el divisor proporcional
    let divisor = 0;
    months.forEach(monthId => {
      if (monthId === currentMonthId) {
        divisor += currentMonthProportion;
      } else {
        divisor += 1.0;
      }
    });

    if (divisor < 0.05) divisor = 1.0;

    // Sumar cantidad por producto
    const qtyMap: Record<string, number> = {};
    filteredLinesTransactions.forEach(row => {
      // Normalizamos la referencia quitando ceros a la izquierda para evitar problemas de compatibilidad
      const ref = String(row.ref || '').trim().replace(/^0+/, '');
      const cant = Number(row.cant || 0);
      if (ref) {
        qtyMap[ref] = (qtyMap[ref] || 0) + cant;
      }
    });

    // Dividir por el divisor común
    const velocityMap: Record<string, number> = {};
    Object.entries(qtyMap).forEach(([ref, qty]) => {
      velocityMap[ref] = qty / divisor;
    });

    return velocityMap;
  }, [filteredLinesTransactions, rawLinesRows]);

  const processedInventory = useMemo(() => {
    if (!rawInventoryRows || rawInventoryRows.length === 0) return [];
    
    return rawInventoryRows.map(row => {
      const cod = String(row.cod_item || '').trim();
      const referencia = String(row.referencia || '').trim();
      const descrip = String(row.articulo || '').trim();
      const linea = String(row.linea || '').trim();
      const unimed = String(row.unimed || 'UND').trim();
      const stock = Number(row.stock_actual || 0);
      const min = Number(row.stock_min || 0);
      const max = Number(row.stock_max || 0);
      const lista4 = Number(row.lista4 || 0);
      const lista5 = Number(row.lista5 || 0);
      
      // Normalizamos el código del inventario quitando ceros a la izquierda
      const cleanCod = cod.replace(/^0+/, '');
      const salesVelocity = productSalesVelocityMap[cleanCod] || 0;
      const priorityScore = salesVelocity / (stock + 1);
      
      const dailySales = salesVelocity / 30;
      const coverageDays = dailySales > 0 ? stock / dailySales : 999;
      
      let status: 'Agotado' | 'Riesgo' | 'Atención' | 'Saludable' = 'Saludable';
      if (stock <= 0) {
        status = 'Agotado';
      } else if (stock > 0 && salesVelocity > 0 && coverageDays <= 15) {
        status = 'Riesgo';
      } else if (stock > 0 && salesVelocity > 0 && coverageDays <= 30) {
        status = 'Atención';
      }
      
      return {
        cod,
        referencia,
        descrip,
        linea,
        unimed,
        stock,
        min,
        max,
        salesVelocity,
        priorityScore,
        status,
        coverageDays,
        lista4,
        lista5
      };
    });
  }, [rawInventoryRows, productSalesVelocityMap]);

  const inventoryLines = useMemo(() => {
    const lines = new Set<string>();
    processedInventory.forEach(item => {
      if (item.linea) lines.add(item.linea);
    });
    return ['TODAS', ...Array.from(lines).sort()];
  }, [processedInventory]);

  const filteredInventory = useMemo(() => {
    let result = [...processedInventory];
    
    if (inventorySearchQuery.trim()) {
      const q = inventorySearchQuery.toLowerCase();
      result = result.filter(item => 
        item.cod.toLowerCase().includes(q) || 
        item.referencia.toLowerCase().includes(q) || 
        item.descrip.toLowerCase().includes(q)
      );
    }
    
    if (inventoryLineFilter !== 'TODAS') {
      result = result.filter(item => item.linea === inventoryLineFilter);
    }
    
    if (inventoryStatusFilter !== 'TODOS') {
      result = result.filter(item => item.status === inventoryStatusFilter);
    }
    
    result.sort((a, b) => b.priorityScore - a.priorityScore);
    
    return result;
  }, [processedInventory, inventorySearchQuery, inventoryLineFilter, inventoryStatusFilter]);

  const inventoryTotalPages = Math.ceil(filteredInventory.length / inventoryPageSize) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (inventoryListPage - 1) * inventoryPageSize;
    return filteredInventory.slice(start, start + inventoryPageSize);
  }, [filteredInventory, inventoryListPage, inventoryPageSize]);

  const inventoryKPIs = useMemo(() => {
    let totalAlerts = 0;
    let outOfStock = 0;
    let riskStock = 0;
    let attentionStock = 0;
    let healthyStock = 0;
    let totalStockCoverageDaysSum = 0;
    let itemsWithSales = 0;
    
    // Filtrar por la línea comercial seleccionada y por el buscador local
    const targetItems = processedInventory.filter(item => {
      const passesLine = inventoryLineFilter === 'TODAS' || item.linea === inventoryLineFilter;
      const passesSearch = !inventorySearchQuery.trim() || 
        item.cod.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
        item.descrip.toLowerCase().includes(inventorySearchQuery.toLowerCase());
      return passesLine && passesSearch;
    });

    targetItems.forEach(item => {
      // Solo consideramos alertas de stock críticas si el producto tiene ventas promedio activas
      if (item.salesVelocity > 0) {
        if (item.status === 'Agotado') {
          outOfStock++;
          totalAlerts++;
        } else if (item.status === 'Riesgo') {
          riskStock++;
          totalAlerts++;
        } else if (item.status === 'Atención') {
          attentionStock++;
        } else {
          healthyStock++;
        }
      } else {
        // Ítems sin ventas registradas se consideran estables/saludables en alertas
        healthyStock++;
      }
      
      if (item.salesVelocity > 0) {
        itemsWithSales++;
        totalStockCoverageDaysSum += Math.min(365, item.coverageDays);
      }
    });
    
    const avgCoverage = itemsWithSales > 0 ? Math.round(totalStockCoverageDaysSum / itemsWithSales) : 0;
    
    return {
      totalAlerts,
      outOfStock,
      riskStock,
      attentionStock,
      healthyStock,
      avgCoverage
    };
  }, [processedInventory, inventoryLineFilter, inventorySearchQuery]);

  // =========================================================================
  // MEMOIZACIÓN PARA MÓDULO DE CARTERA
  // =========================================================================
  const carteraKPIs = useMemo(() => {
    const filteredClientes = rawCarteraClientes.filter(c => {
      const matchesSearch = !carteraSearchQuery ||
        String(c.nombre).toLowerCase().includes(carteraSearchQuery.toLowerCase()) ||
        String(c.nit).toLowerCase().includes(carteraSearchQuery.toLowerCase()) ||
        String(c.cod_benf).toLowerCase().includes(carteraSearchQuery.toLowerCase());
        
      const matchesVend = carteraVendedorFilter === 'TODOS' ||
        String(c.nombre_vend) === carteraVendedorFilter ||
        String(c.cod_vend) === carteraVendedorFilter;

      const matchesSidebarVendors = selectedVendors.includes(String(c.nombre_vend));

      let matchesStatus = true;
      if (carteraStatusFilter === 'MORA') {
        matchesStatus = Number(c.saldo_vencido) > 1.0;
      } else if (carteraStatusFilter === 'CORRIENTE') {
        matchesStatus = Number(c.saldo_vencido) <= 1.0;
      }

      return matchesSearch && matchesVend && matchesSidebarVendors && matchesStatus;
    });

    const filteredClientCodes = new Set(filteredClientes.map(c => String(c.cod_benf)));
    const filteredDocs = rawCarteraDocumentos.filter(d => filteredClientCodes.has(String(d.cod_benf)));

    let totalCartera = 0;
    let totalMora = 0;
    let totalCupoAsignado = 0;
    let totalCupoDisponible = 0;
    
    filteredClientes.forEach(c => {
      // Excluir del cómputo de KPIs si el cliente está desmarcado
      if (!carteraExcludedClientes.includes(String(c.cod_benf))) {
        totalCartera += Number(c.saldo_total || 0);
        totalMora += Number(c.saldo_vencido || 0);
        totalCupoAsignado += Number(c.cupo_asignado || 0);
        totalCupoDisponible += Number(c.cupo_disponible || 0);
      }
    });

    let current = 0;
    let range1_30 = 0;
    let range31_60 = 0;
    let range61_90 = 0;
    let rangeOver90 = 0;

    filteredDocs.forEach(d => {
      // Excluir de la distribución de vencimientos si el cliente está desmarcado
      if (!carteraExcludedClientes.includes(String(d.cod_benf))) {
        const saldo = Number(d.saldo || 0);
        const mora = Number(d.dias_mora || 0);
        if (d.estado === 'Corriente' || mora === 0) {
          current += saldo;
        } else if (mora >= 1 && mora <= 30) {
          range1_30 += saldo;
        } else if (mora >= 31 && mora <= 60) {
          range31_60 += saldo;
        } else if (mora >= 61 && mora <= 90) {
          range61_90 += saldo;
        } else if (mora > 90) {
          rangeOver90 += saldo;
        }
      }
    });

    // Mapeo de documentos por cliente para verificación de Aging
    const clientDocsMap = new Map<string, any[]>();
    rawCarteraDocumentos.forEach(d => {
      const key = String(d.cod_benf);
      if (!clientDocsMap.has(key)) clientDocsMap.set(key, []);
      clientDocsMap.get(key)!.push(d);
    });

    const clientMatchesAging = (codBenf: string) => {
      if (carteraAgingFilter === 'TODOS') return true;
      const docs = clientDocsMap.get(String(codBenf)) || [];
      return docs.some(d => {
        const saldo = Number(d.saldo || 0);
        if (saldo <= 0) return false;
        const mora = Number(d.dias_mora || 0);
        if (carteraAgingFilter === 'current') {
          return d.estado === 'Corriente' || mora === 0;
        } else if (carteraAgingFilter === 'range1_30') {
          return mora >= 1 && mora <= 30;
        } else if (carteraAgingFilter === 'range31_60') {
          return mora >= 31 && mora <= 60;
        } else if (carteraAgingFilter === 'range61_90') {
          return mora >= 61 && mora <= 90;
        } else if (carteraAgingFilter === 'rangeOver90') {
          return mora > 90;
        }
        return false;
      });
    };

    // Agregar score de prioridad y estado 'checked'
    const clientsWithPriority = filteredClientes.map(c => {
      const score = Number(c.saldo_vencido || 0) * (Number(c.mora_maxima || 0) + 1);
      const isChecked = !carteraExcludedClientes.includes(String(c.cod_benf));
      return { ...c, prioridadScore: score, checked: isChecked };
    });

    const finalClientes = clientsWithPriority.filter(c => clientMatchesAging(c.cod_benf));
    
    // Ordenar dinámicamente por la columna y dirección seleccionadas
    const sortedClientes = finalClientes.sort((a, b) => {
      let valA = a[carteraSortColumn];
      let valB = b[carteraSortColumn];

      if (carteraSortColumn === 'nombre') {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        if (valA < valB) return carteraSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return carteraSortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      const numA = Number(valA || 0);
      const numB = Number(valB || 0);
      return carteraSortDirection === 'asc' ? numA - numB : numB - numA;
    });

    const isAllChecked = sortedClientes.length > 0 && sortedClientes.every(c => c.checked);

    return {
      filteredClientes,
      filteredDocs,
      sortedClientes,
      isAllChecked,
      totalCartera,
      totalMora,
      moraPercent: totalCartera > 0 ? (totalMora / totalCartera) * 100 : 0,
      totalCupoAsignado,
      totalCupoDisponible,
      aging: {
        current,
        range1_30,
        range31_60,
        range61_90,
        rangeOver90
      }
    };
  }, [rawCarteraClientes, rawCarteraDocumentos, carteraSearchQuery, carteraVendedorFilter, selectedVendors, carteraStatusFilter, carteraAgingFilter, carteraSortColumn, carteraSortDirection, carteraExcludedClientes]);

  const carteraVendedores = useMemo(() => {
    const list = rawCarteraClientes.map(c => String(c.nombre_vend || 'Sin Vendedor'));
    return Array.from(new Set(list)).filter(x => x.trim() !== '').sort();
  }, [rawCarteraClientes]);

  const carteraSellersChartData = useMemo(() => {
    if (rawCarteraClientes.length === 0) return [];

    const clientToSellerMap = new Map<string, string>();
    rawCarteraClientes.forEach(c => {
      clientToSellerMap.set(String(c.cod_benf), String(c.nombre_vend || 'Sin Vendedor'));
    });

    const sellerDataMap = new Map<string, {
      vendedor: string;
      corriente: number;
      range1_30: number;
      range31_60: number;
      range61_90: number;
      rangeOver90: number;
      total: number;
    }>();

    const activeClientCodes = new Set(
      carteraKPIs.filteredClientes
        .filter(c => !carteraExcludedClientes.includes(String(c.cod_benf)))
        .map(c => String(c.cod_benf))
    );

    rawCarteraDocumentos.forEach(d => {
      const clientCode = String(d.cod_benf);
      if (!activeClientCodes.has(clientCode)) return;

      const seller = clientToSellerMap.get(clientCode) || 'Sin Vendedor';
      const saldo = Number(d.saldo || 0);
      if (saldo <= 0) return;
      const mora = Number(d.dias_mora || 0);

      if (!sellerDataMap.has(seller)) {
        sellerDataMap.set(seller, {
          vendedor: seller,
          corriente: 0,
          range1_30: 0,
          range31_60: 0,
          range61_90: 0,
          rangeOver90: 0,
          total: 0
        });
      }

      const sData = sellerDataMap.get(seller)!;
      sData.total += saldo;

      if (d.estado === 'Corriente' || mora === 0) {
        sData.corriente += saldo;
      } else if (mora >= 1 && mora <= 30) {
        sData.range1_30 += saldo;
      } else if (mora >= 31 && mora <= 60) {
        sData.range31_60 += saldo;
      } else if (mora >= 61 && mora <= 90) {
        sData.range61_90 += saldo;
      } else if (mora > 90) {
        sData.rangeOver90 += saldo;
      }
    });

    return Array.from(sellerDataMap.values())
      .map(item => {
        const parts = item.vendedor.split(' ');
        const shortName = parts.length > 2 
          ? `${parts[0]} ${parts[1].charAt(0)}.` 
          : item.vendedor;
        return {
          ...item,
          shortName,
          corrienteMillions: item.corriente / 1_000_000,
          range1_30Millions: item.range1_30 / 1_000_000,
          range31_60Millions: item.range31_60 / 1_000_000,
          range61_90Millions: item.range61_90 / 1_000_000,
          rangeOver90Millions: item.rangeOver90 / 1_000_000,
          totalMillions: item.total / 1_000_000
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [rawCarteraClientes, rawCarteraDocumentos, carteraKPIs.filteredClientes, carteraExcludedClientes]);

  const carteraTotalPages = Math.ceil(carteraKPIs.sortedClientes.length / carteraPageSize) || 1;
  
  const paginatedCarteraClientes = useMemo(() => {
    const start = (carteraListPage - 1) * carteraPageSize;
    return carteraKPIs.sortedClientes.slice(start, start + carteraPageSize);
  }, [carteraKPIs.sortedClientes, carteraListPage, carteraPageSize]);

  const inventoryLineChartData = useMemo(() => {
    const group: Record<string, { name: string, agotado: number, riesgo: number, totalAlerts: number }> = {};
    
    processedInventory.forEach(item => {
      if ((item.status === 'Agotado' || item.status === 'Riesgo') && item.salesVelocity > 0) {
        const lineName = item.linea || 'Sin Línea';
        if (!group[lineName]) {
          group[lineName] = { name: lineName, agotado: 0, riesgo: 0, totalAlerts: 0 };
        }
        if (item.status === 'Agotado') {
          group[lineName].agotado++;
        } else {
          group[lineName].riesgo++;
        }
        group[lineName].totalAlerts++;
      }
    });
    
    return Object.values(group)
      .sort((a, b) => b.totalAlerts - a.totalAlerts)
      .slice(0, 15);
  }, [processedInventory]);

  // Cálculos para la pestaña de Ventas por Línea
  const linesTabAnalysis = useMemo(() => {
    if (filteredLinesTransactions.length === 0) {
      return {
        totalSales: 0,
        overallTotalSales: 0,
        activeLinesCount: 0,
        leaderLineName: 'Ninguno',
        leaderLineSales: 0,
        avgSalesPerLine: 0,
        linesChartData: [],
        linesTableData: [],
        isAllChecked: false
      };
    }

    // Agrupar por code01 (Nombre de la Línea)
    const lineSalesMap: Record<string, number> = {};
    filteredLinesTransactions.forEach(row => {
      const lineName = row.code01 || 'Sin Descripción';
      const val = Number(row.total1) || 0;
      lineSalesMap[lineName] = (lineSalesMap[lineName] || 0) + val;
    });

    const linesArray = Object.keys(lineSalesMap).map(lineName => {
      const salesRaw = lineSalesMap[lineName];
      const checked = selectedCommercialLines.includes(lineName);
      return {
        name: lineName,
        salesRaw,
        salesMillions: salesRaw / 1000000, // Convertir a millones
        checked
      };
    });

    // Ordenar de mayor a menor
    linesArray.sort((a, b) => b.salesRaw - a.salesRaw);

    const overallTotalSales = linesArray.reduce((acc, curr) => acc + curr.salesRaw, 0);

    // Filtrar solo las que están seleccionadas/marcadas para cálculos de KPIs y gráfico
    const checkedLinesArray = linesArray.filter(l => l.checked);

    const totalSales = checkedLinesArray.reduce((acc, curr) => acc + curr.salesRaw, 0);
    const activeLinesCount = checkedLinesArray.length;
    const leaderLine = checkedLinesArray[0] || { name: 'Ninguno', salesRaw: 0 };
    const avgSalesPerLine = activeLinesCount > 0 ? totalSales / activeLinesCount : 0;

    // Top 15 para gráfico usando solo las líneas chequeadas
    const linesChartData = checkedLinesArray.slice(0, 15);

    // Tabla con buscador de línea
    const linesTableData = linesArray.filter(line => 
      String(line.name).toLowerCase().includes(lineSearchQuery.toLowerCase())
    );

    // Determinar si todas las líneas mostradas en la tabla están chequeadas
    const isAllChecked = linesTableData.length > 0 && linesTableData.every(l => l.checked);

    return {
      totalSales,
      overallTotalSales,
      activeLinesCount,
      leaderLineName: leaderLine.name,
      leaderLineSales: leaderLine.salesRaw,
      avgSalesPerLine,
      linesChartData,
      linesTableData,
      isAllChecked
    };
  }, [filteredLinesTransactions, lineSearchQuery, selectedCommercialLines]);

  // Listas de dropdowns únicos para filtros locales de Artículos
  const articlesFilterDropdowns = useMemo(() => {
    const linesSet = new Set<string>();
    const clientsSet = new Set<string>();

    filteredLinesTransactions.forEach(row => {
      if (row.code01) linesSet.add(String(row.code01));
      if (row.cliente) clientsSet.add(String(row.cliente).trim().toUpperCase());
    });

    return {
      linesList: ['TODAS', ...Array.from(linesSet).sort()],
      clientsList: ['TODOS', ...Array.from(clientsSet).sort()]
    };
  }, [filteredLinesTransactions]);

  const filteredClientsForSearch = useMemo(() => {
    if (!articlesFilterDropdowns.clientsList) return [];
    return articlesFilterDropdowns.clientsList.filter(client => 
      client.toLowerCase().includes(clientFilterSearchQuery.toLowerCase())
    );
  }, [articlesFilterDropdowns.clientsList, clientFilterSearchQuery]);

  // Datos filtrados localmente para la pestaña de Análisis de Artículos
  const filteredArticlesTransactions = useMemo(() => {
    return filteredLinesTransactions.filter(row => {
      const passesLine = selectedLineFilter === 'TODAS' || String(row.code01) === selectedLineFilter;
      const passesClient = selectedClientFilter === 'TODOS' || (row.cliente && String(row.cliente).trim().toUpperCase() === selectedClientFilter);
      return passesLine && passesClient;
    });
  }, [filteredLinesTransactions, selectedLineFilter, selectedClientFilter]);

  // Cálculos para la pestaña de Análisis de Artículos
  const articlesTabAnalysis = useMemo(() => {
    if (filteredArticlesTransactions.length === 0) {
      return {
        totalArticlesCount: 0,
        starProductName: 'Ninguno',
        starProductSales: 0,
        totalUnitsSold: 0,
        topClientName: 'Ninguno',
        topClientSales: 0,
        articlesChartData: [],
        articlesTableData: [],
        totalPages: 1,
        isAllChecked: false
      };
    }

    // 1. Obtener todos los meses únicos del dataset (de rawLinesRows) para identificar los últimos 4 meses
    const allDatasetMonths: string[] = [];
    if (rawLinesRows && rawLinesRows.length > 0) {
      const monthsSet = new Set<string>();
      rawLinesRows.forEach(row => {
        const mId = getMonthIdFromSerial(row.fecha);
        if (mId) {
          monthsSet.add(mId);
        }
      });
      // Ordenar cronológicamente según MESES_CONFIG
      allDatasetMonths.push(...Array.from(monthsSet).sort((a, b) => {
        const idxA = MESES_CONFIG.findIndex(m => m.id === a);
        const idxB = MESES_CONFIG.findIndex(m => m.id === b);
        return idxA - idxB;
      }));
    }

    // Tomar los últimos 4 meses
    const last4Months = allDatasetMonths.slice(-4);
    const last4MonthsSet = new Set(last4Months);
    const vendorsSet = new Set(selectedVendors);

    const cleanVendorNameLocal = (v?: any) => {
      if (!v) return '';
      return String(v).replace(/^\d+\s+/, '').trim().toUpperCase();
    };

    // 2. Filtrar transacciones para estos últimos 4 meses aplicando filtros de asesores, línea y cliente
    const last4MonthsTransactions = (rawLinesRows || []).filter(row => {
      const vName = cleanVendorNameLocal(row.vendedor);
      const mId = getMonthIdFromSerial(row.fecha);
      const passesVendor = vendorsSet.has(vName);
      const passesMonth = mId && last4MonthsSet.has(mId);
      const passesLine = selectedLineFilter === 'TODAS' || String(row.code01) === selectedLineFilter;
      const passesClient = selectedClientFilter === 'TODOS' || (row.cliente && String(row.cliente).trim().toUpperCase() === selectedClientFilter);

      return passesVendor && passesMonth && passesLine && passesClient;
    });

    // 3. Calcular cantidades vendidas agrupadas por artículo en este periodo de últimos 4 meses
    const last4MonthsQtyMap: Record<string, number> = {};
    last4MonthsTransactions.forEach(row => {
      const artName = row.articulo ? String(row.articulo) : 'Sin Nombre';
      const qty = Number(row.cant) || 0;
      last4MonthsQtyMap[artName] = (last4MonthsQtyMap[artName] || 0) + qty;
    });

    const activeArticlesSet = new Set(selectedArticles);

    const articleSalesMap: Record<string, { ref: string; salesRaw: number; qty: number }> = {};
    filteredArticlesTransactions.forEach(row => {
      const artName = row.articulo ? String(row.articulo) : 'Sin Nombre';
      const ref = row.ref ? String(row.ref) : '-';
      const val = Number(row.total1) || 0;
      const qty = Number(row.cant) || 0;

      if (!articleSalesMap[artName]) {
        articleSalesMap[artName] = { ref, salesRaw: 0, qty: 0 };
      }
      articleSalesMap[artName].salesRaw += val;
      articleSalesMap[artName].qty += qty;
    });

    // Artículos array con estado checked y promedio
    const articlesArray = Object.keys(articleSalesMap).map(artName => {
      const item = articleSalesMap[artName];
      const checked = activeArticlesSet.has(artName);
      const qty4M = last4MonthsQtyMap[artName] || 0;
      const avgQty4M = qty4M / (last4Months.length || 1);

      return {
        name: artName,
        articleRef: item.ref,
        salesRaw: item.salesRaw,
        salesMillions: item.salesRaw / 1000000,
        qty: item.qty,
        avgQtyLast4Months: avgQty4M,
        avgPrice: item.qty > 0 ? item.salesRaw / item.qty : 0,
        checked
      };
    });

    articlesArray.sort((a, b) => b.salesRaw - a.salesRaw);

    // Filtrar solo artículos chequeados para KPIs y gráfico
    const checkedArticlesArray = articlesArray.filter(a => a.checked);

    const totalArticlesCount = checkedArticlesArray.length;
    const starProduct = checkedArticlesArray[0] || { name: 'Ninguno', salesRaw: 0 };

    let totalUnitsSold = 0;
    const clientSalesMap: Record<string, number> = {};

    // Re-calcular volumen total y clientes usando transacciones de artículos activos
    filteredArticlesTransactions.forEach(row => {
      const artName = row.articulo ? String(row.articulo) : 'Sin Nombre';
      if (!activeArticlesSet.has(artName)) return; // Excluir desactivados

      const val = Number(row.total1) || 0;
      const qty = Number(row.cant) || 0;
      totalUnitsSold += qty;

      if (row.cliente) {
        const clientName = String(row.cliente);
        clientSalesMap[clientName] = (clientSalesMap[clientName] || 0) + val;
      }
    });

    const clientsArray = Object.keys(clientSalesMap).map(clientName => ({
      name: clientName,
      salesRaw: clientSalesMap[clientName]
    }));
    clientsArray.sort((a, b) => b.salesRaw - a.salesRaw);
    const topClient = clientsArray[0] || { name: 'Ninguno', salesRaw: 0 };

    // Top 15 para gráfico usando solo chequeados
    const articlesChartData = checkedArticlesArray.slice(0, 15);

    // Tabla con buscador de nombre/ref (incluyendo chequeados y desmarcados)
    const searchedArticles = articlesArray.filter(art => 
      String(art.name).toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
      String(art.articleRef).toLowerCase().includes(articleSearchQuery.toLowerCase())
    );

    // Paginación a 15 artículos por página
    const itemsPerPage = 15;
    const totalPages = Math.max(1, Math.ceil(searchedArticles.length / itemsPerPage));
    const paginatedArticles = searchedArticles.slice(
      (articleListPage - 1) * itemsPerPage,
      articleListPage * itemsPerPage
    );

    // Determinar si todos los artículos mostrados en la página actual de la tabla están chequeados
    const isAllChecked = paginatedArticles.length > 0 && paginatedArticles.every(a => a.checked);

    return {
      totalArticlesCount,
      starProductName: String(starProduct.name),
      starProductSales: starProduct.salesRaw,
      totalUnitsSold,
      topClientName: String(topClient.name),
      topClientSales: topClient.salesRaw,
      articlesChartData,
      articlesTableData: paginatedArticles,
      totalPages,
      isAllChecked
    };
  }, [filteredArticlesTransactions, articleSearchQuery, articleListPage, selectedArticles, rawLinesRows, selectedVendors, selectedLineFilter, selectedClientFilter]);

  // CÁLCULOS DINÁMICOS DE VENTAS (MIGRADO A MILLONES DE COP)
  const salesData = useMemo(() => {
    if (advisorsData.length === 0 || rawExcelRows.length === 0) {
      return {
        advisorsSales: [],
        totalSales: 0,
        leaderName: 'Ninguno',
        leaderSales: 0,
        avgSales: 0,
        globalUniqueClientsCount: 0,
        globalTicketAverage: 0
      };
    }

    const salesMap: Record<string, { id: string; name: string; sales: number; clientCodes: Set<string> }> = {};
    const globalUniqueClientsSet = new Set<string>();
    
    advisorsData.forEach(adv => {
      salesMap[adv.name] = {
        id: adv.id,
        name: adv.name,
        sales: 0,
        clientCodes: new Set()
      };
    });

    let grandTotal = 0;

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.total1 || !row.Tipo) return;
      if (!['FE', 'CT', 'N2'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') {
        name = 'PRINCIPAL';
      }

      const monthId = getMonthIdFromRow(row);
      if (monthId && selectedMaestraMonths.includes(monthId)) {
        const val = parseFloat(row.total1) || 0;
        const clientCode = row.cod_client ? String(row.cod_client).trim() : '';
        
        if (selectedVendors.includes(name)) {
          if (!salesMap[name]) {
            salesMap[name] = { id, name, sales: 0, clientCodes: new Set() };
          }
          salesMap[name].sales += val;
          grandTotal += val;
          if (clientCode && clientCode !== '222222222222' && clientCode !== '222222') {
            salesMap[name].clientCodes.add(clientCode);
            globalUniqueClientsSet.add(clientCode);
          }
        }
      }
    });

    const advisorsSalesArray = Object.values(salesMap)
      .filter(adv => 
        selectedVendors.includes(adv.name) &&
        adv.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(adv => {
        const salesInMillions = adv.sales / 1000000;
        const percentage = grandTotal > 0 ? parseFloat(((adv.sales / grandTotal) * 100).toFixed(1)) : 0;
        const activeClients = adv.clientCodes.size;
        const ticketAverage = activeClients > 0 ? (adv.sales / activeClients) : 0;

        return {
          id: adv.id,
          name: adv.name,
          salesRaw: adv.sales,
          salesInMillions,
          percentage,
          activeClients,
          ticketAverage
        };
      })
      .sort((a, b) => b.salesInMillions - a.salesInMillions);

    const leader = advisorsSalesArray[0] || { name: 'Ninguno', salesInMillions: 0, percentage: 0 };
    const count = advisorsSalesArray.length;
    const avgSales = count > 0 ? (grandTotal / count) : 0;
    const globalUniqueClientsCount = globalUniqueClientsSet.size;
    const globalTicketAverage = globalUniqueClientsCount > 0 ? (grandTotal / globalUniqueClientsCount) : 0;

    return {
      advisorsSales: advisorsSalesArray,
      totalSales: grandTotal, 
      leaderName: leader.name,
      leaderSales: leader.salesRaw,
      leaderPercentage: leader.percentage,
      avgSales,
      globalUniqueClientsCount,
      globalTicketAverage
    };
  }, [selectedMaestraMonths, selectedVendors, searchQuery, rawExcelRows, advisorsData]);

  // Donut chart slices en base a la participación de ventas
  const donutSlices = useMemo(() => {
    const radius = 38;
    const C = 2 * Math.PI * radius; 
    let accumulatedOffset = 0;

    return salesData.advisorsSales.map(adv => {
      const colorIndex = parseInt(adv.id) || 0;
      const sliceColor = MESES_CONFIG[colorIndex % MESES_CONFIG.length]?.color || '#10b981';
      
      const percentageDecimal = adv.percentage / 100;
      const strokeLength = percentageDecimal * C;
      const gapLength = C - strokeLength;
      
      const strokeDashArray = `${strokeLength} ${gapLength}`;
      const strokeDashOffset = -accumulatedOffset; 
      
      // Calculate middle angle for label placement (in radians)
      // Standard mathematical angle: starting at 12 o'clock, clockwise.
      // 12 o'clock corresponds to -Math.PI / 2 radians in standard polar coordinates where 0 is 3 o'clock.
      const middleOffset = accumulatedOffset + strokeLength / 2;
      const middleAngle = -Math.PI / 2 + (middleOffset / C) * 2 * Math.PI;
      
      // Label coordinates (center of the slice ring at radius 38)
      const labelX = 50 + radius * Math.cos(middleAngle);
      const labelY = 50 + radius * Math.sin(middleAngle);

      accumulatedOffset += strokeLength;

      return {
        name: adv.name,
        color: sliceColor,
        percentage: adv.percentage,
        strokeDashArray,
        strokeDashOffset: String(strokeDashOffset),
        labelX: parseFloat(labelX.toFixed(2)),
        labelY: parseFloat(labelY.toFixed(2))
      };
    });
  }, [salesData.advisorsSales]);

  // FRECUENCIA DE COMPRA
  const frequencyData = useMemo(() => {
    if (advisorsData.length === 0 || rawExcelRows.length === 0) {
      return { advisorsFrequency: [], avgFrequency: 0, totalInvoices: 0, leaderName: 'Ninguno', leaderFrequency: 0 };
    }
    const invoiceCounts: Record<string, number> = {};
    let totalInvoices = 0;

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') name = 'PRINCIPAL';

      const monthId = getMonthIdFromRow(row);
      if (monthId && selectedMaestraMonths.includes(monthId) && selectedVendors.includes(name)) {
        const clientCode = row.cod_client ? String(row.cod_client).trim() : '';
        if (clientCode !== '222222222222' && clientCode !== '222222') {
          invoiceCounts[name] = (invoiceCounts[name] || 0) + 1;
          totalInvoices += 1;
        }
      }
    });

    const advisorsFrequencyArray = salesData.advisorsSales.map(adv => {
      const invoices = invoiceCounts[adv.name] || 0;
      const frequency = adv.activeClients > 0 ? parseFloat((invoices / adv.activeClients).toFixed(2)) : 0;
      return {
        ...adv,
        invoices,
        frequency,
        shortName: getShortNameWithLastName(adv.name)
      };
    }).sort((a, b) => b.frequency - a.frequency);

    const activeAdvisors = advisorsFrequencyArray.filter(a => a.activeClients > 0);
    const avgFrequency = activeAdvisors.length > 0
      ? parseFloat((activeAdvisors.reduce((acc, curr) => acc + curr.frequency, 0) / activeAdvisors.length).toFixed(2))
      : 0;

    const leader = advisorsFrequencyArray[0] || { name: 'Ninguno', frequency: 0 };

    return {
      advisorsFrequency: advisorsFrequencyArray,
      avgFrequency,
      totalInvoices,
      leaderName: leader.name,
      leaderFrequency: leader.frequency
    };
  }, [selectedMaestraMonths, selectedVendors, rawExcelRows, salesData.advisorsSales, advisorsData]);

  // CALCULO DINAMICO DE RECENCIA Y RIESGO DE CLIENTES (RFM)
  // CALCULO DINAMICO DE RECENCIA Y RIESGO DE CLIENTES (RFM)
  const clientRecencyData = useMemo(() => {
    if (rawExcelRows.length === 0) {
      return {
        summary: { saludable: 0, atencion: 0, riesgo: 0, perdido: 0, total: 0, avgInactivity: 0 },
        byVendor: [],
        chartData: [],
        clientsList: []
      };
    }

    if (selectedMaestraMonths.length === 0) {
      return {
        summary: { saludable: 0, atencion: 0, riesgo: 0, perdido: 0, total: 0, avgInactivity: 0 },
        byVendor: [],
        chartData: [],
        clientsList: []
      };
    }

    // Metadatos de meses base para mapear de forma cronológica exacta
    const MONTH_METADATA: Record<string, { year: number, monthZeroIndexed: number }> = {
      'Sep25': { year: 2025, monthZeroIndexed: 8 },
      'Oct25': { year: 2025, monthZeroIndexed: 9 },
      'Nov25': { year: 2025, monthZeroIndexed: 10 },
      'Dic25': { year: 2025, monthZeroIndexed: 11 },
      'Enero': { year: 2026, monthZeroIndexed: 0 },
      'Febrero': { year: 2026, monthZeroIndexed: 1 },
      'Marzo': { year: 2026, monthZeroIndexed: 2 },
      'Abril': { year: 2026, monthZeroIndexed: 3 },
      'Mayo': { year: 2026, monthZeroIndexed: 4 },
      'Junio': { year: 2026, monthZeroIndexed: 5 },
      'Julio': { year: 2026, monthZeroIndexed: 6 },
      'Agosto': { year: 2026, monthZeroIndexed: 7 },
      'Septiembre': { year: 2026, monthZeroIndexed: 8 },
      'Octubre': { year: 2026, monthZeroIndexed: 9 },
      'Noviembre': { year: 2026, monthZeroIndexed: 10 },
      'Diciembre': { year: 2026, monthZeroIndexed: 11 }
    };

    // Helper para obtener el número de serie de Excel del primer día del mes calendario posterior
    const getNextMonthFirstDaySerial = (monthId: string): number => {
      const meta = MONTH_METADATA[monthId];
      if (!meta) return 46143; // Mayo 1, 2026 por defecto (Abril 2026 + 1 mes)

      let nextYear = meta.year;
      let nextMonth = meta.monthZeroIndexed + 1;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }

      const jsDate = new Date(Date.UTC(nextYear, nextMonth, 1));
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.round((jsDate.getTime() - excelEpoch.getTime()) / msPerDay);
    };

    // 1. Encontrar la fecha más reciente (maxSerial) en todo el dataset de rawExcelRows
    let maxSerial = 0;
    rawExcelRows.forEach(row => {
      const f = Number(row.fecha);
      if (f && f > maxSerial) {
        maxSerial = f;
      }
    });
    const maxSerialMonthId = maxSerial > 0 ? getMonthIdFromSerial(maxSerial) : null;

    // 2. Encontrar el mes más tardío dentro del rango de meses seleccionado
    let latestMonthId = 'Abril'; // Fallback por defecto si no se encuentra
    let maxMonthIndex = -1;

    selectedMaestraMonths.forEach(mId => {
      const idx = MESES_CONFIG.findIndex(m => m.id === mId);
      if (idx > maxMonthIndex) {
        maxMonthIndex = idx;
        latestMonthId = mId;
      }
    });

    // 3. Determinar la fecha de referencia dinámica
    // Si el último mes seleccionado es el mismo de la venta más reciente, usamos maxSerial.
    // De lo contrario (datos históricos cerrados), usamos el primer día del mes siguiente.
    const referenceDateSerial = (latestMonthId === maxSerialMonthId && maxSerial > 0)
      ? maxSerial
      : getNextMonthFirstDaySerial(latestMonthId);

    // Mapa para almacenar la fecha de última compra de cada cliente único
    const clientLastPurchase: Record<string, { lastDateSerial: number, sellerName: string, clientName: string }> = {};

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.cod_client || !row.fecha || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      const monthId = getMonthIdFromRow(row);
      if (!monthId || !selectedMaestraMonths.includes(monthId)) return;

      const rawVendedor = row.vendedor.trim();
      const id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') name = 'PRINCIPAL';

      // Filtrar por vendedores seleccionados
      if (!selectedVendors.includes(name)) return;

      const clientCode = String(row.cod_client).trim();
      if (clientCode === '222222222222' || clientCode === '222222') return;
      const dateSerial = Number(row.fecha);

      if (!clientCode || !dateSerial) return;

      if (!clientLastPurchase[clientCode] || dateSerial > clientLastPurchase[clientCode].lastDateSerial) {
        clientLastPurchase[clientCode] = {
          lastDateSerial: dateSerial,
          sellerName: name,
          clientName: row.nombre_cli ? String(row.nombre_cli).trim() : 'CLIENTE SIN NOMBRE'
        };
      }
    });

    // Clasificar los clientes en las categorías de riesgo
    let saludable = 0; // 0-15
    let atencion = 0;  // 16-30
    let riesgo = 0;    // 31-60
    let perdido = 0;   // >60
    let totalInactivityDaysSum = 0;
    let totalClientsCount = 0;

    // Agrupación por vendedor
    const vendorRiskMap: Record<string, { saludable: number, atencion: number, riesgo: number, perdido: number, totalDays: number, totalClients: number }> = {};
    selectedVendors.forEach(v => {
      vendorRiskMap[v] = { saludable: 0, atencion: 0, riesgo: 0, perdido: 0, totalDays: 0, totalClients: 0 };
    });

    const clientsList: Array<{
      clientCode: string;
      clientName: string;
      sellerName: string;
      lastDateSerial: number;
      inactivityDays: number;
      category: 'Saludable' | 'Atención' | 'Riesgo' | 'Perdido';
    }> = [];

    Object.entries(clientLastPurchase).forEach(([clientCode, info]) => {
      const inactivityDays = Math.max(0, referenceDateSerial - info.lastDateSerial);
      totalInactivityDaysSum += inactivityDays;
      totalClientsCount++;

      const vName = info.sellerName;
      if (!vendorRiskMap[vName]) {
        vendorRiskMap[vName] = { saludable: 0, atencion: 0, riesgo: 0, perdido: 0, totalDays: 0, totalClients: 0 };
      }

      vendorRiskMap[vName].totalDays += inactivityDays;
      vendorRiskMap[vName].totalClients++;

      let category: 'Saludable' | 'Atención' | 'Riesgo' | 'Perdido';

      if (inactivityDays <= 15) {
        saludable++;
        vendorRiskMap[vName].saludable++;
        category = 'Saludable';
      } else if (inactivityDays <= 30) {
        atencion++;
        vendorRiskMap[vName].atencion++;
        category = 'Atención';
      } else if (inactivityDays <= 60) {
        riesgo++;
        vendorRiskMap[vName].riesgo++;
        category = 'Riesgo';
      } else {
        perdido++;
        vendorRiskMap[vName].perdido++;
        category = 'Perdido';
      }

      clientsList.push({
        clientCode,
        clientName: info.clientName,
        sellerName: info.sellerName,
        lastDateSerial: info.lastDateSerial,
        inactivityDays,
        category
      });
    });

    const avgInactivity = totalClientsCount > 0 ? parseFloat((totalInactivityDaysSum / totalClientsCount).toFixed(1)) : 0;

    const byVendorArray = Object.entries(vendorRiskMap).map(([sellerName, counts]) => {
      const avgDays = counts.totalClients > 0 ? parseFloat((counts.totalDays / counts.totalClients).toFixed(1)) : 0;
      return {
        sellerName,
        shortName: getShortNameWithLastName(sellerName),
        saludable: counts.saludable,
        atencion: counts.atencion,
        riesgo: counts.riesgo,
        perdido: counts.perdido,
        totalClients: counts.totalClients,
        avgInactivityDays: avgDays
      };
    }).sort((a, b) => b.totalClients - a.totalClients);

    const chartData = [
      { name: 'Saludable', range: '0-15 días', value: saludable, color: '#059669', darkColor: '#10B981' },
      { name: 'Atención', range: '16-30 días', value: atencion, color: '#D97706', darkColor: '#F59E0B' },
      { name: 'Riesgo', range: '31-60 días', value: riesgo, color: '#F97316', darkColor: '#EA580C' },
      { name: 'Perdido', range: '>60 días', value: perdido, color: '#E11D48', darkColor: '#BE123C' }
    ];

    return {
      summary: { saludable, atencion, riesgo, perdido, total: totalClientsCount, avgInactivity },
      byVendor: byVendorArray,
      chartData,
      clientsList
    };
  }, [rawExcelRows, selectedVendors, selectedMaestraMonths]);

  // Filtrado, búsqueda y paginación de clientes según estado de riesgo (Frecuencia de Compra)
  const filteredClients = useMemo(() => {
    if (!clientRecencyData.clientsList) return [];
    return clientRecencyData.clientsList
      .filter(client => {
        const matchesCategory = selectedRiskCategory === 'TODOS' || client.category === selectedRiskCategory;
        if (!matchesCategory) return false;

        const query = clientSearchQuery.trim().toLowerCase();
        if (!query) return true;

        return (
          client.clientCode.toLowerCase().includes(query) ||
          client.clientName.toLowerCase().includes(query) ||
          client.sellerName.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.inactivityDays - a.inactivityDays); // Ordenar de mayor a menor días de inactividad
  }, [clientRecencyData.clientsList, selectedRiskCategory, clientSearchQuery]);

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (clientListPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = useMemo(() => {
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, startIndex]);


  // TENDENCIAS DE FACTURACION
  const monthlyTrends = useMemo(() => {
    if (advisorsData.length === 0 || rawExcelRows.length === 0) {
      return [];
    }
    const monthlySales: Record<string, number> = {};
    const monthlyClients: Record<string, Set<string>> = {};
    const monthlyInvoices: Record<string, number> = {};

    MESES_CONFIG.forEach(m => {
      monthlySales[m.id] = 0;
      monthlyClients[m.id] = new Set();
      monthlyInvoices[m.id] = 0;
    });

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.total1 || !row.Tipo) return;
      if (!['FE', 'CT', 'N2'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') name = 'PRINCIPAL';

      if (selectedVendors.includes(name)) {
        const monthId = getMonthIdFromRow(row);
        const mConfig = monthId ? MESES_CONFIG.find(m => m.id === monthId) : null;
        if (mConfig) {
          const val = parseFloat(row.total1) || 0;
          const clientCode = row.cod_client ? String(row.cod_client).trim() : '';

          monthlySales[mConfig.id] += val;
          if (clientCode !== '222222222222' && clientCode !== '222222') {
            monthlyInvoices[mConfig.id] += 1;
          }
          if (clientCode && clientCode !== '222222222222' && clientCode !== '222222') {
            monthlyClients[mConfig.id].add(clientCode);
          }
        }
      }
    });

    return MESES_CONFIG.map((m, idx, arr) => {
      const salesRaw = monthlySales[m.id];
      const salesInMillions = salesRaw / 1000000;
      const clients = monthlyClients[m.id].size;
      const invoices = monthlyInvoices[m.id];
      const active = selectedMaestraMonths.includes(m.id);

      // Calcular crecimiento
      let growthPercentage = 0;
      if (idx > 0) {
        const prevId = arr[idx - 1].id;
        const prevSales = monthlySales[prevId];
        if (prevSales > 0) {
          growthPercentage = parseFloat((((salesRaw - prevSales) / prevSales) * 100).toFixed(1));
        }
      }

      return {
        id: m.id,
        label: m.label,
        color: m.color,
        salesRaw,
        salesInMillions,
        clients,
        invoices,
        growthPercentage,
        active
      };
    }).filter(d => selectedMaestraMonths.includes(d.id));
  }, [selectedMaestraMonths, selectedVendors, rawExcelRows, advisorsData]);

  // ANALISIS INDIVIDUAL POR ASESOR DETALLADO
  const selectedAdvisorAnalysis = useMemo(() => {
    if (advisorsData.length === 0 || rawExcelRows.length === 0) {
      return null;
    }
    const salesInfo = salesData.advisorsSales.find(a => a.name === selectedIndividualVendor);
    const coverageInfo = processedAdvisors.find(a => a.name === selectedIndividualVendor);
    const ranking = salesData.advisorsSales.findIndex(a => a.name === selectedIndividualVendor) + 1;

    const monthlySales: Record<string, number> = {};
    const monthlyClients: Record<string, Set<string>> = {};
    const monthlyInvoices: Record<string, number> = {};

    MESES_CONFIG.forEach(m => {
      monthlySales[m.id] = 0;
      monthlyClients[m.id] = new Set();
      monthlyInvoices[m.id] = 0;
    });

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.total1 || !row.Tipo) return;
      if (!['FE', 'CT', 'N2'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') name = 'PRINCIPAL';

      if (name === selectedIndividualVendor) {
        const monthId = getMonthIdFromRow(row);
        const mConfig = monthId ? MESES_CONFIG.find(m => m.id === monthId) : null;
        if (mConfig) {
          const val = parseFloat(row.total1) || 0;
          const clientCode = row.cod_client ? String(row.cod_client).trim() : '';

          monthlySales[mConfig.id] += val;
          if (['FE', 'CT'].includes(row.Tipo)) {
            if (clientCode !== '222222222222' && clientCode !== '222222') {
              monthlyInvoices[mConfig.id] += 1;
            }
          }
          if (clientCode && clientCode !== '222222222222' && clientCode !== '222222') {
            monthlyClients[mConfig.id].add(clientCode);
          }
        }
      }
    });

    const monthlyData = MESES_CONFIG.map(m => {
      const salesRaw = monthlySales[m.id];
      const salesInMillions = salesRaw / 1000000;
      const clients = monthlyClients[m.id].size;
      const invoices = monthlyInvoices[m.id];
      const frequency = clients > 0 ? parseFloat((invoices / clients).toFixed(2)) : 0;
      return {
        name: m.label,
        monthId: m.id,
        salesInMillions,
        clients,
        invoices,
        frequency
      };
    }).filter(d => selectedMaestraMonths.includes(d.monthId));

    let totalInvoices = 0;
    selectedMaestraMonths.forEach(mId => {
      totalInvoices += monthlyInvoices[mId] || 0;
    });
    
    const overallFrequency = (coverageInfo?.dynamicCoverage || 0) > 0 
      ? parseFloat((totalInvoices / (coverageInfo?.dynamicCoverage || 0)).toFixed(2)) 
      : 0;

    return {
      name: selectedIndividualVendor,
      salesRaw: salesInfo?.salesRaw || 0,
      salesInMillions: salesInfo?.salesInMillions || 0,
      activeClients: salesInfo?.activeClients || 0,
      ticketAverage: salesInfo?.ticketAverage || 0,
      percentage: salesInfo?.percentage || 0,
      coverage: coverageInfo?.dynamicCoverage || 0,
      ranking,
      monthlyData,
      totalInvoices,
      overallFrequency
    };
  }, [selectedIndividualVendor, selectedMaestraMonths, rawExcelRows, salesData.advisorsSales, processedAdvisors, advisorsData]);



  const kpis = useMemo(() => {
    if (advisorsData.length === 0 || rawExcelRows.length === 0) {
      return {
        totalUnique: 0,
        leaderName: 'Ninguno',
        leaderCoverage: 0,
        participation: "0.0"
      };
    }

    const uniqueClients = new Set<string>();

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.cod_client || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') {
        name = 'PRINCIPAL';
      }

      const monthId = getMonthIdFromRow(row);
      if (monthId && selectedVendors.includes(name) && selectedMaestraMonths.includes(monthId)) {
        const clientCode = String(row.cod_client).trim();
        if (clientCode !== '222222222222' && clientCode !== '222222') {
          uniqueClients.add(clientCode);
        }
      }
    });

    const totalUnique = uniqueClients.size;
    const leader = processedAdvisors[0] || { name: 'Ninguno', dynamicCoverage: 0 };

    let participation = "100.0";
    if (selectedVendors.length < advisorsData.length && selectedVendors.length > 0) {
      const totalAllVendorsClients = new Set<string>();
      rawExcelRows.forEach(row => {
        if (!row.vendedor || !row.cod_client || !row.Tipo) return;
        if (!['FE', 'CT'].includes(row.Tipo)) return;

        let rawVendedor = row.vendedor.trim();
        let id = rawVendedor.substring(0, 2);
        let name = rawVendedor.substring(3).trim();
        if (id === '01') {
          name = 'PRINCIPAL';
        }

        const monthId = getMonthIdFromRow(row);
        if (monthId && advisorsData.map(a => a.name).includes(name) && selectedMaestraMonths.includes(monthId)) {
          const clientCode = String(row.cod_client).trim();
          if (clientCode !== '222222222222' && clientCode !== '222222') {
            totalAllVendorsClients.add(clientCode);
          }
        }
      });
      
      const totalAllVal = totalAllVendorsClients.size;
      participation = totalAllVal > 0 ? ((totalUnique / totalAllVal) * 100).toFixed(1) : "0.0";
    }

    return {
      totalUnique,
      leaderName: leader.name,
      leaderCoverage: leader.dynamicCoverage,
      participation
    };
  }, [selectedMaestraMonths, selectedVendors, processedAdvisors, rawExcelRows, advisorsData]);

  const formatNumberWithDots = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // DATOS MAPEADOS PARA LOS GRÁFICOS DE RECHARTS
  const chartAdvisorsData = useMemo(() => {
    return processedAdvisors
      .filter(a => a.id !== '12' && a.id !== 'PR') 
      .map(adv => ({
        ...adv,
        shortName: getShortNameWithLastName(adv.name)
      })) as (Advisor & { dynamicCoverage: number; shortName: string } & Record<string, any>)[];
  }, [processedAdvisors]);

  const kpisCobertura = useMemo(() => {
    const activeAdvisors = chartAdvisorsData;
    const totalUnique = kpis.totalUnique;
    
    const avgCoverage = activeAdvisors.length > 0 
      ? Math.round(activeAdvisors.reduce((acc, curr) => acc + curr.dynamicCoverage, 0) / activeAdvisors.length)
      : 0;
      
    const bestAdvisor = activeAdvisors[0] || { name: 'Ninguno', dynamicCoverage: 0 };
    const bestAdvisorName = getShortNameWithLastName(bestAdvisor.name);
    const bestAdvisorCoverage = bestAdvisor.dynamicCoverage;
    const bestAdvisorShare = totalUnique > 0 ? Math.round((bestAdvisorCoverage / totalUnique) * 100) : 0;
    
    const diffVsAvg = avgCoverage > 0 ? Math.round(((bestAdvisorCoverage - avgCoverage) / avgCoverage) * 100) : 0;
    
    const latestMonthId = selectedMaestraMonths.length > 0
      ? MAESTRA_MESES.filter(m => selectedMaestraMonths.includes(m)).pop()
      : 'Abril';
    const latestMonthIndex = MAESTRA_MESES.indexOf(latestMonthId || 'Abril');
    const prevMonthId = latestMonthIndex > 0 ? MAESTRA_MESES[latestMonthIndex - 1] : null;

    let growthMesActual = "0.0";
    let growthMesLabel = "Vs. período anterior";
    let growthCompareLabel = "N/A";
    if (latestMonthId && prevMonthId) {
      const sumPrev = prevMonthId ? activeAdvisors.reduce((acc, curr) => acc + (Number(curr[prevMonthId]) || 0), 0) : 0;
      const sumCurr = latestMonthId ? activeAdvisors.reduce((acc, curr) => acc + (Number(curr[latestMonthId]) || 0), 0) : 0;
      if (sumPrev > 0) {
        growthMesActual = ((sumCurr - sumPrev) / sumPrev * 100).toFixed(1);
      }
      const latestMonthLabel = MESES_CONFIG.find(m => m.id === latestMonthId)?.label || latestMonthId;
      const prevMonthLabel = MESES_CONFIG.find(m => m.id === prevMonthId)?.label || prevMonthId;
      growthMesLabel = `Vs. período anterior (${prevMonthLabel})`;
      growthCompareLabel = `${latestMonthLabel} vs ${prevMonthLabel}`;
    }
    
    return {
      avgCoverage,
      bestAdvisorName,
      bestAdvisorCoverage,
      bestAdvisorShare,
      diffVsAvg,
      growthMesActual,
      growthMesLabel,
      growthCompareLabel
    };
  }, [chartAdvisorsData, kpis.totalUnique, selectedMaestraMonths]);

  // DONUT SLICES FOR UNIQUE CLIENTS
  const unicosDonutSlices = useMemo(() => {
    const C = 2 * Math.PI * 40;
    let accumulatedOffset = 0;
    const totalCoverage = chartAdvisorsData.reduce((acc, curr) => acc + curr.dynamicCoverage, 0);

    return chartAdvisorsData.map((adv, idx) => {
      const sliceColor = MESES_CONFIG[idx % MESES_CONFIG.length]?.color || '#3182ce';
      const percentage = totalCoverage > 0 ? parseFloat(((adv.dynamicCoverage / totalCoverage) * 100).toFixed(1)) : 0;
      const percentageDecimal = percentage / 100;
      const strokeLength = percentageDecimal * C;
      const gapLength = C - strokeLength;

      const strokeDashArray = `${strokeLength} ${gapLength}`;
      const strokeDashOffset = -accumulatedOffset;
      accumulatedOffset += strokeLength;

      return {
        name: adv.name,
        color: sliceColor,
        percentage,
        strokeDashArray,
        strokeDashOffset: String(strokeDashOffset)
      };
    });
  }, [chartAdvisorsData]);

  // DONUT SLICES FOR INVOICES FREQUENCY (Comentado - ya no se usa)
  /*
  const frequencyDonutSlices = useMemo(() => {
    const C = 2 * Math.PI * 40;
    let accumulatedOffset = 0;
    const totalInvoices = frequencyData.advisorsFrequency.reduce((acc, curr) => acc + curr.invoices, 0);

    return frequencyData.advisorsFrequency.map((adv, idx) => {
      const sliceColor = MESES_CONFIG[idx % MESES_CONFIG.length]?.color || '#f59e0b';
      const percentage = totalInvoices > 0 ? parseFloat(((adv.invoices / totalInvoices) * 100).toFixed(1)) : 0;
      const percentageDecimal = percentage / 100;
      const strokeLength = percentageDecimal * C;
      const gapLength = C - strokeLength;

      const strokeDashArray = `${strokeLength} ${gapLength}`;
      const strokeDashOffset = -accumulatedOffset;
      accumulatedOffset += strokeLength;

      return {
        name: adv.name,
        color: sliceColor,
        percentage,
        strokeDashArray,
        strokeDashOffset: String(strokeDashOffset)
      };
    });
  }, [frequencyData.advisorsFrequency]);
  */



  const salesChartData = useMemo(() => {
    return salesData.advisorsSales
      .filter(a => a.id !== '12' && a.id !== 'PR')
      .map(adv => ({
        ...adv,
        shortName: getShortNameWithLastName(adv.name)
      }));
  }, [salesData.advisorsSales]);

  // Format Y Axis in millions
  const formatYAxisMillions = (val: number) => {
    return formatMillionsValue(val).replace(' ', '');
  };

  const handleToggleMonth = (monthId: string) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthId)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== monthId);
      } else {
        return [...prev, monthId];
      }
    });
  };

  const handleToggleVendor = (vendorName: string) => {
    setSelectedVendors(prev => {
      if (prev.includes(vendorName)) {
        if (prev.length === 1) return prev;
        return prev.filter(v => v !== vendorName);
      } else {
        return [...prev, vendorName];
      }
    });
  };

  const handleSelectAllVendors = () => {
    setSelectedVendors(advisorsData.map(a => a.name));
  };

  const handleDeselectAllVendors = () => {
    if (advisorsData.length > 0) {
      setSelectedVendors([advisorsData[0].name]);
    }
  };

  const handleClearFilters = () => {
    const monthsSpanish = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentMonthIndex = new Date().getMonth();
    const currentMonthName = monthsSpanish[currentMonthIndex];
    
    const hasCurrentMonth = visibleMonthsConfig.some(m => m.id === currentMonthName);
    const sliceCount = hasCurrentMonth ? -4 : -3;
    
    const defaultSelected = visibleMonthsConfig.slice(sliceCount).map(m => m.id);
    setSelectedMonths(defaultSelected);
    setSelectedVendors(advisorsData.map(a => a.name));
    setSearchQuery('');
    setInventorySearchQuery('');
    setInventoryLineFilter('TODAS');
    setInventoryStatusFilter('TODOS');
    setInventoryListPage(1);
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300 ${
        isDarkMode ? 'bg-[#030712]' : 'bg-[#f8fafc]'
      }`}>
        <style>{`
          @keyframes geminiGlow {
            0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
            33% { transform: translate(40px, -60px) scale(1.15) rotate(120deg); }
            66% { transform: translate(-30px, 30px) scale(0.9) rotate(240deg); }
            100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
          }
          @keyframes geminiGlowReverse {
            0% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
            33% { transform: translate(-40px, 50px) scale(0.85) rotate(240deg); }
            66% { transform: translate(50px, -30px) scale(1.2) rotate(120deg); }
            100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          }
          .gemini-glow-1 {
            animation: geminiGlow 30s infinite alternate ease-in-out;
          }
          .gemini-glow-2 {
            animation: geminiGlowReverse 35s infinite alternate ease-in-out;
          }
        `}</style>

        {/* Gemini-inspired Animated Glows */}
        {isDarkMode ? (
          <>
            <div 
              className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] rounded-full blur-[120px] opacity-60 pointer-events-none gemini-glow-1"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.1) 40%, rgba(244,63,94,0.05) 70%, rgba(0,0,0,0) 100%)'
              }}
            />
            <div 
              className="absolute w-[150%] h-[150%] bottom-[-25%] right-[-25%] rounded-full blur-[120px] opacity-60 pointer-events-none gemini-glow-2"
              style={{
                background: 'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.15) 0%, rgba(59,130,246,0.1) 40%, rgba(6,182,212,0.06) 70%, rgba(0,0,0,0) 100%)'
              }}
            />
          </>
        ) : (
          <>
            <div 
              className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] rounded-full blur-[120px] opacity-80 pointer-events-none gemini-glow-1"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(193,162,255,0.4) 0%, rgba(155,197,255,0.3) 35%, rgba(255,208,177,0.25) 70%, rgba(255,255,255,0) 100%)'
              }}
            />
            <div 
              className="absolute w-[150%] h-[150%] bottom-[-25%] right-[-25%] rounded-full blur-[120px] opacity-80 pointer-events-none gemini-glow-2"
              style={{
                background: 'radial-gradient(circle at 70% 70%, rgba(255,189,230,0.35) 0%, rgba(174,245,255,0.3) 35%, rgba(211,194,255,0.25) 70%, rgba(255,255,255,0) 100%)'
              }}
            />
          </>
        )}

        <button
          onClick={toggleTheme}
          className={`absolute top-6 right-6 p-3 rounded-full border transition-all duration-300 shadow-md ${
            isDarkMode 
              ? 'bg-[#0f172a]/80 border-gray-800/80 text-yellow-500 hover:bg-[#1e293b]' 
              : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50'
          }`}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={`w-full max-w-md backdrop-blur-xl border rounded-3xl p-8 relative z-10 shadow-2xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#0f172a]/80 border-gray-800/80 shadow-blue-900/10' 
            : 'bg-white/90 border-gray-200/90 shadow-slate-300/40'
        }`}>
          <div className="flex flex-col items-center mb-8">
            <div className={`p-4 rounded-2xl border mb-4 shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-blue-600/10 border-blue-500/20 shadow-blue-500/10' 
                : 'bg-blue-50 border-blue-200 shadow-blue-200/30'
            }`}>
              <Database className="text-blue-500" size={32} />
            </div>
            <h2 className={`text-2xl font-black tracking-tight transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Distribuidora JR</h2>
            <p className={`text-xs mt-1 uppercase tracking-widest font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>Maestra de Clientes 2026</p>
            {lastUpdateDate && (
              <p className={`text-[10px] mt-2 tracking-tight transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Datos actualizados hasta: <span className="font-semibold text-blue-500">{lastUpdateDate}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Contraseña de Acceso</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Introduce la contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-2xl py-3 pl-11 pr-11 text-sm transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    isDarkMode 
                      ? 'bg-gray-950/60 border-gray-800/80 text-gray-100 placeholder-gray-600 focus:border-blue-500/50' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500/50'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs font-semibold">
                <AlertCircle size={15} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`rounded focus:ring-0 focus:ring-offset-0 w-4 h-4 ${
                    isDarkMode ? 'border-gray-800 bg-gray-950 text-blue-600' : 'border-gray-300 bg-white text-blue-600'
                  }`}
                />
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Recordar sesión</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#3182ce] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all duration-300 transform active:scale-98"
            >
              Ingresar al Tablero
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Pantalla de Carga
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans transition-colors duration-300 ${
        isDarkMode ? 'bg-[#020617] text-gray-100' : 'bg-[#f4f6fa] text-gray-800'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-md"></div>
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Cargando base de datos Excel de forma automática...</p>
        </div>
      </div>
    );
  }

  // Pantalla de Error en la Carga de Datos
  if (loadingError) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300 ${
        isDarkMode ? 'bg-[#020617] text-gray-100' : 'bg-[#f4f6fa] text-gray-800'
      }`}>
        <div className={`w-full max-w-md p-8 border rounded-3xl text-center shadow-xl ${
          isDarkMode ? 'bg-[#0f172a] border-red-900/20' : 'bg-white border-red-200'
        }`}>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl inline-block mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-red-500 mb-2">Error de Automatización</h2>
          <p className="text-sm text-gray-400 mb-6">{loadingError}</p>
          
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl text-left text-xs mb-6 text-gray-400 leading-relaxed">
            <span className="font-bold text-blue-500 block mb-1">Solución rápida:</span>
            Asegúrate de colocar el archivo original <strong>"1Maestra de clientes2026.xlsx"</strong> dentro de la carpeta <strong>public/</strong> del proyecto y recargar la página.
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Reintentar Carga
          </button>
        </div>
      </div>
    );
  }

  const currentTab: string = activeTab;

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 overflow-hidden ${
      isDarkMode ? 'bg-[#020617] text-gray-100' : 'bg-[#F8FAFC] text-gray-800'
    }`}>
      
      {/* 1. SIDEBAR IZQUIERDO (11.5% DE ANCHO - FIJO Y COLAPSABLE) */}
      <aside className={`fixed left-0 top-0 h-screen border-r transition-all duration-300 flex flex-col justify-between p-3 z-40 bg-[#020617] border-slate-800/60 ${
        isSidebarCollapsed ? 'w-[60px]' : 'w-[11.5%]'
      }`}>
        <div className="space-y-6">
          {/* Logo y Encabezado */}
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 shrink-0">
                  <Database size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight leading-none text-white">Dashboard</h2>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Ventas & Clientes</span>
                </div>
              </div>
            )}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors mx-auto ${isSidebarCollapsed ? 'rotate-180' : ''}`}
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Menú de Navegación Lateral */}
          <nav className="space-y-1">
            {[
              { id: 'cobertura', label: 'Cobertura de Clientes', icon: Users },
              { id: 'asesor', label: 'Análisis por Asesor', icon: User },
              { id: 'frecuencia', label: 'Frecuencia de Compra', icon: RefreshCw },
              { id: 'lineas', label: 'Ventas por Línea', icon: TrendingUp },
              { id: 'articulos', label: 'Análisis de Artículos', icon: Package },
              { id: 'inventario', label: 'Inventario', icon: Database },
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 ${
                    isActive
                      ? 'bg-[#16A34A] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                  title={tab.label}
                >
                  <IconComp size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {!isSidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}

            {/* Separador de Sección Financiera */}
            {isFinancialDataUnlocked && (
              <>
                <div className="my-5 border-t border-slate-800/60" />
                {!isSidebarCollapsed && (
                  <div className="px-3 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#6366f1] dark:text-[#818cf8] block">
                      Área Financiera
                    </span>
                  </div>
                )}
                {[
                  { id: 'ventas', label: 'Ventas por Vendedor', icon: BarChart3 },
                  { id: 'tendencias', label: 'Tendencias', icon: Calendar },
                  { id: 'cartera', label: 'Cartera Comercial', icon: CreditCard },
                ].map(tab => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 ${
                        isActive
                          ? 'bg-[#4f46e5] text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                      title={tab.label}
                    >
                      <IconComp size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                      {!isSidebarCollapsed && <span>{tab.label}</span>}
                    </button>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {/* Configuración inferior del Sidebar */}
        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          {/* Botón de Candado de Seguridad */}
          <button
            onClick={handleFinancialLockToggle}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 border border-dashed ${
              isFinancialDataUnlocked
                ? 'border-emerald-500/20 text-[#10B981] hover:bg-[#10B981]/10'
                : 'border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/40'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isFinancialDataUnlocked ? "Bloquear datos financieros" : "Desbloquear datos financieros"}
          >
            {isFinancialDataUnlocked ? <Unlock size={16} className="shrink-0" /> : <Lock size={16} className="shrink-0" />}
            {!isSidebarCollapsed && (
              <span className="truncate">
                {isFinancialDataUnlocked ? "Financiero Abierto" : "Financiero Cerrado"}
              </span>
            )}
          </button>

          <div className="flex items-center justify-between px-1">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 text-slate-400">
                <Moon size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Modo oscuro</span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDarkMode ? 'bg-[#16A34A]' : 'bg-slate-700'
              } ${isSidebarCollapsed ? 'mx-auto' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 hover:bg-red-500/10 rounded-xl text-xs font-bold text-red-400 transition-all flex items-center gap-3"
            title="Cerrar sesión"
          >
            <LogOut size={16} className="shrink-0 text-red-400" />
            {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>

          {!isSidebarCollapsed && (
            <div className="text-center mt-2 space-y-0.5">
              <p className="text-[9px] text-slate-500 font-semibold tracking-tight">© 2026 Distribuidora JR</p>
              {lastUpdateDate && (
                <p className="text-[8px] text-slate-400 font-medium tracking-tight">Datos hasta: {lastUpdateDate}</p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 2. ÁREA CENTRAL (78% - DESPLAZABLE, CON MÁXIMA DENSIDAD VISIBLE) */}
      <main className="flex-1 p-3 h-screen overflow-y-auto transition-all duration-300" style={{
        marginLeft: isSidebarCollapsed ? '60px' : '11.5%',
        marginRight: isFiltersCollapsed ? '40px' : '10.5%'
      }}>
        
        {/* ENCABEZADO PRINCIPAL DE PÁGINA */}
        <header className="flex items-center justify-between border-b pb-6 mb-6 transition-colors duration-300 border-gray-200/60 dark:border-gray-800/60">
          <div>
            <h1 
              style={{ color: isDarkMode ? '#F8FAFC' : '#000000' }}
              className="text-2xl sm:text-[32px] font-black tracking-tight leading-none flex items-center gap-2"
            >
              {activeTab === 'ventas' && 'Ventas por Vendedor'}
              {activeTab === 'cobertura' && 'Cobertura de Clientes'}
              {activeTab === 'unicos' && 'Clientes Únicos'}
              {activeTab === 'frecuencia' && 'Frecuencia de Compra'}
              {activeTab === 'tendencias' && 'Tendencias de Facturación'}
              {activeTab === 'asesor' && 'Análisis Individual por Asesor'}
              {activeTab === 'lineas' && 'Ventas por Línea'}
              {activeTab === 'articulos' && 'Análisis de Artículos'}
              {activeTab === 'inventario' && 'Alertas de Inventario y Abastecimiento'}
              {activeTab === 'cartera' && 'Estado de Cartera y Cupos'}
            </h1>
            <p 
              style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.85)' }}
              className="text-[13px] mt-2 font-medium"
            >
              {activeTab === 'ventas' && 'Análisis del volumen total de ventas por vendedor en millones de COP.'}
              {activeTab === 'cobertura' && 'Análisis de clientes activos en la base de clientes de la empresa.'}
              {activeTab === 'unicos' && 'Total de clientes únicos atendidos por cada asesor en los periodos seleccionados.'}
              {activeTab === 'frecuencia' && 'Promedio de facturas generadas por cada cliente atendido (FE + CT).'}
              {activeTab === 'tendencias' && 'Evolución mensual de facturación global y base de clientes en tiempo real.'}
              {activeTab === 'asesor' && 'Métricas detalladas de desempeño de ventas y clientes para el asesor comercial seleccionado.'}
              {activeTab === 'lineas' && 'Análisis detallado de facturación clasificado por marcas y líneas comerciales.'}
              {activeTab === 'articulos' && 'Estadísticas de volumen y valor de productos vendidos con filtros de línea y asesor.'}
              {activeTab === 'inventario' && 'Análisis de stock crítico, priorizando abastecimiento según la velocidad de ventas recientes y agrupado por líneas de producto.'}
              {activeTab === 'cartera' && 'Visualización detallada de cuentas por cobrar, estados de morosidad, proyección de vencimientos y cupos de crédito asignados.'}
            </p>
          </div>

          {/* Acciones de Cabecera compactas */}
          <div className="flex items-center gap-3">
            {lastDatabaseSync && (
              <div className={`p-1.5 px-3 border rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-450 dark:text-slate-405' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>DataX Sincronizado: <span className="font-bold text-slate-750 dark:text-slate-200">{lastDatabaseSync}</span></span>
              </div>
            )}
            <button 
              onClick={() => setReloadTrigger(prev => prev + 1)}
              className={`p-1.5 px-3 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
              title="Actualizar Datos"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
            <button 
              onClick={handleClearFilters}
              className={`p-1.5 px-3 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
              title="Limpiar Filtros"
            >
              <RefreshCw size={12} />
              <span>Limpiar filtros</span>
            </button>
            <button 
              onClick={toggleTheme}
              className={`p-1.5 px-3 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
              title={isDarkMode ? "Modo claro" : "Modo oscuro"}
            >
              {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
              <span>{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
            </button>
          </div>
        </header>

        {(activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'cartera') && !isFinancialDataUnlocked ? (
          <div className="flex flex-col items-center justify-center p-12 min-h-[460px] border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl bg-gray-500/5 backdrop-blur-sm animate-fade-in select-none">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl mb-4 border border-amber-500/20">
              <Lock size={32} />
            </div>
            <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[16px] font-bold uppercase tracking-tight mb-2">Acceso Restringido</h3>
            <p style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-xs text-center max-w-sm leading-relaxed">
              Esta sección contiene información financiera altamente sensible de la compañía. Haz clic en el candado del menú lateral e ingresa la contraseña de seguridad para desbloquearla.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'cobertura' ? (
          <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5 animate-fade-in select-none">
            {/* KPI 1: CLIENTES ACTIVOS TOTALES */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/30 cursor-pointer ${
              isDarkMode 
                ? 'bg-[#0f172a] border-slate-800/80 shadow-black/30 shadow-md' 
                : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-md'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-[#14532D]/35 text-[#4ADE80] border-emerald-500/25' 
                  : 'bg-[#E8F8EE] text-[#059669] border-[#D1FAE5]'
              }`}>
                <Users size={22} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <span 
                  style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }}
                  className="text-[11px] font-bold tracking-[0.5px] uppercase block"
                >
                  Clientes Activos Totales
                </span>
                <span className="text-[25px] sm:text-[27px] font-extrabold leading-none text-[#15803D] dark:text-[#4ADE80] tracking-tight block mt-1">
                  {formatNumberWithDots(kpis.totalUnique)}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                  className="text-[12px] font-medium block mt-0.5"
                >
                  Clientes
                </span>
                <span 
                  style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                  className="text-[11px] font-semibold block mt-3.5"
                >
                  En el período seleccionado
                </span>
              </div>
            </div>

            {/* KPI 2: COBERTURA PROMEDIO POR ASESOR */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/30 cursor-pointer ${
              isDarkMode 
                ? 'bg-[#0f172a] border-slate-800/80 shadow-black/30 shadow-md' 
                : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-md'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-[#3B0764]/35 text-[#C084FC] border-purple-500/25' 
                  : 'bg-[#F0EDFD] text-[#7C3AED] border-[#E0D7FE]'
              }`}>
                <BarChart3 size={22} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <span 
                  style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }}
                  className="text-[11px] font-bold tracking-[0.5px] uppercase block"
                >
                  Cobertura Promedio Por Asesor
                </span>
                <span className="text-[25px] sm:text-[27px] font-extrabold leading-none text-[#6B21A8] dark:text-[#C084FC] tracking-tight block mt-1">
                  {kpisCobertura.avgCoverage}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                  className="text-[12px] font-medium block mt-0.5"
                >
                  Clientes por asesor activo
                </span>
                <span 
                  style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                  className="text-[11px] font-semibold block mt-3.5"
                >
                  Promedio del período
                </span>
              </div>
            </div>

            {/* KPI 3: MEJOR ASESOR */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/30 cursor-pointer ${
              isDarkMode 
                ? 'bg-[#0f172a] border-slate-800/80 shadow-black/30 shadow-md' 
                : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-md'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-[#78350F]/35 text-[#FBBF24] border-amber-500/25' 
                  : 'bg-[#FEF5E7] text-[#D97706] border-[#FEEBCE]'
              }`}>
                <Crown size={22} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <span 
                  style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }}
                  className="text-[11px] font-bold tracking-[0.5px] uppercase block"
                >
                  Mejor Asesor
                </span>
                <span 
                  style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                  className="text-[19px] sm:text-[21px] lg:text-[22px] font-extrabold leading-tight tracking-tight block mt-1 truncate"
                  title={toTitleCase(getShortNameWithLastName(kpisCobertura.bestAdvisorName || "Miguel Agudelo"))}
                >
                  {toTitleCase(getShortNameWithLastName(kpisCobertura.bestAdvisorName || "Miguel Agudelo"))}
                </span>
                <span className="text-[12px] font-bold text-[#059669] dark:text-[#4ADE80] block mt-0.5">
                  {kpisCobertura.bestAdvisorCoverage} clientes
                </span>
                <span 
                  style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                  className="text-[11px] font-semibold block mt-3.5"
                >
                  {kpisCobertura.bestAdvisorShare}% del total de cobertura
                </span>
              </div>
            </div>

            {/* KPI 4: DIFERENCIA VS PROMEDIO */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/30 cursor-pointer ${
              isDarkMode 
                ? 'bg-[#0f172a] border-slate-800/80 shadow-black/30 shadow-md' 
                : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-md'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-[#1E3A8A]/35 text-[#60A5FA] border-blue-500/25' 
                  : 'bg-[#EEF2FF] text-[#2563EB] border-[#DBEAFE]'
              }`}>
                <TrendingUp size={22} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <span 
                  style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }}
                  className="text-[11px] font-bold tracking-[0.5px] uppercase block"
                >
                  Diferencia Vs Promedio
                </span>
                <span className="text-[25px] sm:text-[27px] font-extrabold leading-none text-[#1D4ED8] dark:text-[#60A5FA] tracking-tight block mt-1">
                  {kpisCobertura.diffVsAvg >= 0 ? `+${kpisCobertura.diffVsAvg}%` : `${kpisCobertura.diffVsAvg}%`}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                  className="text-[12px] font-medium block mt-0.5"
                >
                  Sobre el promedio de cobertura
                </span>
                <span 
                  style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                  className="text-[11px] font-semibold block mt-3.5 truncate"
                  title={`${toTitleCase(getShortNameWithLastName(kpisCobertura.bestAdvisorName || "Miguel Agudelo"))} vs promedio`}
                >
                  {toTitleCase(getShortNameWithLastName(kpisCobertura.bestAdvisorName || "Miguel Agudelo"))} vs promedio
                </span>
              </div>
            </div>

            {/* KPI 5: CRECIMIENTO MES ACTUAL */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/30 cursor-pointer ${
              isDarkMode 
                ? 'bg-[#0f172a] border-slate-800/80 shadow-black/30 shadow-md' 
                : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-md'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 shadow-sm ${
                parseFloat(kpisCobertura.growthMesActual) >= 0 
                  ? (isDarkMode 
                      ? 'bg-[#14532D]/35 text-[#4ADE80] border-emerald-500/25' 
                      : 'bg-[#E8F8EE] text-[#059669] border-[#D1FAE5]')
                  : (isDarkMode 
                      ? 'bg-[#7F1D1D]/35 text-[#F87171] border-red-500/25' 
                      : 'bg-[#FDF2F2] text-[#DC2626] border-[#FEE2E2]')
              }`}>
                {parseFloat(kpisCobertura.growthMesActual) >= 0 ? <TrendingUp size={22} className="stroke-[2.5]" /> : <TrendingDown size={22} className="stroke-[2.5]" />}
              </div>
              <div className="flex-1 min-w-0">
                <span 
                  style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }}
                  className="text-[11px] font-bold tracking-[0.5px] uppercase block"
                >
                  Crecimiento Mes Actual
                </span>
                <span className={`text-[25px] sm:text-[27px] font-extrabold leading-none tracking-tight block mt-1 ${
                  parseFloat(kpisCobertura.growthMesActual) >= 0 
                    ? 'text-[#15803D] dark:text-[#4ADE80]' 
                    : 'text-[#B91C1C] dark:text-[#F87171]'
                }`}>
                  {parseFloat(kpisCobertura.growthMesActual) >= 0 ? `+${kpisCobertura.growthMesActual}%` : `${kpisCobertura.growthMesActual}%`}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}
                  className="text-[12px] font-medium block mt-0.5"
                >
                  {kpisCobertura.growthMesLabel}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                  className="text-[11px] font-semibold block mt-3.5"
                >
                  {kpisCobertura.growthCompareLabel}
                </span>
              </div>
            </div>
          </section>
        ) : (
          currentTab !== 'frecuencia' && currentTab !== 'lineas' && currentTab !== 'articulos' && currentTab !== 'inventario' && currentTab !== 'cartera' && (
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5 select-none animate-fade-in">
            {/* KPI 1 */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias'
                ? 'border-l-4 border-l-emerald-500'
                : activeTab === 'unicos'
                  ? 'border-l-4 border-l-blue-500'
                  : activeTab === 'frecuencia'
                    ? 'border-l-4 border-l-amber-500'
                    : 'border-l-4 border-l-rose-500'
            }`}>
              <div className="flex-1 min-w-0 pr-2">
                <span className={`text-[36px] font-extrabold tracking-tight block leading-none mb-1.5 ${
                  activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'asesor'
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : activeTab === 'unicos'
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {(activeTab === 'ventas' || activeTab === 'tendencias') && formatMillionsCOP(salesData.totalSales)}
                  {activeTab === 'unicos' && (
                    <>
                      {formatNumberWithDots(kpis.totalUnique)}
                      <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1.5 font-sans">Únicos</span>
                    </>
                  )}
                  {activeTab === 'frecuencia' && (
                    <>
                      {frequencyData.avgFrequency}
                      <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1.5 font-sans">compras/cl</span>
                    </>
                  )}
                  {activeTab === 'asesor' && formatMillionsCOP(selectedAdvisorAnalysis?.salesRaw || 0)}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                  className="text-[14px] font-semibold uppercase tracking-wider block mt-2"
                >
                  {activeTab === 'ventas' && 'Ventas Totales'}
                  {activeTab === 'unicos' && 'Total Clientes Únicos'}
                  {activeTab === 'frecuencia' && 'Frecuencia Promedio'}
                  {activeTab === 'tendencias' && 'Ventas Globales'}
                  {activeTab === 'asesor' && 'Ventas Asesor'}
                </span>
              </div>
              <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 ${
                activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'asesor'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400 border-emerald-500/10'
                  : activeTab === 'unicos'
                    ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400 border-blue-500/10'
                    : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400 border-amber-500/10'
              }`}>
                <Database size={42} />
              </div>
            </div>

            {/* KPI 2 */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias'
                ? 'border-l-4 border-l-indigo-500'
                : activeTab === 'unicos'
                  ? 'border-l-4 border-l-indigo-500'
                  : activeTab === 'frecuencia'
                    ? 'border-l-4 border-l-orange-500'
                    : 'border-l-4 border-l-sky-500'
            }`}>
              <div className="flex-1 min-w-0 pr-2">
                <span 
                  style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }}
                  className={`${
                    activeTab === 'ventas' || activeTab === 'unicos'
                      ? 'text-[22px]'
                      : 'text-[36px]'
                  } font-extrabold tracking-tight block leading-none mb-1.5 truncate`}
                >
                  {activeTab === 'ventas' && getShortNameWithLastName(salesData.leaderName)}
                  {activeTab === 'unicos' && getShortNameWithLastName(kpis.leaderName)}
                  {activeTab === 'frecuencia' && (
                    <>
                      {formatNumberWithDots(frequencyData.totalInvoices)}
                      <span 
                        style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                        className="text-base font-medium ml-1.5 font-sans"
                      >
                        FE+CT
                      </span>
                    </>
                  )}
                  {activeTab === 'tendencias' && (((monthlyTrends.reduce((max, curr) => curr.salesRaw > max.salesRaw ? curr : max, { label: 'Ninguno', salesRaw: 0 } as any) as any).label || 'Ninguno'))}
                  {activeTab === 'asesor' && (
                    <>
                      {selectedAdvisorAnalysis?.coverage || 0}
                      <span 
                        style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                        className="text-base font-medium ml-1.5 font-sans"
                      >
                        Clientes
                      </span>
                    </>
                  )}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                  className="text-[14px] font-semibold uppercase tracking-wider block mt-2"
                >
                  {activeTab === 'ventas' && 'Líder en Ventas'}
                  {activeTab === 'unicos' && 'Líder de Clientes'}
                  {activeTab === 'frecuencia' && 'Total Invoices'}
                  {activeTab === 'tendencias' && 'Mes Top Facturación'}
                  {activeTab === 'asesor' && 'Clientes Atendidos'}
                </span>
                <span className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400 block mt-2 leading-none">
                  {activeTab === 'ventas' && formatMillionsCOP(salesData.leaderSales)}
                  {activeTab === 'unicos' && `${formatNumberWithDots(kpis.leaderCoverage)} Clientes`}
                  {activeTab === 'frecuencia' && formatMillionsCOP(salesData.totalSales)}
                  {activeTab === 'tendencias' && formatMillionsCOP((monthlyTrends.reduce((max, curr) => max.salesRaw > curr.salesRaw ? max : curr, { salesRaw: 0 } as any) as any).salesRaw || 0)}
                  {activeTab === 'asesor' && `Posición #${selectedAdvisorAnalysis?.ranking || 1}`}
                </span>
              </div>
              <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 ${
                activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'unicos'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/5 dark:text-indigo-400 border-indigo-500/10'
                  : activeTab === 'frecuencia'
                    ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/5 dark:text-orange-400 border-orange-500/10'
                    : 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/5 dark:text-sky-400 border-sky-500/10'
              }`}>
                <User size={42} />
              </div>
            </div>

            {/* KPI 3 */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias'
                ? 'border-l-4 border-l-amber-500'
                : activeTab === 'unicos'
                  ? 'border-l-4 border-l-emerald-500'
                  : activeTab === 'frecuencia'
                    ? 'border-l-4 border-l-rose-500'
                    : 'border-l-4 border-l-amber-500'
            }`}>
              <div className="flex-1 min-w-0 pr-2">
                <span className={`${
                  activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'frecuencia'
                    ? 'text-[26px]'
                    : 'text-[36px]'
                } font-extrabold tracking-tight block leading-none mb-1.5 ${
                  activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'asesor'
                    ? 'text-amber-700 dark:text-amber-400'
                    : activeTab === 'unicos'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-455 dark:text-rose-400'
                }`}>
                  {activeTab === 'ventas' && formatMillionsCOP(salesData.avgSales)}
                  {activeTab === 'unicos' && `${kpis.participation}%`}
                  {activeTab === 'frecuencia' && getShortNameWithLastName(frequencyData.leaderName)}
                  {activeTab === 'tendencias' && formatMillionsCOP(salesData.totalSales / (monthlyTrends.length || 1))}
                  {activeTab === 'asesor' && formatMillionsCOP(selectedAdvisorAnalysis?.ticketAverage || 0)}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                  className="text-[14px] font-semibold uppercase tracking-wider block mt-2"
                >
                  {activeTab === 'ventas' && 'Venta Promedio'}
                  {activeTab === 'unicos' && 'Promedio Clientes'}
                  {activeTab === 'frecuencia' && 'Mayor Frecuencia'}
                  {activeTab === 'tendencias' && 'Promedio Mensual'}
                  {activeTab === 'asesor' && 'Ticket Promedio'}
                </span>
              </div>
              <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 ${
                activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'asesor'
                  ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400 border-amber-500/10'
                  : activeTab === 'unicos'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400 border-emerald-500/10'
                    : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/5 dark:text-rose-450 border-rose-500/10'
              }`}>
                <PieChart size={42} />
              </div>
            </div>

            {/* KPI 4 */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias'
                ? 'border-l-4 border-l-sky-500'
                : activeTab === 'unicos'
                  ? 'border-l-4 border-l-sky-500'
                  : activeTab === 'frecuencia'
                    ? 'border-l-4 border-l-indigo-500'
                    : 'border-l-4 border-l-sky-500'
            }`}>
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[36px] font-extrabold tracking-tight block leading-none mb-1.5 text-sky-700 dark:text-sky-400">
                  {activeTab === 'ventas' && (
                    <>
                      {salesData.advisorsSales.length}
                      <span style={{ color: isDarkMode ? '#94A3B8' : '#334155' }} className="text-base font-medium ml-1.5 font-sans">Asesores</span>
                    </>
                  )}
                  {activeTab === 'unicos' && (
                    <>
                      {chartAdvisorsData.length}
                      <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1.5 font-sans">Asesores</span>
                    </>
                  )}
                  {activeTab === 'frecuencia' && (
                    <>
                      {frequencyData.advisorsFrequency.length}
                      <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1.5 font-sans">Asesores</span>
                    </>
                  )}
                  {activeTab === 'tendencias' && (
                    <>
                      {formatNumberWithDots(frequencyData.totalInvoices)}
                      <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1.5 font-sans">Facturas</span>
                    </>
                  )}
                  {activeTab === 'asesor' && `Ranking #${selectedAdvisorAnalysis?.ranking || 1}`}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                  className="text-[14px] font-semibold uppercase tracking-wider block mt-2"
                >
                  {activeTab === 'ventas' && 'Asesores Activos'}
                  {activeTab === 'unicos' && 'Asesores Activos'}
                  {activeTab === 'frecuencia' && 'Asesores Activos'}
                  {activeTab === 'tendencias' && 'Facturas Totales'}
                  {activeTab === 'asesor' && 'Ranking Ventas'}
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 bg-sky-500/10 text-sky-600 dark:bg-sky-500/5 dark:text-sky-400 border-sky-500/10">
                <Users size={42} />
              </div>
            </div>

            {/* KPI 5 */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias'
                ? 'border-l-4 border-l-rose-500'
                : activeTab === 'unicos'
                  ? 'border-l-4 border-l-rose-500'
                  : activeTab === 'frecuencia'
                    ? 'border-l-4 border-l-teal-500'
                    : 'border-l-4 border-l-violet-500'
            }`}>
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[36px] font-extrabold tracking-tight block leading-none mb-1.5 text-rose-700 dark:text-rose-400">
                  {activeTab === 'ventas' && `${salesData.leaderPercentage}%`}
                  {activeTab === 'unicos' && `${(kpis.leaderCoverage / (kpis.totalUnique || 1) * 100).toFixed(1)}%`}
                  {activeTab === 'frecuencia' && `${frequencyData.leaderFrequency} c/cl`}
                  {activeTab === 'tendencias' && `${monthlyTrends.length} meses`}
                  {activeTab === 'asesor' && `${selectedAdvisorAnalysis?.percentage || 0}%`}
                </span>
                <span 
                  style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                  className="text-[14px] font-semibold uppercase tracking-wider block mt-2"
                >
                  {activeTab === 'ventas' && 'Participación Líder'}
                  {activeTab === 'unicos' && 'Participación Líder'}
                  {activeTab === 'frecuencia' && 'Frecuencia Líder'}
                  {activeTab === 'tendencias' && 'Meses Activos'}
                  {activeTab === 'asesor' && 'Participación Ventas'}
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 bg-rose-500/10 text-rose-600 dark:bg-rose-500/5 dark:text-rose-455 border-rose-500/10">
                <PieChart size={42} />
              </div>
            </div>
          </section>
        )
      )}

        {/* 4. SECCIÓN PRINCIPAL: GRÁFICO PROTAGONISTA (PROPORCIONAL, OPTIMIZADO E IMPECABLE) */}
        {activeTab === 'ventas' && (
          <div className="space-y-4 animate-fade-in">
            {/* Gráfico de Ventas en Millones de COP */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block mb-1">Facturación por Vendedor (Millones de COP)</span>
                <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">Análisis comparativo de ingresos facturados por cada asesor comercial</h3>
              </div>

              <div className="w-full h-[460px]">
                <ResponsiveContainer width="100%" height={430}>
                  <BarChart data={salesChartData} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#047857" stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                       strokeDasharray="3 3" 
                      vertical={false} 
                      stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} 
                    />
                    <XAxis 
                      dataKey="shortName" 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatYAxisMillions}
                      domain={[0, (dataMax: number) => Math.ceil((dataMax || 10) * 1.15)]}
                    />
                    <Tooltip 
                      content={(props: any) => <CustomTooltip {...props} isDarkMode={isDarkMode} type="ventas" />} 
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }} 
                    />
                    <Bar 
                      dataKey="salesInMillions" 
                      fill="url(#salesGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={salesChartData.length < 5 ? 65 : 45}
                    >
                      <LabelList 
                        dataKey="salesInMillions" 
                        position="top" 
                        formatter={(val: any) => typeof val === 'number' ? formatMillionsValue(val).replace(' ', '') : ''}
                        style={{ fill: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: 9, fontWeight: 'bold' }} 
                        offset={6} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* 5. GRID DOS COLUMNAS: TABLA EJECUTIVA & DONUT CHART (EVITA COMPLETAMENTE EL SCROLL VERTICAL) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* Tabla Resumen de Detalle (60% del ancho del grid) */}
              <section className={`p-4 rounded-2xl border transition-colors duration-300 lg:col-span-3 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block mb-1">Detalle de Ventas por Vendedor (Millones de COP)</span>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className={`border-b transition-colors font-extrabold text-[12px] uppercase tracking-wider ${
                          isDarkMode ? 'border-gray-800/60' : 'border-gray-200'
                        }`}>
                          <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-1.5 px-2 font-black">#</th>
                          <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-1.5 px-2 font-black">Vendedor</th>
                          <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-1.5 px-2 text-right font-black">Ventas (COP)</th>
                          <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-1.5 px-2 text-right font-black">Participación</th>
                          <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-1.5 px-2 text-center font-black">Clientes</th>
                          <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-1.5 px-2 text-right font-black">Ticket Prom.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.advisorsSales.map((adv, idx) => {
                          const colorIndex = parseInt(adv.id) || 0;
                          const badgeColor = MESES_CONFIG[colorIndex % MESES_CONFIG.length]?.color || '#10b981';
                          const shortName = getShortNameWithLastName(adv.name);

                          let rowClass = `border-b transition-all duration-200 ${
                            isDarkMode 
                              ? 'border-gray-800/40 hover:bg-gray-900/20 text-gray-300' 
                              : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                          }`;
                          let rankBadge = null;

                          if (idx === 0) {
                            rowClass = `border-b transition-all duration-200 border-l-2 border-l-amber-500/80 ${
                              isDarkMode 
                                ? 'bg-amber-500/[0.04] border-gray-800/40 hover:bg-amber-500/[0.07] text-gray-100 font-semibold' 
                                : 'bg-amber-500/[0.03] border-gray-100 hover:bg-amber-500/[0.06] text-gray-900 font-semibold'
                            }`;
                            rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-450 rounded px-1.5 py-0.5 font-black text-[9px]">🥇 1</span>;
                          } else if (idx === 1) {
                            rowClass = `border-b transition-all duration-200 border-l-2 border-l-slate-400/80 ${
                              isDarkMode 
                                ? 'bg-slate-400/[0.04] border-gray-800/40 hover:bg-slate-400/[0.07] text-gray-100 font-semibold' 
                                : 'bg-slate-400/[0.03] border-gray-100 hover:bg-slate-400/[0.06] text-gray-900 font-semibold'
                            }`;
                            rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-slate-400/10 text-slate-500 dark:text-slate-400 rounded px-1.5 py-0.5 font-black text-[9px]">🥈 2</span>;
                          } else if (idx === 2) {
                            rowClass = `border-b transition-all duration-200 border-l-2 border-l-orange-500/80 ${
                              isDarkMode 
                                ? 'bg-orange-500/[0.04] border-gray-800/40 hover:bg-orange-500/[0.07] text-gray-100 font-semibold' 
                                : 'bg-orange-500/[0.03] border-gray-100 hover:bg-orange-500/[0.06] text-gray-900 font-semibold'
                            }`;
                            rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded px-1.5 py-0.5 font-black text-[9px]">🥉 3</span>;
                          } else {
                            rankBadge = <span style={{ color: isDarkMode ? '#94A3B8' : '#334155' }} className="font-bold px-1.5">{idx + 1}</span>;
                          }

                          return (
                            <tr key={adv.id} className={rowClass}>
                              <td className="py-1.5 px-2">{rankBadge}</td>
                              <td style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-1.5 px-2 font-bold">
                                {shortName}
                              </td>
                              <td className="py-1.5 px-2 text-right font-black text-emerald-600 dark:text-emerald-400">
                                {formatMillionsCOP(adv.salesRaw)}
                              </td>
                              <td style={{ color: isDarkMode ? '#CBD5E1' : '#000000' }} className="py-1.5 px-2 text-right font-black">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span>{adv.percentage}%</span>
                                  <div style={{ backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }} className="w-16 h-1.5 rounded-full overflow-hidden shrink-0">
                                    <div className="h-full" style={{ width: `${adv.percentage}%`, backgroundColor: badgeColor }} />
                                  </div>
                                </div>
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold text-sky-600 dark:text-sky-400">{adv.activeClients}</td>
                              <td className="py-1.5 px-2 text-right font-bold text-amber-600 dark:text-amber-400">{formatMillionsCOP(adv.ticketAverage)}</td>
                            </tr>
                          );
                        })}
                        {/* TOTAL GENERAL */}
                        <tr style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="font-extrabold border-t-2 border-gray-300 dark:border-gray-800 bg-gray-500/5">
                          <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-1.5 px-2" colSpan={2}>Total General</td>
                          <td className="py-1.5 px-2 text-right text-emerald-650 dark:text-emerald-400">{formatMillionsCOP(salesData.totalSales)}</td>
                          <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-1.5 px-2 text-right">100.0%</td>
                          <td className="py-1.5 px-2 text-center text-sky-600 dark:text-sky-400">{salesData.globalUniqueClientsCount}</td>
                          <td className="py-1.5 px-2 text-right text-amber-600 dark:text-amber-400">{formatMillionsCOP(salesData.globalTicketAverage)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Gráfico Donut de Participación (40% del ancho del grid) */}
              <section className={`p-4 rounded-2xl border transition-colors duration-300 lg:col-span-2 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block mb-1">Participación por Vendedor</span>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2 mt-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative w-52 h-52 flex items-center justify-center">
                        <svg className="w-full h-full animate-fade-in" viewBox="0 0 100 100">
                          {/* Circles rotated counter-clockwise by 90 degrees inside a group */}
                          <g transform="rotate(-90 50 50)">
                            {donutSlices.map((slice, idx) => (
                              <circle
                                key={idx}
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth="20"
                                strokeDasharray={slice.strokeDashArray}
                                strokeDashoffset={slice.strokeDashOffset}
                                className="transition-all duration-500 hover:stroke-[22] cursor-pointer"
                              />
                            ))}
                          </g>
                          {/* Upright horizontal labels for percentages centered inside the ring slices */}
                          {donutSlices.map((slice, idx) => {
                            if (slice.percentage < 5) return null;
                            return (
                              <text
                                key={`label-${idx}`}
                                x={slice.labelX}
                                y={slice.labelY}
                                fill="#ffffff"
                                fontSize="4.8"
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="pointer-events-none select-none font-sans font-black"
                              >
                                {slice.percentage}%
                              </text>
                            );
                          })}
                        </svg>
                      </div>
                      
                      {/* Total Ventas text placed cleanly below the donut chart */}
                      <div className="mt-3 text-center p-2 rounded-xl bg-slate-500/5 border border-slate-500/10 w-full max-w-[190px]">
                        <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[10px] font-extrabold uppercase tracking-widest block">Total Ventas</span>
                        <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-[16px] font-black block mt-0.5 leading-none">
                          {formatMillionsCOP(salesData.totalSales)}
                        </span>
                      </div>
                    </div>

                    {/* Vendedores legend with larger font size and better spacing */}
                    <div className="flex-1 space-y-2.5 text-[13px] w-full max-h-[260px] overflow-y-auto pl-2 pr-1">
                      {salesData.advisorsSales.map((adv) => {
                        const colorIndex = parseInt(adv.id) || 0;
                        const legendColor = MESES_CONFIG[colorIndex % MESES_CONFIG.length]?.color || '#10b981';
                        const shortName = getShortNameWithLastName(adv.name);

                        return (
                          <div key={adv.id} className="flex items-center gap-2.5 font-semibold">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: legendColor }}></div>
                            <div className="min-w-0 flex-1 truncate">
                              <p style={{ color: isDarkMode ? '#CBD5E1' : '#000000' }} className="font-extrabold truncate text-[13px] uppercase tracking-wider">
                                {shortName}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}

        {activeTab === 'cobertura' && (
          <div className="flex flex-col gap-6 animate-fade-in mb-8">
            {/* FILA 2 — ANÁLISIS PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* BLOQUE IZQUIERDO (70% - Ranking de Cobertura por Asesor) */}
              <section className={`p-5 rounded-2xl border transition-colors duration-300 lg:col-span-8 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
              }`}>
                <div>
                  <div className="mb-5 flex flex-col gap-1">
                    <h3 
                      style={{ color: isDarkMode ? '#F8FAFC' : '#000000' }}
                      className="text-[18px] font-extrabold uppercase tracking-tight font-sans"
                    >
                      RANKING DE COBERTURA POR ASESOR
                    </h3>
                    <p 
                      style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.85)' }}
                      className="text-[14px] font-medium"
                    >
                      Número de clientes activos por asesor en el período seleccionado.
                    </p>
                  </div>

                  <div className="w-full mt-4 pr-2">
                    {/* Encabezados de Columna del Ranking */}
                    <div 
                      style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.80)' }}
                      className="flex items-center text-[11px] font-bold uppercase tracking-wider mb-3.5 px-1"
                    >
                      <div className="w-[180px]"></div>
                      <div className="flex-1"></div>
                      <span className="w-[60px] text-right">Clientes</span>
                      <span className="w-[80px] text-right">Participación</span>
                    </div>

                    {/* Lista Horizontal de Barras */}
                    <div className="space-y-3">
                      {chartAdvisorsData.map((adv, idx) => {
                        const total = kpis.totalUnique;
                        const percentage = total > 0 ? ((adv.dynamicCoverage / total) * 100).toFixed(1) : "0.0";
                        const shortName = toTitleCase(getShortNameWithLastName(adv.name));
                        
                        // Top 3 medal badges
                        const badgeContent = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : String(idx + 1);
                        const badgeClass = idx === 0 
                          ? 'w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-sm shrink-0 border border-amber-300/60 dark:border-amber-700/60 shadow-sm'
                          : idx === 1
                          ? 'w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 flex items-center justify-center text-sm shrink-0 border border-slate-300/60 dark:border-slate-600/60 shadow-sm'
                          : idx === 2
                          ? 'w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 flex items-center justify-center text-sm shrink-0 border border-orange-300/60 dark:border-orange-700/60 shadow-sm'
                          : 'w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#94A3B8] flex items-center justify-center text-[11px] font-black shrink-0';

                        // Top 3 get a gradient bar
                        const barClass = idx === 0 
                          ? 'h-full rounded-full bg-gradient-to-r from-[#16A34A] to-[#059669] transition-all duration-500'
                          : idx === 1
                          ? 'h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] transition-all duration-500'
                          : idx === 2
                          ? 'h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] transition-all duration-500'
                          : 'h-full rounded-full bg-[#16A34A] transition-all duration-500';

                        return (
                          <div key={adv.id} className={`flex items-center px-1 py-0.5 rounded-lg transition-colors duration-200 ${
                            idx < 3 ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30' : ''
                          }`}>
                            {/* Círculo de ranking */}
                            <div className={badgeClass}>
                              {badgeContent}
                            </div>
                            {/* Nombre del Asesor */}
                            <span 
                              style={{ color: isDarkMode ? (idx < 3 ? '#FFFFFF' : '#CBD5E1') : (idx < 3 ? '#000000' : 'rgba(0, 0, 0, 0.85)') }}
                              className="text-[14px] font-bold w-[148px] truncate ml-2"
                            >
                              {shortName}
                            </span>
                            {/* Barra de progreso */}
                            <div className={`flex-1 h-4 rounded-full overflow-hidden mr-4 relative ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                              <div 
                                className={barClass}
                                style={{ width: `${(adv.dynamicCoverage / 280) * 100}%` }}
                              />
                            </div>
                            {/* Clientes */}
                            <span 
                              style={{ color: isDarkMode ? (idx < 3 ? '#FFFFFF' : '#E2E8F0') : (idx < 3 ? '#000000' : 'rgba(0, 0, 0, 0.85)') }}
                              className="w-[60px] text-right text-[14px] font-extrabold"
                            >
                              {adv.dynamicCoverage}
                            </span>
                            {/* Participación */}
                            <span 
                              style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.75)' }}
                              className="w-[80px] text-right text-[14px] font-bold"
                            >
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Eje X de escala */}
                    <div 
                      style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.70)' }}
                      className="flex items-center mt-4 pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-[11px] font-bold px-1"
                    >
                      <div className="w-[180px]"></div>
                      <div className="flex-1 flex justify-between relative px-1 pr-4">
                        <span>0</span>
                        <span>70</span>
                        <span>140</span>
                        <span>210</span>
                        <span>280</span>
                      </div>
                      <div className="w-[140px]"></div>
                    </div>
                    <div 
                      style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.70)' }}
                      className="flex justify-center text-[11px] font-bold mt-1"
                    >
                      <span>Clientes activos</span>
                    </div>

                  </div>
                </div>
              </section>

              {/* BLOQUE DERECHO (30% - Treemap de Participación) */}
              <section className={`p-5 rounded-2xl border transition-colors duration-300 lg:col-span-4 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
              }`}>
                <div className="h-full flex flex-col justify-between">
                  <div className="mb-4 flex flex-col gap-1">
                    <h3 
                      style={{ color: isDarkMode ? '#F8FAFC' : '#000000' }}
                      className="text-[18px] font-extrabold uppercase tracking-tight"
                    >
                      DISTRIBUCIÓN DE COBERTURA
                    </h3>
                    <p 
                      style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.85)' }}
                      className="text-[14px] font-medium"
                    >
                      Participación porcentual de clientes activos por asesor.
                    </p>
                  </div>

                  {/* Treemap Bento de 3 Filas Horizontales Proporcionales */}
                  <div className="flex flex-col gap-2 h-[380px] shrink-0 font-sans select-none">
                    {/* FILA 1: Rank 1 (Green) y Rank 2 (Purple) */}
                    {(() => {
                      const c1 = chartAdvisorsData[0]?.dynamicCoverage || 1;
                      const c2 = chartAdvisorsData[1]?.dynamicCoverage || 1;
                      const totalRow = c1 + c2;
                      const w1 = `${(c1 / totalRow) * 100}%`;
                      const w2 = `${(c2 / totalRow) * 100}%`;
                      
                      return (
                        <div className="h-[42%] flex gap-2 w-full">
                          {chartAdvisorsData[0] && (
                            <div 
                              style={{ width: w1 }} 
                              className="p-4 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#059669] border-[#047857] hover:opacity-90"
                            >
                              <span className="font-bold text-[13px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[0].name))}</span>
                              <div className="flex flex-col mt-1.5 w-full text-white">
                                <span className="font-extrabold text-[17px] leading-none">{chartAdvisorsData[0].dynamicCoverage}</span>
                                <span className="font-bold text-[14px] leading-none opacity-90 mt-1">{kpis.totalUnique > 0 ? ((chartAdvisorsData[0].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                          {chartAdvisorsData[1] && (
                            <div 
                              style={{ width: w2 }} 
                              className="p-4 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#7C3AED] border-[#6D28D9] hover:opacity-90"
                            >
                              <span className="font-bold text-[13px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[1].name))}</span>
                              <div className="flex flex-col mt-1.5 w-full text-white">
                                <span className="font-extrabold text-[17px] leading-none">{chartAdvisorsData[1].dynamicCoverage}</span>
                                <span className="font-bold text-[14px] leading-none opacity-90 mt-1">{kpis.totalUnique > 0 ? ((chartAdvisorsData[1].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* FILA 2: Rank 3 (Blue), Rank 4 (Amber) y Rank 5 (Teal) */}
                    {(() => {
                      const c3 = chartAdvisorsData[2]?.dynamicCoverage || 1;
                      const c4 = chartAdvisorsData[3]?.dynamicCoverage || 1;
                      const c5 = chartAdvisorsData[4]?.dynamicCoverage || 1;
                      const totalRow = c3 + c4 + c5;
                      const w3 = `${(c3 / totalRow) * 100}%`;
                      const w4 = `${(c4 / totalRow) * 100}%`;
                      const w5 = `${(c5 / totalRow) * 100}%`;
                      
                      return (
                        <div className="h-[32%] flex gap-2 w-full">
                          {chartAdvisorsData[2] && (
                            <div 
                              style={{ width: w3 }} 
                              className="p-3.5 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#2563EB] border-[#1D4ED8] hover:opacity-90"
                            >
                              <span className="font-bold text-[12px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[2].name))}</span>
                              <div className="flex flex-col mt-1 w-full text-white">
                                <span className="font-extrabold text-[15px] leading-none">{chartAdvisorsData[2].dynamicCoverage}</span>
                                <span className="font-bold text-[13px] leading-none opacity-90 mt-1">{kpis.totalUnique > 0 ? ((chartAdvisorsData[2].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                          {chartAdvisorsData[3] && (
                            <div 
                              style={{ width: w4 }} 
                              className="p-3.5 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#D97706] border-[#B45309] hover:opacity-90"
                            >
                              <span className="font-bold text-[12px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[3].name))}</span>
                              <div className="flex flex-col mt-1 w-full text-white">
                                <span className="font-extrabold text-[15px] leading-none">{chartAdvisorsData[3].dynamicCoverage}</span>
                                <span className="font-bold text-[13px] leading-none opacity-90 mt-1">{kpis.totalUnique > 0 ? ((chartAdvisorsData[3].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                          {chartAdvisorsData[4] && (
                            <div 
                              style={{ width: w5 }} 
                              className="p-3.5 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#0D9488] border-[#0F766E] hover:opacity-90"
                            >
                              <span className="font-bold text-[12px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[4].name))}</span>
                              <div className="flex flex-col mt-1 w-full text-white">
                                <span className="font-extrabold text-[15px] leading-none">{chartAdvisorsData[4].dynamicCoverage}</span>
                                <span className="font-bold text-[13px] leading-none opacity-90 mt-1">{kpis.totalUnique > 0 ? ((chartAdvisorsData[4].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* FILA 3: Rank 6 (Red), Rank 7 (Orange), Rank 8 (Blue), Rank 9 (Purple) */}
                    {(() => {
                      const c6 = chartAdvisorsData[5]?.dynamicCoverage || 1;
                      const c7 = chartAdvisorsData[6]?.dynamicCoverage || 1;
                      const c8 = chartAdvisorsData[7]?.dynamicCoverage || 1;
                      const c9 = chartAdvisorsData[8]?.dynamicCoverage || 1;
                      const totalRow = c6 + c7 + c8 + c9;
                      const w6 = `${(c6 / totalRow) * 100}%`;
                      const w7 = `${(c7 / totalRow) * 100}%`;
                      const w8 = `${(c8 / totalRow) * 105}%`;
                      const w9 = `${(c9 / totalRow) * 95}%`;
                      
                      return (
                        <div className="h-[26%] flex gap-2 w-full">
                          {chartAdvisorsData[5] && (
                            <div 
                              style={{ width: w6 }} 
                              className="p-2.5 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#DC2626] border-[#B91C1C] hover:opacity-90"
                            >
                              <span className="font-bold text-[11px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[5].name))}</span>
                              <div className="flex flex-col mt-0.5 w-full text-white">
                                <span className="font-extrabold text-[13px] leading-none">{chartAdvisorsData[5].dynamicCoverage}</span>
                                <span className="font-bold text-[11px] leading-none opacity-90 mt-0.5">{kpis.totalUnique > 0 ? ((chartAdvisorsData[5].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                          {chartAdvisorsData[6] && (
                            <div 
                              style={{ width: w7 }} 
                              className="p-2.5 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#F97316] border-[#EA580C] hover:opacity-90"
                            >
                              <span className="font-bold text-[11px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[6].name))}</span>
                              <div className="flex flex-col mt-0.5 w-full text-white">
                                <span className="font-extrabold text-[13px] leading-none">{chartAdvisorsData[6].dynamicCoverage}</span>
                                <span className="font-bold text-[11px] leading-none opacity-90 mt-0.5">{kpis.totalUnique > 0 ? ((chartAdvisorsData[6].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                          {chartAdvisorsData[7] && (
                            <div 
                              style={{ width: w8 }} 
                              className="p-2.5 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#2563EB] border-[#1D4ED8] hover:opacity-90"
                            >
                              <span className="font-bold text-[11px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[7].name))}</span>
                              <div className="flex flex-col mt-0.5 w-full text-white">
                                <span className="font-extrabold text-[13px] leading-none">{chartAdvisorsData[7].dynamicCoverage}</span>
                                <span className="font-bold text-[11px] leading-none opacity-90 mt-0.5">{kpis.totalUnique > 0 ? ((chartAdvisorsData[7].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                          {chartAdvisorsData[8] && (
                            <div 
                              style={{ width: w9 }} 
                              className="p-2.5 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all duration-200 bg-[#7C3AED] border-[#6D28D9] hover:opacity-90"
                            >
                              <span className="font-bold text-[11px] leading-tight block truncate uppercase text-white">{toTitleCase(getShortNameWithLastName(chartAdvisorsData[8].name))}</span>
                              <div className="flex flex-col mt-0.5 w-full text-white">
                                <span className="font-extrabold text-[13px] leading-none">{chartAdvisorsData[8].dynamicCoverage}</span>
                                <span className="font-bold text-[11px] leading-none opacity-90 mt-0.5">{kpis.totalUnique > 0 ? ((chartAdvisorsData[8].dynamicCoverage / kpis.totalUnique) * 100).toFixed(1).replace('.', ',') : 0}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div 
                    style={{ color: isDarkMode ? '#E2E8F0' : '#000000' }}
                    className="text-center font-bold text-[14px] mt-3 border-t border-slate-200/80 dark:border-slate-700/60 pt-2"
                  >
                    Total: <span className="text-[#059669] font-extrabold">{formatNumberWithDots(kpis.totalUnique)}</span> clientes
                  </div>
                </div>
              </section>
            </div>

            {/* FILA 3 — EVOLUCIÓN DE COBERTURA (HEATMAP & SPARKLINE) */}
            <section className={`p-5 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            }`}>
              <div>
                <div className="mb-5">
                  <div className="flex flex-col gap-1">
                    <h3 
                      style={{ color: isDarkMode ? '#F8FAFC' : '#000000' }}
                      className="text-[18px] font-extrabold uppercase tracking-tight"
                    >
                      EVOLUCIÓN DE COBERTURA POR VENDEDOR
                    </h3>
                    <p 
                      style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.85)' }}
                      className="text-[14px] font-medium"
                    >
                      Clientes activos por asesor en cada período. Los colores indican la variación respecto al período anterior.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto mt-2 select-none">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr 
                        style={{ color: isDarkMode ? '#94A3B8' : 'rgba(0, 0, 0, 0.85)' }}
                        className={`border-b transition-colors font-extrabold text-[12px] uppercase tracking-wider ${
                          isDarkMode ? 'border-slate-800/60' : 'border-slate-200/80'
                        }`}
                      >
                        <th className="py-2.5 px-3">Vendedor</th>
                        {tableMonths.map(m => (
                          <th key={m} className="py-2.5 px-3 text-center">{getMonthLabel(m)}</th>
                        ))}
                        <th className="py-2.5 px-3 text-right">{variationHeaderLabel}</th>
                        <th className="py-2.5 px-3 text-right">Variación %</th>
                        <th className="py-2.5 px-3 text-center">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartAdvisorsData.map((adv) => {
                        const activeMonths = MAESTRA_MESES.map(m => adv[m] || 0).filter(val => val > 0);
                        const totalCoverage = activeMonths.reduce((sum, val) => sum + val, 0);
                        const avgCoverage = activeMonths.length > 0 ? totalCoverage / activeMonths.length : 0;

                        const valLast = lastMonth ? (adv[lastMonth] || 0) : 0;
                        const valPrev = prevMonth ? (adv[prevMonth] || 0) : 0;
                        
                        const diffVal = valLast - valPrev;
                        const diffPct = valPrev > 0 ? ((diffVal / valPrev) * 100).toFixed(1) : "0.0";
                        const diffColor = diffVal > 0 
                          ? 'text-[#16A34A] font-extrabold' 
                          : diffVal === 0 
                            ? 'text-[#F59E0B] font-extrabold' 
                            : 'text-[#EF4444] font-extrabold';
                        
                        const trendPoints = tableMonths.map(m => adv[m] || 0);
                        const sparklineColor = diffVal > 0 
                          ? '#16A34A' 
                          : diffVal === 0 
                            ? '#F59E0B' 
                            : '#EF4444';
                            
                        const shortName = toTitleCase(getShortNameWithLastName(adv.name));

                        return (
                          <tr 
                            key={adv.id} 
                            className={`border-b transition-all duration-200 ${
                              isDarkMode 
                                ? 'border-gray-800/40 hover:bg-gray-800/60 text-gray-300' 
                                : 'border-gray-100 hover:bg-slate-50 text-gray-750'
                            }`}
                          >
                            <td 
                              style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                              className="py-3 px-3 font-bold text-[14px]"
                            >
                              {shortName}
                            </td>
                            {tableMonths.map(m => {
                              const val = adv[m] || 0;
                              const cellClass = getCellClass(val, avgCoverage, isDarkMode);
                              return (
                                <td key={m} className="py-2.5 px-3 text-center">
                                  <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${cellClass}`}>
                                    {val}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="py-2.5 px-3 text-right">
                              <span className={`text-[12px] font-extrabold ${diffColor}`}>
                                {diffVal >= 0 ? `+${diffVal}` : diffVal}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`text-[13px] font-extrabold ${diffColor}`}>
                                {diffVal >= 0 ? `+${diffPct}%` : `${diffPct}%`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center h-[40px] align-middle">
                              <Sparkline data={trendPoints} color={sparklineColor} />
                            </td>
                          </tr>
                        );
                      })}

                      {/* TOTAL EMPRESA */}
                      {(() => {
                        const monthSums: Record<string, number> = {};
                        MAESTRA_MESES.forEach(m => {
                          monthSums[m] = chartAdvisorsData.reduce((acc, curr) => acc + ((curr[m] as number) || 0), 0);
                        });

                        const activeTotalMonths = MAESTRA_MESES.map(m => monthSums[m]).filter(val => val > 0);
                        const totalEnterpriseCoverage = activeTotalMonths.reduce((sum, val) => sum + val, 0);
                        const avgEnterpriseCoverage = activeTotalMonths.length > 0 ? totalEnterpriseCoverage / activeTotalMonths.length : 0;

                        const sumLast = lastMonth ? monthSums[lastMonth] : 0;
                        const sumPrev = prevMonth ? monthSums[prevMonth] : 0;

                        const totalDiffVal = sumLast - sumPrev;
                        const totalDiffPct = sumPrev > 0 ? ((totalDiffVal / sumPrev) * 100).toFixed(1) : "0.0";
                        const totalDiffColor = totalDiffVal > 0 
                          ? 'text-[#16A34A] font-extrabold' 
                          : totalDiffVal === 0 
                            ? 'text-[#F59E0B] font-extrabold' 
                            : 'text-[#EF4444] font-extrabold';

                        const totalTrendPoints = tableMonths.map(m => monthSums[m]);
                        const totalSparkColor = totalDiffVal > 0 ? '#16A34A' : totalDiffVal === 0 ? '#F59E0B' : '#EF4444';

                        return (
                          <tr 
                            style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                            className="font-extrabold border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20"
                          >
                            <td className="py-4 px-3 font-black text-[14px] tracking-tight">TOTAL EMPRESA</td>
                            {tableMonths.map(m => {
                              const val = monthSums[m];
                              const cellClass = getCellClass(val, avgEnterpriseCoverage, isDarkMode);
                              return (
                                <td key={m} className="py-3 px-3 text-center">
                                  <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${cellClass}`}>
                                    {formatNumberWithDots(val)}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="py-3 px-3 text-right">
                              <span className={`text-[12px] font-extrabold ${totalDiffColor}`}>
                                {totalDiffVal >= 0 ? `+${totalDiffVal}` : totalDiffVal}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`text-[12px] font-extrabold ${totalDiffColor}`}>
                                {totalDiffVal >= 0 ? `+${totalDiffPct}%` : `${totalDiffPct}%`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center h-[40px] align-middle">
                              <Sparkline data={totalTrendPoints} color={totalSparkColor} />
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'unicos' && (
          <div className="space-y-4 animate-fade-in">
            {/* Gráfico de Clientes Únicos */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider block mb-1">Clientes Únicos por Vendedor</span>
                <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">Análisis comparativo de clientes únicos atendidos sin duplicación</h3>
              </div>

              <div className="w-full h-[460px]">
                <ResponsiveContainer width="100%" height={430}>
                  <BarChart data={chartAdvisorsData} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="unicosGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} 
                    />
                    <XAxis 
                      dataKey="shortName" 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                      domain={[0, (dataMax: number) => Math.ceil((dataMax || 10) * 1.15)]}
                    />
                    <Tooltip 
                      content={(props: any) => <CustomTooltip {...props} isDarkMode={isDarkMode} type="cobertura-grupal" />} 
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }} 
                    />
                    <Bar 
                      dataKey="dynamicCoverage" 
                      fill="url(#unicosGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={chartAdvisorsData.length < 5 ? 65 : 45}
                    >
                      <LabelList 
                        dataKey="dynamicCoverage" 
                        position="top" 
                        style={{ fill: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: 9, fontWeight: 'bold' }} 
                        offset={6} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Grid Detalle y Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* Tabla Detalle */}
              <section className={`p-4 rounded-2xl border transition-colors duration-300 lg:col-span-3 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-[14px] font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider block mb-1">Detalle de Clientes Únicos por Vendedor</span>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className={`border-b transition-colors font-extrabold text-[12px] uppercase tracking-wider ${
                          isDarkMode ? 'border-gray-800/60 text-table-header' : 'border-gray-200 text-table-header'
                        }`}>
                          <th className="py-1.5 px-2">#</th>
                          <th className="py-1.5 px-2">Vendedor</th>
                          <th className="py-1.5 px-2 text-center">Clientes Únicos</th>
                          <th className="py-1.5 px-2 text-right">Participación %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartAdvisorsData.map((adv, idx) => {
                          const colorIndex = idx;
                          const badgeColor = MESES_CONFIG[colorIndex % MESES_CONFIG.length]?.color || '#8b5cf6';
                          const totalCoverage = chartAdvisorsData.reduce((acc, curr) => acc + curr.dynamicCoverage, 0);
                          const percentage = totalCoverage > 0 ? ((adv.dynamicCoverage / totalCoverage) * 100).toFixed(1) : "0.0";
                          const shortName = getShortNameWithLastName(adv.name);

                          let rowClass = `border-b transition-all duration-200 ${
                            isDarkMode 
                              ? 'border-gray-800/40 hover:bg-gray-900/20 text-gray-300' 
                              : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                          }`;
                          let rankBadge = null;

                          if (idx === 0) {
                            rowClass = `border-b transition-all duration-200 border-l-2 border-l-amber-500/80 ${
                              isDarkMode 
                                ? 'bg-amber-500/[0.04] border-gray-800/40 hover:bg-amber-500/[0.07] text-gray-100 font-semibold' 
                                : 'bg-amber-500/[0.03] border-gray-100 hover:bg-amber-500/[0.06] text-gray-900 font-semibold'
                            }`;
                            rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-450 rounded px-1.5 py-0.5 font-black text-[9px]">🥇 1</span>;
                          } else if (idx === 1) {
                            rowClass = `border-b transition-all duration-200 border-l-2 border-l-slate-400/80 ${
                              isDarkMode 
                                ? 'bg-slate-400/[0.04] border-gray-800/40 hover:bg-slate-400/[0.07] text-gray-100 font-semibold' 
                                : 'bg-slate-400/[0.03] border-gray-100 hover:bg-slate-400/[0.06] text-gray-900 font-semibold'
                            }`;
                            rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-slate-400/10 text-slate-500 dark:text-slate-400 rounded px-1.5 py-0.5 font-black text-[9px]">🥈 2</span>;
                          } else if (idx === 2) {
                            rowClass = `border-b transition-all duration-200 border-l-2 border-l-orange-500/80 ${
                              isDarkMode 
                                ? 'bg-orange-500/[0.04] border-gray-800/40 hover:bg-orange-500/[0.07] text-gray-100 font-semibold' 
                                : 'bg-orange-500/[0.03] border-gray-100 hover:bg-orange-500/[0.06] text-gray-900 font-semibold'
                            }`;
                            rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded px-1.5 py-0.5 font-black text-[9px]">🥉 3</span>;
                          } else {
                            rankBadge = <span className="text-gray-400 font-bold px-1.5">{idx + 1}</span>;
                          }

                          return (
                            <tr key={adv.id} className={rowClass}>
                              <td className="py-1.5 px-2">{rankBadge}</td>
                              <td style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-1.5 px-2 font-bold">{shortName}</td>
                              <td className="py-1.5 px-2 text-center font-black text-violet-600 dark:text-violet-400">{adv.dynamicCoverage}</td>
                              <td style={{ color: isDarkMode ? '#CBD5E1' : '#000000' }} className="py-1.5 px-2 text-right font-black">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span>{percentage}%</span>
                                  <div style={{ backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }} className="w-16 h-1.5 rounded-full overflow-hidden shrink-0">
                                    <div className="h-full" style={{ width: `${percentage}%`, backgroundColor: badgeColor }} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {/* TOTAL GENERAL */}
                        <tr style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="font-extrabold border-t-2 border-gray-300 dark:border-gray-800 bg-gray-500/5">
                          <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-2 px-1" colSpan={2}>Total General</td>
                          <td className="py-2 px-1 text-center text-violet-650 dark:text-violet-400">{chartAdvisorsData.reduce((acc, curr) => acc + curr.dynamicCoverage, 0)}</td>
                          <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-2 px-1 text-right">100.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Donut Chart */}
              <section className={`p-4 rounded-2xl border transition-colors duration-300 lg:col-span-2 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-[14px] font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider block mb-1">Participación de Clientes</span>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2 mt-2">
                    <div className="relative w-52 h-52 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 animate-fade-in" viewBox="0 0 100 100">
                        {unicosDonutSlices.map((slice, idx) => (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth="9"
                            strokeDasharray={slice.strokeDashArray}
                            strokeDashoffset={slice.strokeDashOffset}
                            className="transition-all duration-500 hover:stroke-[11] cursor-pointer"
                          />
                        ))}
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest leading-none">Clientes</span>
                        <span className={`text-[16px] font-black leading-none mt-1 transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {chartAdvisorsData.reduce((acc, curr) => acc + curr.dynamicCoverage, 0)}
                        </span>
                        <span className="text-[8px] font-extrabold text-gray-400 mt-1 leading-none">Activos</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1 text-[10px] w-full max-h-[190px] overflow-y-auto pl-2">
                      {chartAdvisorsData.map((adv, idx) => {
                        const colorIndex = idx;
                        const legendColor = MESES_CONFIG[colorIndex % MESES_CONFIG.length]?.color || '#8b5cf6';
                        const totalCoverage = chartAdvisorsData.reduce((acc, curr) => acc + curr.dynamicCoverage, 0);
                        const percentage = totalCoverage > 0 ? ((adv.dynamicCoverage / totalCoverage) * 100).toFixed(1) : "0";
                        const shortName = getShortNameWithLastName(adv.name);

                        return (
                          <div key={adv.id} className="flex items-center gap-1.5 font-semibold">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: legendColor }}></div>
                            <div className="min-w-0 flex-1 truncate">
                              <p className={`font-black truncate text-[10px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {shortName}: {percentage}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}

        {activeTab === 'frecuencia' && (
          <div className="space-y-4 animate-fade-in">
            {/* Cabecera del Análisis de Riesgo */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div>
                <span style={{ color: isDarkMode ? '#F59E0B' : '#D97706' }} className="text-[14px] font-semibold uppercase tracking-wider block mb-1">
                  Análisis de Inactividad y Riesgo de Clientes
                </span>
                <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">
                  Monitoreo del tiempo transcurrido desde la última compra de cada cliente único
                </h3>
              </div>
            </section>

            {/* Tarjetas KPI de Estado de Riesgo */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Tarjeta 1: Saludable */}
              <div 
                onClick={() => { setSelectedRiskCategory('Saludable'); setClientListPage(1); }}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                  isDarkMode ? 'bg-[#1e293b]' : 'bg-white shadow-sm'
                } border-l-4 border-l-[#059669] ${
                  selectedRiskCategory === 'Saludable'
                    ? isDarkMode ? 'border-slate-700 ring-2 ring-[#059669] bg-emerald-950/5' : 'border-slate-300 ring-2 ring-[#059669] bg-emerald-50/20'
                    : isDarkMode ? 'border-slate-800/80' : 'border-slate-200/60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                    Saludable (0-15 días)
                  </span>
                  <span style={{ color: isDarkMode ? '#10B981' : '#059669' }} className="text-[25px] font-black leading-none block mt-1">
                    {clientRecencyData.summary.saludable}
                  </span>
                  <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[11px] font-semibold block mt-2">
                    {clientRecencyData.summary.total > 0 ? ((clientRecencyData.summary.saludable / clientRecencyData.summary.total) * 100).toFixed(1) : '0,0'}% del total
                  </span>
                </div>
              </div>

              {/* Tarjeta 2: Atención */}
              <div 
                onClick={() => { setSelectedRiskCategory('Atención'); setClientListPage(1); }}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                  isDarkMode ? 'bg-[#1e293b]' : 'bg-white shadow-sm'
                } border-l-4 border-l-[#D97706] ${
                  selectedRiskCategory === 'Atención'
                    ? isDarkMode ? 'border-slate-700 ring-2 ring-[#D97706] bg-amber-950/5' : 'border-slate-300 ring-2 ring-[#D97706] bg-amber-50/20'
                    : isDarkMode ? 'border-slate-800/80' : 'border-slate-200/60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                    Atención (16-30 días)
                  </span>
                  <span style={{ color: isDarkMode ? '#F59E0B' : '#D97706' }} className="text-[25px] font-black leading-none block mt-1">
                    {clientRecencyData.summary.atencion}
                  </span>
                  <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[11px] font-semibold block mt-2">
                    {clientRecencyData.summary.total > 0 ? ((clientRecencyData.summary.atencion / clientRecencyData.summary.total) * 100).toFixed(1) : '0,0'}% del total
                  </span>
                </div>
              </div>

              {/* Tarjeta 3: Riesgo */}
              <div 
                onClick={() => { setSelectedRiskCategory('Riesgo'); setClientListPage(1); }}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                  isDarkMode ? 'bg-[#1e293b]' : 'bg-white shadow-sm'
                } border-l-4 border-l-[#F97316] ${
                  selectedRiskCategory === 'Riesgo'
                    ? isDarkMode ? 'border-slate-700 ring-2 ring-[#F97316] bg-orange-950/5' : 'border-slate-300 ring-2 ring-[#F97316] bg-orange-50/20'
                    : isDarkMode ? 'border-slate-800/80' : 'border-slate-200/60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                    Riesgo (31-60 días)
                  </span>
                  <span style={{ color: isDarkMode ? '#EA580C' : '#F97316' }} className="text-[25px] font-black leading-none block mt-1">
                    {clientRecencyData.summary.riesgo}
                  </span>
                  <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[11px] font-semibold block mt-2">
                    {clientRecencyData.summary.total > 0 ? ((clientRecencyData.summary.riesgo / clientRecencyData.summary.total) * 100).toFixed(1) : '0,0'}% del total
                  </span>
                </div>
              </div>

              {/* Tarjeta 4: Perdido */}
              <div 
                onClick={() => { setSelectedRiskCategory('Perdido'); setClientListPage(1); }}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                  isDarkMode ? 'bg-[#1e293b]' : 'bg-white shadow-sm'
                } border-l-4 border-l-[#E11D48] ${
                  selectedRiskCategory === 'Perdido'
                    ? isDarkMode ? 'border-slate-700 ring-2 ring-[#E11D48] bg-red-950/5' : 'border-slate-300 ring-2 ring-[#E11D48] bg-red-50/20'
                    : isDarkMode ? 'border-slate-800/80' : 'border-slate-200/60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                    Perdido ({'>'}60 días)
                  </span>
                  <span style={{ color: isDarkMode ? '#BE123C' : '#E11D48' }} className="text-[25px] font-black leading-none block mt-1">
                    {clientRecencyData.summary.perdido}
                  </span>
                  <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[11px] font-semibold block mt-2">
                    {clientRecencyData.summary.total > 0 ? ((clientRecencyData.summary.perdido / clientRecencyData.summary.total) * 100).toFixed(1) : '0,0'}% del total
                  </span>
                </div>
              </div>

              {/* Tarjeta 5: Promedio General */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                isDarkMode ? 'bg-[#1e293b] border-slate-800/80' : 'bg-white border-slate-200/60 shadow-sm'
              } border-l-4 border-l-indigo-500`}>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                    Promedio Inactividad
                  </span>
                  <span className="text-[25px] font-black leading-none block mt-1 text-indigo-600 dark:text-indigo-400">
                    {clientRecencyData.summary.avgInactivity} <span className="text-xs font-normal">días</span>
                  </span>
                  <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[11px] font-semibold block mt-2">
                    Total clientes únicos: {clientRecencyData.summary.total}
                  </span>
                </div>
              </div>

            </section>

            {/* Fila del Gráfico y Tabla Detalle */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* Gráfica de Distribución de Riesgo */}
              <section className={`p-4 rounded-2xl border transition-colors duration-300 lg:col-span-2 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[14px] font-semibold uppercase tracking-wider block mb-1">
                    Distribución de Clientes por Nivel de Riesgo
                  </span>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[16px] font-bold uppercase tracking-tight mb-4">
                    Cantidad total de clientes en cada estado
                  </h3>
                  
                  <div className="w-full h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={clientRecencyData.chartData} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          vertical={false} 
                          stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} 
                        />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className={`p-4 border rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 font-sans text-xs ${
                                  isDarkMode ? 'bg-[#0f172a]/95 border-gray-800 text-gray-200' : 'bg-white/95 border-gray-200/80 text-gray-800'
                                }`}>
                                  <p className="font-extrabold border-b pb-1 mb-2">Estado: {data.name}</p>
                                  <p className="flex justify-between gap-6"><span>Rango:</span><span className="font-black text-slate-500">{data.range}</span></p>
                                  <p className="flex justify-between gap-6"><span>Clientes:</span><span className="font-black" style={{ color: isDarkMode ? data.darkColor : data.color }}>{data.value} cl</span></p>
                                  <p className="flex justify-between gap-6"><span>Participación:</span><span className="font-black">{clientRecencyData.summary.total > 0 ? ((data.value / clientRecencyData.summary.total) * 100).toFixed(1) : '0'}%</span></p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                          {clientRecencyData.chartData.map((entry, idx) => (
                            <Cell 
                              key={`cell-${idx}`} 
                              fill={isDarkMode ? entry.darkColor : entry.color} 
                              onClick={() => {
                                setSelectedRiskCategory(entry.name as any);
                                setClientListPage(1);
                              }}
                              className="cursor-pointer"
                            />
                          ))}
                          <LabelList 
                            dataKey="value" 
                            position="top" 
                            style={{ fill: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: 9, fontWeight: 'bold' }} 
                            offset={6} 
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* Tabla Detalle por Asesor Comercial */}
              <section className={`p-4 rounded-2xl border transition-colors duration-300 lg:col-span-3 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[14px] font-semibold uppercase tracking-wider block mb-1">
                    Análisis de Riesgo por Asesor Comercial
                  </span>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[16px] font-bold uppercase tracking-tight mb-4">
                    Clasificación de la cartera de clientes de cada vendedor
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[12px]">
                      <thead>
                        <tr className={`border-b transition-colors font-extrabold text-[11px] uppercase tracking-wider ${
                          isDarkMode ? 'border-gray-800/60 text-table-header' : 'border-gray-200 text-table-header'
                        }`}>
                          <th className="py-2 px-1">Asesor</th>
                          <th className="py-2 px-1 text-center bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400">Saludable</th>
                          <th className="py-2 px-1 text-center bg-amber-50/20 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400">Atención</th>
                          <th className="py-2 px-1 text-center bg-orange-50/20 dark:bg-orange-950/10 text-orange-700 dark:text-orange-400">Riesgo</th>
                          <th className="py-2 px-1 text-center bg-red-50/20 dark:bg-red-950/10 text-red-700 dark:text-red-400">Perdido</th>
                          <th className="py-2 px-1 text-center font-bold">Total Cl.</th>
                          <th className="py-2 px-1 text-right">Inactividad Prom.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientRecencyData.byVendor.map((adv) => (
                          <tr 
                            key={adv.sellerName}
                            className={`border-b transition-all duration-200 ${
                              isDarkMode 
                                ? 'border-gray-800/40 hover:bg-gray-900/20 text-gray-300' 
                                : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <td className="py-2 px-1 font-bold">{adv.shortName}</td>
                            <td className="py-2 px-1 text-center font-bold bg-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">{adv.saludable}</td>
                            <td className="py-2 px-1 text-center font-bold bg-amber-500/[0.03] text-amber-600 dark:text-amber-400">{adv.atencion}</td>
                            <td className="py-2 px-1 text-center font-bold bg-orange-500/[0.03] text-orange-600 dark:text-orange-400">{adv.riesgo}</td>
                            <td className="py-2 px-1 text-center font-bold bg-red-500/[0.03] text-red-600 dark:text-red-400">{adv.perdido}</td>
                            <td className="py-2 px-1 text-center font-extrabold text-slate-800 dark:text-slate-100">{adv.totalClients}</td>
                            <td className="py-2 px-1 text-right font-black text-indigo-600 dark:text-indigo-400">{adv.avgInactivityDays} días</td>
                          </tr>
                        ))}
                        {/* TOTAL GENERAL */}
                        <tr className="font-extrabold border-t-2 border-gray-800 text-gray-900 dark:text-white bg-gray-500/5 text-[12px]">
                          <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-2.5 px-1 font-black">Total General</td>
                          <td className="py-2.5 px-1 text-center text-emerald-600 dark:text-emerald-400">{clientRecencyData.summary.saludable}</td>
                          <td className="py-2.5 px-1 text-center text-amber-600 dark:text-amber-400">{clientRecencyData.summary.atencion}</td>
                          <td className="py-2.5 px-1 text-center text-orange-600 dark:text-orange-400">{clientRecencyData.summary.riesgo}</td>
                          <td className="py-2.5 px-1 text-center text-red-600 dark:text-red-400">{clientRecencyData.summary.perdido}</td>
                          <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-2.5 px-1 text-center font-black">{clientRecencyData.summary.total}</td>
                          <td className="py-2.5 px-1 text-right text-indigo-600 dark:text-indigo-400 font-black">{clientRecencyData.summary.avgInactivity} días</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

            </div>

            {/* Listado Detalle de Clientes según Estado de Riesgo */}
            <section className={`p-6 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[14px] font-semibold uppercase tracking-wider block">
                      Detalle Operativo de Clientes
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      selectedRiskCategory === 'TODOS' ? 'bg-indigo-500/10 text-indigo-550' :
                      selectedRiskCategory === 'Saludable' ? 'bg-emerald-500/10 text-emerald-500' :
                      selectedRiskCategory === 'Atención' ? 'bg-amber-500/10 text-amber-500' :
                      selectedRiskCategory === 'Riesgo' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {selectedRiskCategory === 'TODOS' ? 'Todos los Estados' : selectedRiskCategory}
                    </span>
                  </div>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[16px] font-bold uppercase tracking-tight">
                    {selectedRiskCategory === 'TODOS'
                      ? 'Listado general de clientes'
                      : `Listado de clientes clasificados en estado ${selectedRiskCategory}`
                    }
                  </h3>
                </div>

                {/* Selector y Buscador */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Selector de Categoría (Listbox) */}
                  <div className="relative">
                    <select
                      value={selectedRiskCategory}
                      onChange={(e) => {
                        setSelectedRiskCategory(e.target.value as any);
                        setClientListPage(1);
                      }}
                      className={`w-full sm:w-[220px] pl-3 pr-8 py-2 text-[12px] font-extrabold uppercase tracking-wider rounded-xl border appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'bg-[#1e293b] border-gray-800 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500' 
                          : 'bg-white border-gray-200 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm'
                      }`}
                    >
                      <option value="TODOS">📋 Todos los Clientes</option>
                      <option value="Saludable">🟢 Saludable (0-15 días)</option>
                      <option value="Atención">🟡 Atención (16-30 días)</option>
                      <option value="Riesgo">🟠 Riesgo (31-60 días)</option>
                      <option value="Perdido">🔴 Perdido (&gt;60 días)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>

                  {/* Buscador */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o código..."
                      value={clientSearchQuery}
                      onChange={(e) => {
                        setClientSearchQuery(e.target.value);
                        setClientListPage(1);
                      }}
                      className={`w-full sm:w-[240px] pl-9 pr-3 py-2 text-[12px] rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                        isDarkMode 
                          ? 'bg-[#1e293b] border-gray-800 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500' 
                          : 'bg-white border-gray-200 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm'
                      }`}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    {clientSearchQuery && (
                      <button
                        onClick={() => {
                          setClientSearchQuery('');
                          setClientListPage(1);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>

                  {/* Botón Descargar Excel */}
                  <button
                    onClick={downloadClientsExcel}
                    disabled={filteredClients.length === 0}
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                      filteredClients.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                        : isDarkMode
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-950/20 active:scale-95 cursor-pointer'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              {/* Tabla de Clientes */}
              <div className="overflow-x-auto rounded-xl border border-gray-200/40 dark:border-gray-800/40">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className={`border-b transition-colors font-extrabold text-[11px] uppercase tracking-wider ${
                      isDarkMode ? 'border-gray-800/60 bg-gray-950/20' : 'border-gray-200 bg-gray-50/50'
                    }`}>
                      <th className="py-3 px-4 font-black" style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }}>Código</th>
                      <th className="py-3 px-4 font-black" style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }}>Nombre del Cliente</th>
                      <th className="py-3 px-4 font-black" style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }}>Asesor Responsable</th>
                      <th className="py-3 px-4 font-black text-right" style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }}>Última Compra</th>
                      {selectedRiskCategory === 'TODOS' && (
                        <th className="py-3 px-4 font-black text-center" style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }}>Estado</th>
                      )}
                      <th className="py-3 px-4 font-black text-right" style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }}>Días de Inactividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.length === 0 ? (
                      <tr>
                        <td colSpan={selectedRiskCategory === 'TODOS' ? 6 : 5} className="py-12 text-center font-semibold" style={{ color: isDarkMode ? '#94A3B8' : '#334155' }}>
                          No se encontraron clientes en esta categoría con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      paginatedClients.map((client) => (
                        <tr 
                          key={client.clientCode}
                          className={`border-b transition-all duration-200 ${
                            isDarkMode 
                              ? 'border-gray-800/40 hover:bg-gray-900/20' 
                              : 'border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold" style={{ color: isDarkMode ? '#E2E8F0' : '#0F172A' }}>{client.clientCode}</td>
                          <td className="py-3 px-4 font-black uppercase text-slate-800 dark:text-slate-200" style={{ color: isDarkMode ? '#F8FAFC' : '#000000' }}>{client.clientName}</td>
                          <td className="py-3 px-4 font-bold" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>{getShortNameWithLastName(client.sellerName)}</td>
                          <td className="py-3 px-4 text-right font-bold" style={{ color: isDarkMode ? '#94A3B8' : '#334155' }}>{formatExcelDate(client.lastDateSerial)}</td>
                          {selectedRiskCategory === 'TODOS' && (
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                                client.category === 'Saludable' ? 'bg-emerald-500/10 text-emerald-500' :
                                client.category === 'Atención' ? 'bg-amber-500/10 text-amber-500' :
                                client.category === 'Riesgo' ? 'bg-orange-500/10 text-orange-500' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {client.category}
                              </span>
                            </td>
                          )}
                          <td className="py-3 px-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                            {client.inactivityDays} días
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200/40 dark:border-gray-800/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: isDarkMode ? '#94A3B8' : '#334155' }}>
                    Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredClients.length)} de {filteredClients.length} clientes
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setClientListPage(prev => Math.max(1, prev - 1))}
                      disabled={clientListPage === 1}
                      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                        clientListPage === 1
                          ? 'text-gray-400 bg-gray-100 dark:bg-gray-800/40 cursor-not-allowed opacity-50'
                          : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40'
                      }`}
                    >
                      Anterior
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - clientListPage) <= 1)
                      .map((p, i, arr) => {
                        const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && <span className="px-1.5 text-gray-400">...</span>}
                            <button
                              onClick={() => setClientListPage(p)}
                              className={`w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-lg transition-all ${
                                clientListPage === p
                                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/60'
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      onClick={() => setClientListPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={clientListPage === totalPages}
                      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                        clientListPage === totalPages
                          ? 'text-gray-400 bg-gray-100 dark:bg-gray-800/40 cursor-not-allowed opacity-50'
                          : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </section>

          </div>
        )}

        {activeTab === 'tendencias' && (
          <div className="space-y-4 animate-fade-in">
            {/* Gráfico de Ventas Mensuales */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1">Tendencia de Ventas (Millones de COP)</span>
                <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">Evolución del volumen total facturado por mes en períodos activos</h3>
              </div>

              <div className="w-full h-[460px]">
                <ResponsiveContainer width="100%" height={430}>
                  <BarChart data={monthlyTrends} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} 
                    />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatYAxisMillions}
                      domain={[0, (dataMax: number) => Math.ceil((dataMax || 10) * 1.15)]}
                    />
                    <Tooltip 
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }} 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={`p-4 border rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 font-sans text-xs ${
                              isDarkMode ? 'bg-[#0f172a]/95 border-gray-800 text-gray-200' : 'bg-white/95 border-gray-200/80 text-gray-800'
                            }`}>
                              <p className="font-extrabold border-b pb-1 mb-2">Periodo: {label}</p>
                              <p className="flex justify-between gap-6"><span>Facturación:</span><span className="font-black text-indigo-600 dark:text-indigo-400">{formatMillionsCOP(payload[0].payload.salesRaw)}</span></p>
                              <p className="flex justify-between gap-6"><span>Crecimiento:</span><span className={`font-black ${payload[0].payload.growthPercentage >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{payload[0].payload.growthPercentage}%</span></p>
                              <p className="flex justify-between gap-6"><span>Clientes Atendidos:</span><span className="font-black text-sky-600 dark:text-sky-400">{payload[0].payload.clients}</span></p>
                              <p className="flex justify-between gap-6"><span>Documentos Generados:</span><span className="font-black text-gray-400">{payload[0].payload.invoices} docs</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="salesInMillions" 
                      fill="url(#trendsGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={60}
                    >
                      <LabelList 
                        dataKey="salesInMillions" 
                        position="top" 
                        formatter={(val: any) => typeof val === 'number' ? formatMillionsValue(val).replace(' ', '') : ''}
                        style={{ fill: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: 9, fontWeight: 'bold' }} 
                        offset={6} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Tabla Detalle por Mes */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div>
                <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1">Historial Mensual de Desempeño Comercial</span>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className={`border-b transition-colors font-extrabold text-[12px] uppercase tracking-wider ${
                        isDarkMode ? 'border-gray-800/60' : 'border-gray-200'
                      }`}>
                        <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-2 px-1 font-black">Periodo</th>
                        <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-2 px-1 text-right font-black">Facturación</th>
                        <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-2 px-2 text-right font-black">Crecimiento %</th>
                        <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-2 px-1 text-center font-black">Clientes Atendidos</th>
                        <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-2 px-1 text-center font-black">Documentos (FE + CT)</th>
                        <th style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }} className="py-2 px-1 text-right font-black">Ticket Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyTrends.map((trend) => {
                        const ticketAvg = trend.clients > 0 ? (trend.salesRaw / trend.clients) : 0;
                        return (
                          <tr 
                            key={trend.id}
                            className={`border-b transition-all duration-200 ${
                              isDarkMode 
                                ? 'border-gray-800/40 hover:bg-gray-900/20' 
                                : 'border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <td className="py-2 px-1 font-bold text-gray-800 dark:text-gray-200">{trend.label}</td>
                            <td className="py-2 px-1 text-right font-black text-indigo-600 dark:text-indigo-400">{formatMillionsCOP(trend.salesRaw)}</td>
                            <td className={`py-2 px-2 text-right font-bold ${trend.growthPercentage >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {trend.growthPercentage >= 0 ? `+${trend.growthPercentage}%` : `${trend.growthPercentage}%`}
                            </td>
                            <td className="py-2 px-1 text-center font-bold text-sky-600 dark:text-sky-400">{trend.clients}</td>
                            <td style={{ color: isDarkMode ? '#94A3B8' : '#334155' }} className="py-2 px-1 text-center font-bold">{trend.invoices} docs</td>
                            <td className="py-2 px-1 text-right font-bold text-amber-600 dark:text-amber-400">{formatMillionsCOP(ticketAvg)}</td>
                          </tr>
                        );
                      })}
                      {/* TOTAL GENERAL */}
                      <tr style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="font-extrabold border-t-2 border-gray-300 dark:border-gray-800 bg-gray-500/5">
                        <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-2 px-1">Total General</td>
                        <td className="py-2 px-1 text-right text-indigo-600 dark:text-indigo-400">{formatMillionsCOP(salesData.totalSales)}</td>
                        <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-2 px-2 text-right">-</td>
                        <td className="py-2 px-1 text-center text-sky-600 dark:text-sky-400">{salesData.globalUniqueClientsCount}</td>
                        <td style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="py-2 px-1 text-center">{frequencyData.totalInvoices} docs</td>
                        <td className="py-2 px-1 text-right text-amber-600 dark:text-amber-400">{formatMillionsCOP(salesData.globalTicketAverage)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'asesor' && (
          <div className="space-y-4 animate-fade-in">
            {/* Cabecera de Selección */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[14px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">Análisis Comercial por Asesor</span>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">Filtro analítico por vendedor en períodos activos</h3>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-455">Seleccionar Asesor:</label>
                  <select
                    value={selectedIndividualVendor}
                    onChange={(e) => setSelectedIndividualVendor(e.target.value)}
                    className={`text-[13px] font-bold py-1.5 px-3 rounded-lg border focus:outline-none focus:ring-1 focus:ring-rose-500/25 transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-950 border-gray-800 text-gray-200 focus:border-rose-500/50' 
                        : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-rose-500/50'
                    }`}
                  >
                    {advisorsData.map(adv => (
                      <option key={adv.id} value={adv.name}>
                        {getShortNameWithLastName(adv.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Gráfico de Ventas Mensuales Asesor */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">Facturación Mensual de {getShortNameWithLastName(selectedIndividualVendor)}</span>
                <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">Volumen de ventas logradas por mes en millones de COP</h3>
              </div>

              <div className="w-full h-[460px]">
                <ResponsiveContainer width="100%" height={430}>
                  <BarChart data={selectedAdvisorAnalysis?.monthlyData || []} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="asesorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#be123c" stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} 
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatYAxisMillions}
                      domain={[0, (dataMax: number) => Math.ceil((dataMax || 1) * 1.15)]}
                    />
                    <Tooltip 
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }} 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={`p-4 border rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 font-sans text-xs ${
                              isDarkMode ? 'bg-[#0f172a]/95 border-gray-800 text-gray-200' : 'bg-white/95 border-gray-200/80 text-gray-800'
                            }`}>
                              <p className="font-extrabold border-b pb-1 mb-2">Periodo: {label}</p>
                              <p className="flex justify-between gap-6"><span>Ventas Facturadas:</span><span className="font-black text-rose-600 dark:text-rose-400">{formatMillionsCOP(payload[0].payload.salesInMillions * 1000000)}</span></p>
                              <p className="flex justify-between gap-6"><span>Clientes Atendidos:</span><span className="font-black text-sky-600 dark:text-sky-400">{payload[0].payload.clients}</span></p>
                              <p className="flex justify-between gap-6"><span>Ticket Promedio:</span><span className="font-black text-amber-600 dark:text-amber-400">{formatMillionsCOP(payload[0].payload.clients > 0 ? (payload[0].payload.salesInMillions * 1000000 / payload[0].payload.clients) : 0)}</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="salesInMillions" 
                      radius={[4, 4, 0, 0]}
                      barSize={50}
                    >
                      {(selectedAdvisorAnalysis?.monthlyData || []).map((_, index) => {
                        const BAR_COLORS = [
                          '#059669', // Verde Esmeralda
                          '#7C3AED', // Morado Lavanda
                          '#2563EB', // Azul Eléctrico
                          '#D97706', // Amarillo Oro
                          '#0D9488', // Teal Turquesa
                          '#E11D48', // Rojo Rosado
                          '#F97316', // Naranja
                          '#06B6D4', // Cyan Eléctrico
                        ];
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={BAR_COLORS[index % BAR_COLORS.length]} 
                          />
                        );
                      })}
                      <LabelList 
                        dataKey="salesInMillions" 
                        position="top" 
                        formatter={(val: any) => typeof val === 'number' ? formatMillionsValue(val) : ''}
                        style={{ fill: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: 9, fontWeight: 'bold' }} 
                        offset={6} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Tabla Detalle por Mes para Asesor */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div>
                <span className="text-[14px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">Historial de Desempeño de {getShortNameWithLastName(selectedIndividualVendor)}</span>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className={`border-b transition-colors font-extrabold text-[12px] uppercase tracking-wider ${
                        isDarkMode ? 'border-gray-800/60 text-table-header' : 'border-gray-200 text-table-header'
                      }`}>
                        <th className="py-2 px-1">Periodo</th>
                        <th className="py-2 px-1 text-right">Facturación</th>
                        <th className="py-2 px-1 text-center">Clientes Atendidos</th>
                        <th className="py-2 px-1 text-center">Pedidos por Cliente</th>
                        <th className="py-2 px-1 text-right">Ticket Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAdvisorAnalysis?.monthlyData.map((m) => {
                        const ticketAvg = m.clients > 0 ? (m.salesInMillions * 1000000 / m.clients) : 0;
                        return (
                          <tr 
                            key={m.monthId}
                            className={`border-b transition-all duration-200 ${
                              isDarkMode 
                                ? 'border-gray-800/40 hover:bg-gray-900/20 text-gray-300' 
                                : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <td className="py-2 px-1 font-bold">{m.name}</td>
                            <td className="py-2 px-1 text-right font-black text-rose-600 dark:text-rose-400">{formatMillionsCOP(m.salesInMillions * 1000000)}</td>
                            <td className="py-2 px-1 text-center font-bold text-sky-600 dark:text-sky-400">{m.clients}</td>
                            <td className="py-2 px-1 text-center font-bold text-indigo-600 dark:text-indigo-400">{m.frequency.toFixed(2)}</td>
                            <td className="py-2 px-1 text-right font-bold text-amber-600 dark:text-amber-400">{formatMillionsCOP(ticketAvg)}</td>
                          </tr>
                        );
                      })}
                      {/* TOTAL ACUMULADO */}
                      <tr className="font-extrabold border-t-2 border-gray-800 text-gray-900 dark:text-white bg-gray-500/5">
                        <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-2 px-1 font-black">Total General</td>
                        <td className="py-2 px-1 text-right text-rose-600 dark:text-rose-400">{formatMillionsCOP(selectedAdvisorAnalysis?.salesRaw || 0)}</td>
                        <td className="py-2 px-1 text-center text-sky-600 dark:text-sky-400">{selectedAdvisorAnalysis?.coverage || 0}</td>
                        <td className="py-2 px-1 text-center text-indigo-600 dark:text-indigo-400">{selectedAdvisorAnalysis?.overallFrequency.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-1 text-right text-amber-600 dark:text-amber-400">{formatMillionsCOP(selectedAdvisorAnalysis?.ticketAverage || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}



        {activeTab === 'lineas' && !linesLoading && rawLinesRows.length > 0 && (
          <div className="space-y-4 animate-fade-in select-none">
            {/* KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
              {/* KPI 1: Facturación Total */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#064E3B]/35 text-[#34D399] border-emerald-500/25' : 'bg-[#E8F8EE] text-[#059669] border-[#D1FAE5]'
                }`}>
                  <BarChart3 size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Facturación Total (Líneas)</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{formatMillionsCOP(linesTabAnalysis.totalSales)}</span>
                  <span style={{ color: isDarkMode ? '#34D399' : '#059669' }} className="text-[10px] font-extrabold mt-1 block uppercase">Total Acumulado</span>
                </div>
              </div>

              {/* KPI 2: Línea Líder */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#78350F]/35 text-[#FBBF24] border-amber-500/25' : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                }`}>
                  <Crown size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Línea Líder</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-sm sm:text-[15px] font-black tracking-tight leading-tight block truncate uppercase">{linesTabAnalysis.leaderLineName}</span>
                  <span style={{ color: isDarkMode ? '#FBBF24' : '#D97706' }} className="text-[10px] font-extrabold mt-1 block uppercase">Ventas: {formatMillionsCOP(linesTabAnalysis.leaderLineSales)}</span>
                </div>
              </div>

              {/* KPI 3: Líneas Activas */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#1E3A8A]/35 text-[#60A5FA] border-blue-500/25' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                }`}>
                  <Users size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Líneas Activas</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{linesTabAnalysis.activeLinesCount}</span>
                  <span style={{ color: isDarkMode ? '#60A5FA' : '#2563EB' }} className="text-[10px] font-extrabold mt-1 block uppercase">Marcas con Ventas</span>
                </div>
              </div>

              {/* KPI 4: Promedio por Línea */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#311042]/35 text-[#C084FC] border-purple-500/25' : 'bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF]'
                }`}>
                  <TrendingUp size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Promedio por Línea</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{formatMillionsCOP(linesTabAnalysis.avgSalesPerLine)}</span>
                  <span style={{ color: isDarkMode ? '#C084FC' : '#7C3AED' }} className="text-[10px] font-extrabold mt-1 block uppercase">Promedio por Marca</span>
                </div>
              </div>
            </section>

            {/* Gráfico y Tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Gráfico de Barras Horizontal (Top 15) */}
              <div className={`p-4 rounded-2xl border lg:col-span-2 flex flex-col h-[600px] transition-colors duration-300 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="mb-4 shrink-0">
                  <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block mb-1">Top 15 Líneas comerciales</span>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">Marcas con mayor facturación (Millones de COP)</h3>
                </div>

                <div className="w-full flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={linesTabAnalysis.linesChartData.map(l => ({
                        ...l,
                        displayName: l.name.length > 22 ? l.name.substring(0, 22) + '...' : l.name
                      }))}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="linesBarGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.65} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} />
                      <XAxis type="number" tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="displayName" type="category" width={150} tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        content={(props: any) => <CustomTooltip {...props} isDarkMode={isDarkMode} type="lineas" />} 
                        cursor={false} 
                      />
                      <Bar dataKey="salesMillions" fill="url(#linesBarGradient)" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabla de Detalle con buscador */}
              <div className={`p-4 rounded-2xl border flex flex-col h-[600px] transition-colors duration-300 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="mb-3 shrink-0">
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[14px] font-extrabold uppercase tracking-wider mb-2">Desglose de Líneas</h3>
                  
                  {/* Buscador de Líneas */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-450 dark:text-slate-500" size={14} />
                    <input
                      type="text"
                      placeholder="Buscar marca/línea..."
                      value={lineSearchQuery}
                      onChange={(e) => setLineSearchQuery(e.target.value)}
                      className={`pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none w-full placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300 ${
                        isDarkMode ? 'bg-[#1e293b] border-gray-800 text-gray-100 focus:border-emerald-500/50' : 'bg-white border-gray-200 text-slate-900 focus:border-emerald-500/50'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ color: isDarkMode ? '#94A3B8' : '#334155' }} className="border-b border-gray-800/20 dark:border-gray-800/50 font-black uppercase text-[10px]">
                        <th className="pb-2 text-left w-8">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox"
                              checked={linesTabAnalysis.isAllChecked}
                              onChange={(e) => {
                                const allShownLineNames = linesTabAnalysis.linesTableData.map(l => l.name);
                                if (e.target.checked) {
                                  setSelectedCommercialLines(prev => {
                                    const next = new Set([...prev, ...allShownLineNames]);
                                    return Array.from(next);
                                  });
                                } else {
                                  setSelectedCommercialLines(prev => prev.filter(name => !allShownLineNames.includes(name)));
                                }
                              }}
                              className="rounded border-gray-300 dark:border-gray-700 bg-transparent text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer animate-none"
                            />
                          </div>
                        </th>
                        <th className="pb-2 text-left">Marca / Línea</th>
                        <th className="pb-2 text-right">Ventas</th>
                        <th className="pb-2 text-right font-black">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/10 dark:divide-gray-800/40">
                      {linesTabAnalysis.linesTableData.map(line => {
                        const isChecked = line.checked;
                        const participationPercent = isChecked && linesTabAnalysis.totalSales > 0 ? (line.salesRaw / linesTabAnalysis.totalSales) * 100 : 0;
                        return (
                          <tr 
                            key={line.name} 
                            className={`hover:bg-slate-500/5 transition-all duration-200 ${!isChecked ? 'opacity-40' : ''}`}
                          >
                            <td className="py-2 text-center w-8">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedCommercialLines(prev => prev.filter(l => l !== line.name));
                                    } else {
                                      setSelectedCommercialLines(prev => [...prev, line.name]);
                                    }
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-700 bg-transparent text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer animate-none"
                                />
                              </div>
                            </td>
                            <td style={{ color: isDarkMode ? '#CBD5E1' : '#0F172A' }} className="py-2 font-bold uppercase truncate max-w-[140px]">{line.name}</td>
                            <td className="py-2 text-right font-bold text-emerald-500">{formatMillionsCOP(line.salesRaw)}</td>
                            <td className="py-2 text-right font-black text-indigo-500">{participationPercent.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                      {linesTabAnalysis.linesTableData.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 font-bold uppercase tracking-wider">No se encontraron marcas</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articulos' && !linesLoading && rawLinesRows.length > 0 && (
          <div className="space-y-4 animate-fade-in select-none">
            {/* KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
              {/* KPI 1: Artículos Totales */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#311042]/35 text-[#C084FC] border-purple-500/25' : 'bg-purple-55 text-purple-600 border-[#E9D5FF]'
                }`}>
                  <Package size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Artículos Vendidos</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{articlesTabAnalysis.totalArticlesCount}</span>
                  <span style={{ color: isDarkMode ? '#C084FC' : '#7C3AED' }} className="text-[10px] font-extrabold mt-1 block uppercase">Referencias Distintas</span>
                </div>
              </div>

              {/* KPI 2: Artículo Estrella */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#78350F]/35 text-[#FBBF24] border-amber-500/25' : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                }`}>
                  <Crown size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Artículo Estrella</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xs sm:text-[11px] font-black tracking-tight leading-tight block truncate uppercase" title={articlesTabAnalysis.starProductName}>{articlesTabAnalysis.starProductName}</span>
                  <span style={{ color: isDarkMode ? '#FBBF24' : '#D97706' }} className="text-[10px] font-extrabold mt-1 block uppercase">Ventas: {formatMillionsCOP(articlesTabAnalysis.starProductSales)}</span>
                </div>
              </div>

              {/* KPI 3: Volumen Físico */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#064E3B]/35 text-[#34D399] border-emerald-500/25' : 'bg-[#E8F8EE] text-[#059669] border-[#D1FAE5]'
                }`}>
                  <RefreshCw size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Volumen Total</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{formatNumberWithDots(articlesTabAnalysis.totalUnitsSold)}</span>
                  <span style={{ color: isDarkMode ? '#34D399' : '#059669' }} className="text-[10px] font-extrabold mt-1 block uppercase">Unidades Vendidas</span>
                </div>
              </div>

              {/* KPI 4: Cliente Principal */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#1E3A8A]/35 text-[#60A5FA] border-blue-500/25' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                }`}>
                  <User size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Cliente Principal</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xs sm:text-[11px] font-black tracking-tight leading-tight block truncate uppercase" title={articlesTabAnalysis.topClientName}>{articlesTabAnalysis.topClientName}</span>
                  <span style={{ color: isDarkMode ? '#60A5FA' : '#2563EB' }} className="text-[10px] font-extrabold mt-1 block uppercase">Compras: {formatMillionsCOP(articlesTabAnalysis.topClientSales)}</span>
                </div>
              </div>
            </section>

            {/* Barra de Filtros Locales */}
            <div className={`p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-4 transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              {/* Filtro de Línea */}
              <div>
                <label style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="block text-[11px] font-bold uppercase tracking-wider mb-2">Filtrar por Línea / Marca</label>
                <select
                  value={selectedLineFilter}
                  onChange={(e) => {
                    setSelectedLineFilter(e.target.value);
                    setArticleListPage(1);
                  }}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20 ${
                    isDarkMode ? 'bg-[#1e293b] border-gray-800 text-gray-100 focus:border-emerald-500/50' : 'bg-white border-gray-200 text-slate-800 focus:border-emerald-500/50 shadow-sm'
                  }`}
                >
                  {articlesFilterDropdowns.linesList.map(line => (
                    <option key={line} value={line}>{line}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Cliente */}
              <div className="relative">
                <label style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="block text-[11px] font-bold uppercase tracking-wider mb-2">Filtrar por Cliente / Distribuidora</label>
                
                {/* Botón del Dropdown */}
                <button
                  type="button"
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-bold transition-all focus:outline-none flex items-center justify-between text-left ${
                    isDarkMode 
                      ? 'bg-[#1e293b] border-gray-800 text-gray-100 hover:border-slate-700' 
                      : 'bg-white border-gray-200 text-slate-800 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <span className="truncate max-w-[90%]">{selectedClientFilter}</span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform duration-250 shrink-0 ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Backdrop invisible para cerrar el menú al hacer clic fuera */}
                {isClientDropdownOpen && (
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => {
                      setIsClientDropdownOpen(false);
                      setClientFilterSearchQuery('');
                    }}
                  />
                )}

                {/* Panel Flotante del Dropdown */}
                {isClientDropdownOpen && (
                  <div className={`absolute left-0 w-full mt-1.5 rounded-xl border shadow-xl flex flex-col max-h-[320px] overflow-hidden z-50 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-[#1e293b] border-slate-800 text-gray-100' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {/* Caja de Búsqueda */}
                    <div className="relative p-2 shrink-0 border-b border-gray-200/50 dark:border-gray-800/50">
                      <Search className="absolute left-4 top-4.5 text-slate-400 dark:text-slate-500" size={12} />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar cliente..."
                        value={clientFilterSearchQuery}
                        onChange={(e) => setClientFilterSearchQuery(e.target.value)}
                        className={`pl-7 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none w-full placeholder-slate-500 dark:placeholder-slate-400 ${
                          isDarkMode 
                            ? 'bg-gray-950 border-gray-800 text-gray-200 focus:border-emerald-500/50' 
                            : 'bg-white border-gray-200 text-slate-900 focus:border-emerald-500/50'
                        }`}
                      />
                    </div>

                    {/* Lista de Resultados */}
                    <div className="flex-1 overflow-y-auto py-1 custom-scrollbar text-left text-xs font-bold uppercase">
                      {filteredClientsForSearch.map(client => {
                        const isSelected = client === selectedClientFilter;
                        return (
                          <button
                            key={client}
                            type="button"
                            onClick={() => {
                              setSelectedClientFilter(client);
                              setArticleListPage(1);
                              setIsClientDropdownOpen(false);
                              setClientFilterSearchQuery('');
                            }}
                            className={`w-full text-left px-3.5 py-2.5 transition-all duration-150 uppercase truncate block ${
                              isSelected
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-black'
                                : isDarkMode
                                  ? 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                                  : 'hover:bg-slate-55 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            {client}
                          </button>
                        );
                      })}
                      {filteredClientsForSearch.length === 0 && (
                        <div className="px-3.5 py-4 text-center text-slate-500 dark:text-slate-600 font-bold uppercase tracking-wider">
                          No se encontraron clientes
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico y Tabla Paginada */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Gráfico de Artículos (Top 15) */}
              <div className={`p-4 rounded-2xl border lg:col-span-2 flex flex-col h-[600px] transition-colors duration-300 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="mb-4 shrink-0">
                  <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block mb-1">Top 15 Artículos</span>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">Productos con mayor facturación en filtros activos</h3>
                </div>

                <div className="w-full flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={articlesTabAnalysis.articlesChartData.map(a => ({
                        ...a,
                        displayName: a.name.length > 22 ? a.name.substring(0, 22) + '...' : a.name
                      }))}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="articlesBarGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.65} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} />
                      <XAxis type="number" tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="displayName" type="category" width={150} tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        content={(props: any) => <CustomTooltip {...props} isDarkMode={isDarkMode} type="articulos" />} 
                        cursor={false} 
                      />
                      <Bar dataKey="salesMillions" fill="url(#articlesBarGradient)" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabla Paginada con Buscador */}
              <div className={`p-4 rounded-2xl border flex flex-col h-[600px] transition-colors duration-300 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="mb-3 shrink-0">
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[14px] font-extrabold uppercase tracking-wider mb-2">Artículos</h3>
                  
                  {/* Buscador de Artículos */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-450 dark:text-slate-500" size={14} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o ref..."
                      value={articleSearchQuery}
                      onChange={(e) => {
                        setArticleSearchQuery(e.target.value);
                        setArticleListPage(1);
                      }}
                      className={`pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none w-full placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300 ${
                        isDarkMode ? 'bg-[#1e293b] border-gray-800 text-gray-100 focus:border-emerald-500/50' : 'bg-white border-gray-200 text-slate-900 focus:border-emerald-500/50'
                      }`}
                    />
                  </div>
                </div>

                {/* Listado */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ color: isDarkMode ? '#94A3B8' : '#334155' }} className="border-b border-gray-800/20 dark:border-gray-800/50 font-black uppercase text-[10px]">
                        <th className="pb-2 text-left w-8">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox"
                              checked={articlesTabAnalysis.isAllChecked}
                              onChange={(e) => {
                                const allShownArticleNames = articlesTabAnalysis.articlesTableData.map(a => a.name);
                                if (e.target.checked) {
                                  setSelectedArticles(prev => {
                                    const next = new Set([...prev, ...allShownArticleNames]);
                                    return Array.from(next);
                                  });
                                } else {
                                  setSelectedArticles(prev => prev.filter(name => !allShownArticleNames.includes(name)));
                                }
                              }}
                              className="rounded border-gray-300 dark:border-gray-700 bg-transparent text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer animate-none"
                            />
                          </div>
                        </th>
                        <th className="pb-2 text-left">Artículo / Ref</th>
                        <th className="pb-2 text-center">Cant.</th>
                        <th className="pb-2 text-center">Prom. 4M</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/10 dark:divide-gray-800/40">
                      {articlesTabAnalysis.articlesTableData.map(art => {
                        const isChecked = art.checked;
                        return (
                          <tr 
                            key={art.name} 
                            className={`hover:bg-slate-500/5 transition-all duration-200 ${!isChecked ? 'opacity-40' : ''}`}
                          >
                            <td className="py-2 text-center w-8">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedArticles(prev => prev.filter(a => a !== art.name));
                                    } else {
                                      setSelectedArticles(prev => [...prev, art.name]);
                                    }
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-700 bg-transparent text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer animate-none"
                                />
                              </div>
                            </td>
                            <td className="py-2 max-w-[130px]">
                              <p style={{ color: isDarkMode ? '#CBD5E1' : '#0F172A' }} className="font-bold truncate uppercase">{art.name}</p>
                              <p className="text-[9px] font-black text-slate-500">REF: {art.articleRef} | PROM: {formatMillionsCOP(art.avgPrice)}</p>
                            </td>
                            <td style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }} className="py-2 text-center font-bold">{formatNumberWithDots(art.qty)}</td>
                            <td className="py-2 text-center font-bold text-emerald-600 dark:text-emerald-400">{formatAverageQty(art.avgQtyLast4Months)}</td>
                            <td className="py-2 text-right font-bold text-indigo-500">{formatMillionsCOP(art.salesRaw)}</td>
                          </tr>
                        );
                      })}
                      {articlesTabAnalysis.articlesTableData.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 font-bold uppercase tracking-wider">No se encontraron artículos</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {articlesTabAnalysis.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-800/20 dark:border-gray-800/40 pt-3 mt-2 shrink-0">
                    <button
                      disabled={articleListPage === 1}
                      onClick={() => setArticleListPage(prev => Math.max(1, prev - 1))}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-colors ${
                        articleListPage === 1
                          ? 'border-transparent text-slate-400 cursor-not-allowed'
                          : isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      Anterior
                    </button>
                    <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[10px] font-bold uppercase tracking-wider">
                      {articleListPage} / {articlesTabAnalysis.totalPages}
                    </span>
                    <button
                      disabled={articleListPage === articlesTabAnalysis.totalPages}
                      onClick={() => setArticleListPage(prev => Math.min(articlesTabAnalysis.totalPages, prev + 1))}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-colors ${
                        articleListPage === articlesTabAnalysis.totalPages
                          ? 'border-transparent text-slate-400 cursor-not-allowed'
                          : isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Carga y errores específicos de Ventas por línea */}
        {((activeTab === 'lineas' || activeTab === 'articulos') && linesLoading) && (
          <div className="flex flex-col items-center justify-center p-20 min-h-[460px] border border-dashed border-gray-350 dark:border-gray-800 rounded-2xl bg-gray-500/5 backdrop-blur-sm animate-fade-in select-none">
            <RefreshCw className="animate-spin text-emerald-500 mb-3" size={32} />
            <span style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }} className="text-xs font-bold uppercase tracking-wider">Cargando base de datos de Ventas por Línea (5.8MB)...</span>
          </div>
        )}

        {((activeTab === 'lineas' || activeTab === 'articulos') && !linesLoading && rawLinesRows.length === 0) && (
          <div className="flex flex-col items-center justify-center p-20 min-h-[460px] border border-dashed border-red-300 dark:border-red-950 rounded-2xl bg-red-500/5 backdrop-blur-sm animate-fade-in select-none">
            <AlertCircle className="text-red-500 mb-3" size={32} />
            <span style={{ color: isDarkMode ? '#FCA5A5' : '#B91C1C' }} className="text-xs font-bold uppercase tracking-wider mb-2">No se encontraron datos de Ventas por Línea</span>
            <p style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] text-center max-w-sm">
              Asegúrate de colocar el archivo original <strong>"Ventas por linea.xlsx"</strong> dentro de la carpeta <strong>public/</strong> del proyecto y recargar la página.
            </p>
          </div>
        )}

        {/* Carga y errores específicos de Inventario */}
        {(activeTab === 'inventario' && inventoryLoading) && (
          <div className="flex flex-col items-center justify-center p-20 min-h-[460px] border border-dashed border-gray-350 dark:border-gray-800 rounded-2xl bg-gray-500/5 backdrop-blur-sm animate-fade-in select-none">
            <RefreshCw className="animate-spin text-emerald-500 mb-3" size={32} />
            <span style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }} className="text-xs font-bold uppercase tracking-wider">Cargando base de datos de Inventario...</span>
          </div>
        )}

        {(activeTab === 'inventario' && !inventoryLoading && rawInventoryRows.length === 0) && (
          <div className="flex flex-col items-center justify-center p-20 min-h-[460px] border border-dashed border-red-300 dark:border-red-950 rounded-2xl bg-red-500/5 backdrop-blur-sm animate-fade-in select-none">
            <AlertCircle className="text-red-500 mb-3" size={32} />
            <span style={{ color: isDarkMode ? '#FCA5A5' : '#B91C1C' }} className="text-xs font-bold uppercase tracking-wider mb-2">No se encontraron datos de Inventario</span>
            <p style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] text-center max-w-sm">
              Asegúrate de colocar el archivo original <strong>"Inventario.xlsx"</strong> dentro de la carpeta <strong>public/</strong> del proyecto y recargar la página.
            </p>
          </div>
        )}

        {activeTab === 'inventario' && !inventoryLoading && rawInventoryRows.length > 0 && (
          <div className="space-y-4 animate-fade-in select-none">
            {/* KPIs Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
              {/* KPI 1: Artículos Agotados */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  inventoryKPIs.outOfStock > 0
                    ? isDarkMode ? 'bg-[#7F1D1D]/35 text-[#FCA5A5] border-red-500/25' : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]'
                    : isDarkMode ? 'bg-[#1E3A8A]/35 text-[#60A5FA] border-blue-500/25' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                }`}>
                  <Package size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Artículos Agotados</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{inventoryKPIs.outOfStock}</span>
                  <span className="text-[10px] font-extrabold mt-1 block uppercase text-red-500">Sin Existencias</span>
                </div>
              </div>

              {/* KPI 2: Stock Crítico */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  inventoryKPIs.riskStock > 0
                    ? isDarkMode ? 'bg-[#78350F]/35 text-[#FBBF24] border-amber-500/25' : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                    : isDarkMode ? 'bg-[#1E3A8A]/35 text-[#60A5FA] border-blue-500/25' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                }`}>
                  <TrendingDown size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Stock Crítico</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{inventoryKPIs.riskStock}</span>
                  <span className="text-[10px] font-extrabold mt-1 block uppercase text-amber-500">Cobert. &lt; 15 Días</span>
                </div>
              </div>

              {/* KPI 3: Stock en Atención */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  inventoryKPIs.attentionStock > 0
                    ? isDarkMode ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-yellow-100/40 text-yellow-700 border-yellow-250'
                    : isDarkMode ? 'bg-[#1E3A8A]/35 text-[#60A5FA] border-blue-500/25' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                }`}>
                  <AlertCircle size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Stock en Atención</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{inventoryKPIs.attentionStock}</span>
                  <span className="text-[10px] font-extrabold mt-1 block uppercase text-yellow-600 dark:text-yellow-450">Cobert. &lt; 30 Días</span>
                </div>
              </div>

              {/* KPI 4: Cobertura Promedio */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                  isDarkMode ? 'bg-[#311042]/35 text-[#C084FC] border-purple-500/25' : 'bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF]'
                }`}>
                  <RefreshCw size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider block mb-0.5">Cobertura Promedio</span>
                  <span style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className="text-xl sm:text-[24px] font-black tracking-tight leading-none block">{inventoryKPIs.avgCoverage} Días</span>
                  <span className="text-[10px] font-extrabold mt-1 block uppercase text-purple-500">Proyección de Venta</span>
                </div>
              </div>
            </section>

            {/* Filtros locales */}
            <div className={`p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              {/* Filtro de Línea / Marca */}
              <div>
                <label style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="block text-[11px] font-bold uppercase tracking-wider mb-2">Filtrar por Línea / Marca</label>
                <select
                  value={inventoryLineFilter}
                  onChange={(e) => {
                    setInventoryLineFilter(e.target.value);
                    setInventoryListPage(1);
                  }}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20 ${
                    isDarkMode ? 'bg-[#1e293b] border-gray-800 text-gray-100 focus:border-emerald-500/50' : 'bg-white border-gray-200 text-slate-800 focus:border-emerald-500/50 shadow-sm'
                  }`}
                >
                  {inventoryLines.map(line => (
                    <option key={line} value={line}>{line}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Estado de Stock */}
              <div>
                <label style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="block text-[11px] font-bold uppercase tracking-wider mb-2">Estado de Stock</label>
                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => {
                    setInventoryStatusFilter(e.target.value);
                    setInventoryListPage(1);
                  }}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/20 ${
                    isDarkMode ? 'bg-[#1e293b] border-gray-800 text-gray-100 focus:border-emerald-500/50' : 'bg-white border-gray-200 text-slate-800 focus:border-emerald-500/50 shadow-sm'
                  }`}
                >
                  <option value="TODOS">TODOS LOS PRODUCTOS</option>
                  <option value="Agotado">AGOTADOS (STOCK 0)</option>
                  <option value="Riesgo">STOCK CRÍTICO (&lt; 15 DÍAS)</option>
                  <option value="Atención">EN ATENCIÓN (&lt; 30 DÍAS)</option>
                  <option value="Saludable">SALUDABLES (STOCK OK)</option>
                </select>
              </div>

              {/* Buscador de Producto */}
              <div>
                <label style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="block text-[11px] font-bold uppercase tracking-wider mb-2">Buscar Producto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-450 dark:text-slate-500" size={14} />
                  <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={inventorySearchQuery}
                    onChange={(e) => {
                      setInventorySearchQuery(e.target.value);
                      setInventoryListPage(1);
                    }}
                    className={`pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none w-full placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300 ${
                      isDarkMode ? 'bg-[#1e293b] border-gray-800 text-gray-100 focus:border-emerald-500/50' : 'bg-white border-gray-200 text-slate-900 focus:border-emerald-500/50 shadow-sm'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Gráfica y Tabla Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Gráfica de alertas por línea */}
              <div className={`p-4 rounded-2xl border lg:col-span-1 flex flex-col h-[600px] transition-colors duration-300 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="mb-4 shrink-0">
                  <span className="text-[14px] font-semibold text-rose-605 dark:text-rose-400 uppercase tracking-wider block mb-1">Top 15 Líneas comerciales</span>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">Alertas de Stock por Marca</h3>
                </div>

                <div className="w-full flex-1 min-h-0">
                  {inventoryLineChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={inventoryLineChartData.map(l => ({
                          ...l,
                          displayName: l.name.length > 20 ? l.name.substring(0, 20) + '...' : l.name
                        }))}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} />
                        <XAxis type="number" tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="displayName" type="category" width={120} tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          content={(props: any) => <CustomTooltip {...props} isDarkMode={isDarkMode} type="inventario" />} 
                          cursor={false} 
                        />
                        <Bar dataKey="agotado" name="Agotados" stackId="a" fill="#ef4444" isAnimationActive={false} />
                        <Bar dataKey="riesgo" name="Stock Crítico" stackId="a" fill="#f59e0b" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 font-bold uppercase text-xs">
                      Sin alertas activas
                    </div>
                  )}
                </div>
              </div>

              {/* Tabla de Abastecimiento Prioritario */}
              <div className={`p-4 rounded-2xl border lg:col-span-3 flex flex-col h-[600px] transition-colors duration-300 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="mb-3 shrink-0 flex items-center justify-between">
                  <div>
                    <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[14px] font-extrabold uppercase tracking-wider">Detalle de Inventario Priorizado</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      Prioridad = Ventas Prom. Mes / (Stock Actual + 1)
                    </p>
                  </div>
                  <span className="text-xs bg-[#16A34A]/10 text-[#16A34A] dark:text-[#4ADE80] font-black py-1 px-2.5 rounded-full uppercase">
                    {filteredInventory.length} ítems
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  <table className="w-full text-xs text-left">
                    <thead className="sticky top-0 z-10">
                      <tr style={{ color: isDarkMode ? '#94A3B8' : '#334155' }} className="border-b border-gray-800/20 dark:border-gray-800/50 font-black uppercase text-[10px]">
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1">Referencia</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1">Descripción</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1 text-center">Ventas Prom.</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1 text-center">U.M.</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1 text-center">Stock Actual</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1 text-center">Días Exist.</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1 text-right">Lista 5</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1 text-right">Lista 4</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1 text-center">Estado</th>
                        <th style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }} className="pb-2 pt-1 text-right">Prioridad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/10 dark:divide-gray-800/40">
                      {paginatedInventory.map(item => {
                        let statusColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450';
                        if (item.status === 'Agotado') statusColor = 'bg-red-500/10 text-red-500 font-extrabold';
                        else if (item.status === 'Riesgo') statusColor = 'bg-amber-500/10 text-amber-500 font-extrabold';
                        else if (item.status === 'Atención') statusColor = 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-semibold';
                        
                        let priorityBadge = 'bg-gray-150 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                        if (item.priorityScore >= 10) priorityBadge = 'bg-red-600 text-white font-black animate-pulse';
                        else if (item.priorityScore >= 5) priorityBadge = 'bg-amber-500 text-white font-black';
                        else if (item.priorityScore >= 1) priorityBadge = 'bg-yellow-400 text-slate-900 font-extrabold';
 
                        return (
                          <tr key={item.cod} className="hover:bg-slate-500/5 transition-all duration-200">
                            <td style={{ color: isDarkMode ? '#CBD5E1' : '#0F172A' }} className="py-2.5 font-mono font-bold">{item.referencia || item.cod}</td>
                            <td className="py-2.5 max-w-[200px]">
                              <p style={{ color: isDarkMode ? '#F8FAFC' : '#1e293b' }} className="font-extrabold uppercase truncate" title={item.descrip}>{item.descrip}</p>
                            </td>
                            <td className="py-2.5 text-center font-bold text-sky-500">{formatAverageQty(item.salesVelocity)}</td>
                            <td style={{ color: isDarkMode ? '#CBD5E1' : '#475569' }} className="py-2.5 text-center font-semibold">{item.unimed}</td>
                            <td className={`py-2.5 text-center font-black ${
                              item.stock <= 0 && item.salesVelocity > 0 ? 'text-red-500 font-black' : item.status === 'Riesgo' ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {formatNumberWithDots(item.stock)}
                            </td>
                            <td className={`py-2.5 text-center font-bold ${
                              item.status === 'Agotado' ? 'text-red-500' : item.status === 'Riesgo' ? 'text-amber-500' : item.status === 'Atención' ? 'text-yellow-500' : 'text-emerald-500'
                            }`}>
                              {item.salesVelocity > 0 ? (item.coverageDays > 365 ? '>365' : Math.round(item.coverageDays)) : '-'}
                            </td>
                            <td style={{ color: isDarkMode ? '#E2E8F0' : '#1E293B' }} className="py-2.5 text-right font-semibold">
                              {item.lista5 > 0 ? `$${formatNumberWithDots(Math.round(item.lista5))}` : '-'}
                            </td>
                            <td style={{ color: isDarkMode ? '#E2E8F0' : '#1E293B' }} className="py-2.5 text-right font-semibold">
                              {item.lista4 > 0 ? `$${formatNumberWithDots(Math.round(item.lista4))}` : '-'}
                            </td>
                            <td className="py-2.5 text-center">
                              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${statusColor}`}>
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md ${priorityBadge}`}>
                                {item.priorityScore.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {paginatedInventory.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-slate-500 font-bold uppercase tracking-wider">
                            No se encontraron artículos en inventario
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between border-t border-gray-800/20 dark:border-gray-800/40 pt-3 mt-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[10px] font-bold uppercase tracking-wider">
                      Filas por pág:
                    </span>
                    <select
                      value={inventoryPageSize}
                      onChange={(e) => {
                        setInventoryPageSize(Number(e.target.value));
                        setInventoryListPage(1);
                      }}
                      className={`text-[10px] font-bold py-1 px-2 border rounded-lg transition-colors focus:outline-none ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800 text-gray-300' 
                          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                      }`}
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={999999}>Todos</option>
                    </select>
                  </div>

                  {inventoryTotalPages > 1 && (
                    <div className="flex items-center gap-3">
                      <button
                        disabled={inventoryListPage === 1}
                        onClick={() => setInventoryListPage(prev => Math.max(1, prev - 1))}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-colors ${
                          inventoryListPage === 1
                            ? 'border-transparent text-slate-400 cursor-not-allowed'
                            : isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        Anterior
                      </button>
                      <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[10px] font-bold uppercase tracking-wider">
                        {inventoryListPage} / {inventoryTotalPages}
                      </span>
                      <button
                        disabled={inventoryListPage === inventoryTotalPages}
                        onClick={() => setInventoryListPage(prev => Math.min(inventoryTotalPages, prev + 1))}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-colors ${
                          inventoryListPage === inventoryTotalPages
                            ? 'border-transparent text-slate-400 cursor-not-allowed'
                            : isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carga y errores específicos de Cartera */}
        {(activeTab === 'cartera' && carteraLoading) && (
          <div className="flex flex-col items-center justify-center p-20 min-h-[460px] border border-dashed border-gray-350 dark:border-gray-800 rounded-2xl bg-gray-500/5 backdrop-blur-sm animate-fade-in select-none">
            <RefreshCw className="animate-spin text-[#4f46e5] mb-3" size={32} />
            <span style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }} className="text-xs font-bold uppercase tracking-wider">Cargando base de datos de Cartera...</span>
          </div>
        )}

        {(activeTab === 'cartera' && !carteraLoading && rawCarteraClientes.length === 0) && (
          <div className="flex flex-col items-center justify-center p-20 min-h-[460px] border border-dashed border-red-300 dark:border-red-950 rounded-2xl bg-red-500/5 backdrop-blur-sm animate-fade-in select-none">
            <AlertCircle className="text-red-500 mb-3" size={32} />
            <span style={{ color: isDarkMode ? '#FCA5A5' : '#B91C1C' }} className="text-xs font-bold uppercase tracking-wider mb-2">No se encontraron datos de Cartera comercial</span>
            <p style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] text-center max-w-sm">
              Asegúrate de colocar el archivo <strong>"Cartera.xlsx"</strong> dentro de la carpeta <strong>public/</strong> del proyecto y recargar la página.
            </p>
          </div>
        )}

        {activeTab === 'cartera' && !carteraLoading && rawCarteraClientes.length > 0 && (() => {
          // Formateador local de moneda
          const formatCOP = (val: number) => {
            return `$${Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
          };

          const getPriorityBadge = (score: number) => {
            if (score >= 100_000_000) {
              return (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/25 animate-pulse">
                  Crítica
                </span>
              );
            } else if (score >= 10_000_000) {
              return (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  Alta
                </span>
              );
            } else if (score >= 1_000_000) {
              return (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Media
                </span>
              );
            } else if (score > 0) {
              return (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/25">
                  Baja
                </span>
              );
            } else {
              return (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                  Al día
                </span>
              );
            }
          };

          const {
            filteredDocs,
            sortedClientes,
            isAllChecked,
            totalCartera,
            totalMora,
            moraPercent,
            totalCupoAsignado,
            totalCupoDisponible,
            aging
          } = carteraKPIs;

          const paginatedClientes = paginatedCarteraClientes;
          const totalClientes = sortedClientes.length;
          const totalPages = carteraTotalPages;

          const handleHeaderClick = (column: typeof carteraSortColumn) => {
            if (carteraSortColumn === column) {
              setCarteraSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
            } else {
              setCarteraSortColumn(column);
              setCarteraSortDirection('desc');
            }
            setCarteraListPage(1);
          };

          const renderSortIcon = (column: typeof carteraSortColumn) => {
            if (carteraSortColumn !== column) return null;
            return carteraSortDirection === 'asc' 
              ? <ChevronUp size={11} className="inline ml-0.5 stroke-[2.5]" /> 
              : <ChevronDown size={11} className="inline ml-0.5 stroke-[2.5]" />;
          };

          const selectedClienteDocs = carteraSelectedCliente
            ? rawCarteraDocumentos.filter(d => String(d.cod_benf) === String(carteraSelectedCliente.cod_benf))
            : [];

          return (
            <div className="space-y-5 animate-fade-in select-none">
              {/* KPIs Bento Grid (Colapsable) */}
              <section>
                <button
                  type="button"
                  onClick={() => setCarteraKpisCollapsed(prev => !prev)}
                  className={`flex items-center gap-2 mb-3 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {carteraKpisCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  {carteraKpisCollapsed ? 'Mostrar KPIs' : 'Ocultar KPIs'}
                </button>

                {!carteraKpisCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fade-in">
                {/* KPI 1: Cartera Total */}
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                    isDarkMode ? 'bg-[#1E3A8A]/35 text-[#60A5FA] border-blue-500/25' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                  }`}>
                    <CreditCard size={22} className="stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                      Cartera Total por Cobrar
                    </span>
                    <span className="text-[25px] sm:text-[27px] font-extrabold leading-none text-[#2563EB] dark:text-[#60A5FA] tracking-tight block mt-1">
                      {formatCOP(totalCartera)}
                    </span>
                    <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[10px] font-semibold block mt-1.5">
                      {formatNumberWithDots(filteredDocs.length)} facturas activas
                    </span>
                  </div>
                </div>

                {/* KPI 2: Cartera en Mora */}
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                    totalMora > 0
                      ? isDarkMode ? 'bg-[#7F1D1D]/35 text-[#FCA5A5] border-red-500/25' : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]'
                      : isDarkMode ? 'bg-[#14532D]/35 text-[#4ADE80] border-emerald-500/25' : 'bg-[#E8F8EE] text-[#059669] border-[#D1FAE5]'
                  }`}>
                    <AlertCircle size={22} className="stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                      Cartera Vencida (Mora)
                    </span>
                    <span className={`text-[25px] sm:text-[27px] font-extrabold leading-none tracking-tight block mt-1 ${
                      totalMora > 0 ? 'text-[#B91C1C] dark:text-[#FCA5A5]' : 'text-[#059669] dark:text-[#4ADE80]'
                    }`}>
                      {formatCOP(totalMora)}
                    </span>
                    <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[10px] font-semibold block mt-1.5">
                      {formatNumberWithDots(filteredDocs.filter(d => d.estado === 'Vencido').length)} facturas vencidas
                    </span>
                  </div>
                </div>

                {/* KPI 3: Indice de Mora */}
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                    moraPercent > 15
                      ? isDarkMode ? 'bg-[#7F1D1D]/35 text-[#FCA5A5] border-red-500/25' : 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]'
                      : moraPercent > 5
                        ? isDarkMode ? 'bg-[#78350F]/35 text-[#FDE68A] border-amber-500/25' : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                        : isDarkMode ? 'bg-[#14532D]/35 text-[#4ADE80] border-emerald-500/25' : 'bg-[#E8F8EE] text-[#059669] border-[#D1FAE5]'
                  }`}>
                    <TrendingUp size={22} className="stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                      Índice de Morosidad
                    </span>
                    <span className={`text-[25px] sm:text-[27px] font-extrabold leading-none tracking-tight block mt-1 ${
                      moraPercent > 15 ? 'text-red-500' : moraPercent > 5 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {moraPercent.toFixed(1).replace('.', ',')}%
                    </span>
                    <span className="block mt-1.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        moraPercent > 15 
                          ? 'bg-red-500/10 text-red-500' 
                          : moraPercent > 5 
                            ? 'bg-amber-500/10 text-amber-500' 
                            : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {moraPercent > 15 ? 'Crítico' : moraPercent > 5 ? 'Atención' : 'Saludable'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* KPI 4: Cupo Disponible */}
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/60 shadow-slate-100/50 shadow-sm'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                    isDarkMode ? 'bg-[#581C87]/35 text-[#E9D5FF] border-purple-500/25' : 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]'
                  }`}>
                    <Users size={22} className="stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                      Total Cupo Disponible
                    </span>
                    <span className="text-[25px] sm:text-[27px] font-extrabold leading-none text-[#7E22CE] dark:text-[#E9D5FF] tracking-tight block mt-1">
                      {formatCOP(totalCupoDisponible)}
                    </span>
                    <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[10px] font-semibold block mt-1.5">
                      Cupo Asignado: {formatCOP(totalCupoAsignado)}
                    </span>
                  </div>
                </div>
                </div>
                )}
              </section>

              {/* Aging (Proyección de Vencimientos) */}
              <section className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200 shadow-slate-100 shadow-sm'
              }`}>
                <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[13px] font-extrabold uppercase tracking-wider mb-4">
                  Distribución de Cartera por Envejecimiento (Aging)
                </h3>
                
                {/* Visual Aging Bar */}
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex mb-6">
                  {([
                    { key: 'current', label: 'Corriente', val: aging.current, color: 'bg-emerald-500' },
                    { key: 'range1_30', label: '1-30 días', val: aging.range1_30, color: 'bg-yellow-400' },
                    { key: 'range31_60', label: '31-60 días', val: aging.range31_60, color: 'bg-orange-400' },
                    { key: 'range61_90', label: '61-90 días', val: aging.range61_90, color: 'bg-orange-600' },
                    { key: 'rangeOver90', label: '>90 días', val: aging.rangeOver90, color: 'bg-red-600' }
                  ] as const).map(bucket => {
                    const pct = totalCartera > 0 ? (bucket.val / totalCartera) * 100 : 0;
                    if (pct <= 0) return null;
                    const isSelected = carteraAgingFilter === bucket.key;
                    return (
                      <div 
                        key={bucket.key}
                        onClick={() => {
                          setCarteraAgingFilter(carteraAgingFilter === bucket.key ? 'TODOS' : bucket.key);
                          setCarteraListPage(1);
                        }}
                        className={`${bucket.color} h-full transition-all duration-500 hover:opacity-90 cursor-pointer ${
                          isSelected ? 'ring-2 ring-white ring-inset opacity-100 shadow-md' : 'opacity-85'
                        }`}
                        style={{ width: `${pct}%` }}
                        title={`${bucket.label}: ${formatCOP(bucket.val)} (${pct.toFixed(1)}%) - Haz clic para filtrar`}
                      />
                    );
                  })}
                </div>

                {/* Aging Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                  {([
                    { key: 'current', label: 'Corriente (Al Día)', val: aging.current, colorText: 'text-emerald-600 dark:text-emerald-455', border: 'border-l-emerald-500', activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
                    { key: 'range1_30', label: '1 a 30 Días', val: aging.range1_30, colorText: 'text-yellow-600 dark:text-yellow-400', border: 'border-l-yellow-400', activeBg: 'bg-yellow-500/10 dark:bg-yellow-500/20' },
                    { key: 'range31_60', label: '31 a 60 Días', val: aging.range31_60, colorText: 'text-orange-600 dark:text-orange-400', border: 'border-l-orange-400', activeBg: 'bg-orange-500/10 dark:bg-orange-500/20' },
                    { key: 'range61_90', label: '61 a 90 Días', val: aging.range61_90, colorText: 'text-orange-700 dark:text-orange-500', border: 'border-l-orange-600', activeBg: 'bg-orange-600/10 dark:bg-orange-600/20' },
                    { key: 'rangeOver90', label: 'Más de 90 Días', val: aging.rangeOver90, colorText: 'text-red-700 dark:text-red-400', border: 'border-l-red-600', activeBg: 'bg-red-500/10 dark:bg-red-500/20' }
                  ] as const).map((bucket) => {
                    const isSelected = carteraAgingFilter === bucket.key;
                    const pct = totalCartera > 0 ? (bucket.val / totalCartera) * 100 : 0;
                    return (
                      <div 
                        key={bucket.key} 
                        onClick={() => {
                          setCarteraAgingFilter(carteraAgingFilter === bucket.key ? 'TODOS' : bucket.key);
                          setCarteraListPage(1);
                        }}
                        className={`p-3 border-l-4 rounded-xl border flex flex-col justify-between transition-all duration-300 hover:shadow-md cursor-pointer ${
                          isSelected 
                            ? `${bucket.activeBg} border-indigo-500 ring-2 ring-indigo-500/30` 
                            : isDarkMode ? 'bg-[#1e293b]/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider block">
                          {bucket.label}
                        </span>
                        <div className="mt-2">
                          <span className={`text-[17px] font-extrabold block leading-tight ${bucket.colorText}`}>
                            {formatCOP(bucket.val)}
                          </span>
                          <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[10px] font-semibold mt-0.5 block">
                            {pct.toFixed(1).replace('.', ',')}% del total
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Filtros e Interfaz */}
              <section className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3.5 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                {/* Buscador */}
                <div className="relative flex-1 min-w-[240px]">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={carteraSearchQuery}
                    onChange={(e) => {
                      setCarteraSearchQuery(e.target.value);
                      setCarteraListPage(1);
                    }}
                    placeholder="Buscar por Nombre, NIT o Código de Cliente..."
                    className={`w-full py-2 pl-9 pr-4 rounded-xl text-xs transition-all focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/40 ${
                      isDarkMode 
                        ? 'bg-[#1e293b] border-slate-800 text-slate-100 placeholder-slate-500 focus:border-[#4f46e5]/70' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-450 focus:border-[#4f46e5]/70'
                    }`}
                  />
                </div>

                {/* Filtro Vendedor */}
                <div className="flex items-center gap-2">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-extrabold uppercase tracking-wider">
                    Vendedor:
                  </span>
                  <select
                    value={carteraVendedorFilter}
                    onChange={(e) => {
                      setCarteraVendedorFilter(e.target.value);
                      setCarteraListPage(1);
                    }}
                    className={`py-1.5 px-3.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/40 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#1e293b] border-slate-800 text-slate-200' 
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="TODOS">TODOS</option>
                    {carteraVendedores.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Estado */}
                <div className="flex items-center gap-2">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-extrabold uppercase tracking-wider">
                    Estado:
                  </span>
                  <select
                    value={carteraStatusFilter}
                    onChange={(e) => {
                      setCarteraStatusFilter(e.target.value);
                      setCarteraListPage(1);
                    }}
                    className={`py-1.5 px-3.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/40 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#1e293b] border-slate-800 text-slate-200' 
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="TODOS">Todos con Saldo</option>
                    <option value="MORA">Sólo en Mora</option>
                    <option value="CORRIENTE">Sólo Corrientes</option>
                  </select>
                </div>
              </section>

              {/* Master-Detail Layout (Split Screen) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* LISTADO DE CLIENTES (Master) */}
                <div className={`p-4 rounded-2xl border lg:col-span-7 ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[13px] font-extrabold uppercase tracking-wider">
                        Clientes en Cartera ({formatNumberWithDots(totalClientes)})
                      </h3>
                      {carteraAgingFilter !== 'TODOS' && (
                        <span 
                          onClick={() => {
                            setCarteraAgingFilter('TODOS');
                            setCarteraListPage(1);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4f46e5]/10 text-[#4f46e5] dark:bg-[#4f46e5]/20 dark:text-[#a5b4fc] cursor-pointer hover:bg-[#4f46e5]/20 transition-colors"
                        >
                          Aging: {
                            carteraAgingFilter === 'current' ? 'Corriente' :
                            carteraAgingFilter === 'range1_30' ? '1-30 días' :
                            carteraAgingFilter === 'range31_60' ? '31-60 días' :
                            carteraAgingFilter === 'range61_90' ? '61-90 días' : 'Más de 90 días'
                          } ✕
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tabla Clientes con Scroll Vertical */}
                  <div className="overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800/60 max-h-[550px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`${
                          isDarkMode ? 'bg-[#1e293b]/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                        } border-b text-[10px] font-extrabold uppercase tracking-wider`}>
                          <th className="py-2.5 px-3 w-8 text-center">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox"
                                checked={isAllChecked}
                                onChange={(e) => {
                                  const allFilteredCodes = sortedClientes.map(c => String(c.cod_benf));
                                  if (e.target.checked) {
                                    setCarteraExcludedClientes(prev => prev.filter(code => !allFilteredCodes.includes(code)));
                                  } else {
                                    setCarteraExcludedClientes(prev => {
                                      const next = new Set([...prev, ...allFilteredCodes]);
                                      return Array.from(next);
                                    });
                                  }
                                }}
                                className="rounded border-slate-300 dark:border-slate-700 bg-transparent text-[#4f46e5] focus:ring-[#4f46e5] w-3.5 h-3.5 cursor-pointer"
                              />
                            </div>
                          </th>
                          <th 
                            onClick={() => handleHeaderClick('nombre')}
                            className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <span className="flex items-center">Cliente {renderSortIcon('nombre')}</span>
                          </th>
                          <th 
                            onClick={() => handleHeaderClick('prioridadScore')}
                            className="py-2.5 px-3 cursor-pointer select-none text-center hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors border-l border-transparent"
                          >
                            <span className="flex items-center justify-center">Prioridad {renderSortIcon('prioridadScore')}</span>
                          </th>
                          <th 
                            onClick={() => handleHeaderClick('cupo_asignado')}
                            className="py-2.5 px-3 cursor-pointer select-none text-right hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <span className="flex items-center justify-end">Cupo Asig. {renderSortIcon('cupo_asignado')}</span>
                          </th>
                          <th 
                            onClick={() => handleHeaderClick('saldo_total')}
                            className="py-2.5 px-3 cursor-pointer select-none text-right hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <span className="flex items-center justify-end">Saldo Total {renderSortIcon('saldo_total')}</span>
                          </th>
                          <th 
                            onClick={() => handleHeaderClick('saldo_vencido')}
                            className="py-2.5 px-3 cursor-pointer select-none text-right hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <span className="flex items-center justify-end">Saldo Venc. {renderSortIcon('saldo_vencido')}</span>
                          </th>
                          <th 
                            onClick={() => handleHeaderClick('mora_maxima')}
                            className="py-2.5 px-3 cursor-pointer select-none text-center hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <span className="flex items-center justify-center">Mora Max {renderSortIcon('mora_maxima')}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                        {paginatedClientes.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-450 dark:text-slate-500 text-xs">
                              No hay clientes que coincidan con los filtros aplicados.
                            </td>
                          </tr>
                        ) : (
                          paginatedClientes.map((c) => {
                            const isSelected = carteraSelectedCliente && String(c.cod_benf) === String(carteraSelectedCliente.cod_benf);
                            const hasMora = Number(c.saldo_vencido) > 1.0;
                            const isChecked = c.checked;
                            return (
                              <tr 
                                key={c.cod_benf}
                                className={`text-xs cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 text-[#4f46e5] dark:text-[#a5b4fc] font-semibold'
                                    : isDarkMode 
                                      ? 'hover:bg-slate-800/40 text-slate-300' 
                                      : 'hover:bg-slate-50 text-slate-700'
                                } ${!isChecked ? 'opacity-40' : ''}`}
                              >
                                <td className="py-2.5 px-3 text-center w-8" onClick={(e) => e.stopPropagation()}>
                                  <div className="relative flex items-center justify-center">
                                    <input 
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setCarteraExcludedClientes(prev => [...prev, String(c.cod_benf)]);
                                        } else {
                                          setCarteraExcludedClientes(prev => prev.filter(code => code !== String(c.cod_benf)));
                                        }
                                      }}
                                      className="rounded border-slate-300 dark:border-slate-700 bg-transparent text-[#4f46e5] focus:ring-[#4f46e5] w-3.5 h-3.5 cursor-pointer animate-none"
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 min-w-[200px]" onClick={() => setCarteraSelectedCliente(c)}>
                                  <div className="font-extrabold text-[12px] uppercase truncate max-w-[220px]" title={c.nombre}>
                                    {c.nombre}
                                  </div>
                                  <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                                    <span>NIT: {c.nit}</span>
                                    <span>•</span>
                                    <span>Vend: {c.nombre_vend}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-center" onClick={() => setCarteraSelectedCliente(c)}>
                                  {getPriorityBadge(c.prioridadScore)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-semibold" onClick={() => setCarteraSelectedCliente(c)}>
                                  {c.cupo_asignado > 0 ? formatCOP(c.cupo_asignado) : '—'}
                                </td>
                                <td className="py-2.5 px-3 text-right font-black" onClick={() => setCarteraSelectedCliente(c)}>
                                  {formatCOP(c.saldo_total)}
                                </td>
                                <td className={`py-2.5 px-3 text-right font-black ${hasMora ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-455'}`} onClick={() => setCarteraSelectedCliente(c)}>
                                  {formatCOP(c.saldo_vencido)}
                                </td>
                                <td className="py-2.5 px-3 text-center" onClick={() => setCarteraSelectedCliente(c)}>
                                  {hasMora ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-500/10 text-red-500">
                                      {c.mora_maxima} días
                                    </span>
                                  ) : (
                                    <span className="text-emerald-500 font-extrabold">✓ Al día</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación y Selector de Tamaño de Página */}
                  {totalClientes > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                      {/* Selector de tamaño de página */}
                      <div className="flex items-center gap-2">
                        <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-extrabold uppercase tracking-wider">
                          Clientes por pág:
                        </span>
                        <select
                          value={carteraPageSize}
                          onChange={(e) => {
                            setCarteraPageSize(Number(e.target.value));
                            setCarteraListPage(1);
                          }}
                          className={`py-1 px-2.5 rounded-lg border text-[11px] font-bold focus:outline-none cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-900 border-slate-800 text-slate-200' 
                              : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                          }`}
                        >
                          <option value={15}>15</option>
                          <option value={30}>30</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      {/* Controles de página */}
                      {totalPages > 1 ? (
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                            Página {carteraListPage} de {totalPages}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={carteraListPage === 1}
                              onClick={() => setCarteraListPage(prev => Math.max(1, prev - 1))}
                              className={`p-1 px-3 border rounded-lg text-[11px] font-bold transition-all ${
                                carteraListPage === 1
                                  ? 'border-transparent text-slate-400 cursor-not-allowed'
                                  : isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              Anterior
                            </button>
                            <button
                              disabled={carteraListPage === totalPages}
                              onClick={() => setCarteraListPage(prev => Math.min(totalPages, prev + 1))}
                              className={`p-1 px-3 border rounded-lg text-[11px] font-bold transition-all ${
                                carteraListPage === totalPages
                                  ? 'border-transparent text-slate-400 cursor-not-allowed'
                                  : isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              Siguiente
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                          Mostrando todos los clientes
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* DETALLE DE FACTURAS (Detail) */}
                <div className={`p-4 rounded-2xl border lg:col-span-5 ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  {!carteraSelectedCliente ? (
                    <div className="flex flex-col items-center justify-center p-12 min-h-[380px] text-center">
                      <div className={`p-3.5 rounded-2xl mb-3 ${
                        isDarkMode ? 'bg-[#1E293B] text-slate-400 border border-slate-800' : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        <CreditCard size={28} />
                      </div>
                      <h4 style={{ color: isDarkMode ? '#CBD5E1' : '#1E293B' }} className="text-xs font-bold uppercase tracking-wider">
                        Sin Cliente Seleccionado
                      </h4>
                      <p style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }} className="text-[10px] mt-1.5 max-w-[240px] leading-relaxed">
                        Haz clic sobre cualquier cliente en la grilla izquierda para ver la composición detallada de sus facturas y estado de cuenta.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      {/* Cliente Cabecera Detalle */}
                      <div className={`p-3.5 rounded-xl border relative ${
                        isDarkMode ? 'bg-[#1e293b]/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <button 
                          onClick={() => setCarteraSelectedCliente(null)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                          title="Cerrar detalle"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#4f46e5] dark:text-[#a5b4fc] block">
                          Composición de Deuda
                        </span>
                        <h4 style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="text-[13px] font-extrabold uppercase mt-1 pr-6 leading-tight">
                          {carteraSelectedCliente.nombre}
                        </h4>
                        
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">
                              Cupo Asignado:
                            </span>
                            <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">
                              {carteraSelectedCliente.cupo_asignado > 0 ? formatCOP(carteraSelectedCliente.cupo_asignado) : 'Sin Asignar'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">
                              Cupo Disponible:
                            </span>
                            <span className={`text-xs font-bold block ${carteraSelectedCliente.cupo_disponible < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                              {carteraSelectedCliente.cupo_asignado > 0 ? formatCOP(carteraSelectedCliente.cupo_disponible) : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">
                              Vendedor:
                            </span>
                            <span className="text-[11px] font-bold block text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={carteraSelectedCliente.nombre_vend}>
                              {carteraSelectedCliente.nombre_vend}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">
                              Mora Máxima:
                            </span>
                            <span className={`text-[11px] font-bold block ${Number(carteraSelectedCliente.saldo_vencido) > 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                              {Number(carteraSelectedCliente.saldo_vencido) > 1 ? `${carteraSelectedCliente.mora_maxima} días` : 'Al día'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Listado Facturas del Cliente */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="text-[10px] font-extrabold uppercase tracking-wider">
                            Facturas Pendientes ({selectedClienteDocs.length})
                          </span>
                        </div>

                        {/* Listado Scrollable de Facturas */}
                        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                          {selectedClienteDocs.map((doc, idx) => {
                            const isOverdue = doc.estado === 'Vencido' || doc.dias_mora > 0;
                            return (
                              <div 
                                key={idx}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3.5 transition-all hover:translate-x-0.5 ${
                                  isOverdue
                                    ? isDarkMode ? 'bg-[#7F1D1D]/5 border-red-900/35' : 'bg-red-500/5 border-red-100'
                                    : isDarkMode ? 'bg-[#14532D]/5 border-emerald-950/35' : 'bg-emerald-500/5 border-emerald-100'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-[12px] dark:text-white">
                                      {doc.documento}
                                    </span>
                                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                      isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                      {isOverdue ? `Vencido` : `Corriente`}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 flex flex-wrap items-center gap-1.5 leading-none">
                                    <span>Elab: {formatExcelDate(Number(doc.fecha_elab))}</span>
                                    <span>•</span>
                                    <span>Vcto: {formatExcelDate(Number(doc.fecha_vcto))}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`font-black text-sm block ${
                                    isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {formatCOP(doc.saldo)}
                                  </span>
                                  {isOverdue && (
                                    <span className="text-red-500 text-[10px] font-extrabold block mt-0.5">
                                      {doc.dias_mora} días de mora
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Tarjeta del Total Pendiente */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 mr-5 ${
                          isDarkMode 
                            ? 'bg-[#1e1b4b]/40 border-indigo-900/50 shadow-inner' 
                            : 'bg-indigo-50/50 border-indigo-100/80 shadow-sm'
                        }`}>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            isDarkMode ? 'text-indigo-300/80' : 'text-indigo-600'
                          }`}>
                            Total Facturado Pendiente
                          </span>
                          <span className={`text-[15px] font-black tracking-tight ${
                            isDarkMode ? 'text-indigo-200' : 'text-indigo-800'
                          }`}>
                            {formatCOP(carteraSelectedCliente.saldo_total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Gráfico de Cartera por Asesor Comercial (Al final de la página) */}
              <section className={`p-5 rounded-2xl border transition-colors duration-300 mt-5 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200 shadow-slate-100 shadow-sm'
              }`}>
                <div className="mb-4">
                  <span className="text-[14px] font-semibold text-[#4f46e5] dark:text-[#a5b4fc] uppercase tracking-wider block mb-1">
                    Análisis de Cartera por Asesor Comercial
                  </span>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[18px] font-bold uppercase tracking-tight">
                    Distribución y Envejecimiento (Aging) del Saldo Pendiente por Vendedor
                  </h3>
                </div>

                <div className="w-full h-[676px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={carteraSellersChartData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={isDarkMode ? 'rgba(31,41,55,0.4)' : 'rgba(229,231,235,0.6)'} />
                      <XAxis type="number" tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${Math.round(val)}M`} />
                      <YAxis dataKey="vendedor" type="category" width={180} tick={{ fill: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        content={(props: any) => <CarteraSellersTooltip {...props} isDarkMode={isDarkMode} />} 
                        cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'extrabold', textTransform: 'uppercase', paddingBottom: '12px' }}
                      />
                      <Bar dataKey="corrienteMillions" name="Corriente" stackId="a" fill="#10b981" />
                      <Bar dataKey="range1_30Millions" name="1-30 días" stackId="a" fill="#facc15" />
                      <Bar dataKey="range31_60Millions" name="31-60 días" stackId="a" fill="#fb923c" />
                      <Bar dataKey="range61_90Millions" name="61-90 días" stackId="a" fill="#ea580c" />
                      <Bar dataKey="rangeOver90Millions" name=">90 días" stackId="a" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          );
        })()}

          </>
        )}

      </main>

      {/* 3. PANEL DERECHO DE FILTROS (10.5% DE ANCHO - FIJO Y COLAPSABLE) */}
      <aside className={`fixed right-0 top-0 h-screen border-l transition-all duration-300 flex flex-col justify-between p-2.5 z-40 ${
        isFiltersCollapsed ? 'w-[40px]' : 'w-[10.5%]'
      } ${
        isDarkMode ? 'bg-[#0f172a] border-gray-800/80' : 'bg-white border-gray-200/80 shadow-sm'
      }`}>
        <div className="space-y-5 h-full flex flex-col">
          {/* Header de Filtros */}
          <div className="flex items-center justify-between border-b pb-2 border-gray-250/20 dark:border-gray-800/40 shrink-0">
            <button 
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className={`p-1.5 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500 transition-colors mx-auto ${isFiltersCollapsed ? '' : 'rotate-180'}`}
            >
              <ChevronLeft size={14} />
            </button>
            {!isFiltersCollapsed && (
              <span 
                style={{ color: isDarkMode ? '#4ADE80' : '#059669' }}
                className="text-[12px] font-extrabold uppercase tracking-widest flex items-center gap-1.5"
              >
                <Search size={12} />
                Filtros Activos
              </span>
            )}
          </div>

          {!isFiltersCollapsed && (
            <div className="space-y-5 flex-1 flex flex-col overflow-hidden">
              {/* Filtro de Períodos agrupados por Año */}
              <div className="shrink-0 space-y-3">
                <label 
                  style={{ color: isDarkMode ? '#CBD5E1' : '#000000' }}
                  className="text-[12px] font-extrabold uppercase tracking-wider block"
                >
                  Periodos
                </label>
                {Object.entries(monthsByYear).map(([year, months]) => (
                  <div key={year} className="space-y-1.5">
                    <span 
                      style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                      className="text-[10px] font-black uppercase tracking-[0.5px] block border-b border-slate-500/10 dark:border-slate-800/40 pb-0.5"
                    >
                      {year}
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {months.map(m => {
                        const active = selectedMonths.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleToggleMonth(m.id)}
                            className={`py-1 rounded text-[12px] font-extrabold transition-all duration-350 ${
                              active 
                                ? 'bg-[#16A34A] text-white shadow-sm font-black' 
                                : isDarkMode 
                                  ? 'bg-slate-900 text-slate-350 border border-slate-800 hover:border-slate-700'
                                  : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {m.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filtro de Vendedores con Buscador y Multiselección */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <label 
                  style={{ color: isDarkMode ? '#CBD5E1' : '#000000' }}
                  className="text-[12px] font-extrabold uppercase tracking-wider block mb-1"
                >
                  Vendedores
                </label>
                
                {/* Caja de Búsqueda */}
                <div className="relative shrink-0 mb-2">
                  <Search className="absolute left-2.5 top-2.5 text-slate-450 dark:text-slate-500" size={12} />
                  <input
                    type="text"
                    placeholder="Buscar asesor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-7 pr-3 py-1.5 border rounded-lg text-[13px] focus:outline-none w-full placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-950 border-gray-800 text-gray-250 focus:border-emerald-500/50' 
                        : 'bg-white border-gray-200 text-slate-900 focus:border-emerald-500/50'
                    }`}
                  />
                </div>

                {/* Acciones de Vendedores */}
                <div className="flex justify-between items-center text-[12px] font-bold shrink-0 mb-2 border-b pb-2 border-gray-250/20 dark:border-gray-800/20">
                  <button 
                    onClick={handleSelectAllVendors} 
                    style={{ color: isDarkMode ? '#4ADE80' : '#059669' }}
                    className="hover:opacity-80 transition-opacity font-extrabold"
                  >
                    Marcar Todos
                  </button>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <button 
                    onClick={handleDeselectAllVendors} 
                    style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                    className="hover:opacity-80 transition-opacity font-extrabold"
                  >
                    Limpiar
                  </button>
                </div>

                {/* Lista Multiselección */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {advisorsData
                    .filter(adv => adv.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(adv => {
                       const isChecked = selectedVendors.includes(adv.name);
                       const shortName = getShortNameWithLastName(adv.name);
                       return (
                        <label 
                          key={adv.id} 
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer select-none text-[13px] font-medium transition-all ${
                            isChecked
                              ? 'bg-[#16A34A]/10 border-[#16A34A]/30 text-[#16A34A]'
                              : isDarkMode
                                ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleVendor(adv.name)}
                              className="sr-only" // Hidden, custom styled checkbox
                            />
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                              isChecked 
                                ? 'bg-[#16A34A] border-[#16A34A] text-white' 
                                : isDarkMode 
                                  ? 'border-slate-700 bg-slate-900 text-slate-400' 
                                  : 'border-slate-300 bg-white text-slate-600'
                            }`}>
                              {isChecked && (
                                <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="truncate">{toTitleCase(shortName)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
            </div>
          )}

          {isFiltersCollapsed && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Calendar size={18} className="text-emerald-500" />
              <User size={18} className="text-indigo-500" />
            </div>
          )}
        </div>
      </aside>

      {/* MODAL DE SEGURIDAD PARA ACCESO FINANCIERO */}
      {showFinancialUnlockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md border rounded-3xl p-6 relative shadow-2xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#0f172a] border-gray-800 shadow-blue-900/10' 
              : 'bg-white border-gray-200 shadow-slate-300/40'
          }`}>
            <div className="flex flex-col items-center mb-6">
              <div className={`p-3.5 rounded-2xl border mb-3 shadow-md ${
                isDarkMode 
                  ? 'bg-amber-600/10 border-amber-500/20 text-amber-500' 
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}>
                <Lock size={24} />
              </div>
              <h3 className={`text-lg font-black tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Acceso Restringido</h3>
              <p className={`text-[11px] font-bold uppercase tracking-wider text-center mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Se requieren credenciales financieras para ver esta sección
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (financialPassword === CORRECT_PASSWORD) {
                  setIsFinancialDataUnlocked(true);
                  setShowFinancialUnlockModal(false);
                  setFinancialPassword('');
                  setFinancialPasswordError('');
                } else {
                  setFinancialPasswordError('Contraseña incorrecta. Acceso denegado.');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Contraseña de Seguridad
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    placeholder="Introduce la contraseña"
                    value={financialPassword}
                    onChange={(e) => {
                      setFinancialPassword(e.target.value);
                      setFinancialPasswordError('');
                    }}
                    autoFocus
                    className={`w-full border rounded-2xl py-2.5 pl-10 pr-4 text-xs transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-amber-500/20 ${
                      isDarkMode 
                        ? 'bg-[#1e293b] border-gray-800 text-gray-100 placeholder-gray-600 focus:border-amber-500/60' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-500/60 shadow-inner'
                    }`}
                  />
                </div>
                {financialPasswordError && (
                  <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5 animate-bounce">
                    <span>⚠️</span> {financialPasswordError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFinancialUnlockModal(false);
                    setFinancialPassword('');
                    setFinancialPasswordError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-800 text-gray-400 hover:bg-gray-800/40 hover:text-white' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all shadow-md"
                >
                  Desbloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
