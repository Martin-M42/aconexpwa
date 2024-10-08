import { useStore } from '@/store/use-store';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { RightDrawer } from '@/components/drawers';
import { DatePicker, Form, TextInput } from '@/components/form';
import { api } from '@/services/api';
import { useProfessionalsContext } from '../../context/professionals.context';

const Mnjeditprof = ({ status, currentStatus }) => {
	if (status.isLoading) {
		return (
			<Stack direction="row" alignItems="center" spacing={1}>
				<CircularProgress /> <p>Cargando...</p>
			</Stack>
		);
	}
	if (currentStatus === 'success') {
		return <Alert severity="success">Profesional editado con exito!</Alert>;
	}
	if (status.isError) {
		const errormensaje = status.error.response.data.message;
		return <Alert severity="error">Error al editar profesional: {errormensaje}</Alert>;
	}
};

async function editprofiledata(data) {
	const idstring = data[0].toString();
	const urldata = '/perfiles/' + idstring;
	const response = await api.patch(urldata, data[1], data[2]);
	return response;
}

const cuttimezone = (vigencia) => {
	//Recorta la zona horaria de la fecha de forma tal que dayjs no la modifique
	if (vigencia) {
		const tam1 = vigencia.length - 2;
		const fecha1 = vigencia.slice(0, tam1);

		return fecha1;
	}
	return null;
};

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 */

export const EditProfessionalData = ({ open, onClose }) => {
	const [currentStatus, setCurrentStatus] = useState('idle');

	useEffect(() => {
		if (currentStatus === 'success') {
			const timer = setTimeout(() => {
				setCurrentStatus('idle');
				onClose();
			}, 2000);
			return () => clearInterval(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStatus]);

	const { professionalInView } = useProfessionalsContext();
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: editprofiledata,
		onSuccess: () => {
			setCurrentStatus('success');
			queryClient.invalidateQueries({ queryKey: ['professionals'] });
		},
	});
	const user = useStore((state) => state.user);
	const additionalHeaders = {
		Authorization: `Bearer ${user.token}`,
	};
	const handleSubmit = (ev) => {
		let datos = {};
		for (let key in ev) {
			if (ev[key] && ev[key] != null && ev[key] != '') {
				if (key != 'nacimiento') {
					datos = { [key]: ev[key], ...datos };
				} else {
					if (dayjs(ev[key]).isValid()) {
						const birthday = ev.nacimiento.format('MM/DD/YYYY');
						datos = { [key]: birthday, ...datos };
					}
				}
			}
		}

		const dataperfil = [professionalInView.perfil.id, datos, { headers: { ...additionalHeaders } }];
		mutation.mutate(dataperfil);
	};

	return (
		<RightDrawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: 1201 }}>
			<Typography variant="h4" component="h2">
				Información personal
			</Typography>
			<Typography variant="h6" component="p" sx={{ mt: 1, mb: 3 }}>
				{professionalInView?.perfil.nombre} {professionalInView?.perfil.apellido} -{' '}
				{professionalInView?.perfil.cedula}
			</Typography>
			<Form
				onSubmit={handleSubmit}
				defaultValues={{
					nombre: professionalInView?.perfil.nombre,
					apellido: professionalInView?.perfil.apellido,
					cedula: professionalInView?.perfil.cedula,
					celular: professionalInView?.perfil.celular,
					direccion: professionalInView?.perfil.direccion,
					email: professionalInView?.perfil.email,
					nacimiento: dayjs(cuttimezone(professionalInView?.perfil.nacimiento)),
				}}
			>
				<Stack spacing={3}>
					<TextInput name="nombre" label="Nombre" />
					<TextInput name="apellido" label="Apellido" rules={{ required: false }} />
					<TextInput name="cedula" label="Número de DNI o Pasaporte" rules={{ required: false }} />
					<TextInput name="celular" label="Celular" rules={{ required: false }} />
					<TextInput name="direccion" label="Dirección" rules={{ required: false }} />
					<TextInput name="email" label="Correo electrónico" rules={{ required: false }} />
					<DatePicker
						name="nacimiento"
						label="Fecha de nacimiento"
						slotProps={{ textField: { variant: 'standard' } }}
						disableFuture
						format="DD/MM/YYYY"
						rules={{ required: false }}
					/>
					<Button type="submit" variant="contained">
						Guardar
					</Button>
				</Stack>
			</Form>
			<Container sx={{ mt: 2, mb: 1 }}>
				<Mnjeditprof status={mutation} currentStatus={currentStatus} />
			</Container>
		</RightDrawer>
	);
};
