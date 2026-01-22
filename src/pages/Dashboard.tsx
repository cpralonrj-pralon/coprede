import React from 'react';
import { DashboardController } from '../modules/dashboard/DashboardController';

interface DashboardProps {
  onOpenIncident?: () => void;
  session?: any;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  return <DashboardController />;
};
