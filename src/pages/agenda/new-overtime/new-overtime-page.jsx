import { useCreatePatient } from '@/pages/patients/hooks/use-create-patient';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Alert from '@mui/material/Alert';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
//import { useShifts } from '../hooks/use-shifts';
//import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { Autocomplete, DatePicker, Form, TextInput, TimePicker } from '@/components/form';
import { TextInputMinute } from '@/components/form/text-input-minute';
import { usePatients } from '@/hooks/use-patients';
import { useProfessionals } from '@/hooks/use-professionals';
import { useNewShift } from '../hooks/use-new-shift';

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
	const {
		state: { shift },
	} = useLocation();
	/* const shiftDate = dayjs.utc(shift.date); */
	/* const { data: allDayShifts } = useShifts({
		fechaDesde: shiftDate.format('MM/DD/YY'),
		fechaHasta: shiftDate.format('MM/DD/YY'),
	}); */
	const { mutate: createpatient, status: patientstatus } = useCreatePatient();
	const { data: patients } = usePatients();
	const { data: professionals } = useProfessionals();
	const { mutate, isSuccess, error } = useNewShift();
	const navigate = useNavigate();
	const [cellphone, setCellphone] = useState(0);
	let selectedoptions = useRef(opcionesPresentismo[1]);
	let flagobject = useRef(null); //flagobject
	/* const [minuteTimer, setMinuteTimer] = useState('');

	const handleChange = (event) => {
		const value = event.target.value;
		if (/^\d*$/.test(value) && Number(value) >= 0 && Number(value) <= 59) {
			setMinuteTimer(value);
		}
	}; */
	/* const unavailableMinutes = allDayShifts?.reduce((array, currentShift) => {
		const date = dayjs.utc(currentShift.date);
		if (date.hour() === shiftDate.hour()) {
			array.push(dayjs(currentShift.date).minute());
		}
		return array;
	}, []); */

	const handleOnChangepresentismo = (selected) => {
		selectedoptions.current = selected;
	};

	const handleCellphonechange = (data) => {
		setCellphone(data.target.value);
	};

	const Isthesameobject = (data) => {
		//due to an autocomplete malfunction where the input overwrites
		// default data on every Render on the input hook
		//ive created this piece of code that veryfies if the object
		//changed so the input can be modifiable
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

	const handleSubmit = (formdata) => {
		let minuteAct = null;
		if (formdata.minute) {
			minuteAct = dayjs().minute(Number(formdata.minute));
		}
		const hour = dayjs(formdata.hour);
		const minute = dayjs(minuteAct);
		const date = dayjs.utc(formdata.date).set('hour', hour.hour()).set('minute', minute.minute());

		if (formdata.celular) {
			formdata.celular = Number(formdata.celular);
		} else {
			formdata.celular = 0;
		}

		let datos = {};
		for (var key in formdata) {
			if (formdata[key] != '' && (key === 'observacion' || key === 'obraSocial')) {
				datos = { [key]: formdata[key], ...datos };
			}
		}

		if (datos.presentismo) {
			datos.presentismo = datos.presentismo.estado;
		} else {
			datos.presentismo = ' ';
		}

		if (cellphone != null) {
			if (cellphone.toString() != '' && cellphone != 0) {
				let cell = cellphone;
				if (typeof cellphone === 'string') {
					cell = Number(cellphone);
				}
				datos = { celular: cell, ...datos };
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
						profesionalId: formdata.profesional.id,
						pacienteId: patientdata.data.data.id,
						date: date.toISOString(),
						...datos,
					};
					mutate(datos, { onSuccess: () => setTimeout(() => navigate(-1), 4_000) });
				},
			});
		} else {
			datos = {
				profesionalId: formdata.profesional.id,
				pacienteId: formdata.patient.id,
				date: date.toISOString(),
				...datos,
			};
			mutate(datos, { onSuccess: () => setTimeout(() => navigate(-1), 4_000) });
		}
	};

	return (
		<>
			<Helmet>
				<title>Nuevo sobreturno</title>
			</Helmet>
			<Container>
				<Typography variant="h3" component="h1" sx={{ mb: 3 }}>
					Nuevo sobreturno
				</Typography>
				<Typography variant="h6" component="h2" sx={{ mb: 3 }}>
					Datos requeridos
				</Typography>
				<Form
					defaultValues={{
						observacion: '',
						presentismo: null,
						patient: null,
						date: dayjs.utc(shift.date),
						hour: dayjs.utc(shift.date),
						minute: '',
						profesional: null,
						obraSocial: '',
					}}
					onSubmit={handleSubmit}
				>
					<Stack spacing={4}>
						<Stack direction="row" spacing={4}>
							<DatePicker
								name="date"
								slotProps={{
									textField: { variant: 'standard', label: 'Fecha' },
									inputAdornment: { style: { display: 'none' } },
								}}
								format="DD/MM/YYYY"
								readOnly
								sx={{ flex: '1' }}
							/>
							<TimePicker
								name="hour"
								slotProps={{
									textField: { variant: 'standard', label: 'Hora del turno' },
									inputAdornment: { style: { display: 'none' } },
								}}
								readOnly
								views={['hours']}
								view="hours"
							/>
							{/* <TimePicker
								name="minute"
								slotProps={{ textField: { variant: 'standard', label: 'Minutos del turno' } }}
								minutesStep={1}
								views={['minutes']}
								view="minutes"
								shouldDisableTime={(value, view) => {
									return view === 'minutes' && unavailableMinutes.includes(value.minute());
								}}
							/> */}
							{/* <TextField
								name="minute"
								label="Minutos del turno"
								variant="standard"
								value={minuteTimer}
								onChange={handleChange}
								inputProps={{
									inputMode: 'numeric',
									pattern: '[0-9]*',
									maxLength: 2,
								}}
							/> */}
							<TextInputMinute name="minute" label="Minutos del turno" variant="standard" />
						</Stack>
						<Autocomplete
							name="patient"
							options={patients ?? []}
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
									return `${opt.perfil.nombre} ${opt.perfil.apellido} — ${handlePatientnullabledata(
										opt.perfil.email
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
						<Autocomplete
							name="profesional"
							options={professionals ?? []}
							getOptionLabel={(opt) =>
								`${opt.perfil.nombre} ${opt.perfil.apellido} — ${opt.perfil.email}`
							}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							inputProps={{
								variant: 'standard',
								label: 'Profesional',
								placeholder: 'Nombre del Paciente e email',
							}}
						/>

						<TextInput
							name="observacion"
							variant="standard"
							label="Observación"
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
						<Autocomplete
							name="presentismo"
							onChange={handleOnChangepresentismo}
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
							name="obraSocial"
							variant="standard"
							label="Obra Social"
							rules={{ required: false }}
						/>
						<Button type="submit" variant="contained">
							Crear sobreturno
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
				<Collapse in={isSuccess}>
					<Alert severity="success" sx={{ mt: 2 }}>
						Sobreturno creado con éxito!
					</Alert>
				</Collapse>
				<Collapse in={Boolean(error)}>
					<Alert severity="error" sx={{ mt: 2 }}>
						{/* @ts-ignore */}
						Hubo un problema creando el sobreturno: {error?.response.data.message}
					</Alert>
				</Collapse>
			</Container>
		</>
	);
};
