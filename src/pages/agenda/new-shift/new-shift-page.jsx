import { useCreatePatient } from '@/pages/patients/hooks/use-create-patient';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Alert from '@mui/material/Alert';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { Autocomplete, Form, TextInput } from '@/components/form';
import { usePatients } from '@/hooks/use-patients';
import { useEditShifts } from '../hooks/use-edit-shifts';

const opcionesPresentismo = [
	{ estado: 'Presente', color: '#63db8b' },
	{ estado: 'Atendido', color: '#6ad3ee' },
	{ estado: 'Ausento con aviso', color: '#d9e25d' },
	{ estado: 'Ausento sin aviso', color: '#ee1919' },
	{ estado: 'Confirmado', color: '#0f8519' },
	{ estado: 'Cancelado', color: '#000000' },
];

const handlePatientnullabledata = (nullabledata) => {
	if (nullabledata) {
		return `— ${nullabledata}`;
	} else {
		return ' ';
	}
};

const filter = createFilterOptions();
const opciones = (opt) => {
	if (typeof opt === 'string') {
		return opt;
	}
	if (opt.inputValue) {
		return opt.inputValue;
	}
	if (opt.perfil?.nombre != undefined) {
		return `${opt.perfil.nombre} ${opt.perfil.apellido} ${handlePatientnullabledata(
			opt.perfil.email
		)}`;
	}
};

