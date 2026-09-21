import { config } from '../config/config.js';
export function getAdminSession(){return sessionStorage.getItem(config.sessionStorageKey);}
export function setAdminSession(token){if(!token)throw new Error('A KTMS administrator session token is required.');sessionStorage.setItem(config.sessionStorageKey,token);}
export function clearAdminSession(){sessionStorage.removeItem(config.sessionStorageKey);}
export function hasAdminSession(){return Boolean(getAdminSession());}