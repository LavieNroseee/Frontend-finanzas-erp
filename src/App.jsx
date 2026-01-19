import { useEffect, useState } from 'react';
import { Briefcase, LayoutDashboard, Menu, TrendingDown, TrendingUp, UploadCloud, Wallet, X } from 'lucide-react';
import GlobalStyles from './components/GlobalStyles';
import UploadScreen from './screens/UploadScreen';
import VisionScreen from './screens/VisionScreen';
import CxCScreen from './screens/CxCScreen';
import CxPScreen from './screens/CxPScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import { ALIASES, COLUMNS, cleanNum, getAgingBucket, parseExDate } from './utils/financial';

const App = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [rawData, setRawData] = useState({ cxc: null, cxp: null, proj: null, balance: null, funcion: null });
  const [normalizedData, setNormalizedData] = useState({ cxc: [], cxp: [], proj: [], balance: null, funcion: null });
  const [isProcessed, setIsProcessed] = useState(false);
  const [filesStatus, setFilesStatus] = useState({});
  const [logs, setLogs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);

  useEffect(() => {
    const loadScripts = async () => {
      const load = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });

      try {
        addLog('Inicializando sistema v2.0...', 'info');
        await Promise.all([
          load('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'),
          load('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js')
        ]);
        setLibsLoaded(true);
        addLog('Motor financiero listo.', 'success');
      } catch (err) {
        addLog('Error crítico de red.', 'error');
      }
    };
    loadScripts();
  }, []);

  const addLog = (msg, type = 'info') => setLogs(prev => [...prev, { msg, type }]);

  const processFile = (file, key) => {
    if (!libsLoaded) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        if (!window.XLSX) throw new Error('Motor XLSX no disponible');
        const workbook = window.XLSX.read(evt.target.result, { type: 'binary', cellDates: true });
        const sheetData = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        if (validate(sheetData, key)) {
          setRawData(prev => ({ ...prev, [key]: sheetData }));
          setFilesStatus(prev => ({ ...prev, [key]: true }));
          addLog(`Módulo ${key.toUpperCase()} sincronizado.`, 'success');
        }
      } catch (err) {
        addLog(`Error en ${key}: ${err.message}`, 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const validate = (data, key) => {
    if (!data || data.length === 0) return false;
    if (key === 'balance' || key === 'funcion') return true;
    const headers = Object.keys(data[0]).map(h => h.toLowerCase());
    const missing = COLUMNS[key].filter(req => {
      const hasDirect = headers.includes(req.toLowerCase());
      const hasAlias = (ALIASES[req] || []).some(a => headers.includes(a.toLowerCase()));
      return !hasDirect && !hasAlias;
    });
    if (missing.length > 0) {
      addLog(`Error esquema ${key}: Faltan campos ${missing.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const normalize = (data, key) => {
    if (!data) return [];
    const required = COLUMNS[key];
    const today = new Date();
    return data.map(row => {
      const obj = {};
      const rowKeys = Object.keys(row);
      required.forEach(field => {
        const header = rowKeys.find(h => h.toLowerCase() === field.toLowerCase() || (ALIASES[field] || []).includes(h.toLowerCase()));
        let val = row[header];
        if (['monto', 'saldo', 'total', 'gastado', 'presupuesto_neto', 'sub_total', 'igv', 'detraccion', 'garantias', 'avance'].includes(field)) val = cleanNum(val);
        if (field.includes('fecha')) val = parseExDate(val);
        obj[field] = val;
      });
      if (obj.fecha_vencimiento) {
        const diff = today - obj.fecha_vencimiento;
        obj.dias_vencidos = Math.ceil(diff / (1000 * 60 * 60 * 24));
        obj.bucket = getAgingBucket(obj.dias_vencidos);
      } else {
        obj.dias_vencidos = 0;
        obj.bucket = 'Por Vencer';
      }
      return obj;
    });
  };

  const handleProcess = () => {
    addLog('Calculando indicadores estratégicos...', 'info');
    const norm = {
      cxc: normalize(rawData.cxc, 'cxc'),
      cxp: normalize(rawData.cxp, 'cxp'),
      proj: normalize(rawData.proj, 'proj'),
      balance: rawData.balance,
      funcion: rawData.funcion
    };
    setNormalizedData(norm);
    setIsProcessed(true);
    setActiveTab('vision');
    addLog('Dashboard actualizado exitosamente.', 'success');
  };

  const canProcess = rawData.cxc && rawData.cxp && rawData.proj;

  const NavItem = ({ id, label, icon: Icon, disabled }) => (
    <button
      onClick={() => {
        if (!disabled) {
          setActiveTab(id);
          setIsSidebarOpen(false);
        }
      }}
      className={`
        w-full flex items-center gap-4 px-6 py-4 text-sm font-semibold transition-all duration-300 relative overflow-hidden group
        ${activeTab === id
          ? 'text-white bg-white/10 shadow-lg border-l-4 border-indigo-400'
          : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
      `}
    >
      <Icon size={20} className={`transition-colors ${activeTab === id ? 'text-indigo-300' : 'text-slate-500 group-hover:text-indigo-300'}`} />
      <span className="relative z-10">{label}</span>
      {activeTab === id && <div className="absolute inset-0 bg-indigo-500/10 blur-xl"></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <GlobalStyles />

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`
        fixed md:relative z-50 w-72 h-full sidebar-gradient text-white shadow-2xl
        transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 mb-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Wallet className="text-indigo-400" />
                FinCore
              </h1>
              <div className="text-[11px] text-indigo-200 font-semibold uppercase tracking-[0.2em] mt-1 pl-8">Enterprise OS</div>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
          </div>
        </div>

        <nav className="space-y-2 py-4">
          <NavItem id="upload" label="Centro de Datos" icon={UploadCloud} />
          <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Analítica</div>
          <NavItem id="vision" label="Visión Estratégica" icon={LayoutDashboard} disabled={!isProcessed} />
          <NavItem id="cxc" label="Cobranzas" icon={TrendingUp} disabled={!isProcessed} />
          <NavItem id="cxp" label="Pagos" icon={TrendingDown} disabled={!isProcessed} />
          <NavItem id="proyectos" label="Proyectos" icon={Briefcase} disabled={!isProcessed} />
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs">JS</div>
            <div>
              <p className="text-xs font-bold text-white">Admin User</p>
              <p className="text-[10px] text-indigo-300">Financial Controller</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto w-full relative bg-[#f8fafc]">
        <header className="md:hidden glass-effect p-4 flex items-center justify-between sticky top-0 z-30 border-b border-slate-200">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600"><Menu /></button>
          <span className="font-bold text-slate-800">Dashboard</span>
          <div className="w-6"></div>
        </header>

        <div className="p-6 md:p-12 max-w-[1600px] mx-auto min-h-screen">
          {activeTab === 'upload' && (
            <UploadScreen
              onFileLoaded={(e, key) => processFile(e.target.files[0], key)}
              filesStatus={filesStatus}
              logs={logs}
              canProcess={canProcess}
              onProcess={handleProcess}
              libsLoaded={libsLoaded}
            />
          )}

          {activeTab === 'vision' && <VisionScreen data={normalizedData} />}
          {activeTab === 'cxc' && <CxCScreen data={normalizedData.cxc} />}
          {activeTab === 'cxp' && <CxPScreen data={normalizedData.cxp} balance={normalizedData.balance} />}
          {activeTab === 'proyectos' && <ProjectsScreen data={normalizedData.proj} />}
        </div>
      </main>
    </div>
  );
};

export default App;
