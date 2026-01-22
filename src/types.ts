export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  name?: string;
}

export interface Incident {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'investigating';
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
}

export type ApiIncident = Incident; // Alias for compatibility

export interface GponEvent {
  id_mostra?: number;
  nm_tipo?: string;
  nm_status?: string;
  dh_inicio?: string;
  ds_sumario?: string;
  nm_cidade?: string;
  nm_origem?: string;
  nm_cat_prod3?: string;
  nm_cat_prod2?: string;
  nm_cat_oper2?: string;
  regional?: string;
  grupo?: string;
  cluster?: string;
  subcluster?: string;
}

// Mirrors the Supabase 'incidents' table
export interface OperationalIncident {
  id: string;
  id_mostra: string;
  nm_origem: string;

  nm_tipo: string;
  nm_status: string;
  dh_inicio: string;
  ds_sumario: string;

  nm_cidade: string;
  topologia?: string;
  tp_topologia?: string;

  nm_cat_prod2?: string;
  nm_cat_prod3?: string;
  nm_cat_oper2?: string;
  nm_cat_oper3?: string;

  regional: string;
  grupo: string;
  cluster: string;
  subcluster: string;

  created_at: string;
  updated_at: string;
}
