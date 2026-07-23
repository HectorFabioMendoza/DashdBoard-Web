import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Package, 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Sun, 
  Moon, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown,
  Filter,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Box,
  ShoppingBag,
  ListFilter,
  Tag,
  Eye,
  EyeOff
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
  Cell
} from 'recharts';

// Meses transcurridos a la fecha (Julio 2026)
interface MesConfig {
  id: string;
  label: string;
  year: number;
}

const MESES_CONFIG: MesConfig[] = [
  { id: 'Sep25', label: 'Sep', year: 2025 },
  { id: 'Oct25', label: 'Oct', year: 2025 },
  { id: 'Nov25', label: 'Nov', year: 2025 },
  { id: 'Dic25', label: 'Dic', year: 2025 },
  { id: 'Enero', label: 'Ene', year: 2026 },
  { id: 'Febrero', label: 'Feb', year: 2026 },
  { id: 'Marzo', label: 'Mar', year: 2026 },
  { id: 'Abril', label: 'Abr', year: 2026 },
  { id: 'Mayo', label: 'May', year: 2026 },
  { id: 'Junio', label: 'Jun', year: 2026 },
  { id: 'Julio', label: 'Jul', year: 2026 },
];

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
    if (month >= 0 && month <= 6) { // Solo hasta Julio 2026
      return months2026[month];
    }
  }
  return null;
};

interface ItemInventario {
  cod_item: string;
  referencia: string;
  articulo: string;
  linea: string; // Representa el Grupo de Producto
  unimed: string;
  stock_actual: number;
  stock_min: number;
  stock_max: number;
}

interface VentaLinea {
  ref: string;
  articulo: string;
  code01: string;
  fecha: number;
  cant: number;
  valor: number;
  total1: number;
}

const formatNumber = (val: number) => {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 1
  }).format(val);
};

