// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/docs', // ajuste para o endereço da sua API
});

export default api;