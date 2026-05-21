import axiosInstance from './axiosInstance';
import axios from 'axios';

/**
 * Kiểm tra Backend API có đang chạy không
 * Gọi /health — được proxy bởi Vite tới http://localhost:3001/health
 * @returns {{ status, message, timestamp, database, environment }}
 */
export const checkHealth = () =>
  axios.get('/health').then((res) => res.data);

/**
 * Ping test route — /api/v1/ping
 * @returns {{ message, timestamp }}
 */
export const ping = () => axiosInstance.get('/ping');

