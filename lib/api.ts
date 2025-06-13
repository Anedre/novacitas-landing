import axios from 'axios';

const BASE_URL = 'https://mbrn706o5j.execute-api.us-east-1.amazonaws.com/Prod';

export const fetchCitas = async (doctorId: string) => {
  const res = await axios.get(`${BASE_URL}/NovaCalendario-CreateAppointment`, {
    params: { doctorId }
  });
  return res.data;
};

export const crearCita = async (data: any) => {
  const res = await axios.post(`${BASE_URL}/NovaCalendario-CreateAppointment`, data);
  return res.data;
};
