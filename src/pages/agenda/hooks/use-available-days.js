import { useStore } from '@/store/use-store';
import { objectToQueryString } from '@/utils/objectToQueryString';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';

/**
 * @param {number} clinicaId
 * @param {Pick<import('../context/agenda.context').Filters, 'fechaDesde' | 'libres' | 'profesionalId'>} params
 * @param {object} additionalHeaders
 */
const getAvailableDaysInCurrentWeek = async (clinicaId, params, additionalHeaders) => {
	const stringifiedParams = objectToQueryString(params);
	const res = await api.get(`/turnos/ColorSemana/${clinicaId}${stringifiedParams}`, {
		headers: { ...additionalHeaders },
	});
	return res.data;
};

export const useAvailableDays = () => {
	const { id } = useStore((state) => state.clinic);
	const user = useStore((state) => state.user);
	const [searchParams] = useSearchParams();
	const additionalHeaders = {
		Authorization: `Bearer ${user.token}`,
	};
	const params = {
		fechaDesde: searchParams.get('fechaDesde') || dayjs().format('MM/DD/YY'),
		libres: Boolean(searchParams.get('libres')) || undefined,
		profesionalId: Number(searchParams.get('profesionalId')) || undefined,
	};

	return useQuery({
		queryFn: () => getAvailableDaysInCurrentWeek(id, params, additionalHeaders),
		queryKey: ['shifts', 'availableDays', params],
		keepPreviousData: true,
	});
};
