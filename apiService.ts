
import { User, Incident, GponEvent } from './types';

export interface ApiIncident {
    data: string;
    idEvento: number;
    tipoEvento: string;
    mercado: string;
    natureza: string;
    sintoma: string;
    cidade: string;
    grupo: string;
    equipamento: string;
    dataPrev: string | null;
    associados: any;
}

export interface DashboardMetrics {
    total: number;
    pending: number;
    treated: number;
    efficiency: string;
    evolutionData: { time: string; val: number }[];
    techData: { name: string; value: number; color: string }[];
    recentIncidents: any[];
    availableMarkets: string[];
    availableStatuses: string[];
    topCities: {
        name: string;
        value: number;
        topFailure: string;
        stats: { name: string; count: number; percent: number }[];
    }[];
    topCitiesOver24h?: {
        name: string;
        value: number;
        topFailure: string;
        stats: { name: string; count: number; percent: number }[];
    }[];
    outages: { market: string; type: string; count: number }[];
}

export interface SgoIncident {
    ticket: string;
    incidente: string;
    sintoma: string;
    acionado: string;
    dataInicio: string;
    observacao: string;
    cidade: string;
    node: string;
    tecnologia: string;
    rede: string;
    sintomaOper: string;
    impacto: string;
    regional: string;
    grupo: string;
    cluster: string;
    subcluster: string;
}

// Mock Data Generators

const MOCK_INCIDENTS: ApiIncident[] = [
    {
        data: new Date().toISOString(),
        idEvento: 1001,
        tipoEvento: 'Massiva',
        mercado: 'SÃO PAULO',
        natureza: 'Falha',
        sintoma: 'SEM SINAL',
        cidade: 'SÃO PAULO',
        grupo: 'METRO',
        equipamento: 'OLT-01',
        dataPrev: null,
        associados: []
    },
    {
        data: new Date(Date.now() - 3600000).toISOString(),
        idEvento: 1002,
        tipoEvento: 'Degradação',
        mercado: 'RIO DE JANEIRO',
        natureza: 'Falha',
        sintoma: 'LENTIDÃO',
        cidade: 'RIO DE JANEIRO',
        grupo: 'CAPITAL',
        equipamento: 'CMTS-05',
        dataPrev: new Date(Date.now() + 7200000).toISOString(),
        associados: []
    },
    {
        data: new Date(Date.now() - 7200000).toISOString(),
        idEvento: 1003,
        tipoEvento: 'Massiva',
        mercado: 'BELO HORIZONTE',
        natureza: 'Prejuizo',
        sintoma: 'ROMPIMENTO FIBRA',
        cidade: 'BELO HORIZONTE',
        grupo: 'MINAS',
        equipamento: 'CABO-02',
        dataPrev: null,
        associados: []
    },
    {
        data: new Date(Date.now() - 1800000).toISOString(),
        idEvento: 1004,
        tipoEvento: 'Massiva',
        mercado: 'SÃO PAULO',
        natureza: 'Falha',
        sintoma: 'SEM SINAL',
        cidade: 'CAMPINAS',
        grupo: 'INTERIOR',
        equipamento: 'OLT-03',
        dataPrev: null,
        associados: []
    }
];

const MOCK_SGO_INCIDENTS: SgoIncident[] = [
    {
        ticket: 'SGO-2024-001',
        incidente: 'FALHA DE ENERGIA',
        sintoma: 'SEM ENERGIA',
        acionado: 'Novo',
        dataInicio: new Date().toISOString(),
        observacao: 'Falta de energia na estação',
        cidade: 'SÃO PAULO',
        node: 'SP-EST-01',
        tecnologia: 'HFC',
        rede: 'CLARO',
        sintomaOper: 'ENERGIA',
        impacto: 'ALTO',
        regional: 'SP',
        grupo: 'CAPITAL',
        cluster: 'SUL',
        subcluster: 'JABAQUARA'
    },
    {
        ticket: 'SGO-2024-002',
        incidente: 'ROMPIMENTO',
        sintoma: 'ROMPIMENTO',
        acionado: 'Em Progresso',
        dataInicio: new Date(Date.now() - 5400000).toISOString(),
        observacao: 'Equipe em deslocamento',
        cidade: 'RIO DE JANEIRO',
        node: 'RJ-EST-05',
        tecnologia: 'GPON',
        rede: 'VITAL',
        sintomaOper: 'FIBRA',
        impacto: 'MEDIO',
        regional: 'RJ',
        grupo: 'LESTE',
        cluster: 'NORTE',
        subcluster: 'TIJUCA'
    }
];


export const fetchRawIncidents = async (): Promise<ApiIncident[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_INCIDENTS;
};

