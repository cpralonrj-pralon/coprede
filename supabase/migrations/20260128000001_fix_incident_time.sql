-- Force update for incident INM00001493395 which has wrong timezone (13:48 UTC instead of 16:48 UTC)
UPDATE incidents 
SET dh_inicio = '2026-01-28 16:48:05+00' 
WHERE id_mostra = 'INM00001493395';
