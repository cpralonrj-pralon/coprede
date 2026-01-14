
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
