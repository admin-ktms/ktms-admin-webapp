import { supabase } from '../lib/supabase.js';
import { clearAdminSession, getAdminSession, setAdminSession } from './session.js';

export const auth = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  getAdminSession,

  setAdminSession,

  async signOut() {
    clearAdminSession();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
