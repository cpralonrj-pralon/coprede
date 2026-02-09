import React, { useState } from 'react';
import { supabase } from '../apiService';
import { read, utils } from 'xlsx';

export const RecurrenceUpload = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ incidents: 0, coverage: 0 });
    const [stats, setStats] = useState({ incidents: 0, coverage: 0 });

    const processFile = async (file: File, table: 'reincidencia_incidentes' | 'reincidencia_abrangencia') => {
        const data = await file.arrayBuffer();
        const workbook = read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // DEBUG: Read raw rows to find header
        const rawRows = utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        const targetKey = table === 'reincidencia_incidentes' ? 'INCIDENTE' : 'COD';

        let headerRowIndex = -1;
        const normalize = (str: any) => String(str).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");

        // Scan first 20 rows
        for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
            const row = rawRows[i];
            if (Array.isArray(row) && row.some(cell => cell && normalize(cell).includes(targetKey))) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) {
            alert(`DEBUG: Não encontrei a coluna "${targetKey}" nas primeiras 20 linhas. Verifique se o arquivo está correto.`);
            headerRowIndex = 0; // Fallback
        }

        // Parse with correct header row. Use raw: true to get Excel Serial dates (Numbers) instead of ambiguous strings.
        const jsonData = utils.sheet_to_json<any>(worksheet, { range: headerRowIndex, raw: true });

        // Batch insert
        const BATCH_SIZE = 100;
        let insertedCount = 0;

        for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
            const batch = jsonData.slice(i, i + BATCH_SIZE);

            const mappedBatch = batch
                .map(r => mapRowToTable(r, table))
                .filter(r => {
                    if (table === 'reincidencia_incidentes') return !!r.incidente;
                    return !!r.cod_incidente;
                });

            if (mappedBatch.length === 0) continue;

            // Deduplicate batch in memory before sending (to avoid Error 21000 in batch)
            const uniqueBatch = mappedBatch.filter((row, index, self) =>
                index === self.findIndex((t) => {
                    if (table === 'reincidencia_incidentes') return t.incidente === row.incidente;
                    // For coverage, composite uniqueness
                    return t.incidente === row.incidente && t.node === row.node && t.nap === row.nap && t.celula === row.celula;
                })
            );

            if (uniqueBatch.length === 0) continue;

            const options = table === 'reincidencia_incidentes'
                ? { onConflict: 'incidente' }
                : { onConflict: 'incidente,node,nap,celula' }; // Removed ignoreDuplicates to force update and avoid 409s

            const { error } = await supabase.from(table).upsert(uniqueBatch, options);

            if (error) {
                console.error(`Error inserting into ${table}:`, error);
                // alert(`DEBUG Erro no Banco: ${error.message}`); 
            } else {
                insertedCount += uniqueBatch.length;
                setProgress(prev => ({ ...prev, [table === 'reincidencia_incidentes' ? 'incidents' : 'coverage']: Math.round((insertedCount / jsonData.length) * 100) }));
            }
        }
        return insertedCount;
    };

    const mapRowToTable = (row: any, table: string) => {
        // Robust Key Normalizer: removes accents, special chars, spaces, and lowercase
        const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

        // Helper to find value using normalized keys
        const val = (targetKeys: string[]) => {
            const rowKeys = Object.keys(row);
            const foundKey = rowKeys.find(k => targetKeys.some(tk => normalize(k) === normalize(tk)));
            return foundKey ? row[foundKey] : null;
        };

        if (table === 'reincidencia_incidentes') {
            return {
                incidente: val(['INCIDENTE', 'ID_INCIDENTE', 'CHAMADO']),
                ticket_pai: val(['TICKET_PAI', 'TICKET PAI']),
                cd_origem: val(['CD_ORIGEM']),
                ds_origem: val(['DS_ORIGEM', 'DS ORIGEM']),
                cd_tipo: val(['CD_TIPO']),
                nm_tipo: val(['NM_TIPO', 'TIPO']),
                tp_abrangencia: val(['TP_ABRANGENCIA']),
                cd_status: val(['CD_STATUS']),
                ds_status: val(['DS_STATUS', 'STATUS']),
                ds_sumario: val(['DS_SUMARIO', 'SUMARIO']),

                // Mapeamento Estendido (Solicitado pelo Usuário)
                lg_abertura: val(['LG_ABERTURA', 'LOGIN_ABERTURA', 'USUARIO_ABERTURA']),
                nm_abertura: val(['NM_ABERTURA', 'NOME_ABERTURA']),
                login_nm_abertura: val(['LOGIN_NM_ABERTURA', 'LOGIN/NOME']),
                nm_grupo_abertura: val(['NM_GRUPO', 'NM_GRUPO_ABERTURA', 'GRUPO_ABERTURA']),
                nm_organizacao_abertura: val(['NM_ORGA', 'NM_ORGANIZACAO_ABERTURA', 'ORGANIZACAO_ABERTURA']),

                lg_tratamento: val(['LG_TRATAI', 'LG_TRATAMENTO', 'LOGIN_TRATAMENTO']),
                nm_tratamento: val(['NM_TRATA', 'NM_TRATAMENTO', 'NOME_TRATAMENTO']),
                login_nm_tratamento: val(['LOGIN_NM_TRATAMENTO']),
                nm_grupo_tratamento: val(['NM_GRUPO_TRATAMENTO']),
                nm_organizacao_tratamento: val(['NM_ORGANIZACAO_TRATAMENTO']),

                lg_fechamento: val(['LG_FECHAMENTO']),
                nm_fechamento: val(['NM_FECHAMENTO']),

                dh_created: normalizeDate(val(['DH_CREATED', 'DATA_CRIACAO', 'DH_ABERTURA'])),
                dh_inicio: normalizeDate(val(['DH_INICIO'])),
                dh_fechamento: normalizeDate(val(['DH_FECHAMENTO'])),
                ds_cat_prod3: val(['DS_CAT_PROD3']),
                ds_resolucao: val(['DS_RESOLUCAO'])
            };
        } else {
            return {
                // Table 2: Abrangencia
                cod_incidente: val(['COD_INCIDENTE', 'COD. INCIDENTE', 'COD INCIDENTE']),
                incidente: val(['INCIDENTE']),
                node: val(['NODE']) || '',
                nap: val(['NAP']) || '',
                celula: val(['CELULA']) || '',

                // Topologia (concatenate requested by user)
                areatecnica: val(['AREATECNICA', 'AREA TECNICA', 'AREA_TECNICA']),
                microregiao: val(['MICROREGIAO', 'MICRO REGIAO', 'MICRO_REGIAO']),
                caixaprimaria: val(['CAIXAPRIMARIA', 'CAIXA PRIMARIA', 'CAIXA_PRIMARIA']),
                divisorprimario: val(['DIVISORPRIMARIO', 'DIVISOR PRIMARIO', 'DIVISOR_PRIMARIO']),

                nm_cidade: val(['NM_CIDADE', 'MUNICIPIO']),
                ci_estado: val(['CI_ESTADO', 'UF', 'ESTADO']),
                qt_impact_customers: asInt(val(['QT_IMPACT_CUSTOMERS'])),
                dh_created: normalizeDate(val(['DH_CREATED']))
            };
        }
    }; // End mapRowToTable

    const normalizeDate = (v: any) => {
        if (!v) return null;

        // 1. If it's already a JS Date
        if (v instanceof Date) return v.toISOString();

        try {
            // 2. If it's a number (Excel Serial Date)
            let numVal = v;
            if (typeof v === 'string' && /^\d+$/.test(v.trim())) {
                numVal = parseInt(v.trim());
            }

            if (typeof numVal === 'number' && !isNaN(numVal)) {
                if (numVal > 20000) { // Safety check for modern dates
                    const date = new Date((numVal - 25569) * 86400 * 1000);
                    return isNaN(date.getTime()) ? null : date.toISOString();
                }
            }

            // 3. If it's a string
            if (typeof v === 'string') {
                const cleanV = v.trim();

                // Regex for DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
                const regexBR = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2}))?/;

                const match = cleanV.match(regexBR);

                if (match) {
                    const day = parseInt(match[1]);
                    const month = parseInt(match[2]) - 1; // 0-index
                    let year = parseInt(match[3]);
                    const hour = match[4] ? parseInt(match[4]) : 0;
                    const minute = match[5] ? parseInt(match[5]) : 0;

                    if (year < 100) year += 2000;

                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        let d = new Date(year, month, day, hour, minute);
                        if (!isNaN(d.getTime())) return d.toISOString();
                    }
                }

                // Fallback for ISO
                const isoD = new Date(cleanV);
                if (!isNaN(isoD.getTime())) return isoD.toISOString();
            }

            const d = new Date(v);
            return isNaN(d.getTime()) ? null : d.toISOString();

        } catch (e) {
            console.warn('Error parsing date:', v, e);
            return null;
        }
    };

    const asInt = (v: any) => {
        const i = parseInt(v);
        return isNaN(i) ? null : i;
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        const incidentsFile = (document.getElementById('file-incidents') as HTMLInputElement).files?.[0];
        const coverageFile = (document.getElementById('file-coverage') as HTMLInputElement).files?.[0];

        try {
            if (incidentsFile) {
                const count = await processFile(incidentsFile, 'reincidencia_incidentes');
                setStats(s => ({ ...s, incidents: count }));
                if (count === 0) {
                    // Read headers again for debug message
                    const data = await incidentsFile.arrayBuffer();
                    const workbook = read(data);
                    // Just show raw first row for user to see
                    const firstRow = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0] as string[];
                    alert(`Aviso: 0 incidentes. Colunas encontradas: ${JSON.stringify(firstRow)}. Esperado: INCIDENTE.`);
                }
            }
            if (coverageFile) {
                const count = await processFile(coverageFile, 'reincidencia_abrangencia');
                setStats(s => ({ ...s, coverage: count }));
                if (count === 0) {
                    const data = await coverageFile.arrayBuffer();
                    const workbook = read(data);
                    const firstRow = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0] as string[];
                    alert(`Aviso: 0 via abrangência. Colunas encontradas: ${JSON.stringify(firstRow)}. Esperado: COD_INCIDENTE.`);
                }
            }
            if (incidentsFile || coverageFile) {
                onUploadComplete();
            }
        } catch (err: any) {
            alert('Erro: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                Upload de Dados (Reincidência)
            </h2>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                    <label htmlFor="file-incidents" className="block text-sm font-medium text-gray-400 mb-2">Arquivo 1: Incidentes</label>
                    <input id="file-incidents" type="file" accept=".csv, .xlsx, .xls" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80" />
                    {progress.incidents > 0 && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress.incidents}%` }}></div>
                            </div>
                            <p className="text-xs text-primary mt-1 text-right">{progress.incidents}% processado</p>
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="file-coverage" className="block text-sm font-medium text-gray-400 mb-2">Arquivo 2: Abrangência (Nodes)</label>
                    <input id="file-coverage" type="file" accept=".csv, .xlsx, .xls" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80" />
                    {progress.coverage > 0 && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress.coverage}%` }}></div>
                            </div>
                            <p className="text-xs text-green-400 mt-1 text-right">{progress.coverage}% processado</p>
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={uploading}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed h-10"
                >
                    {uploading ? 'Processando...' : 'Iniciar Importação'}
                </button>
            </form>
            {stats.incidents > 0 && (
                <div className="mt-4 p-4 bg-black/20 rounded-lg text-sm text-gray-300">
                    <p>✅ Incidentes: {stats.incidents} linhas importadas.</p>
                    <p>✅ Abrangência: {stats.coverage} linhas importadas.</p>
                </div>
            )}
        </div>
    );
};