export const Component = () => {
	const { mutate: createpatient, status: patientstatus } = useCreatePatient();
	const { data: patients, isLoading } = usePatients();
	const {
		state: { shift },
	} = useLocation();
	const editshiftmutation = useEditShifts();
	const navigate = useNavigate();
	const [cellphone, setCellphone] = useState(0);
	let flagobject = useRef(null); //flagobject
	let selectedoptions = useRef(opcionesPresentismo[1]);

	const handleCellphonechange = (data) => {
		setCellphone(data.target.value);
	};
	const handleOnChange = (selected) => {
		selectedoptions.current = selected;
	};
	const Isthesameobject = (data) => {
		if (flagobject.current === null) {
			return false;
		}

		if (typeof data != typeof flagobject.current) {
			return false;
		}

		if (typeof data === 'string') {
			if (data != flagobject.current) {
				return false;
			}
			return true;
		}

		if (data.inputValue && flagobject.current.inputValue) {
			if (data.inputValue != flagobject.current.inputValue) {
				return false;
			}
			return true;
		}

		if (data.id && flagobject.current.id) {
			if (data.id != flagobject.current.id) {
				return false;
			}
			return true;
		}

		if (data.title && flagobject.current.title) {
			if (data.title != flagobject.current.title) {
				return false;
			}
			return true;
		}

		return false;
	};

	const assignPatientToShift = (formdata) => {
		let datos = {};
		for (var key in formdata) {
			if (
				formdata[key] != '' &&
				key != 'patient' &&
				key != 'celular' &&
				formdata[key] != undefined &&
				formdata[key] != null
			) {
				datos = { [key]: formdata[key], ...datos };
			}
		}
		if (datos.presentismo) {
			datos.presentismo = datos.presentismo.estado;
		} else {
			datos.presentismo = ' ';
		}
		if (cellphone == undefined || cellphone < 0 || String(cellphone) === '') {
			delete datos.celular;
		} else {
			if (cellphone.toString() != '' && cellphone != 0) {
				let cell = cellphone;
				if (typeof cellphone === 'string') {
					cell = Number(cellphone);
				}
				datos = { celular: cell, ...datos };
			} else {
				setCellphone(null);
				datos = { celular: Number(cellphone), ...datos };
			}
		}

		if (formdata.patient.inputValue) {
			let pacienteobj = { nombre: formdata.patient.inputValue, apellido: ' ' };

			if (datos?.celular) {
				pacienteobj = { ...pacienteobj, celular: datos.celular };
			}

			createpatient(pacienteobj, {
				onSuccess: async (patientdata) => {
					datos = {
						shiftId: shift.id,
						profesionalId: shift.profesionalId,
						pacienteId: patientdata.data.data.id,
						...datos,
					};
					editshiftmutation.mutate(datos, {
						onSuccess: () => setTimeout(() => navigate(-1), 1_000),
					});
				},
			});
		} else {
			if (!formdata.patient.id && formdata.patient) {
				let pacienteobj = { nombre: formdata.patient, apellido: ' ' };

				if (datos?.celular) {
					pacienteobj = { ...pacienteobj, celular: datos.celular };
				}

				createpatient(pacienteobj, {
					onSuccess: async (patientdata) => {
						datos = {
							shiftId: shift.id,
							profesionalId: shift.profesionalId,
							pacienteId: patientdata.data.data.id,
							...datos,
						};
						editshiftmutation.mutate(datos, {
							onSuccess: () => setTimeout(() => navigate(-1), 1_000),
						});
					},
				});
			} else {
				datos = {
					shiftId: shift.id,
					profesionalId: shift.profesionalId,
					pacienteId: formdata.patient.id,
					...datos,
				};
				editshiftmutation.mutate(datos, { onSuccess: () => setTimeout(() => navigate(-1), 1_000) });
			}
		}
	};

	return (
		<>
			<Helmet>
				<title>Nuevo turno</title>
			</Helmet>
			<Container>
				<Typography variant="h3" component="h1">
					Nuevo turno
				</Typography>
				<Typography
					variant="h5"
					textTransform="capitalize"
					fontWeight="bold"
					component="p"
					sx={{ mb: 3, mt: 1 }}
				>
					{dayjs(shift.date).add(3, 'hour').format('MMMM DD | HH:mm')}
				</Typography>
				<Typography variant="h6" component="h2" sx={{ mb: 3 }}>
					Datos requeridos
				</Typography>
				<Form
					defaultValues={{ observacion: '', presentismo: null, patient: null }}
					onSubmit={assignPatientToShift}
				>
					<Stack spacing={4}>
						<Autocomplete
							name="patient"
							options={patients ?? []}
							loading={isLoading}
							loadingText="Cargando lista de pacientes..."
							filterOptions={(options, params) => {
								const filtered = filter(options, params);
								if (params.inputValue != '') {
									filtered.push({
										inputValue: params.inputValue,
										title: `Agregar "${params.inputValue}"`,
									});
								}

								return filtered;
							}}
							getOptionLabel={(opt) => {
								let boolflag = Isthesameobject(opt);
								if (typeof opt === 'string') {
									if (!boolflag) {
										flagobject.current = opt;
										setCellphone(0);
									}
									return opt;
								}
								if (opt.inputValue) {
									if (!boolflag) {
										flagobject.current = opt;
										setCellphone(0);
									}
									return opt.inputValue;
								}
								if (opt.perfil?.nombre != undefined) {
									if (opt.perfil?.celular != undefined && opt.perfil?.celular != null) {
										if (!boolflag) {
											flagobject.current = opt;
											setCellphone(opt.perfil.celular);
										}
									} else {
										if (!boolflag) {
											flagobject.current = opt;
											setCellphone(0);
										}
									}
									return `${opt.perfil.nombre} ${opt.perfil.apellido} - ${handlePatientnullabledata(
										opt.perfil?.email
									)}`;
								}
								if (!boolflag) {
									flagobject.current = opt;
									setCellphone(0);
								}
								return opt.title;
							}}
							inputProps={{
								variant: 'standard',
								label: 'Paciente',
								placeholder: 'Nombre del Paciente e email',
							}}
							selectOnFocus
							clearOnBlur
							handleHomeEndKeys
							renderOption={(props, option) => (
								<li {...props}>
									{typeof option.title === 'string' ? option.title : opciones(option)}
								</li>
							)}
							freeSolo
						/>

						<TextInput
							name="observacion"
							variant="standard"
							label="Observación"
							rules={{ required: false }}
						/>
						<Autocomplete
							name="presentismo"
							onChange={handleOnChange}
							options={opcionesPresentismo}
							getOptionLabel={(opt) => `${opt.estado}`}
							isOptionEqualToValue={(option, value) => option.estado === value.estado}
							renderOption={(props, option) => (
								<li {...props}>
									{<FiberManualRecordIcon sx={{ color: option.color }} />}
									{option.estado}
								</li>
							)}
							inputProps={{
								variant: 'standard',
								label: 'Presentismo',
							}}
							rules={{ required: false }}
						/>
						<TextInput
							name="celular"
							value={cellphone}
							onChange={handleCellphonechange}
							variant="standard"
							type="number"
							label="telefono/celular"
							rules={{ required: false }}
						/>
						<TextInput
							name="obraSocial"
							variant="standard"
							label="Obra Social"
							rules={{ required: false }}
						/>
						<Button type="submit" variant="contained" disabled={editshiftmutation.isLoading}>
							Asignar turno
							{editshiftmutation.isLoading && (
								<CircularProgress
									size={24}
									sx={{
										position: 'absolute',
										top: '50%',
										left: '50%',
										marginTop: '-12px',
										marginLeft: '-12px',
									}}
								/>
							)}
						</Button>
					</Stack>
				</Form>
				{patientstatus === 'loading' && <Alert severity="info">Cargando...</Alert>}

				{patientstatus === 'error' && (
					// @ts-ignore
					<Alert severity="error">Error al crear el paciente</Alert>
				)}

				{patientstatus === 'success' && (
					<Alert severity="success">Paciente creado con éxito.</Alert>
				)}

				{editshiftmutation.isError ? (
					<Alert severity="error">
						Error al crear Turno{' '}
						{
							//@ts-ignore
							editshiftmutation.error?.response?.data?.message
						}
					</Alert>
				) : (
					<div />
				)}
				<Collapse in={editshiftmutation.isSuccess}>
					<Alert severity="success" sx={{ mt: 2 }}>
						Turno asignado con éxito!
					</Alert>
				</Collapse>
			</Container>
		</>
	);
};
