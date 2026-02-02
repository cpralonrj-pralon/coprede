import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ValidationResult {
  row: number;
  data: any;
  errors: string[];
}

interface AreaStats {
  name: string; // Cidade/Distrito/HeadEnd combination
  cidade: string;
  distrito: string;
  headend: string;
  errorCount: number;
}

export const DataValidator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [stats, setStats] = useState<AreaStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setValidationResults([]);
      setStats([]);
      setErrorHeader(null);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        validateData(jsonData);
      } catch (error) {
        console.error("Error parsing Excel:", error);
        setErrorHeader("Erro ao ler o arquivo Excel. Verifique o formato.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const validateData = (data: any[]) => {
    const results: ValidationResult[] = [];
    const areaMap = new Map<string, AreaStats>();

    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      const node = row['Node'] ? String(row['Node']).trim() : '';
      
      // Validation Rule: Node must have exactly 7 numeric characters
      const cleanNode = node.replace(/[^0-9]/g, '');
      if (cleanNode.length !== 7) {
        rowErrors.push(`Node inválido: '${node}' (deve ter 7 dígitos numéricos)`);
      }

      if (rowErrors.length > 0) {
        results.push({
          row: index + 2, // Excel 1-based index + header
          data: row,
          errors: rowErrors
        });

        // Agregando estatísticas
        const cidade = row['Cidade'] || 'N/A';
        const distrito = row['Distrito'] || 'N/A';
        const headend = row['HeadEnd'] || 'N/A';
        
        // Chave única para agrupar (pode ajustar conforme a necessidade do gráfico)
        // O usuário pediu gráfico por Área, Cidade/Distrito/Headend
        const areaKey = `${cidade} - ${distrito}`; 
        
        if (!areaMap.has(areaKey)) {
          areaMap.set(areaKey, {
            name: areaKey,
            cidade,
            distrito,
            headend,
            errorCount: 0
          });
        }
        
        const currentStat = areaMap.get(areaKey)!;
        currentStat.errorCount++;
      }
    });

    setValidationResults(results);
    setStats(Array.from(areaMap.values()).sort((a, b) => b.errorCount - a.errorCount)); // Sort by errors desc
    
    if (results.length === 0) {
        setErrorHeader("Nenhum erro encontrado! Todos os registros estão válidos.");
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Validação de Dados - Excel</h1>
      
      <div className="bg-surface-dark p-6 rounded-xl border border-white/5 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Selecione o arquivo Excel (.xlsx, .xls, .csv)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/80"
            />
          </div>
          <button
            onClick={processFile}
            disabled={!file || loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !file || loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? 'Processando...' : 'Validar Planilha'}
          </button>
        </div>
        {errorHeader && (
             <div className="mt-4 p-3 bg-blue-500/20 text-blue-300 rounded-lg">
                 {errorHeader}
             </div>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface-dark p-6 rounded-xl border border-white/5">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Erros por Cidade/Distrito</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" width={150} stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                  />
                  <Legend />
                  <Bar dataKey="errorCount" name="Registros Inválidos" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-surface-dark p-6 rounded-xl border border-white/5 overflow-y-auto max-h-[400px]">
             <h2 className="text-xl font-semibold mb-4 text-yellow-400">Resumo de Erros</h2>
             <table className="w-full text-left border-collapse">
                 <thead>
                     <tr className="border-b border-white/10 text-gray-400 text-sm">
                         <th className="py-2">Área</th>
                         <th className="py-2 text-right">Qtd. Erros</th>
                     </tr>
                 </thead>
                 <tbody>
                     {stats.map((stat, idx) => (
                         <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                             <td className="py-2 text-sm">{stat.name}</td>
                             <td className="py-2 text-right font-mono text-red-400">{stat.errorCount}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
        </div>
      )}

      {validationResults.length > 0 && (
        <div className="bg-surface-dark p-6 rounded-xl border border-white/5">
          <h2 className="text-xl font-semibold mb-4">Detalhes dos Registros Inválidos ({validationResults.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-gray-400 text-sm uppercase">
                  <th className="p-3">Linha Excel</th>
                  <th className="p-3">Cidade</th>
                  <th className="p-3">Node (Valor Original)</th>
                  <th className="p-3">Erro Encontrado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {validationResults.slice(0, 100).map((res, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-mono text-gray-400">{res.row}</td>
                    <td className="p-3">{res.data['Cidade']}</td>
                    <td className="p-3 font-mono bg-red-500/10 text-red-300 rounded">{res.data['Node']}</td>
                    <td className="p-3 text-red-400">{res.errors.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {validationResults.length > 100 && (
                <div className="p-4 text-center text-gray-500 italic">
                    Mostrando apenas os primeiros 100 erros de {validationResults.length}.
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