export default function App() {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [ventas, setVentas] = useState<VentaLinea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Tema claro por defecto
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Periodos seleccionados por defecto (Mayo, Junio, Julio 2026)
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['Mayo', 'Junio', 'Julio']);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('TODAS');
  
  // UX Invertida de Grupos: deselectedGrupos contiene los grupos deseleccionados/ocultados
  const [deselectedGrupos, setDeselectedGrupos] = useState<string[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS LOS PRODUCTOS');

  // Ordenamiento (por defecto 'rankingPrioridad' ascendente, es decir #1, #2, #3...)
  const [sortField, setSortField] = useState<string>('rankingPrioridad');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Paginación ajustada a 25 filas por defecto con scroll interno
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);


  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      try {
        const resLast = await fetch('./last_update.json?t=' + Date.now());
        if (resLast.ok) {
          const dataLast = await resLast.json();
          setLastUpdate(dataLast.last_update || '');
        }
      } catch (e) {
        console.log("No se pudo cargar last_update.json", e);
      }

      const resInv = await fetch('./Inventario.xlsx?t=' + Date.now());
      if (!resInv.ok) throw new Error("No se pudo obtener el archivo Inventario.xlsx");
      const abInv = await resInv.arrayBuffer();
      const wbInv = XLSX.read(abInv, { type: 'array' });
      const wsInv = wbInv.Sheets[wbInv.SheetNames[0]];
      const jsonInv: any[] = XLSX.utils.sheet_to_json(wsInv);

      let jsonVtas: VentaLinea[] = [];
      try {
        const resVtas = await fetch('./Ventas por linea.xlsx?t=' + Date.now());
        if (resVtas.ok) {
          const abVtas = await resVtas.arrayBuffer();
          const wbVtas = XLSX.read(abVtas, { type: 'array' });
          const wsVtas = wbVtas.Sheets[wbVtas.SheetNames[0]];
          jsonVtas = XLSX.utils.sheet_to_json(wsVtas);
          setVentas(jsonVtas);
        }
      } catch (e) {
        console.warn("No se cargaron ventas por línea:", e);
      }

      const itemsProcesados: ItemInventario[] = jsonInv.map((row: any) => ({
        cod_item: String(row.cod_item || ''),
        referencia: String(row.referencia || row.cod_item || ''),
        articulo: String(row.articulo || ''),
        linea: String(row.linea || row.code01 || 'GENERAL'),
        unimed: String(row.unimed || 'UND'),
        stock_actual: Number(row.stock_actual || 0),
        stock_min: Number(row.stock_min || 0),
        stock_max: Number(row.stock_max || 0),
      }));

      setInventario(itemsProcesados);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const toggleMonth = (monthId: string) => {
    if (selectedMonths.includes(monthId)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter(m => m !== monthId));
      }
    } else {
      setSelectedMonths([...selectedMonths, monthId]);
    }
  };

  // UX Invertida: Hacer clic en un grupo lo DESELECCIONA / DESACTIVA (lo oculta)
  const toggleGrupo = (grupo: string) => {
    if (deselectedGrupos.includes(grupo)) {
      // Re-activar el grupo
      setDeselectedGrupos(deselectedGrupos.filter(g => g !== grupo));
    } else {
      // Deseleccionar / Excluir el grupo del filtro
      setDeselectedGrupos([...deselectedGrupos, grupo]);
    }
    setCurrentPage(1);
  };

  // Activar todos los grupos (limpiar exclusiones)
  const toggleAllGrupos = () => {
    setDeselectedGrupos([]);
    setSelectedGrupo('TODAS');
    setCurrentPage(1);
  };

  // Ventas por producto en los meses seleccionados
  const vtasPorProducto = useMemo(() => {
    const mapV: Record<string, number> = {};
    if (selectedMonths.length === 0) return mapV;

    ventas.forEach(v => {
      const monthId = getMonthIdFromSerial(Number(v.fecha));
      if (monthId && selectedMonths.includes(monthId)) {
        const ref = String(v.ref || '').trim();
        const cant = Number(v.cant || 0);
        if (ref) {
          mapV[ref] = (mapV[ref] || 0) + cant;
        }
      }
    });
    return mapV;
  }, [ventas, selectedMonths]);

  // Evaluación de Agotados y Cálculo de Ranking de Prioridad (#1, #2, #3...)
  const itemsEnriquecidos = useMemo(() => {
    const numMeses = Math.max(selectedMonths.length, 1);

    const baseItems = inventario.map(item => {
      const totalVtas = vtasPorProducto[item.cod_item] || vtasPorProducto[item.referencia] || 0;
      const vtasPromedioMes = totalVtas / numMeses;
      
      const vtasDiarias = vtasPromedioMes / 30;
      const diasExist = vtasDiarias > 0 ? Math.round(item.stock_actual / vtasDiarias) : (item.stock_actual > 0 ? 999 : 0);

      // Prioridad score = Ventas Promedio Mes / (Stock Actual + 1)
      const prioridad = vtasPromedioMes / (item.stock_actual + 1);

      let estado: 'AGOTADO' | 'CRÍTICO' | 'ATENCIÓN' | 'SALUDABLE' | 'SIN ROTACIÓN' = 'SALUDABLE';
      
      if (item.stock_actual <= 0) {
        if (vtasPromedioMes > 0) {
          estado = 'AGOTADO';
        } else {
          estado = 'SIN ROTACIÓN';
        }
      } else if (diasExist < 15 || item.stock_actual <= item.stock_min) {
        estado = 'CRÍTICO';
      } else if (diasExist < 30 || item.stock_actual <= item.stock_min * 1.3) {
        estado = 'ATENCIÓN';
      }

      return {
        ...item,
        vtasPromedioMes,
        diasExist,
        prioridad,
        estado
      };
    });

    // Calcular Ranking de Prioridad (#1 = la de mayor prioridad de reabastecimiento)
    const sortedByPriority = [...baseItems].sort((a, b) => b.prioridad - a.prioridad);
    const rankingMap: Record<string, number> = {};
    sortedByPriority.forEach((item, index) => {
      rankingMap[item.cod_item] = index + 1;
    });

    return baseItems.map(item => ({
      ...item,
      rankingPrioridad: rankingMap[item.cod_item] || 999
    }));
  }, [inventario, vtasPorProducto, selectedMonths]);

  // Lista de Grupos únicos
  const gruposDisponibles = useMemo(() => {
    const setG = new Set<string>();
    inventario.forEach(i => {
      if (i.linea) setG.add(i.linea);
    });
    return Array.from(setG).sort();
  }, [inventario]);

  // KPIs Bento Grid
  const kpis = useMemo(() => {
    let agotados = 0;
    let critico = 0;
    let atencion = 0;
    let totalDiasExist = 0;
    let itemsConDias = 0;

    itemsEnriquecidos.forEach(i => {
      if (i.estado === 'AGOTADO') agotados++;
      else if (i.estado === 'CRÍTICO') critico++;
      else if (i.estado === 'ATENCIÓN') atencion++;

      if (i.diasExist > 0 && i.diasExist < 999) {
        totalDiasExist += i.diasExist;
        itemsConDias++;
      }
    });

    const coberturaPromedio = itemsConDias > 0 ? Math.round(totalDiasExist / itemsConDias) : 0;

    return { agotados, critico, atencion, coberturaPromedio };
  }, [itemsEnriquecidos]);

  // Filtros y Ordenamiento (UX Invertida: Excluir los grupos en deselectedGrupos)
  const itemsFiltrados = useMemo(() => {
    return itemsEnriquecidos.filter(item => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const mCod = item.cod_item.toLowerCase().includes(term);
        const mRef = item.referencia.toLowerCase().includes(term);
        const mArt = item.articulo.toLowerCase().includes(term);
        if (!mCod && !mRef && !mArt) return false;
      }

      // UX Invertida: Excluir grupos deseleccionados
      if (deselectedGrupos.length > 0 && deselectedGrupos.includes(item.linea)) {
        return false;
      }

      // Dropdown de grupo individual si está seleccionado
      if (selectedGrupo !== 'TODAS' && item.linea !== selectedGrupo) {
        return false;
      }

      if (selectedEstado !== 'TODOS LOS PRODUCTOS') {
        if (item.estado !== selectedEstado) return false;
      } else {
        if (item.estado === 'SIN ROTACIÓN') return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [itemsEnriquecidos, searchTerm, selectedGrupo, deselectedGrupos, selectedEstado, sortField, sortAsc]);

  // Paginación
  const totalPages = Math.ceil(itemsFiltrados.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return itemsFiltrados.slice(start, start + pageSize);
  }, [itemsFiltrados, currentPage, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // Para rankingPrioridad, por defecto ordenar 1, 2, 3... (ascendente)
      setSortAsc(field === 'rankingPrioridad' ? true : false);
    }
  };

  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setSelectedGrupo('TODAS');
    setDeselectedGrupos([]);
    setSelectedEstado('TODOS LOS PRODUCTOS');
    setSelectedMonths(['Mayo', 'Junio', 'Julio']);
    setSortField('rankingPrioridad');
    setSortAsc(true);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const dataToExport = itemsFiltrados.map(i => ({
      "Ranking Prioridad": `#${i.rankingPrioridad}`,
      "Referencia": i.referencia,
      "Descripción": i.articulo,
      "Grupo de Producto": i.linea,
      "Ventas Prom. Mes": Number(i.vtasPromedioMes.toFixed(1)),
      "U.M.": i.unimed,
      "Stock Actual": i.stock_actual,
      "Días Exist.": i.diasExist,
      "Estado": i.estado,
      "Score Prioridad": Number(i.prioridad.toFixed(2))
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario_Carapacho");
    XLSX.writeFile(wb, `Inventario_Carapacho_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Gráfico por GRUPO DE PRODUCTOS: Excluir grupos deseleccionados en el filtro
  const chartDataGrupos = useMemo(() => {
    const mapG: Record<string, { grupo: string; agotado: number; critico: number; atencion: number; totalAlertas: number }> = {};
    
    const dataset = deselectedGrupos.length > 0
      ? itemsEnriquecidos.filter(i => !deselectedGrupos.includes(i.linea))
      : itemsEnriquecidos;

    dataset.forEach(i => {
      const g = i.linea || 'GENERAL';
      if (!mapG[g]) mapG[g] = { grupo: g, agotado: 0, critico: 0, atencion: 0, totalAlertas: 0 };
      if (i.estado === 'AGOTADO') {
        mapG[g].agotado += 1;
        mapG[g].totalAlertas += 1;
      } else if (i.estado === 'CRÍTICO') {
        mapG[g].critico += 1;
        mapG[g].totalAlertas += 1;
      } else if (i.estado === 'ATENCIÓN') {
        mapG[g].atencion += 1;
        mapG[g].totalAlertas += 1;
      }
    });

    let list = Object.values(mapG).filter(g => g.totalAlertas > 0);
    
    if (list.length === 0) {
      list = Object.values(mapG);
    }

    return list
      .sort((a, b) => b.totalAlertas - a.totalAlertas)
      .slice(0, 10);
  }, [itemsEnriquecidos, deselectedGrupos]);

  return (
    <div className={`h-screen max-h-screen overflow-hidden flex ${isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* SIDEBAR IZQUIERDO */}
      <aside className={`w-52 shrink-0 border-r flex flex-col justify-between p-3.5 h-full ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-[#0b1120] text-slate-100 border-slate-800'
      }`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1 pt-1">
            <div className="p-1.5 bg-emerald-500 rounded-xl text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-extrabold tracking-tight leading-none text-white">Dashboard</h1>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">INVENTARIO CARAPACHO</span>
            </div>
          </div>

          <nav className="space-y-1 pt-1">
            <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 transition-all">
              <Package className="w-3.5 h-3.5" />
              <span>Inventario</span>
            </button>

            <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all">
              <Layers className="w-3.5 h-3.5" />
              <span>Análisis por Grupo</span>
            </button>

            <button className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all">
              <Box className="w-3.5 h-3.5" />
              <span>Análisis de Artículos</span>
            </button>
          </nav>
        </div>

        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-300 hover:bg-slate-800 transition-all"
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              {isDarkMode ? <Moon className="w-3 h-3 text-amber-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
              <span>Modo oscuro</span>
            </span>
            <div className={`w-6 h-3 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-600'}`}>
              <div className={`w-2 h-2 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>

          <div className="px-1 text-[8.5px] text-slate-500 font-medium">
            © 2026 Carapacho SM<br />Datos ERP Siesa / DataX
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL FLEXIBLE */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* ENCABEZADO COMPACTO */}
        <header className={`px-5 py-2.5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 transition-colors ${
          isDarkMode ? 'bg-[#0f172a]/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <h1 className="text-base font-black tracking-tight leading-tight">Alertas de Inventario y Abastecimiento</h1>
            <p className="text-[10px] font-medium text-slate-500">
              Análisis de stock crítico, priorizando abastecimiento según rotación de ventas.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {lastUpdate && (
              <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sincro: {lastUpdate}</span>
              </div>
            )}

            <button
              onClick={cargarDatos}
              disabled={loading}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800 shadow-sm'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
              <span>Actualizar</span>
            </button>

            <button
              onClick={handleLimpiarFiltros}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download className="w-3 h-3" />
              <span>Exportar</span>
            </button>
          </div>
        </header>

        {/* CONTENIDO 100% AJUSTADO AL ALTO DE LA PANTALLA */}
        <div className="flex-1 flex min-w-0 h-full overflow-hidden">
          
          <main className="flex-1 p-3 flex flex-col gap-3 min-w-0 h-full overflow-hidden">
            
            {/* 4 TARJETAS BENTO DE ALERTAS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
              
              <div 
                onClick={() => setSelectedEstado(selectedEstado === 'AGOTADO' ? 'TODOS LOS PRODUCTOS' : 'AGOTADO')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedEstado === 'AGOTADO' 
                    ? 'ring-2 ring-rose-500 bg-rose-500/10 border-rose-500/30' 
                    : isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-rose-500/40' : 'bg-rose-50/60 border-rose-200/80 hover:border-rose-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500">ARTÍCULOS AGOTADOS</span>
                  <div className="p-1 rounded-lg bg-rose-500/10 text-rose-500">
                    <Box className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-black text-rose-600 leading-none">{formatNumber(kpis.agotados)}</div>
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-rose-500/80 mt-0.5">DEMANDA ACTIVA</div>
              </div>

              <div 
                onClick={() => setSelectedEstado(selectedEstado === 'CRÍTICO' ? 'TODOS LOS PRODUCTOS' : 'CRÍTICO')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedEstado === 'CRÍTICO' 
                    ? 'ring-2 ring-amber-500 bg-amber-500/10 border-amber-500/30' 
                    : isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-amber-500/40' : 'bg-amber-50/60 border-amber-200/80 hover:border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">STOCK CRÍTICO</span>
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-black text-amber-600 leading-none">{formatNumber(kpis.critico)}</div>
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-amber-600/80 mt-0.5">COBERT. &lt; 15 DÍAS</div>
              </div>

              <div 
                onClick={() => setSelectedEstado(selectedEstado === 'ATENCIÓN' ? 'TODOS LOS PRODUCTOS' : 'ATENCIÓN')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedEstado === 'ATENCIÓN' 
                    ? 'ring-2 ring-yellow-500 bg-yellow-500/10 border-yellow-500/30' 
                    : isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-yellow-500/40' : 'bg-yellow-50/60 border-yellow-200/80 hover:border-yellow-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-700">STOCK EN ATENCIÓN</span>
                  <div className="p-1 rounded-lg bg-yellow-500/10 text-yellow-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-black text-yellow-700 leading-none">{formatNumber(kpis.atencion)}</div>
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-yellow-700/80 mt-0.5">COBERT. &lt; 30 DÍAS</div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-purple-50/60 border-purple-200/80 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600">COBERTURA PROMEDIO</span>
                  <div className="p-1 rounded-lg bg-purple-500/10 text-purple-600">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-black text-purple-700 leading-none">{kpis.coberturaPromedio} Días</div>
                <div className="text-[8.5px] font-bold uppercase tracking-wider text-purple-600/80 mt-0.5">PROYECCIÓN VENTA</div>
              </div>

            </div>

            {/* BARRA DE FILTROS HORIZONTALES */}
            <div className={`p-2.5 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="space-y-0.5">
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">GRUPO DE PRODUCTO</label>
                <select
                  value={selectedGrupo}
                  onChange={(e) => { 
                    const val = e.target.value;
                    setSelectedGrupo(val); 
                    setCurrentPage(1); 
                  }}
                  className={`w-full px-2.5 py-1 text-xs font-bold rounded-lg border outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="TODAS">TODOS LOS GRUPOS ({gruposDisponibles.length})</option>
                  {gruposDisponibles.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">ESTADO DE STOCK</label>
                <select
                  value={selectedEstado}
                  onChange={(e) => { setSelectedEstado(e.target.value); setCurrentPage(1); }}
                  className={`w-full px-2.5 py-1 text-xs font-bold rounded-xl border outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="TODOS LOS PRODUCTOS">TODOS LOS PRODUCTOS (CON ROTACIÓN)</option>
                  <option value="AGOTADO">🔴 ARTÍCULOS AGOTADOS (CON DEMANDA)</option>
                  <option value="CRÍTICO">🟠 STOCK CRÍTICO (&lt; 15 DÍAS)</option>
                  <option value="ATENCIÓN">🟡 STOCK EN ATENCIÓN (&lt; 30 DÍAS)</option>
                  <option value="SALUDABLE">🟢 STOCK SALUDABLE</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">BUSCAR PRODUCTO</label>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className={`w-full pl-8 pr-2.5 py-1 text-xs font-medium rounded-lg border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN FLEXIBLE: GRAFICO Y TABLA */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
              
              {/* GRAFICO CLEAN FIT */}
              <div className={`lg:col-span-4 p-3 rounded-xl border flex flex-col min-h-0 h-full overflow-hidden ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="shrink-0 mb-1">
                  <h3 className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">ALERTAS POR GRUPO</h3>
                  <h2 className="text-xs font-black text-slate-900 dark:text-white">TOP GRUPOS CON ALERTAS</h2>
                </div>

                <div className="flex-1 w-full min-h-0 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={chartDataGrupos}
                      margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                      <XAxis type="number" fontSize={9} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                      <YAxis 
                        dataKey="grupo" 
                        type="category" 
                        fontSize={8.5} 
                        width={130} 
                        stroke={isDarkMode ? '#64748b' : '#334155'} 
                        tickFormatter={(v) => String(v).length > 20 ? String(v).substring(0, 20) + '..' : String(v)}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                          borderRadius: '10px',
                          fontSize: '10px'
                        }}
                      />
                      <Bar 
                        dataKey="agotado" 
                        name="Agotados" 
                        stackId="a" 
                        fill="#ef4444" 
                        barSize={16} 
                        radius={[0, 0, 0, 0]}
                        onClick={(data) => {
                          if (data && data.grupo) toggleGrupo(data.grupo);
                        }} 
                      />
                      <Bar 
                        dataKey="critico" 
                        name="Críticos" 
                        stackId="a" 
                        fill="#f97316" 
                        barSize={16} 
                        radius={[0, 0, 0, 0]}
                        onClick={(data) => {
                          if (data && data.grupo) toggleGrupo(data.grupo);
                        }} 
                      />
                      <Bar 
                        dataKey="atencion" 
                        name="Atención" 
                        stackId="a" 
                        fill="#eab308" 
                        barSize={16} 
                        radius={[0, 4, 4, 0]}
                        onClick={(data) => {
                          if (data && data.grupo) toggleGrupo(data.grupo);
                        }} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TABLA FLEXIBLE CLEAN FIT */}
              <div className={`lg:col-span-8 p-3 rounded-xl border flex flex-col justify-between min-h-0 h-full overflow-hidden ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-1 shrink-0">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-tight">DETALLE DE INVENTARIO PRIORIZADO</h2>
                      <p className="text-[9px] font-semibold text-slate-400">Ordenado por jerarquía de prioridad de reabastecimiento (#1 = Máxima Urgencia)</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black rounded-full">
                      {itemsFiltrados.length} ÍTEMS
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar mt-1 border-t border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-[10.5px] border-collapse min-w-[550px]">
                      <thead className="sticky top-0 bg-white dark:bg-[#0f172a] z-10">
                        <tr className={`border-b font-extrabold uppercase tracking-wider ${
                          isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                        }`}>
                          <th className="py-1.5 px-2 text-center cursor-pointer w-[12%]" onClick={() => handleSort('rankingPrioridad')}>
                            PRIORIDAD
                          </th>
                          <th className="py-1.5 px-2 cursor-pointer w-[14%]" onClick={() => handleSort('referencia')}>
                            REFERENCIA
                          </th>
                          <th className="py-1.5 px-2 cursor-pointer w-[34%]" onClick={() => handleSort('articulo')}>
                            DESCRIPCIÓN
                          </th>
                          <th className="py-1.5 px-2 text-right cursor-pointer w-[12%]" onClick={() => handleSort('vtasPromedioMes')}>
                            VENTAS PROM.
                          </th>
                          <th className="py-1.5 px-2 text-center w-[8%]">U.M.</th>
                          <th className="py-1.5 px-2 text-right cursor-pointer w-[10%]" onClick={() => handleSort('stock_actual')}>
                            STOCK
                          </th>
                          <th className="py-1.5 px-2 text-right cursor-pointer w-[10%]" onClick={() => handleSort('diasExist')}>
                            DÍAS
                          </th>
                          <th className="py-1.5 px-2 text-center w-[10%]">ESTADO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                        {loading ? (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-slate-400">
                              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                              <span>Cargando inventario...</span>
                            </td>
                          </tr>
                        ) : paginatedData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-slate-400">
                              No hay artículos que coincidan con la búsqueda o grupos seleccionados.
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map((item, idx) => {
                            const isAgotado = item.estado === 'AGOTADO';
                            const isCritico = item.estado === 'CRÍTICO';
                            const isAtencion = item.estado === 'ATENCIÓN';

                            const badgeStyle = 
                              isAgotado ? 'bg-rose-500 text-white' :
                              isCritico ? 'bg-amber-500 text-white' :
                              isAtencion ? 'bg-yellow-400 text-slate-950' :
                              'bg-emerald-500/20 text-emerald-600';

                            // Badge elegante tipo pill para la Prioridad (#1, #2, #3...)
                            const isTop15 = item.rankingPrioridad <= 15;
                            const isTop50 = item.rankingPrioridad <= 50;

                            const priorityBadgeStyle = isTop15
                              ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400 font-extrabold'
                              : isTop50
                              ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 font-bold'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 font-semibold';

                            return (
                              <tr key={item.cod_item + idx} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                                <td className="py-1.5 px-2 text-center">
                                  <span className={`px-2 py-0.5 text-[9px] rounded-md uppercase tracking-wider inline-block ${priorityBadgeStyle}`}>
                                    #{item.rankingPrioridad}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 font-black text-slate-900 dark:text-slate-100">{item.referencia}</td>
                                <td className="py-1.5 px-2 font-black text-slate-900 dark:text-slate-100 uppercase truncate max-w-[180px]" title={item.articulo}>
                                  {item.articulo}
                                </td>
                                <td className="py-1.5 px-2 text-right font-black text-sky-600">{formatNumber(item.vtasPromedioMes)}</td>
                                <td className="py-1.5 px-2 text-center text-slate-500 font-bold">{item.unimed}</td>
                                <td className={`py-1.5 px-2 text-right font-black ${isAgotado ? 'text-rose-600 font-extrabold' : ''}`}>
                                  {formatNumber(item.stock_actual)}
                                </td>
                                <td className={`py-1.5 px-2 text-right font-black ${isAgotado ? 'text-rose-600' : ''}`}>
                                  {item.diasExist >= 999 ? '999+' : item.diasExist}
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                  <span className={`px-2 py-0.5 text-[8.5px] font-black rounded-md uppercase tracking-wider ${badgeStyle}`}>
                                    {item.estado}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0">
                  <div className="flex items-center gap-3">
                    <span>Pág. {currentPage} de {totalPages}</span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-slate-400 font-bold hidden sm:inline">Mostrar:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <option value={12}>12 ítems</option>
                        <option value={25}>25 ítems</option>
                        <option value={50}>50 ítems</option>
                        <option value={100}>100 ítems</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-0.5 rounded-lg border font-bold text-xs bg-white dark:bg-slate-800 disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-0.5 rounded-lg border font-bold text-xs bg-white dark:bg-slate-800 disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </main>

          {/* PANEL DERECHO DE FILTROS (PERIODOS Y GRUPOS CON UX INVERTIDA) */}
          <aside className={`w-60 shrink-0 border-l p-3 flex flex-col h-full overflow-hidden ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs uppercase tracking-wider">
                <ListFilter className="w-3.5 h-3.5" />
                <span>FILTROS ACTIVOS</span>
              </div>
            </div>

            {/* SECCIÓN DE PERIODOS */}
            <div className="space-y-2 border-b pb-3 border-slate-200 dark:border-slate-800 shrink-0 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">PERIODOS</span>
                <span className="text-[9.5px] font-bold text-slate-400">{selectedMonths.length} Seleccionados</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400">2025</span>
                <div className="grid grid-cols-4 gap-1">
                  {MESES_CONFIG.filter(m => m.year === 2025).map(m => {
                    const active = selectedMonths.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleMonth(m.id)}
                        className={`py-0.5 text-[10px] font-bold rounded-md border transition-all ${
                          active
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                            : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400">2026</span>
                <div className="grid grid-cols-4 gap-1">
                  {MESES_CONFIG.filter(m => m.year === 2026).map(m => {
                    const active = selectedMonths.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleMonth(m.id)}
                        className={`py-0.5 text-[10px] font-bold rounded-md border transition-all ${
                          active
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                            : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECCIÓN DE BOTONES DE GRUPOS DE PRODUCTOS CON UX INVERTIDA */}
            <div className="flex-1 flex flex-col min-h-0 pt-2 space-y-1.5">
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">GRUPOS DE PRODUCTO</span>
                  <p className="text-[8.5px] font-semibold text-slate-400">
                    {gruposDisponibles.length - deselectedGrupos.length} de {gruposDisponibles.length} Activos
                  </p>
                </div>
                <button
                  onClick={toggleAllGrupos}
                  className="text-[9.5px] font-bold text-emerald-600 hover:underline"
                >
                  {deselectedGrupos.length > 0 ? 'Activar Todos' : 'Todos'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1 min-h-0">
                {gruposDisponibles.map(grupo => {
                  const isDeselected = deselectedGrupos.includes(grupo);
                  const isActive = !isDeselected;
                  return (
                    <button
                      key={grupo}
                      onClick={() => toggleGrupo(grupo)}
                      title={isActive ? 'Haz clic para deseleccionar/ocultar este grupo' : 'Haz clic para activar/mostrar este grupo'}
                      className={`w-full flex items-center justify-between px-2.5 py-1 text-left text-[11px] font-bold rounded-lg border transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm hover:bg-emerald-400'
                          : isDarkMode 
                            ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-800/80 line-through opacity-50' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 line-through opacity-60'
                      }`}
                    >
                      <span className="truncate max-w-[155px]">{grupo}</span>
                      {isActive ? (
                        <Eye className="w-3 h-3 shrink-0 text-slate-950" />
                      ) : (
                        <EyeOff className="w-3 h-3 shrink-0 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}
