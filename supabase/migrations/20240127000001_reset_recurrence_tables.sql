-- Migration to reset (truncate) Recurrence Tables
-- Run this to clear all data before re-uploading

TRUNCATE TABLE public.reincidencia_abrangencia, public.reincidencia_incidentes CASCADE;
