
export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'inactive';
  avatar?: string;
  initials?: string;
  address?: string;
}

export interface Incident {
  id: string;
  title: string;
  location: string;
  time: string;
  status: 'pending' | 'resolved' | 'critical';
  type: 'massive' | 'degradation' | 'outage';
}

export interface ChartData {
  time: string;
  occurrences: number;
}

export interface GponEvent {
    id_mostra: number;
    nm_origem: string;
    nm_tipo: string;
    nm_status: string;
    dh_inicio: string;
    ds_sumario: string;
    nm_cidade: string;
    topologia: string;
    tp_topologia: string;
    nm_cat_prod2: string;
    nm_cat_prod3: string;
    nm_cat_oper2: string;
    nm_cat_oper3: string;
    regional: string;
    grupo: string;
    cluster: string;
    subcluster: string;
}
