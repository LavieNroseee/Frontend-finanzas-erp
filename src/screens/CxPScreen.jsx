import { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import ChartComponent from '../components/ui/ChartComponent';
import KPI from '../components/ui/KPI';
import SectionHeader from '../components/ui/SectionHeader';

const CxPScreen = ({ data }) => {
  const [filter, setFilter] = useState('total');

  const filteredData = useMemo(() => {
    if (filter === 'total') return data;
    return data.filter(i => (i.categoria || '').toUpperCase().includes(filter));
  }, [data, filter]);

  const totals = useMemo(() => {
    const total = filteredData.reduce((a, b) => a + b.saldo, 0);
    const vencida = filteredData.filter(i => i.dias_vencidos > 0).reduce((a, b) => a + b.saldo, 0);
    const vencer = filteredData.filter(i => i.dias_vencidos <= 0).reduce((a, b) => a + b.saldo, 0);
    return { total, vencida, vencer };
  }, [filteredData]);

  const chartData = useMemo(() => {
    const buckets = ['Por Vencer', '1-30', '31-60', '61-90', '+90'];
    const values = buckets.map(b => filteredData.filter(i => i.bucket === b).reduce((s, i) => s + i.saldo, 0));
    return {
      labels: buckets,
      datasets: [{
        data: values,
        backgroundColor: ['#10b981', '#fbbf24', '#f59e0b', '#f43f5e', '#be123c'],
        borderWidth: 0,
        hoverOffset: 15
      }]
    };
  }, [filteredData]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader title="Gestión de Pagos (CxP)" subtitle="Control de obligaciones y antigüedad." />
        <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
          {['total', 'CLIENTES', 'PERSONAL', 'GARANTIAS'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-200 uppercase tracking-wide ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {f === 'total' ? 'Global' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPI title="Deuda Total" value={`S/ ${totals.total.toLocaleString()}`} colorTheme="rose" />
        <KPI title="Pagos Vencidos" value={`S/ ${totals.vencida.toLocaleString()}`} colorTheme="amber" />
        <KPI title="Por Vencer" value={`S/ ${totals.vencer.toLocaleString()}`} colorTheme="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hover={true} className="lg:col-span-1 flex flex-col justify-center">
          <h3 className="font-bold text-slate-800 mb-6 text-center">Distribución de Vencimiento</h3>
          <div className="relative">
            <ChartComponent type="doughnut" data={chartData} options={{ cutout: '70%' }} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800 opacity-20">%</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden flex flex-col p-0">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Detalle de Obligaciones</h3>
            <span className="text-xs font-medium text-slate-400">{filteredData.length} registros</span>
          </div>
          <div className="overflow-auto flex-1 max-h-[500px] p-0 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-white sticky top-0 text-xs font-bold uppercase text-slate-400 tracking-wider shadow-sm z-10">
                <tr>
                  <th className="p-4 bg-slate-50">Entidad</th>
                  <th className="p-4 bg-slate-50">Documento</th>
                  <th className="p-4 bg-slate-50">Vencimiento</th>
                  <th className="p-4 bg-slate-50 text-center">Estado</th>
                  <th className="p-4 bg-slate-50 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row, i) => (
                  <tr key={i} className="group hover:bg-rose-50/30 transition-colors">
                    <td className="p-4 font-semibold text-slate-700 group-hover:text-rose-700">{row.entidad}</td>
                    <td className="p-4 text-slate-500 text-xs font-mono">{row.documento}</td>
                    <td className="p-4 text-slate-500 text-xs">{row.fecha_vencimiento ? row.fecha_vencimiento.toLocaleDateString() : '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${row.dias_vencidos > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {row.dias_vencidos > 0 ? `+${row.dias_vencidos} días` : 'Al día'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700 font-mono">S/ {row.saldo.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CxPScreen;
