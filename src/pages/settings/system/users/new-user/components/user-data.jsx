// @ts-nocheck
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import { Form, TextInput } from '@/components/form';
import { useCreateUser } from '../../../hooks/use-create-user';
import { useNewUser } from '../context/new-user.context';

export const UserData = () => {
	const { view, newUser } = useNewUser();
	const { mutate, status, error } = useCreateUser();

	const handleSubmit = ({ username, password }) => {
		mutate({ username, password, ...newUser });
	};

	return (
		<Slide direction="left" in={view === 'USER_DATA'} timeout={450} mountOnEnter>
			<Box sx={{ width: view === 'USER_DATA' ? '100%' : 0 }}>
				<Fade in={view === 'USER_DATA'} appear={false} timeout={200}>
					<Form
						onSubmit={handleSubmit}
						defaultValues={{
							username: '',
							password: '',
						}}
					>
						<Stack gap={4}>
							<TextInput fullWidth name="username" label="Nombre de usuario" />
							<TextInput fullWidth name="password" label="Contraseña" type="password" />
							<Button variant="contained" type="submit">
								Completar
							</Button>
						</Stack>
					</Form>
				</Fade>
				{status === 'loading' && <CircularProgress />}
				{status === 'error' && (
					// @ts-ignore
					<Alert severity="error">
						Error al crear el usuario: {error?.response?.data?.message}
					</Alert>
				)}
				{status === 'success' && (
					<Stack spacing={3} sx={{ my: 4, justifyContent: 'start' }}>
						<Alert severity="success">Usuario creado con éxito.</Alert>
						<Button variant="contained" href="../" sx={{ width: 'max-content' }}>
							Volver
						</Button>
					</Stack>
				)}
			</Box>
		</Slide>
	);
};
