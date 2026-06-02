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
  Crown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  { id: 'Abril', label: 'Abr 26', color: '#3182ce' }  // Azul
];

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


// Formateador financiero premium en Millones/Billones de COP ($X.XXX M / $X,X B)
const formatMillionsValue = (valInMillions: number) => {
  if (valInMillions >= 10000) {
    const valInBillions = valInMillions / 1000;
    return `$${valInBillions.toLocaleString('es-CO', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })} B`;
  }
  const roundedMillions = Math.round(valInMillions);
  return `$${roundedMillions.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })} M`;
};

const formatMillionsCOP = (valInPesos: number) => {
  return formatMillionsValue(valInPesos / 1000000);
};

// Interfaz para la estructura del asesor
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
  Total_2026_Unicos: number;
  Total_General_Unicos: number;
}

// COMPONENTE DE TOOLTIP CUSTOMIZADO Y EJECUTIVO
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isDarkMode: boolean;
  type: 'cobertura-grupal' | 'cobertura-individual' | 'ventas';
}

const CustomTooltip = ({ active, payload, label, isDarkMode, type }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-4 border rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 font-sans text-xs ${
        isDarkMode 
          ? 'bg-[#0f1115]/95 border-gray-800 text-gray-200 shadow-black/60' 
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
  const [rememberMe, setRememberMe] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Por defecto modo claro

  // Estados dinámicos cargados del Excel
  const [advisorsData, setAdvisorsData] = useState<Advisor[]>([]);
  const [rawExcelRows, setRawExcelRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');

  const [selectedMonths, setSelectedMonths] = useState<string[]>(MESES_CONFIG.map(m => m.id));
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'cobertura' | 'ventas' | 'unicos' | 'frecuencia' | 'tendencias' | 'asesor' | 'comparativos'>('cobertura');

  // Estados de navegación del nuevo Sidebar SaaS
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Estado para la gráfica individual de tendencia
  const [selectedIndividualVendor, setSelectedIndividualVendor] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Estados para la pestaña de Frecuencia de Compra - Detalle Operativo de Clientes
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<'Saludable' | 'Atención' | 'Riesgo' | 'Perdido'>('Perdido');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientListPage, setClientListPage] = useState(1);

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
    const fetchAndParseExcel = async () => {
      try {
        setLoading(true);
        const response = await fetch('/1Maestra de clientes2026.xlsx');
        if (!response.ok) {
          throw new Error('No se pudo encontrar el archivo "1Maestra de clientes2026.xlsx" en la carpeta public.');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const sheetName = 'Maestra de Clientes';
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          throw new Error(`No se encontró la hoja "${sheetName}" en el libro de Excel.`);
        }
        
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];
        setRawExcelRows(rows);

        // Agrupación y mapeo dinámico de datos de asesores
        const mesMap: Record<string, keyof Omit<Advisor, 'id' | 'name' | 'Total_2026_Unicos' | 'Total_General_Unicos'>> = {
          'Septiembre': 'Sep25',
          'Octubre': 'Oct25',
          'Noviembre': 'Nov25',
          'Diciembre': 'Dic25',
          'Enero': 'Enero',
          'Febrero': 'Febrero',
          'Marzo': 'Marzo',
          'Abril': 'Abril'
        };

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
          clients2026: Set<string>;
          clientsGeneral: Set<string>;
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
              clients2026: new Set(),
              clientsGeneral: new Set()
            };
          }
          
          const clientCode = row.cod_client ? String(row.cod_client).trim() : '';
          const mes = row.Mes;
          const tipo = row.Tipo;
          if (!clientCode || !mes || !tipo) return;
          
          if (!['FE', 'CT'].includes(tipo)) return;

          const mappedMonth = mesMap[mes];
          if (mappedMonth) {
            advisorsMap[id][mappedMonth].add(clientCode);
          }
          
          if (['Enero', 'Febrero', 'Marzo', 'Abril'].includes(mes)) {
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
  }, [reloadTrigger]);

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

  const getDynamicUnique = (advisor: Advisor, months: string[]) => {
    if (months.length === 0) return 0;
    
    const hasOnly2026 = months.every(m => ['Enero', 'Febrero', 'Marzo', 'Abril'].includes(m));
    const hasAllMonths = months.length === MESES_CONFIG.length;
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

    const sumVal = months.reduce((a, b) => a + (advisor[b as keyof Omit<Advisor, 'id' | 'name' | 'Total_2026_Unicos' | 'Total_General_Unicos'>] || 0), 0);
    const maxVal = Math.max(...months.map(m => advisor[m as keyof Omit<Advisor, 'id' | 'name' | 'Total_2026_Unicos' | 'Total_General_Unicos'>] || 0));
    const scale = maxVal + (sumVal - maxVal) * 0.32;
    return Math.round(Math.min(scale, advisor.Total_General_Unicos));
  };

  const processedAdvisors = useMemo(() => {
    return advisorsData.map(adv => {
      const dynamicCoverage = getDynamicUnique(adv, selectedMonths);
      return {
        ...adv,
        dynamicCoverage
      };
    }).filter(adv => 
      selectedVendors.includes(adv.name) &&
      adv.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.dynamicCoverage - a.dynamicCoverage);
  }, [selectedMonths, selectedVendors, searchQuery, advisorsData]);

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

    const mesMap: Record<string, string> = {
      'Sep25': 'Septiembre',
      'Oct25': 'Octubre',
      'Nov25': 'Noviembre',
      'Dic25': 'Diciembre',
      'Enero': 'Enero',
      'Febrero': 'Febrero',
      'Marzo': 'Marzo',
      'Abril': 'Abril'
    };

    const selectedExcelMonths = selectedMonths.map(m => mesMap[m]);
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
      if (!row.vendedor || !row.Mes || !row.total1 || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') {
        name = 'PRINCIPAL';
      }

      if (selectedExcelMonths.includes(row.Mes)) {
        const val = parseFloat(row.total1) || 0;
        const clientCode = row.cod_client ? String(row.cod_client).trim() : '';
        
        if (selectedVendors.includes(name)) {
          if (!salesMap[name]) {
            salesMap[name] = { id, name, sales: 0, clientCodes: new Set() };
          }
          salesMap[name].sales += val;
          grandTotal += val;
          if (clientCode) {
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
  }, [selectedMonths, selectedVendors, searchQuery, rawExcelRows, advisorsData]);

  // Donut chart slices en base a la participación de ventas
  const donutSlices = useMemo(() => {
    const C = 2 * Math.PI * 40; 
    let accumulatedOffset = 0;

    return salesData.advisorsSales.map(adv => {
      const colorIndex = parseInt(adv.id) || 0;
      const sliceColor = MESES_CONFIG[colorIndex % MESES_CONFIG.length]?.color || '#10b981';
      
      const percentageDecimal = adv.percentage / 100;
      const strokeLength = percentageDecimal * C;
      const gapLength = C - strokeLength;
      
      const strokeDashArray = `${strokeLength} ${gapLength}`;
      const strokeDashOffset = -accumulatedOffset; 
      
      accumulatedOffset += strokeLength;

      return {
        name: adv.name,
        color: sliceColor,
        percentage: adv.percentage,
        strokeDashArray,
        strokeDashOffset: String(strokeDashOffset)
      };
    });
  }, [salesData.advisorsSales]);

  // FRECUENCIA DE COMPRA
  const frequencyData = useMemo(() => {
    if (advisorsData.length === 0 || rawExcelRows.length === 0) {
      return { advisorsFrequency: [], avgFrequency: 0, totalInvoices: 0, leaderName: 'Ninguno', leaderFrequency: 0 };
    }
    const mesMap: Record<string, string> = {
      'Sep25': 'Septiembre', 'Oct25': 'Octubre', 'Nov25': 'Noviembre', 'Dic25': 'Diciembre',
      'Enero': 'Enero', 'Febrero': 'Febrero', 'Marzo': 'Marzo', 'Abril': 'Abril'
    };
    const selectedExcelMonths = selectedMonths.map(m => mesMap[m]);
    const invoiceCounts: Record<string, number> = {};
    let totalInvoices = 0;

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.Mes || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') name = 'PRINCIPAL';

      if (selectedExcelMonths.includes(row.Mes) && selectedVendors.includes(name)) {
        invoiceCounts[name] = (invoiceCounts[name] || 0) + 1;
        totalInvoices += 1;
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
  }, [selectedMonths, selectedVendors, rawExcelRows, salesData.advisorsSales, advisorsData]);

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

    if (selectedMonths.length === 0) {
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
      'Abril': { year: 2026, monthZeroIndexed: 3 }
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

    // 1. Encontrar el mes más tardío dentro del rango de meses seleccionado
    let latestMonthId = 'Abril'; // Fallback por defecto si no se encuentra
    let maxMonthIndex = -1;

    selectedMonths.forEach(mId => {
      const idx = MESES_CONFIG.findIndex(m => m.id === mId);
      if (idx > maxMonthIndex) {
        maxMonthIndex = idx;
        latestMonthId = mId;
      }
    });

    // 2. Determinar la fecha de referencia dinámica (primer día del mes siguiente al último seleccionado)
    const referenceDateSerial = getNextMonthFirstDaySerial(latestMonthId);

    // Mapa para almacenar la fecha de última compra de cada cliente único
    const clientLastPurchase: Record<string, { lastDateSerial: number, sellerName: string, clientName: string }> = {};

    const mesMap: Record<string, string> = {
      'Sep25': 'Septiembre', 'Oct25': 'Octubre', 'Nov25': 'Noviembre', 'Dic25': 'Diciembre',
      'Enero': 'Enero', 'Febrero': 'Febrero', 'Marzo': 'Marzo', 'Abril': 'Abril'
    };
    const selectedExcelMonths = selectedMonths.map(m => mesMap[m]);

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.cod_client || !row.fecha || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      // Filtrar únicamente por los meses elegidos por el usuario
      if (!row.Mes || !selectedExcelMonths.includes(row.Mes)) return;

      const rawVendedor = row.vendedor.trim();
      const id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') name = 'PRINCIPAL';

      // Filtrar por vendedores seleccionados
      if (!selectedVendors.includes(name)) return;

      const clientCode = String(row.cod_client).trim();
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
  }, [rawExcelRows, selectedVendors, selectedMonths]);

  // Filtrado, búsqueda y paginación de clientes según estado de riesgo (Frecuencia de Compra)
  const filteredClients = useMemo(() => {
    if (!clientRecencyData.clientsList) return [];
    return clientRecencyData.clientsList
      .filter(client => {
        const matchesCategory = client.category === selectedRiskCategory;
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
    const mesMap: Record<string, string> = {
      'Sep25': 'Septiembre', 'Oct25': 'Octubre', 'Nov25': 'Noviembre', 'Dic25': 'Diciembre',
      'Enero': 'Enero', 'Febrero': 'Febrero', 'Marzo': 'Marzo', 'Abril': 'Abril'
    };

    const monthlySales: Record<string, number> = {};
    const monthlyClients: Record<string, Set<string>> = {};
    const monthlyInvoices: Record<string, number> = {};

    MESES_CONFIG.forEach(m => {
      monthlySales[m.id] = 0;
      monthlyClients[m.id] = new Set();
      monthlyInvoices[m.id] = 0;
    });

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.Mes || !row.total1 || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') name = 'PRINCIPAL';

      if (selectedVendors.includes(name)) {
        const mConfig = MESES_CONFIG.find(m => mesMap[m.id] === row.Mes);
        if (mConfig) {
          const val = parseFloat(row.total1) || 0;
          const clientCode = row.cod_client ? String(row.cod_client).trim() : '';

          monthlySales[mConfig.id] += val;
          monthlyInvoices[mConfig.id] += 1;
          if (clientCode) {
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
      const active = selectedMonths.includes(m.id);

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
    }).filter(d => selectedMonths.includes(d.id));
  }, [selectedMonths, selectedVendors, rawExcelRows, advisorsData]);

  // ANALISIS INDIVIDUAL POR ASESOR DETALLADO
  const selectedAdvisorAnalysis = useMemo(() => {
    if (advisorsData.length === 0 || rawExcelRows.length === 0) {
      return null;
    }
    const salesInfo = salesData.advisorsSales.find(a => a.name === selectedIndividualVendor);
    const coverageInfo = processedAdvisors.find(a => a.name === selectedIndividualVendor);
    const ranking = salesData.advisorsSales.findIndex(a => a.name === selectedIndividualVendor) + 1;

    const mesMap: Record<string, string> = {
      'Sep25': 'Septiembre', 'Oct25': 'Octubre', 'Nov25': 'Noviembre', 'Dic25': 'Diciembre',
      'Enero': 'Enero', 'Febrero': 'Febrero', 'Marzo': 'Marzo', 'Abril': 'Abril'
    };
    const monthlySales: Record<string, number> = {};
    const monthlyClients: Record<string, Set<string>> = {};

    MESES_CONFIG.forEach(m => {
      monthlySales[m.id] = 0;
      monthlyClients[m.id] = new Set();
    });

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.Mes || !row.total1 || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') name = 'PRINCIPAL';

      if (name === selectedIndividualVendor) {
        const mConfig = MESES_CONFIG.find(m => mesMap[m.id] === row.Mes);
        if (mConfig) {
          const val = parseFloat(row.total1) || 0;
          const clientCode = row.cod_client ? String(row.cod_client).trim() : '';

          monthlySales[mConfig.id] += val;
          if (clientCode) {
            monthlyClients[mConfig.id].add(clientCode);
          }
        }
      }
    });

    const monthlyData = MESES_CONFIG.map(m => {
      const salesRaw = monthlySales[m.id];
      const salesInMillions = salesRaw / 1000000;
      const clients = monthlyClients[m.id].size;
      return {
        name: m.label,
        monthId: m.id,
        salesInMillions,
        clients
      };
    }).filter(d => selectedMonths.includes(d.monthId));

    return {
      name: selectedIndividualVendor,
      salesRaw: salesInfo?.salesRaw || 0,
      salesInMillions: salesInfo?.salesInMillions || 0,
      activeClients: salesInfo?.activeClients || 0,
      ticketAverage: salesInfo?.ticketAverage || 0,
      percentage: salesInfo?.percentage || 0,
      coverage: coverageInfo?.dynamicCoverage || 0,
      ranking,
      monthlyData
    };
  }, [selectedIndividualVendor, selectedMonths, rawExcelRows, salesData.advisorsSales, processedAdvisors, advisorsData]);



  const kpis = useMemo(() => {
    if (advisorsData.length === 0 || rawExcelRows.length === 0) {
      return {
        totalUnique: 0,
        leaderName: 'Ninguno',
        leaderCoverage: 0,
        participation: "0.0"
      };
    }

    const mesMap: Record<string, string> = {
      'Sep25': 'Septiembre',
      'Oct25': 'Octubre',
      'Nov25': 'Noviembre',
      'Dic25': 'Diciembre',
      'Enero': 'Enero',
      'Febrero': 'Febrero',
      'Marzo': 'Marzo',
      'Abril': 'Abril'
    };

    const selectedExcelMonths = selectedMonths.map(m => mesMap[m]);
    const uniqueClients = new Set<string>();

    rawExcelRows.forEach(row => {
      if (!row.vendedor || !row.Mes || !row.cod_client || !row.Tipo) return;
      if (!['FE', 'CT'].includes(row.Tipo)) return;

      let rawVendedor = row.vendedor.trim();
      let id = rawVendedor.substring(0, 2);
      let name = rawVendedor.substring(3).trim();
      if (id === '01') {
        name = 'PRINCIPAL';
      }

      if (selectedVendors.includes(name) && selectedExcelMonths.includes(row.Mes)) {
        uniqueClients.add(String(row.cod_client).trim());
      }
    });

    const totalUnique = uniqueClients.size;
    const leader = processedAdvisors[0] || { name: 'Ninguno', dynamicCoverage: 0 };

    let participation = "100.0";
    if (selectedVendors.length < advisorsData.length && selectedVendors.length > 0) {
      const totalAllVendorsClients = new Set<string>();
      rawExcelRows.forEach(row => {
        if (!row.vendedor || !row.Mes || !row.cod_client || !row.Tipo) return;
        if (!['FE', 'CT'].includes(row.Tipo)) return;

        let rawVendedor = row.vendedor.trim();
        let id = rawVendedor.substring(0, 2);
        let name = rawVendedor.substring(3).trim();
        if (id === '01') {
          name = 'PRINCIPAL';
        }

        if (advisorsData.map(a => a.name).includes(name) && selectedExcelMonths.includes(row.Mes)) {
          totalAllVendorsClients.add(String(row.cod_client).trim());
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
  }, [selectedMonths, selectedVendors, processedAdvisors, rawExcelRows, advisorsData]);

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
      }));
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
    
    const latestMonthId = selectedMonths.length > 0
      ? MESES_CONFIG.filter(m => selectedMonths.includes(m.id)).pop()?.id
      : 'Abril';
    const latestMonthIndex = MESES_CONFIG.findIndex(m => m.id === latestMonthId);
    const prevMonthId = latestMonthIndex > 0 ? MESES_CONFIG[latestMonthIndex - 1].id : null;

    let growthMesActual = "0.0";
    let growthMesLabel = "Vs. período anterior";
    if (latestMonthId && prevMonthId) {
      const sumPrev = activeAdvisors.reduce((acc, curr) => acc + (curr[prevMonthId as keyof Advisor] as number || 0), 0);
      const sumCurr = activeAdvisors.reduce((acc, curr) => acc + (curr[latestMonthId as keyof Advisor] as number || 0), 0);
      if (sumPrev > 0) {
        growthMesActual = ((sumCurr - sumPrev) / sumPrev * 100).toFixed(1);
      }
      const prevMonthLabel = MESES_CONFIG[latestMonthIndex - 1].label;
      growthMesLabel = `Vs. período anterior (${prevMonthLabel})`;
    }
    
    return {
      avgCoverage,
      bestAdvisorName,
      bestAdvisorCoverage,
      bestAdvisorShare,
      diffVsAvg,
      growthMesActual,
      growthMesLabel
    };
  }, [chartAdvisorsData, kpis.totalUnique, selectedMonths]);

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
    return formatMillionsValue(val);
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
    setSelectedMonths(MESES_CONFIG.map(m => m.id));
    setSelectedVendors(advisorsData.map(a => a.name));
    setSearchQuery('');
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0a0c10]' : 'bg-[#f4f6fa]'
      }`}>
        {isDarkMode ? (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
          </>
        ) : (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
          </>
        )}

        <button
          onClick={toggleTheme}
          className={`absolute top-6 right-6 p-3 rounded-full border transition-all duration-300 shadow-md ${
            isDarkMode 
              ? 'bg-[#111318]/80 border-gray-800/80 text-yellow-500 hover:bg-[#181b22]' 
              : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50'
          }`}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={`w-full max-w-md backdrop-blur-xl border rounded-3xl p-8 relative z-10 shadow-2xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#111318]/80 border-gray-800/80 shadow-blue-900/10' 
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
        isDarkMode ? 'bg-[#0a0c10] text-gray-100' : 'bg-[#f4f6fa] text-gray-800'
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
        isDarkMode ? 'bg-[#0a0c10] text-gray-100' : 'bg-[#f4f6fa] text-gray-800'
      }`}>
        <div className={`w-full max-w-md p-8 border rounded-3xl text-center shadow-xl ${
          isDarkMode ? 'bg-[#111318] border-red-900/20' : 'bg-white border-red-200'
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
      isDarkMode ? 'bg-[#0a0c10] text-gray-100' : 'bg-[#F8FAFC] text-gray-800'
    }`}>
      
      {/* 1. SIDEBAR IZQUIERDO (11.5% DE ANCHO - FIJO Y COLAPSABLE) */}
      <aside className={`fixed left-0 top-0 h-screen border-r transition-all duration-300 flex flex-col justify-between p-3 z-40 bg-[#0B0F17] border-slate-800/60 ${
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
              { id: 'ventas', label: 'Ventas por Vendedor', icon: BarChart3, sensitive: true },
              // { id: 'unicos', label: 'Clientes Únicos', icon: Database },
              { id: 'tendencias', label: 'Tendencias', icon: Calendar, sensitive: true },
              { id: 'comparativos', label: 'Comparativos', icon: PieChart },
            ].filter(tab => !tab.sensitive || isFinancialDataUnlocked).map(tab => {
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

            {/* Botón de Candado de Seguridad */}
            <button
              onClick={handleFinancialLockToggle}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 mt-4 border border-dashed ${
                isFinancialDataUnlocked
                  ? 'border-emerald-500/20 text-[#10B981] hover:bg-[#10B981]/10'
                  : 'border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              title={isFinancialDataUnlocked ? "Bloquear datos financieros" : "Desbloquear datos financieros"}
            >
              {isFinancialDataUnlocked ? <Unlock size={16} className="shrink-0" /> : <Lock size={16} className="shrink-0" />}
              {!isSidebarCollapsed && (
                <span className="truncate">
                  {isFinancialDataUnlocked ? "Financiero Abierto" : "Financiero Cerrado"}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Configuración inferior del Sidebar */}
        <div className="space-y-4 pt-4 border-t border-slate-800/60">
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
            <p className="text-[9px] text-slate-500 font-semibold text-center tracking-tight">© 2026 Distribuidora JR</p>
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
              {activeTab === 'comparativos' && 'Comparativos Comerciales'}
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
              {activeTab === 'comparativos' && 'Comparativo de eficiencia: volumen de ventas en millones vs. cantidad de clientes únicos.'}
            </p>
          </div>

          {/* Acciones de Cabecera compactas */}
          <div className="flex items-center gap-3">
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

        {(activeTab === 'ventas' || activeTab === 'tendencias') && !isFinancialDataUnlocked ? (
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
                ? 'bg-[#0F1115] border-slate-800/80 shadow-black/30 shadow-md' 
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
                ? 'bg-[#0F1115] border-slate-800/80 shadow-black/30 shadow-md' 
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
                ? 'bg-[#0F1115] border-slate-800/80 shadow-black/30 shadow-md' 
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
                ? 'bg-[#0F1115] border-slate-800/80 shadow-black/30 shadow-md' 
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
                ? 'bg-[#0F1115] border-slate-800/80 shadow-black/30 shadow-md' 
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
                  Vs. período anterior (Mar 26)
                </span>
                <span 
                  style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
                  className="text-[11px] font-semibold block mt-3.5"
                >
                  Abr 26 vs Mar 26
                </span>
              </div>
            </div>
          </section>
        ) : (
          currentTab !== 'frecuencia' && (
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5 select-none animate-fade-in">
            {/* KPI 1 */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              isDarkMode ? 'bg-[#0f1115] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos'
                ? 'border-l-4 border-l-emerald-500'
                : activeTab === 'unicos'
                  ? 'border-l-4 border-l-blue-500'
                  : activeTab === 'frecuencia'
                    ? 'border-l-4 border-l-amber-500'
                    : 'border-l-4 border-l-rose-500'
            }`}>
              <div className="flex-1 min-w-0 pr-2">
                <span className={`text-[36px] font-extrabold tracking-tight block leading-none mb-1.5 ${
                  activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos' || activeTab === 'asesor'
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : activeTab === 'unicos'
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {(activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos') && formatMillionsCOP(salesData.totalSales)}
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
                  {activeTab === 'comparativos' && 'Ventas Totales'}
                </span>
              </div>
              <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 ${
                activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos' || activeTab === 'asesor'
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
              isDarkMode ? 'bg-[#0f1115] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos'
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
                  className="text-[36px] font-extrabold tracking-tight block leading-none mb-1.5 truncate"
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
                  {activeTab === 'comparativos' && (
                    <>
                      {formatNumberWithDots(kpis.totalUnique)}
                      <span 
                        style={{ color: isDarkMode ? '#94A3B8' : '#475569' }}
                        className="text-base font-medium ml-1.5 font-sans"
                      >
                        Únicos
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
                  {activeTab === 'comparativos' && 'Clientes Únicos'}
                </span>
                <span className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400 block mt-2 leading-none">
                  {activeTab === 'ventas' && formatMillionsCOP(salesData.leaderSales)}
                  {activeTab === 'unicos' && `${formatNumberWithDots(kpis.leaderCoverage)} Clientes`}
                  {activeTab === 'frecuencia' && formatMillionsCOP(salesData.totalSales)}
                  {activeTab === 'tendencias' && formatMillionsCOP((monthlyTrends.reduce((max, curr) => max.salesRaw > curr.salesRaw ? max : curr, { salesRaw: 0 } as any) as any).salesRaw || 0)}
                  {activeTab === 'asesor' && `Posición #${selectedAdvisorAnalysis?.ranking || 1}`}
                  {activeTab === 'comparativos' && 'Base global'}
                </span>
              </div>
              <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 ${
                activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos' || activeTab === 'unicos'
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
              isDarkMode ? 'bg-[#0f1115] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos'
                ? 'border-l-4 border-l-amber-500'
                : activeTab === 'unicos'
                  ? 'border-l-4 border-l-emerald-500'
                  : activeTab === 'frecuencia'
                    ? 'border-l-4 border-l-rose-500'
                    : 'border-l-4 border-l-amber-500'
            }`}>
              <div className="flex-1 min-w-0 pr-2">
                <span className={`text-[36px] font-extrabold tracking-tight block leading-none mb-1.5 ${
                  activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos' || activeTab === 'asesor'
                    ? 'text-amber-700 dark:text-amber-400'
                    : activeTab === 'unicos'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-450 dark:text-rose-400'
                }`}>
                  {activeTab === 'ventas' && formatMillionsCOP(salesData.avgSales)}
                  {activeTab === 'unicos' && `${kpis.participation}%`}
                  {activeTab === 'frecuencia' && getShortNameWithLastName(frequencyData.leaderName)}
                  {activeTab === 'tendencias' && formatMillionsCOP(salesData.totalSales / (monthlyTrends.length || 1))}
                  {activeTab === 'asesor' && formatMillionsCOP(selectedAdvisorAnalysis?.ticketAverage || 0)}
                  {activeTab === 'comparativos' && formatMillionsCOP(salesData.globalTicketAverage)}
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
                  {activeTab === 'comparativos' && 'Ticket Prom. Global'}
                </span>
              </div>
              <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 ${
                activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos' || activeTab === 'asesor'
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
              isDarkMode ? 'bg-[#0f1115] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos'
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
                      <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1.5 font-sans">Asesores</span>
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
                  {activeTab === 'comparativos' && (
                    <>
                      {frequencyData.avgFrequency}
                      <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1.5 font-sans">Compras</span>
                    </>
                  )}
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
                  {activeTab === 'comparativos' && 'Frecuencia Promedio'}
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border transition-colors duration-300 bg-sky-500/10 text-sky-600 dark:bg-sky-500/5 dark:text-sky-400 border-sky-500/10">
                <Users size={42} />
              </div>
            </div>

            {/* KPI 5 */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
              isDarkMode ? 'bg-[#0f1115] border-gray-800/80 shadow-black/30 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
            } ${
              activeTab === 'ventas' || activeTab === 'tendencias' || activeTab === 'comparativos'
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
                  {activeTab === 'comparativos' && `${formatMillionsValue(salesData.totalSales / (kpis.totalUnique || 1) / 1000000)}/cl`}
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
                  {activeTab === 'comparativos' && 'Relación Eficiencia'}
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
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block mb-1">Facturación por Vendedor (Millones de COP)</span>
                <h3 className="text-[18px] font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">Análisis comparativo de ingresos facturados por cada asesor comercial</h3>
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
                      content={<CustomTooltip isDarkMode={isDarkMode} type="ventas" />} 
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }} 
                    />
                    <Bar 
                      dataKey="salesInMillions" 
                      fill="url(#salesGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={salesChartData.length < 5 ? 54 : 32}
                    >
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

            {/* 5. GRID DOS COLUMNAS: TABLA EJECUTIVA & DONUT CHART (EVITA COMPLETAMENTE EL SCROLL VERTICAL) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* Tabla Resumen de Detalle (60% del ancho del grid) */}
              <section className={`p-4 rounded-2xl border transition-colors duration-300 lg:col-span-3 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block mb-1">Detalle de Ventas por Vendedor (Millones de COP)</span>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className={`border-b transition-colors font-extrabold text-[12px] uppercase tracking-wider ${
                          isDarkMode ? 'border-gray-800/60 text-table-header' : 'border-gray-200 text-table-header'
                        }`}>
                          <th className="py-1.5 px-2">#</th>
                          <th className="py-1.5 px-2">Vendedor</th>
                          <th className="py-1.5 px-2 text-right">Ventas (COP)</th>
                          <th className="py-1.5 px-2 text-right">Participación</th>
                          <th className="py-1.5 px-2 text-center">Clientes</th>
                          <th className="py-1.5 px-2 text-right">Ticket Prom.</th>
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
                            rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-orange-650/10 text-orange-650 dark:text-orange-400 rounded px-1.5 py-0.5 font-black text-[9px]">🥉 3</span>;
                          } else {
                            rankBadge = <span className="text-gray-400 font-bold px-1.5">{idx + 1}</span>;
                          }

                          return (
                            <tr key={adv.id} className={rowClass}>
                              <td className="py-1.5 px-2">{rankBadge}</td>
                              <td className="py-1.5 px-2 font-bold text-gray-850 dark:text-gray-200">
                                {shortName}
                              </td>
                              <td className="py-1.5 px-2 text-right font-black text-emerald-600 dark:text-emerald-400">
                                {formatMillionsCOP(adv.salesRaw)}
                              </td>
                              <td className="py-1.5 px-2 text-right font-black text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span>{adv.percentage}%</span>
                                  <div className="w-16 h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-950 shrink-0">
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
                        <tr className="font-extrabold border-t-2 border-gray-800 text-gray-900 dark:text-white bg-gray-500/5">
                          <td className="py-1.5 px-2" colSpan={2}>Total General</td>
                          <td className="py-1.5 px-2 text-right text-emerald-650 dark:text-emerald-400">{formatMillionsCOP(salesData.totalSales)}</td>
                          <td className="py-1.5 px-2 text-right">100.0%</td>
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
                isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-450 uppercase tracking-wider block mb-1">Participación por Vendedor</span>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2 mt-2">
                    <div className="relative w-52 h-52 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 animate-fade-in" viewBox="0 0 100 100">
                        {donutSlices.map((slice, idx) => (
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
                        <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest leading-none">Total Ventas</span>
                        <span className={`text-[16px] font-black leading-none mt-1 transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatMillionsCOP(salesData.totalSales).split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-extrabold text-gray-400 mt-1 leading-none">
                          {formatMillionsCOP(salesData.totalSales).split(' ')[1] === 'B' ? 'Billones' : 'Millones'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1 text-[10px] w-full max-h-[190px] overflow-y-auto pl-2">
                      {salesData.advisorsSales.map((adv) => {
                        const colorIndex = parseInt(adv.id) || 0;
                        const legendColor = MESES_CONFIG[colorIndex % MESES_CONFIG.length]?.color || '#10b981';
                        const shortName = getShortNameWithLastName(adv.name);

                        return (
                          <div key={adv.id} className="flex items-center gap-1.5 font-semibold">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: legendColor }}></div>
                            <div className="min-w-0 flex-1 truncate">
                              <p className={`font-black truncate text-[10px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {shortName}: {adv.percentage}%
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
                isDarkMode ? 'bg-[#0c0e12] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
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
                isDarkMode ? 'bg-[#0c0e12] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
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
              isDarkMode ? 'bg-[#0c0e12] border-slate-800/80 shadow-black/20 shadow-md' : 'bg-white border-slate-200/80 shadow-slate-200/60 shadow-md'
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
                        <th className="py-2.5 px-3 text-center">Ene 26</th>
                        <th className="py-2.5 px-3 text-center">Feb 26</th>
                        <th className="py-2.5 px-3 text-center">Mar 26</th>
                        <th className="py-2.5 px-3 text-center">Abr 26</th>
                        <th className="py-2.5 px-3 text-right">Variación Abr vs Mar</th>
                        <th className="py-2.5 px-3 text-right">Variación %</th>
                        <th className="py-2.5 px-3 text-center">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartAdvisorsData.map((adv) => {
                        const activeMonths = [adv.Dic25 || 0, adv.Enero || 0, adv.Febrero || 0, adv.Marzo || 0, adv.Abril || 0].filter(val => val > 0);
                        const totalCoverage = activeMonths.reduce((sum, val) => sum + val, 0);
                        const avgCoverage = activeMonths.length > 0 ? totalCoverage / activeMonths.length : 0;

                        const cellEne = getCellClass(adv.Enero, avgCoverage, isDarkMode);
                        const cellFeb = getCellClass(adv.Febrero, avgCoverage, isDarkMode);
                        const cellMar = getCellClass(adv.Marzo, avgCoverage, isDarkMode);
                        const cellAbr = getCellClass(adv.Abril, avgCoverage, isDarkMode);
                        
                        const diffVal = adv.Abril - adv.Marzo;
                        const diffPct = adv.Marzo > 0 ? ((diffVal / adv.Marzo) * 100).toFixed(1) : "0.0";
                        const diffColor = diffVal > 0 
                          ? 'text-[#16A34A] font-extrabold' 
                          : diffVal === 0 
                            ? 'text-[#F59E0B] font-extrabold' 
                            : 'text-[#EF4444] font-extrabold';
                        
                        const trendPoints = [adv.Dic25 || 0, adv.Enero || 0, adv.Febrero || 0, adv.Marzo || 0, adv.Abril || 0];
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
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${cellEne}`}>
                                {adv.Enero}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${cellFeb}`}>
                                {adv.Febrero}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${cellMar}`}>
                                {adv.Marzo}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${cellAbr}`}>
                                {adv.Abril}
                              </span>
                            </td>
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
                        const sumDic = chartAdvisorsData.reduce((acc, curr) => acc + (curr.Dic25 || 0), 0);
                        const sumEne = chartAdvisorsData.reduce((acc, curr) => acc + (curr.Enero || 0), 0);
                        const sumFeb = chartAdvisorsData.reduce((acc, curr) => acc + (curr.Febrero || 0), 0);
                        const sumMar = chartAdvisorsData.reduce((acc, curr) => acc + (curr.Marzo || 0), 0);
                        const sumAbr = chartAdvisorsData.reduce((acc, curr) => acc + (curr.Abril || 0), 0);

                        const activeTotalMonths = [sumDic, sumEne, sumFeb, sumMar, sumAbr].filter(val => val > 0);
                        const totalEnterpriseCoverage = activeTotalMonths.reduce((sum, val) => sum + val, 0);
                        const avgEnterpriseCoverage = activeTotalMonths.length > 0 ? totalEnterpriseCoverage / activeTotalMonths.length : 0;

                        const totalEneCell = getCellClass(sumEne, avgEnterpriseCoverage, isDarkMode);
                        const totalFebCell = getCellClass(sumFeb, avgEnterpriseCoverage, isDarkMode);
                        const totalMarCell = getCellClass(sumMar, avgEnterpriseCoverage, isDarkMode);
                        const totalAbrCell = getCellClass(sumAbr, avgEnterpriseCoverage, isDarkMode);

                        const totalDiffVal = sumAbr - sumMar;
                        const totalDiffPct = sumMar > 0 ? ((totalDiffVal / sumMar) * 100).toFixed(1) : "0.0";
                        const totalDiffColor = totalDiffVal > 0 
                          ? 'text-[#16A34A] font-extrabold' 
                          : totalDiffVal === 0 
                            ? 'text-[#F59E0B] font-extrabold' 
                            : 'text-[#EF4444] font-extrabold';

                        const totalTrendPoints = [sumDic, sumEne, sumFeb, sumMar, sumAbr];
                        const totalSparkColor = totalDiffVal > 0 ? '#16A34A' : totalDiffVal === 0 ? '#F59E0B' : '#EF4444';

                        return (
                          <tr 
                            style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                            className="font-extrabold border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20"
                          >
                            <td className="py-4 px-3 font-black text-[14px] tracking-tight">TOTAL EMPRESA</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${totalEneCell}`}>
                                {formatNumberWithDots(sumEne)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${totalFebCell}`}>
                                {formatNumberWithDots(sumFeb)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${totalMarCell}`}>
                                {formatNumberWithDots(sumMar)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[12px] min-w-[48px] ${totalAbrCell}`}>
                                {formatNumberWithDots(sumAbr)}
                              </span>
                            </td>
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
                            <td className="py-3 px-3 text-center h-[40px] align-middle">
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
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider block mb-1">Clientes Únicos por Vendedor</span>
                <h3 className="text-[18px] font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">Análisis comparativo de clientes únicos atendidos sin duplicación</h3>
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
                      content={<CustomTooltip isDarkMode={isDarkMode} type="cobertura-grupal" />} 
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }} 
                    />
                    <Bar 
                      dataKey="dynamicCoverage" 
                      fill="url(#unicosGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={chartAdvisorsData.length < 5 ? 54 : 32}
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
                isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
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
                            rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-orange-650/10 text-orange-650 dark:text-orange-400 rounded px-1.5 py-0.5 font-black text-[9px]">🥉 3</span>;
                          } else {
                            rankBadge = <span className="text-gray-400 font-bold px-1.5">{idx + 1}</span>;
                          }

                          return (
                            <tr key={adv.id} className={rowClass}>
                              <td className="py-1.5 px-2">{rankBadge}</td>
                              <td className="py-1.5 px-2 font-bold text-gray-850 dark:text-gray-200">{shortName}</td>
                              <td className="py-1.5 px-2 text-center font-black text-violet-650 dark:text-violet-400">{adv.dynamicCoverage}</td>
                              <td className="py-1.5 px-2 text-right font-black text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span>{percentage}%</span>
                                  <div className="w-16 h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-950 shrink-0">
                                    <div className="h-full" style={{ width: `${percentage}%`, backgroundColor: badgeColor }} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {/* TOTAL GENERAL */}
                        <tr className="font-extrabold border-t-2 border-gray-800 text-gray-900 dark:text-white bg-gray-500/5">
                          <td className="py-2 px-1" colSpan={2}>Total General</td>
                          <td className="py-2 px-1 text-center text-violet-650 dark:text-violet-400">{chartAdvisorsData.reduce((acc, curr) => acc + curr.dynamicCoverage, 0)}</td>
                          <td className="py-2 px-2 text-right">100.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Donut Chart */}
              <section className={`p-4 rounded-2xl border transition-colors duration-300 lg:col-span-2 flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
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
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
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
                  isDarkMode ? 'bg-[#0F1115]' : 'bg-white shadow-sm'
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
                  isDarkMode ? 'bg-[#0F1115]' : 'bg-white shadow-sm'
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
                  isDarkMode ? 'bg-[#0F1115]' : 'bg-white shadow-sm'
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
                  isDarkMode ? 'bg-[#0F1115]' : 'bg-white shadow-sm'
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
                isDarkMode ? 'bg-[#0F1115] border-slate-800/80' : 'bg-white border-slate-200/60 shadow-sm'
              } border-l-4 border-l-indigo-500`}>
                <div className="flex-1 min-w-0">
                  <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[11px] font-bold tracking-[0.5px] uppercase block">
                    Promedio Inactividad
                  </span>
                  <span className="text-[25px] font-black leading-none block mt-1 text-indigo-650 dark:text-indigo-400">
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
                isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
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
                                  isDarkMode ? 'bg-[#0f1115]/95 border-gray-800 text-gray-200' : 'bg-white/95 border-gray-200/80 text-gray-800'
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
                isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
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
                            <td className="py-2 px-1 text-right font-black text-indigo-650 dark:text-indigo-400">{adv.avgInactivityDays} días</td>
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
                          <td className="py-2.5 px-1 text-right text-indigo-650 dark:text-indigo-400 font-black">{clientRecencyData.summary.avgInactivity} días</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

            </div>

            {/* Listado Detalle de Clientes según Estado de Riesgo */}
            <section className={`p-6 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: isDarkMode ? '#94A3B8' : '#475569' }} className="text-[14px] font-semibold uppercase tracking-wider block">
                      Detalle Operativo de Clientes
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      selectedRiskCategory === 'Saludable' ? 'bg-emerald-500/10 text-emerald-500' :
                      selectedRiskCategory === 'Atención' ? 'bg-amber-500/10 text-amber-500' :
                      selectedRiskCategory === 'Riesgo' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {selectedRiskCategory}
                    </span>
                  </div>
                  <h3 style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="text-[16px] font-bold uppercase tracking-tight">
                    Listado de clientes clasificados en estado {selectedRiskCategory}
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
                          ? 'bg-[#0F1115] border-gray-800 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500' 
                          : 'bg-white border-gray-200 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm'
                      }`}
                    >
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
                          ? 'bg-[#0F1115] border-gray-800 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500' 
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
                      <th className="py-3 px-4 font-black text-right" style={{ color: isDarkMode ? '#F1F5F9' : '#000000' }}>Días de Inactividad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center font-semibold" style={{ color: isDarkMode ? '#94A3B8' : '#334155' }}>
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
                          <td className="py-3 px-4 text-right font-black text-indigo-650 dark:text-indigo-400">
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
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1">Tendencia de Ventas (Millones de COP)</span>
                <h3 className="text-[18px] font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">Evolución del volumen total facturado por mes en períodos activos</h3>
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
                              isDarkMode ? 'bg-[#0f1115]/95 border-gray-800 text-gray-200' : 'bg-white/95 border-gray-200/80 text-gray-800'
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
                      barSize={50}
                    >
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

            {/* Tabla Detalle por Mes */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div>
                <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-1">Historial Mensual de Desempeño Comercial</span>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className={`border-b transition-colors font-extrabold text-[12px] uppercase tracking-wider ${
                        isDarkMode ? 'border-gray-800/60 text-table-header' : 'border-gray-200 text-table-header'
                      }`}>
                        <th className="py-2 px-1">Periodo</th>
                        <th className="py-2 px-1 text-right">Facturación</th>
                        <th className="py-2 px-2 text-right">Crecimiento %</th>
                        <th className="py-2 px-1 text-center">Clientes Atendidos</th>
                        <th className="py-2 px-1 text-center">Documentos (FE + CT)</th>
                        <th className="py-2 px-1 text-right">Ticket Promedio</th>
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
                            <td className="py-2 px-1 text-center font-bold text-gray-400">{trend.invoices} docs</td>
                            <td className="py-2 px-1 text-right font-bold text-amber-600 dark:text-amber-400">{formatMillionsCOP(ticketAvg)}</td>
                          </tr>
                        );
                      })}
                      {/* TOTAL GENERAL */}
                      <tr className="font-extrabold border-t-2 border-gray-800 text-gray-900 dark:text-white bg-gray-500/5">
                        <td className="py-2 px-1">Total General</td>
                        <td className="py-2 px-1 text-right text-indigo-600 dark:text-indigo-400">{formatMillionsCOP(salesData.totalSales)}</td>
                        <td className="py-2 px-2 text-right text-gray-500">-</td>
                        <td className="py-2 px-1 text-center text-sky-600 dark:text-sky-400">{salesData.globalUniqueClientsCount}</td>
                        <td className="py-2 px-1 text-center text-gray-400">{frequencyData.totalInvoices} docs</td>
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
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
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
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
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
                              isDarkMode ? 'bg-[#0f1115]/95 border-gray-800 text-gray-200' : 'bg-white/95 border-gray-200/80 text-gray-800'
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
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
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
                            <td className="py-2 px-1 text-right font-bold text-amber-600 dark:text-amber-400">{formatMillionsCOP(ticketAvg)}</td>
                          </tr>
                        );
                      })}
                      {/* TOTAL ACUMULADO */}
                      <tr className="font-extrabold border-t-2 border-gray-800 text-gray-900 dark:text-white bg-gray-500/5">
                        <td style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }} className="py-2 px-1 font-black">Total General</td>
                        <td className="py-2 px-1 text-right text-rose-600 dark:text-rose-400">{formatMillionsCOP(selectedAdvisorAnalysis?.salesRaw || 0)}</td>
                        <td className="py-2 px-1 text-center text-sky-600 dark:text-sky-400">{selectedAdvisorAnalysis?.coverage || 0}</td>
                        <td className="py-2 px-1 text-right text-amber-600 dark:text-amber-400">{formatMillionsCOP(selectedAdvisorAnalysis?.ticketAverage || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'comparativos' && (
          <div className="space-y-4 animate-fade-in">
            {/* Gráfico Comparativo: Ticket Promedio por Cliente */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="mb-4">
                <span className="text-[14px] font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block mb-1">Comparativo de Eficiencia (Ticket Promedio COP Millones)</span>
                <h3 className="text-[18px] font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tight">Mide la cantidad promedio facturada a cada cliente único por vendedor</h3>
              </div>

              <div className="w-full h-[460px]">
                <ResponsiveContainer width="100%" height={430}>
                  <BarChart data={salesChartData} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={0.65} />
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
                      cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.012)' }} 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={`p-4 border rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 font-sans text-xs ${
                              isDarkMode ? 'bg-[#0f1115]/95 border-gray-800 text-gray-200' : 'bg-white/95 border-gray-200/80 text-gray-800'
                            }`}>
                              <p className="font-extrabold border-b pb-1 mb-2">Vendedor: {label}</p>
                              <p className="flex justify-between gap-6"><span>Ticket Promedio:</span><span className="font-black text-cyan-500 dark:text-cyan-400">{formatMillionsCOP(payload[0].payload.ticketAverage)}</span></p>
                              <p className="flex justify-between gap-6"><span>Facturación Total:</span><span className="font-black text-emerald-600 dark:text-emerald-400">{formatMillionsCOP(payload[0].payload.salesRaw)}</span></p>
                              <p className="flex justify-between gap-6"><span>Clientes Únicos:</span><span className="font-black text-sky-600 dark:text-sky-400">{payload[0].payload.activeClients}</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="ticketAverage" 
                      fill="url(#cyanGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={salesChartData.length < 5 ? 54 : 32}
                    >
                      <LabelList 
                        dataKey="ticketAverage" 
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

            {/* Tabla Comparativa Cruzada */}
            <section className={`p-4 rounded-2xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div>
                <span className="text-[14px] font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block mb-1">Matriz Comparativa de Desempeño y Eficiencia</span>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className={`border-b transition-colors font-extrabold text-[12px] uppercase tracking-wider ${
                        isDarkMode ? 'border-gray-800/60 text-table-header' : 'border-gray-200 text-table-header'
                      }`}>
                        <th className="py-1.5 px-2">Rank</th>
                        <th className="py-1.5 px-2">Vendedor</th>
                        <th className="py-1.5 px-2 text-right">Facturación</th>
                        <th className="py-1.5 px-2 text-center">Clientes Únicos</th>
                        <th className="py-1.5 px-2 text-right">Ticket Promedio</th>
                        <th className="py-1.5 px-2 text-right font-black text-cyan-600 dark:text-cyan-400">Eficiencia (COP/cl)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.advisorsSales.map((adv, idx) => {
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
                          rankBadge = <span className="inline-flex items-center justify-center gap-1 bg-orange-650/10 text-orange-650 dark:text-orange-400 rounded px-1.5 py-0.5 font-black text-[9px]">🥉 3</span>;
                        } else {
                          rankBadge = <span className="text-gray-400 font-bold px-1.5">{idx + 1}</span>;
                        }

                        return (
                          <tr key={adv.id} className={rowClass}>
                            <td className="py-1.5 px-2">{rankBadge}</td>
                            <td className="py-1.5 px-2 font-bold text-gray-850 dark:text-gray-200">{shortName}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-emerald-500">{formatMillionsCOP(adv.salesRaw)}</td>
                            <td className="py-1.5 px-2 text-center font-bold text-sky-500">{adv.activeClients}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-amber-500">{formatMillionsCOP(adv.ticketAverage)}</td>
                            <td className="py-1.5 px-2 text-right font-black text-cyan-500">{formatMillionsCOP(adv.ticketAverage)}</td>
                          </tr>
                        );
                      })}
                      {/* TOTAL GENERAL */}
                      <tr className="font-extrabold border-t-2 border-gray-800 text-gray-900 dark:text-white bg-gray-500/5">
                        <td className="py-1.5 px-2" colSpan={2}>Total General</td>
                        <td className="py-1.5 px-2 text-right text-emerald-500">{formatMillionsCOP(salesData.totalSales)}</td>
                        <td className="py-1.5 px-2 text-center text-sky-500">{salesData.globalUniqueClientsCount}</td>
                        <td className="py-1.5 px-2 text-right text-amber-500">{formatMillionsCOP(salesData.globalTicketAverage)}</td>
                        <td className="py-1.5 px-2 text-right text-cyan-500 font-black">{formatMillionsCOP(salesData.globalTicketAverage)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

          </>
        )}

      </main>

      {/* 3. PANEL DERECHO DE FILTROS (10.5% DE ANCHO - FIJO Y COLAPSABLE) */}
      <aside className={`fixed right-0 top-0 h-screen border-l transition-all duration-300 flex flex-col justify-between p-2.5 z-40 ${
        isFiltersCollapsed ? 'w-[40px]' : 'w-[10.5%]'
      } ${
        isDarkMode ? 'bg-[#0c0e12] border-gray-800/80' : 'bg-white border-gray-200/80 shadow-sm'
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
              {/* Filtro de Períodos */}
              <div className="shrink-0">
                <label 
                  style={{ color: isDarkMode ? '#CBD5E1' : '#000000' }}
                  className="text-[12px] font-extrabold uppercase tracking-wider block mb-2"
                >
                  Periodos
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {MESES_CONFIG.map(m => {
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
              ? 'bg-[#111318] border-gray-800 shadow-blue-900/10' 
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
                        ? 'bg-[#0F1115] border-gray-800 text-gray-100 placeholder-gray-600 focus:border-amber-500/60' 
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