export const calculateMetrics = (conteudo: ApiIncident[]): DashboardMetrics => {
    const total = conteudo.length;
    const pending = conteudo.filter(i => !i.dataPrev).length;
    const treated = total - pending;
    const efficiency = total > 0 ? `${Math.round((treated / total) * 100)}%` : '0%';

    // Evolution Data
    const evolutionMap: Record<string, number> = {};
    conteudo.forEach(item => {
        const hour = item.data.split('T')[1]?.substring(0, 2) + ':00' || '00:00';
        evolutionMap[hour] = (evolutionMap[hour] || 0) + 1;
    });

    const evolutionData = Object.entries(evolutionMap)
        .map(([time, val]) => ({ time, val }))
        .sort((a, b) => a.time.localeCompare(b.time));

    // Event Type Data (Now Falhas/Sintomas)
    const eventTypeMap: Record<string, number> = {};
    conteudo.forEach(item => {
        const key = item.sintoma || item.tipoEvento || 'Outros';
        eventTypeMap[key] = (eventTypeMap[key] || 0) + 1;
    });

    const colors = ['#e0062e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];
    const techData = Object.entries(eventTypeMap)
        .map(([name, count], index) => ({
            name,
            value: Math.round((count / total) * 100),
            color: colors[index % colors.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const recentIncidents = conteudo.slice(0, 4).map(i => ({
        id: `INC-${i.idEvento}`,
        title: i.tipoEvento,
        location: `${i.cidade} - ${i.mercado}`,
        time: i.data.split('T')[1]?.substring(0, 5),
        status: i.natureza.toLowerCase().includes('prejuizo') ? 'critical' : 'pending',
        type: i.sintoma
    }));

    // Top 10 Cities & Matrix Data
    const cityMap: Record<string, { total: number; failures: Record<string, number> }> = {};
    const failureGlobalCount: Record<string, number> = {};

    conteudo.forEach(item => {
        const city = item.cidade || 'N/A';
        const failure = item.sintoma || item.tipoEvento || 'Outros';

        // City Stats
        if (!cityMap[city]) cityMap[city] = { total: 0, failures: {} };
        cityMap[city].total++;
        cityMap[city].failures[failure] = (cityMap[city].failures[failure] || 0) + 1;

        // Global Failure Stats
        failureGlobalCount[failure] = (failureGlobalCount[failure] || 0) + 1;
    });

    // Identify Top 5 Global Failures for Matrix Columns
    const topFailures = Object.entries(failureGlobalCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

    // Compute Top Cities with Matrix Data
    const topCities = Object.entries(cityMap)
        .map(([name, data]) => ({
            name,
            value: data.total,
            stats: topFailures.map(fail => ({
                name: fail,
                count: data.failures[fail] || 0,
                percent: Math.round(((data.failures[fail] || 0) / data.total) * 100)
            })),
            topFailure: Object.entries(data.failures).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    // Outage Detection Logic
    const outageMap: Record<string, { count: number, type: string }> = {};

    conteudo.forEach(item => {
        const sintoma = (item.sintoma || '').toUpperCase();
        if (sintoma.includes('SEM SINAL') || sintoma.includes('DEGRADAÇÃO')) {
            const key = item.cidade || item.mercado || 'N/A';
            if (!outageMap[key]) {
                outageMap[key] = { count: 0, type: sintoma.includes('SEM SINAL') ? 'SEM SINAL' : 'DEGRADAÇÃO' };
            }
            outageMap[key].count++;
        }
    });

    const outages = Object.entries(outageMap)
        .filter(([_, data]) => data.count >= 3)
        .map(([market, data]) => ({
            market,
            type: data.type,
            count: data.count
        }))
        .sort((a, b) => b.count - a.count);

    const availableMarkets = Array.from(new Set(conteudo.map(i => i.mercado))).sort();
    const availableStatuses = ['Todos', 'Pendentes', 'Tratadas'];

    return {
        total,
        pending,
        treated,
        efficiency,
        evolutionData,
        techData,
        topCities,
        outages,
        recentIncidents,
        availableMarkets,
        availableStatuses
    };
};

export const calculateSgoMetrics = (incidents: SgoIncident[]): DashboardMetrics => {
    const total = incidents.length;

    // Classify based on nm_status (mapped to 'acionado' field)
    // Pendentes: "Novo" + "Pendente"
    // Tratadas: "Designado" + "Em Progresso"
    const pending = incidents.filter(i => {
        const status = i.acionado?.toLowerCase() || '';
        return status.includes('novo') || status.includes('pendente') || status.includes('open');
    }).length;

    const treated = incidents.filter(i => {
        const status = i.acionado?.toLowerCase() || '';
        return status.includes('designado') || status.includes('progresso');
    }).length;

    const efficiency = total > 0 ? `${Math.round((treated / total) * 100)}%` : '0%';


    // Evolution Data by dataInicio
    const evolutionMap: Record<string, number> = {};
    incidents.forEach(item => {
        try {
            const date = new Date(item.dataInicio);
            const hour = date.getHours().toString().padStart(2, '0') + ':00';
            evolutionMap[hour] = (evolutionMap[hour] || 0) + 1;
        } catch (e) {
            evolutionMap['00:00'] = (evolutionMap['00:00'] || 0) + 1;
        }
    });

    const evolutionData = Object.entries(evolutionMap)
        .map(([time, val]) => ({ time, val }))

        .sort((a, b) => a.time.localeCompare(b.time));

    // Top Cities (> 24h)
    const longRunningIncidents = incidents.filter(i => {
        try {
            const start = new Date(i.dataInicio).getTime();
            const now = new Date().getTime();
            return (now - start) > (24 * 60 * 60 * 1000); // > 24 hours
        } catch { return false; }
    });

    // Top Failures (Now Cities > 24h)
    const sintomaMap: Record<string, number> = {};
    longRunningIncidents.forEach(item => { // Use longRunningIncidents
        const key = item.cidade || 'N/A'; // Group by CITY instead of sintoma
        sintomaMap[key] = (sintomaMap[key] || 0) + 1;
    });

    const colors = ['#e0062e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];
    const techData = Object.entries(sintomaMap)
        .map(([name, count], index) => ({
            name,
            value: Math.round((count / total) * 100),
            color: colors[index % colors.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Top Cities & Matrix
    // Filter Pending/Novo incidents for Matrix
    const pendingIncidents = incidents.filter(i => {
        const status = i.acionado?.toLowerCase() || '';
        return status.includes('novo') || status.includes('pendente') || status.includes('open');
    });

    const cityMap: Record<string, { total: number; failures: Record<string, number> }> = {};
    const failureGlobalCount: Record<string, number> = {};

    pendingIncidents.forEach(item => { // Use pendingIncidents
        const city = item.cidade || 'N/A';
        const failure = item.sintomaOper || 'Outros'; // Use sintomaOper (nm_cat_oper2)

        if (!cityMap[city]) cityMap[city] = { total: 0, failures: {} };
        cityMap[city].total++;
        cityMap[city].failures[failure] = (cityMap[city].failures[failure] || 0) + 1;

        failureGlobalCount[failure] = (failureGlobalCount[failure] || 0) + 1;
    });

    // Top Categories (Columns)
    const topFailures = Object.entries(failureGlobalCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

    const topCities = Object.entries(cityMap)
        .map(([name, data]) => ({
            name,
            value: data.total,
            stats: topFailures.map(fail => ({
                name: fail,
                count: data.failures[fail] || 0,
                percent: Math.round(((data.failures[fail] || 0) / data.total) * 100)
            })),
            topFailure: Object.entries(data.failures).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);



    const cityMapOver24h: Record<string, { total: number; failures: Record<string, number> }> = {};
    longRunningIncidents.forEach(item => {
        const city = item.cidade || 'N/A';
        const failure = item.sintoma || 'Outros';
        if (!cityMapOver24h[city]) cityMapOver24h[city] = { total: 0, failures: {} };
        cityMapOver24h[city].total++;
        cityMapOver24h[city].failures[failure] = (cityMapOver24h[city].failures[failure] || 0) + 1;
    });

    const topCitiesOver24h = Object.entries(cityMapOver24h)
        .map(([name, data]) => ({
            name,
            value: data.total,
            stats: topFailures.map(fail => ({
                name: fail,
                count: data.failures[fail] || 0,
                percent: Math.round(((data.failures[fail] || 0) / data.total) * 100)
            })),
            topFailure: Object.entries(data.failures).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    return {
        total,
        pending,
        treated,
        efficiency,
        evolutionData,
        techData,
        topCities,
        topCitiesOver24h,
        outages: [],
        recentIncidents: [],
        availableMarkets: [],
        availableStatuses: []
    };
};

export const fetchNewMonitor = async () => {
    try {
        const response = await fetch('https://newmonitor.claro.com.br/json/outage.php');
        if (!response.ok) throw new Error('NewMonitor API error');
        return await response.json();
    } catch (e) {
        console.error('NewMonitor Fetch Error - Using Mock:', e);
        return [];
    }
};

export const fetchSGO = async (): Promise<SgoIncident[]> => {
    console.log('🔍 [SGO] Fetching mock data...');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_SGO_INCIDENTS;
};

export const fetchGponEvents = async (): Promise<GponEvent[]> => {
    try {
        const response = await fetch('dados_gpon.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('GitHub Raw API error');
        return await response.json();
    } catch (e) {
        console.error('GitHub Fetch Error:', e);
        return [];
    }
};
