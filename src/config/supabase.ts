import { createClient } from '@supabase/supabase-js';

// Substitua por variáveis de ambiente no seu ambiente de produção.
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nzepugdxycwzdyticxpr.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZXB1Z2R4eWN3emR5dGljeHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDgyNjQsImV4cCI6MjA4MDI4NDI2NH0.m9c8srIoIih9kL1ZVGXIsH-09sxLS1TSwj8cEeUUhEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const auth = supabase.auth;

export default supabase;
