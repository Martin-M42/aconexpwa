import { useStore } from '@/store/use-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

/**
 * @typedef Perfil
 * @property {string} nombre - The first name.
 * @property {string} apellido - The last name.
 * @property {number} cedula - The identification number.
 * @property {number} celular - The phone number.
 * @property {string} direccion - The address.
 * @property {string} email - The email address.
 * @property {string} nacimiento - The date of birth (in the format "DD/MM/YYYY").
 */

/**
 * @param {number} perfilId
 * @param {Partial<Perfil>} modifications
 */

const editProfile = async (perfilId, modifications, additionalHeaders) => {
	const endpoint = `/perfiles/${perfilId}`;
	const response = await api.patch(endpoint, modifications, additionalHeaders);
	return response.data;
};

/**
 * @param {object} obj
 * @param {Array<string>} obj.queryKeyToInvalidate
 */
export const useEditProfile = ({ queryKeyToInvalidate }) => {
	const queryClient = useQueryClient();
	const user = useStore((state) => state.user);
	const additionalHeaders = {
		headers: { Authorization: `Bearer ${user.token}` },
	};
	/**
	 * @param {Partial<Perfil> & {perfilId: number}} data
	 */
	const mutationFn = (data) => {
		const { perfilId, ...modifications } = data;
		return editProfile(perfilId, modifications, additionalHeaders);
	};

	return useMutation({
		mutationFn,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate }),
	});
};
