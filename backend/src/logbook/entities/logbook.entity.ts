export interface LogbookEntry {
    id?: string;
    titulo: string;
    data: string; // formato: YYYY-MM-DD
    horario: string; // formato: HH:MM:SS
    categoria: string;
    descricao: string;
    impacto?: string;
    status?: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
}
