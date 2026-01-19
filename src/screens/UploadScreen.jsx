import { Activity, Briefcase, CheckCircle, Layers, TrendingDown, TrendingUp, UploadCloud, Wallet } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';

const UploadScreen = ({ onFileLoaded, filesStatus, logs, canProcess, onProcess, libsLoaded }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <SectionHeader
        title="Centro de Datos"
        subtitle="Carga y normalización de archivos financieros para el análisis estratégico."
      />

      {!libsLoaded && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 px-6 py-4 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm">
          <Activity className="animate-spin text-amber-600" size={20} />
          <span>Inicializando motor de cálculo financiero...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'cxc', label: 'Cobranzas (CxC)', required: true, theme: 'indigo', icon: TrendingUp },
          { id: 'cxp', label: 'Pagos (CxP)', required: true, theme: 'rose', icon: TrendingDown },
          { id: 'proj', label: 'Control Proyectos', required: true, theme: 'emerald', icon: Briefcase },
          { id: 'funcion', label: 'EEFF Función', required: false, theme: 'violet', icon: Layers },
          { id: 'balance', label: 'EEFF Balance', required: false, theme: 'amber', icon: Wallet },
        ].map((field) => {
          const isUploaded = filesStatus[field.id];
          const colors = {
            indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:border-indigo-400',
            rose: 'text-rose-600 bg-rose-50 border-rose-200 hover:border-rose-400',
            emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:border-emerald-400',
            violet: 'text-violet-600 bg-violet-50 border-violet-200 hover:border-violet-400',
            amber: 'text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-400',
          };
          const themeClass = colors[field.theme];

          return (
            <div key={field.id} className={`relative group p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${isUploaded ? 'bg-white border-slate-200 shadow-sm' : `${themeClass.replace('text-', '')} bg-opacity-30`}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isUploaded ? 'bg-green-100 text-green-600' : `bg-white shadow-sm ${themeClass.split(' ')[0]}`}`}>
                    <field.icon size={20} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isUploaded ? 'text-slate-700' : 'text-slate-800'}`}>{field.label}</h3>
                    {field.required && !isUploaded && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requerido</span>}
                  </div>
                </div>
                {isUploaded && <CheckCircle size={24} className="text-green-500 drop-shadow-sm" />}
              </div>

              <input
                type="file"
                accept=".xlsx, .xls"
                disabled={!libsLoaded}
                className={`absolute inset-0 w-full h-full opacity-0 z-10 ${libsLoaded ? 'cursor-pointer' : 'cursor-wait'}`}
                onChange={(e) => onFileLoaded(e, field.id)}
              />

              <div className="mt-4 pt-4 border-t border-slate-100">
                {isUploaded ? (
                  <div className="text-xs font-semibold text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} /> Archivo listo
                  </div>
                ) : (
                  <div className="text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors flex items-center justify-between">
                    <span>Click o arrastrar</span>
                    <UploadCloud size={14} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl shadow-slate-200 overflow-hidden">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
          <Activity size={14} /> Log de Operaciones
        </h4>
        <div className="font-mono text-xs space-y-2 h-32 overflow-y-auto pr-2 custom-scrollbar">
          {logs.length === 0 && <span className="text-slate-600 italic">Sistema en espera...</span>}
          {logs.map((log, idx) => (
            <div key={idx} className={`flex items-start gap-2 ${log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : 'text-indigo-300'}`}>
              <span className="opacity-50 mt-0.5">&gt;</span>
              <span>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onProcess}
          disabled={!canProcess}
          className={`
            relative overflow-hidden group px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-1
            ${canProcess
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
          `}
        >
          <span className="relative z-10 flex items-center gap-3">
            <Layers size={20} />
            GENERAR DASHBOARD FINANCIERO
          </span>
          {canProcess && <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>}
        </button>
      </div>
    </div>
  );
};

export default UploadScreen;
