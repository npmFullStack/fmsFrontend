// hooks/useDashboard.js
import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useDashboard = () => {
  const fetchDashboardData = async () => {
    const { data } = await api.get('/dashboard-data');
    return data;
  };

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};