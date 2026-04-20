import { DashboardSummaryDTO } from 'shared';
import { API_BASE_URL } from '../config/api';

export const fetchDashboardSummary = async (): Promise<DashboardSummaryDTO> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard metrics');
  }
  
  return res.json();
};
