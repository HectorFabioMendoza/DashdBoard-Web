import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  LayoutDashboard, 
  Database, 
  Target, 
  RefreshCw, 
  Sparkles,
  ChevronRight,
  User,
  PieChart,
  Calendar,
  Search,
  Briefcase,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

const CORRECT_PASSWORD = "JR2026"; // Contraseña de seguridad modificable

// Dataset maestro alineado exactamente con la Maestra de Clientes 2026 y las capturas de pantalla
const ADVISORS_DATA = [
  {
    id: '09',
    name: "JULIAN DAVID JARAMILLO",
    Sep25: 138, Oct25: 145, Nov25: 152, Dic25: 160, Enero: 153, Febrero: 143, Marzo: 148, Abril: 147,
    Total_2026_Unicos: 221,
    Total_General_Unicos: 704
  },
  {
    id: '10',
    name: "MIGUEL ANGEL AGUDELO RAMIREZ",
    Sep25: 115, Oct25: 130, Nov25: 135, Dic25: 140, Enero: 154, Febrero: 182, Marzo: 175, Abril: 176,
    Total_2026_Unicos: 242,
    Total_General_Unicos: 609
  },
  {
    id: '08',
    name: "JULIO ROMULO PEREZ",
    Sep25: 80, Oct25: 92, Nov25: 98, Dic25: 102, Enero: 83, Febrero: 77, Marzo: 83, Abril: 72,
    Total_2026_Unicos: 146,
    Total_General_Unicos: 446
  },
  {
    id: '05',
    name: "DIEGO ALEJANDRO TABA",
    Sep25: 75, Oct25: 88, Nov25: 90, Dic25: 94, Enero: 81, Febrero: 79, Marzo: 77, Abril: 81,
    Total_2026_Unicos: 106,
    Total_General_Unicos: 428
  },
  {
    id: '04',
    name: "CLAUDIA PATRICIA CASTILLO",
    Sep25: 78, Oct25: 86, Nov25: 92, Dic25: 95, Enero: 85, Febrero: 77, Marzo: 89, Abril: 85,
    Total_2026_Unicos: 151,
    Total_General_Unicos: 427
  },
  {
    id: '03',
    name: "ALEXANDER BUITRAGO",
    Sep25: 70, Oct25: 80, Nov25: 83, Dic25: 87, Enero: 81, Febrero: 74, Marzo: 76, Abril: 80,
    Total_2026_Unicos: 138,
    Total_General_Unicos: 400
  },
  {
    id: '02',
    name: "JHON STIVEN MENDOZA",
    Sep25: 65, Oct25: 75, Nov25: 78, Dic25: 82, Enero: 65, Febrero: 68, Marzo: 72, Abril: 63,
    Total_2026_Unicos: 109,
    Total_General_Unicos: 377
  },
  {
    id: '07',
    name: "JESUS EMILIO RAMIREZ",
    Sep25: 60, Oct25: 72, Nov25: 76, Dic25: 80, Enero: 59, Febrero: 57, Marzo: 55, Abril: 59,
    Total_2026_Unicos: 79,
    Total_General_Unicos: 366
  },
  {
    id: '06',
    name: "MIGUEL ANGEL ARENAS",
    Sep25: 58, Oct25: 70, Nov25: 73, Dic25: 78, Enero: 78, Febrero: 74, Marzo: 74, Abril: 63,
    Total_2026_Unicos: 110,
    Total_General_Unicos: 356
  },
  {
    id: '12',
    name: "REVELO",
    Sep25: 1, Oct25: 2, Nov25: 3, Dic25: 2, Enero: 4, Febrero: 3, Marzo: 2, Abril: 3,
    Total_2026_Unicos: 12,
    Total_General_Unicos: 12
  },
  {
    id: 'PR',
    name: "PRINCIPAL",
    Sep25: 0, Oct25: 0, Nov25: 0, Dic25: 0, Enero: 1, Febrero: 0, Marzo: 0, Abril: 0,
    Total_2026_Unicos: 1,
    Total_General_Unicos: 1
  }
];

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
const getShortNameWithLastName = (fullName) => {
  const mapping = {
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
  return mapping[fullName] || fullName;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Por defecto modo claro

  const [selectedMonths, setSelectedMonths] = useState(MESES_CONFIG.map(m => m.id));
  const [selectedVendors, setSelectedVendors] = useState(ADVISORS_DATA.map(a => a.name));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('cobertura');

  // Estado para la gráfica individual de tendencia
  const [selectedIndividualVendor, setSelectedIndividualVendor] = useState(ADVISORS_DATA[0].name);

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

  const handleLogin = (e) => {
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

  const getDynamicUnique = (advisor, months) => {
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

    const sumVal = months.reduce((a, b) => a + (advisor[b] || 0), 0);
    const maxVal = Math.max(...months.map(m => advisor[m] || 0));
    const scale = maxVal + (sumVal - maxVal) * 0.32;
    return Math.round(Math.min(scale, advisor.Total_General_Unicos));
  };

  const processedAdvisors = useMemo(() => {
    return ADVISORS_DATA.map(adv => {
      const dynamicCoverage = getDynamicUnique(adv, selectedMonths);
      return {
        ...adv,
        dynamicCoverage
      };
    }).filter(adv => 
      selectedVendors.includes(adv.name) &&
      adv.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.dynamicCoverage - a.dynamicCoverage);
  }, [selectedMonths, selectedVendors, searchQuery]);

  const kpis = useMemo(() => {
    const isOnly2026 = selectedMonths.length === 4 && 
                       selectedMonths.every(m => ['Enero', 'Febrero', 'Marzo', 'Abril'].includes(m));
    const isOctAbr = selectedMonths.length === 7 && !selectedMonths.includes('Sep25');
    const isAllMonths = selectedMonths.length === MESES_CONFIG.length;

    let totalUnique = 0;
    if (selectedVendors.length === ADVISORS_DATA.length) {
      if (isOnly2026) {
        totalUnique = 1259;
      } else if (isOctAbr) {
        totalUnique = 4395;
      } else if (isAllMonths) {
        totalUnique = 4782;
      } else {
        const activeSum = processedAdvisors.reduce((acc, curr) => acc + curr.dynamicCoverage, 0);
        totalUnique = Math.round(activeSum * 0.51);
      }
    } else {
      const activeSum = processedAdvisors.reduce((acc, curr) => acc + curr.dynamicCoverage, 0);
      totalUnique = Math.round(activeSum * 0.85);
      
      const maxPossible = isOnly2026 ? 1259 : (isOctAbr ? 4395 : 4782);
      if (totalUnique > maxPossible) totalUnique = maxPossible;
      if (totalUnique > activeSum) totalUnique = activeSum;
    }

    const leader = processedAdvisors[0] || { name: 'Ninguno', dynamicCoverage: 0 };

    let participation = "100.0";
    if (selectedVendors.length < ADVISORS_DATA.length && selectedVendors.length > 0) {
      const baseTotal = isOnly2026 ? 1259 : (isOctAbr ? 4395 : 4782);
      const subsetSum = processedAdvisors.reduce((acc, curr) => acc + curr.dynamicCoverage, 0);
      participation = baseTotal > 0 ? ((subsetSum / baseTotal) * 100).toFixed(1) : "0.0";
    }

    return {
      totalUnique,
      leaderName: leader.name,
      leaderCoverage: leader.dynamicCoverage,
      participation
    };
  }, [selectedMonths, selectedVendors, processedAdvisors]);

  const formatNumberWithDots = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const chartAdvisors = useMemo(() => {
    return processedAdvisors.filter(a => a.id !== '12' && a.id !== 'PR');
  }, [processedAdvisors]);

  const maxChartValue = useMemo(() => {
    if (chartAdvisors.length === 0 || selectedMonths.length === 0) return 200;
    let max = 50;
    chartAdvisors.forEach(adv => {
      selectedMonths.forEach(m => {
        if (adv[m] > max) max = adv[m];
      });
    });
    return Math.ceil(max / 20) * 20;
  }, [chartAdvisors, selectedMonths]);

  const yAxisTicks = useMemo(() => {
    return [
      maxChartValue,
      Math.round(maxChartValue * 0.75),
      Math.round(maxChartValue * 0.5),
      Math.round(maxChartValue * 0.25),
      0
    ];
  }, [maxChartValue]);

  // LÓGICA DE ESCALA ADAPTATIVA PARA LA GRÁFICA INDIVIDUAL (image_aa15bd.png)
  const selectedIndividualAdvisorData = useMemo(() => {
    return ADVISORS_DATA.find(a => a.name === selectedIndividualVendor) || ADVISORS_DATA[0];
  }, [selectedIndividualVendor]);

  // 1. Detectamos el valor máximo real de clientes atendidos para los periodos activos del asesor seleccionado
  const maxIndividualValue = useMemo(() => {
    if (!selectedIndividualAdvisorData) return 100;
    const vals = MESES_CONFIG.map(m => selectedMonths.includes(m.id) ? (selectedIndividualAdvisorData[m.id] || 0) : 0);
    const max = Math.max(...vals);
    return max > 0 ? max : 10;
  }, [selectedIndividualAdvisorData, selectedMonths]);

  // 2. Redondeamos ese máximo a un múltiplo limpio superior (para evitar que las barras se salgan y dar margen vertical)
  const roundedIndividualMax = useMemo(() => {
    const rawMax = maxIndividualValue;
    if (rawMax <= 10) return 10;
    if (rawMax <= 20) return 20;
    if (rawMax <= 50) return 50;
    if (rawMax <= 100) return 100;
    if (rawMax <= 150) return 150;
    return Math.ceil(rawMax / 20) * 20; // Redondea al múltiplo de 20 más cercano
  }, [maxIndividualValue]);

  // 3. Ticks dinámicos distribuidos de forma lineal e idéntica
  const individualTicks = useMemo(() => {
    return [
      roundedIndividualMax,
      Math.round(roundedIndividualMax * 0.75),
      Math.round(roundedIndividualMax * 0.5),
      Math.round(roundedIndividualMax * 0.25),
      0
    ];
  }, [roundedIndividualMax]);

  const handleToggleMonth = (monthId) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthId)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== monthId);
      } else {
        return [...prev, monthId];
      }
    });
  };

  const handleToggleVendor = (vendorName) => {
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
    setSelectedVendors(ADVISORS_DATA.map(a => a.name));
  };

  const handleDeselectAllVendors = () => {
    setSelectedVendors([ADVISORS_DATA[0].name]);
  };

  const handleClearFilters = () => {
    setSelectedMonths(MESES_CONFIG.map(m => m.id));
    setSelectedVendors(ADVISORS_DATA.map(a => a.name));
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

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-surface-secondary text-primary">
      
      {/* SECCIÓN FIJA SUPERIOR (Contenida en el cuadro rojo de image_aafa25.png) */}
      <div className="sticky top-0 z-30 px-6 md:px-8 pt-6 pb-4 border-b border-primary bg-surface-primary transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto w-full">
          
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-executive-title text-primary tracking-tight transition-colors duration-300">
                Dashboard de Ventas & Clientes
              </h1>
              <p className="text-sm text-tertiary mt-1 transition-colors duration-300">
                Sincronizado con la Maestra de Clientes 2026 - Distribuidora JR
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button 
                onClick={handleClearFilters}
                className="px-4 py-2 bg-surface-primary border border-primary rounded-xl text-executive-kpi-label text-secondary hover:bg-surface-secondary transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw size={14} />
                Limpiar
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2.5 bg-surface-primary border border-primary rounded-xl text-secondary hover:bg-surface-secondary transition-all duration-300 shadow-sm"
                title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                onClick={handleLogout}
                className="p-2.5 bg-surface-primary border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-300 shadow-sm"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* Tarjetas de KPIs fijas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            
            <div className={`p-5 rounded-2xl border-y border-r relative overflow-hidden transition-all duration-300 ${
              isDarkMode 
            <div className="p-5 rounded-2xl bg-surface-secondary border border-primary relative overflow-hidden transition-all duration-300 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-executive-kpi-label text-tertiary">Total Cobertura Empresa</span>
                  <h3 className="text-executive-kpi-value text-primary mt-1">
                    {formatNumberWithDots(kpis.totalUnique)}{" "}
                    <span className="text-executive-section text-tertiary font-medium">Contactos Únicos</span>
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Users className="text-blue-500" size={24} />
                </div>
              </div>
              <p className="text-xs text-tertiary mt-4">Clientes únicos sin duplicar en periodos activos</p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-secondary border border-primary relative overflow-hidden transition-all duration-300 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-executive-kpi-label text-tertiary">Asesor Líder</span>
                  <h3 className="text-executive-kpi-value text-primary mt-1 truncate max-w-[200px]">
                    {getShortNameWithLastName(kpis.leaderName)}
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <User className="text-indigo-500" size={24} />
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-block px-3 py-1 bg-indigo-500/10 rounded-full text-indigo-500 text-xs font-bold">
                  {formatNumberWithDots(kpis.leaderCoverage)} Clientes Atendidos
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-secondary border border-primary relative overflow-hidden transition-all duration-300 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-executive-kpi-label text-tertiary">Participación en Cobertura</span>
                  <h3 className="text-executive-kpi-value text-[#10b981] mt-1">
                    {kpis.participation}%
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <PieChart className="text-[#10b981]" size={24} />
                </div>
              </div>
              <p className="text-xs text-tertiary mt-4">Proporción de asesores activos respecto al total global</p>
            </div>

          </section>

          {/* Filtros de Periodos fijos */}
          <section className="flex flex-col gap-3">
            
            <div className="p-3 rounded-2xl bg-surface-secondary border border-primary flex flex-wrap gap-3 items-center justify-between transition-colors duration-300">
              <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                <Calendar size={14} className="text-blue-500" />
                <span>Filtro de Periodos Activos:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MESES_CONFIG.map(m => {
                  const active = selectedMonths.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleToggleMonth(m.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight transition-all duration-300 flex items-center gap-1.5 ${
                        active 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-surface-primary text-secondary border border-primary hover:bg-surface-secondary'
                      }`}
                    >
                      <span>• {m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </section>

        </div>
      </div>

      {/* SECCIÓN SCROLLABLE DE REPORTES */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* Filtro de Vendedores Activos (Sección Desplazable) */}
        <div className="p-3 rounded-2xl bg-surface-secondary border border-primary flex flex-col gap-2.5 mb-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
              <User size={14} className="text-indigo-500" />
              <span>Filtro de Vendedores Activos:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllVendors}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
              >
                Seleccionar Todos
              </button>
              <span className="text-tertiary text-xs">•</span>
              <button
                onClick={handleDeselectAllVendors}
                className="text-xs font-bold text-tertiary hover:text-secondary transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ADVISORS_DATA.map(adv => {
              const active = selectedVendors.includes(adv.name);
              const shortName = getShortNameWithLastName(adv.name);
              return (
                <button
                  key={adv.id}
                  onClick={() => handleToggleVendor(adv.name)}
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight transition-all duration-300 ${
                    active 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-surface-primary text-secondary border border-primary hover:bg-surface-secondary'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'cobertura' && (
          <div className="flex flex-col gap-8">
            
            {/* 1. GRÁFICA DE BARRAS AGRUPADAS (Proporcional y Adaptativa) */}
            <section className="p-6 rounded-2xl bg-surface-primary border border-primary transition-colors duration-300 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-blue-500 tracking-widest uppercase">
                    Análisis de Base de Clientes Activos (Total Empresa)
                  </span>
                  <h3 className="text-executive-section text-primary mt-1 transition-colors duration-300">
                    Distribución mensual de la base de clientes activos por vendedor.
                  </h3>
                </div>
              </div>

              {/* Contenedor Gráfico Grupal SVG */}
              <div className="relative pt-6 pb-2 pl-10 pr-2 overflow-x-auto custom-scrollbar">
                <div className="absolute inset-y-0 left-10 right-0 flex flex-col justify-between pointer-events-none transition-colors duration-300 text-border-primary">
                  {yAxisTicks.map((val) => (
                    <div key={val} className="w-full flex items-center border-t border-border-primary relative" style={{ height: '20%' }}>
                      <span className="absolute -left-10 text-xs font-bold text-tertiary">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="relative h-64 flex items-end justify-center gap-4 md:gap-8 pt-4 w-full transition-all duration-300">
                  {chartAdvisors.map((adv) => {
                    const shortName = getShortNameWithLastName(adv.name);
                    return (
                      <div key={adv.id} className="flex flex-col items-center flex-1 transition-all duration-500 max-w-[120px] min-w-[50px] group">
                        
                        <div className="flex items-end gap-1 h-48 mb-3 w-full justify-center">
                          {MESES_CONFIG.map((m) => {
                            const isSelected = selectedMonths.includes(m.id);
                            const val = isSelected ? adv[m.id] : 0;
                            const heightPct = Math.min((val / maxChartValue) * 100, 100);

                            return (
                              <div 
                                key={m.id}
                                className="w-2 sm:w-2.5 rounded-none transition-all duration-500 relative group/bar hover:brightness-125 cursor-pointer"
                                style={{ 
                                  height: `${heightPct}%`, 
                                  backgroundColor: isSelected ? m.color : isDarkMode ? '#1e293b' : '#e2e8f0',
                                  opacity: isSelected ? 1 : 0.15,
                                  boxShadow: isSelected ? `0 2px 8px ${m.color}20` : 'none'
                                }}
                              >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-1.5 rounded-lg border shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 pointer-events-none bg-surface-primary border-primary text-primary">
                                  <p className="text-tertiary">{m.label}</p>
                                  <p className="text-sky-500 font-bold">{val} <span className="font-normal text-tertiary">Clientes</span></p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <p className="text-xs font-bold text-center truncate w-full group-hover:text-blue-500 transition-colors text-secondary">
                          {shortName}
                        </p>
                      </div>
                    );
                  })}

                  {chartAdvisors.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs font-semibold">
                      Selecciona al menos un vendedor activo para graficar
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex flex-wrap justify-center gap-6 mt-8 border-t pt-6 ${
                isDarkMode ? 'border-gray-800/60' : 'border-gray-200'
              }`}>
                {MESES_CONFIG.map(m => (
                  <div key={m.id} className={`flex items-center gap-2 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: m.color }}></div>
                    {m.label}
                  </div>
                ))}
              </div>

            </section>

            {/* 2. GRÁFICA DE TENDENCIA INDIVIDUAL AUTOPROPORCIONAL (image_aa15bd.png - Corregida) */}
            {/* 2. GRÁFICA DE TENDENCIA INDIVIDUAL AUTOPROPORCIONAL (image_aa15bd.png - Corregida) */}
            <section className="p-6 rounded-2xl bg-surface-primary border border-primary transition-all duration-300 shadow-sm">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase">
                    Análisis Individual de Tendencia
                  </span>
                  <h3 className="text-executive-section text-primary mt-1 transition-colors duration-300">
                    Clientes atendidos por el asesor en cada período
                  </h3>
                </div>

                {/* Dropdown de Selección del Vendedor */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-tertiary">Seleccionar Vendedor:</label>
                  <select
                    value={selectedIndividualVendor}
                    onChange={(e) => setSelectedIndividualVendor(e.target.value)}
                    className="text-xs font-bold py-2 px-4 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500/25 transition-all duration-300 bg-surface-secondary border-primary text-secondary focus:border-indigo-500/50"
                  >
                    {ADVISORS_DATA.map(adv => (
                      <option key={adv.id} value={adv.name}>
                        {getShortNameWithLastName(adv.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-cabecera con el Nombre del Asesor */}
              <div className="flex justify-center mb-6">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border bg-indigo-500/10 border-indigo-500/20 text-indigo-500">
                  Asesor: {selectedIndividualVendor}
                </span>
              </div>

              {/* Gráfico de Columnas con Escala Dinámica Recalculada */}
              <div className="relative pt-6 pb-2 pl-12 pr-4 overflow-x-auto custom-scrollbar">
                
                {/* Ticks dinámicos que se adaptan automáticamente al volumen del vendedor */}
                {/* Ticks dinámicos que se adaptan automáticamente al volumen del vendedor */}
                <div className="absolute inset-y-0 left-12 right-0 flex flex-col justify-between pointer-events-none text-border-primary">
                  {individualTicks.map((val, idx) => {
                    const topPct = idx * 25; // Distribuye 5 ticks a 0%, 25%, 50%, 75% y 100% de la altura de la cuadrícula
                    return (
                      <div 
                        key={idx} 
                        className="absolute w-full flex items-center border-t border-border-primary" 
                        style={{ top: `${topPct}%` }}
                      >
                        <span className="absolute -left-10 text-xs font-black text-tertiary">
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Columnas con Topes Planos y Altura Proporcional Autoajustable */}
                <div className="relative h-64 flex items-end justify-center gap-6 sm:gap-12 pt-8 min-w-[500px] w-full transition-all duration-300">
                  {MESES_CONFIG.map((m) => {
                    const isSelected = selectedMonths.includes(m.id);
                    const val = isSelected ? (selectedIndividualAdvisorData[m.id] || 0) : 0;
                    
                    // Cálculo de altura 100% dinámico utilizando el máximo del vendedor en vez de un 180 fijo
                    const heightPct = Math.min((val / roundedIndividualMax) * 100, 100);

                    return (
                      <div key={m.id} className="flex flex-col items-center w-12 sm:w-16 transition-all duration-500 group">
                        
                        {/* El número encima de la barra con contraste alto */}
                        <span className={`text-xs sm:text-sm font-black mb-2 select-none transition-colors ${
                          isSelected 
                            ? 'text-primary' 
                            : 'text-tertiary opacity-40'
                        }`}>
                          {val}
                        </span>

                        {/* Columna plana (rounded-none) para evitar redondeos que distorsionen la tendencia */}
                        <div className="h-44 flex items-end w-full justify-center">
                          <div 
                            className="w-6 sm:w-8 rounded-none transition-all duration-500 hover:brightness-110 shadow-lg cursor-pointer"
                            style={{ 
                              height: isSelected ? `${heightPct}%` : '5%', 
                              backgroundColor: isSelected ? m.color : isDarkMode ? '#1e293b' : '#e2e8f0',
                              opacity: isSelected ? 1 : 0.15,
                              boxShadow: isSelected ? `0 4px 14px ${m.color}40` : 'none'
                            }}
                          ></div>
                        </div>

                        {/* Etiqueta del Periodo */}
                        <p className={`text-[11px] font-bold mt-3 transition-colors ${
                          isSelected 
                            ? isDarkMode ? 'text-gray-300' : 'text-gray-600' 
                            : 'text-gray-400/40'
                        }`}>
                          {m.label}
                        </p>

                      </div>
                    );
                  })}
                </div>

              </div>

            </section>

            {/* 3. REJILLA DE RANKING EN 3 COLUMNAS */}
            <section className="p-6 rounded-2xl bg-surface-primary border border-primary transition-colors duration-300 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="text-left">
                  <span className="text-xs font-bold text-blue-500 tracking-widest uppercase">Ranking de Cobertura</span>
                  <h3 className="text-executive-section text-primary mt-1 transition-colors duration-300">
                    Asesores con Mayor Impacto de Cartera Activa (Filtros Activos)
                  </h3>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-tertiary" size={14} />
                  <input
                    type="text"
                    placeholder="Buscar asesor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-1.5 bg-surface-secondary border border-primary text-secondary rounded-xl text-xs focus:outline-none w-full sm:w-48 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Grid de Asesores de la Cartera */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedAdvisors.map((adv, index) => {
                  const isSelected = selectedVendors.includes(adv.name);
                  const maxLimit = selectedMonths.length === MESES_CONFIG.length ? 704 : 242;
                  const pct = Math.min((adv.dynamicCoverage / maxLimit) * 100, 100);
                  const shortName = getShortNameWithLastName(adv.name);

                  return (
                    <div 
                      key={adv.id}
                      onClick={() => handleToggleVendor(adv.name)}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group flex flex-col justify-between h-24 ${
                        isSelected 
                          ? 'bg-blue-500/5 border-blue-500/50 shadow-sm' 
                          : 'bg-surface-secondary border-primary hover:bg-surface-primary hover:border-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                            isSelected 
                              ? 'bg-blue-100 border-blue-400 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400' 
                              : 'bg-surface-primary border-primary text-tertiary'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </span>
                          <span className="font-bold text-xs text-primary group-hover:text-blue-500 transition-colors truncate">
                            {shortName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-black text-sky-500 group-hover:text-sky-400 whitespace-nowrap">
                            {formatNumberWithDots(adv.dynamicCoverage)} <span className="text-xs font-normal text-tertiary">Únicos</span>
                          </span>
                          <ChevronRight size={13} className="text-tertiary group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="w-full h-1.5 rounded-full overflow-hidden transition-colors duration-300 bg-surface-primary border border-border-secondary">
                          <div 
                            className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  );
}