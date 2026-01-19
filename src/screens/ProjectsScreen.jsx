import { useMemo, useState } from 'react';
import { Briefcase, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import ChartComponent from '../components/ui/ChartComponent';
import SectionHeader from '../components/ui/SectionHeader';

const ProjectsScreen = ({ data }) => {
  const [selectedStage, setSelectedStage] = useState('all');

  const stages = useMemo(() => {
    const allStages = data.map(p => p.etapa).filter(Boolean);
    return ['all', ...new Set(allStages)];
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedStage === 'all') return data;
    return data.filter(p => p.etapa === selectedStage);
  }, [data, selectedStage]);

  const kpis = useMemo(() => {
    const pres = filteredData.reduce((a, b) => a + b.presupuesto_neto, 0);
    const gastado = filteredData.reduce((a, b) => a + b.gastado, 0);
    const conteo = filteredData.filter(p => (p.estado || '').toLowerCase().includes('ejecucion')).length;
    const avg = filteredData.length > 0
      ? filteredData.reduce((a, b) => a + (b.avance || 0), 0) / filteredData.length
      : 0;
    return { pres, gastado, conteo, avg };
  }, [filteredData]);

  const budgetChartData = useMemo(() => {
    const executed = kpis.gastado;
    const remaining = Math.max(0, kpis.pres - executed);
    const executionPercent = kpis.pres > 0 ? ((executed / kpis.pres) * 100).toFixed(1) : 0;

    return {
      data: {
        labels: ['Ejecutado', 'Pendiente'],
        datasets: [{
          data: [executed, remaining],
          backgroundColor: ['#ef4444', '#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      percent: executionPercent
    };
  }, [kpis]);

  const chartData = useMemo(() => {
    const etapas = {};
    filteredData.forEach(p => etapas[p.etapa || 'Sin Etapa'] = (etapas[p.etapa || 'Sin Etapa'] || 0) + 1);
    return {
      labels: Object.keys(etapas),
      datasets: [{ label: 'Proyectos', data: Object.values(etapas), backgroundColor: '#8b5cf6', borderRadius: 6 }]
    };
  }, [filteredData]);

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Control de Proyectos" subtitle="Seguimiento de presupuestos y avances de obra." />

      {/* FILTROS POR ETAPA */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mr-2">
          <Filter size={16} /> Filtro:
        </div>
        {stages.map(stage => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all 
              ${selectedStage === stage
                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
          >
            {stage === 'all' ? 'Todos' : stage}
          </button>
        ))}
      </div>

      {/* GRÁFICA DE EJECUCIÓN PRESUPUESTAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card hover={true} className="col-span-1 md:col-span-3 flex flex-col md:flex-row items-center gap-8 p-8 bg-gradient-to-br from-white to-slate-50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Briefcase size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Ejecución Presupuestal</h3>
                <p className="text-sm text-slate-500">
                  {selectedStage === 'all' ? 'Consolidado Global' : `Etapa: ${selectedStage}`}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Presupuesto Total</p>
                <p className="text-lg font-black text-slate-800 mt-1">S/ {kpis.pres.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-rose-100 shadow-sm">
                <p className="text-xs font-bold text-rose-400 uppercase">Total Ejecutado</p>
                <p className="text-lg font-black text-rose-600 mt-1">S/ {kpis.gastado.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="relative w-48 h-48 flex-shrink-0">
            <ChartComponent type="doughnut" data={budgetChartData.data} options={{ cutout: '75%', plugins: { legend: { display: false } } }} height={192} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">{budgetChartData.percent}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Ejecutado</span>
            </div>
          </div>
        </Card>
      </div>

      {/* GRÁFICO MOVIDO: PROYECTOS POR ETAPA */}
      <div className="mb-8">
        <Card>
          <h3 className="font-bold text-slate-800 mb-6">Proyectos por Etapa</h3>
          <ChartComponent type="bar" height={200} data={chartData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center py-6 border-b-4 border-b-indigo-500" hover={true}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presupuesto</p>
          <p className="text-xl font-black text-slate-800 mt-2">S/ {kpis.pres.toLocaleString()}</p>
        </Card>
        <Card className="text-center py-6 border-b-4 border-b-rose-500" hover={true}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ejecutado</p>
          <p className="text-xl font-black text-rose-600 mt-2">S/ {kpis.gastado.toLocaleString()}</p>
        </Card>
        <Card className="text-center py-6 border-b-4 border-b-blue-500" hover={true}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avance Prom.</p>
          <p className="text-xl font-black text-blue-600 mt-2">{kpis.avg.toFixed(1)}%</p>
        </Card>
        <Card className="text-center py-6 border-b-4 border-b-emerald-500" hover={true}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Ejecución</p>
          <p className="text-xl font-black text-emerald-600 mt-2">{kpis.conteo}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredData.map((p, i) => (
          <Card key={i} hover={true} className="relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:w-2 transition-all"></div>
            <div className="pl-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-slate-800 text-sm uppercase truncate w-2/3" title={p.proyecto}>{p.proyecto || 'S/N'}</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase">{p.estado || 'EJE'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Presupuesto</p>
                  <p className="font-bold text-slate-700">S/ {p.presupuesto_neto.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Gastado</p>
                  <p className="font-bold text-rose-600">S/ {p.gastado.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${p.avance || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400">Progreso</span>
                <span className="text-indigo-600">{p.avance || 0}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectsScreen;
