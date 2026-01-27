-- 1. Create Alerts Table
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL, -- 'NODE', 'CITY', 'REGION'
    target_name TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    metric_value FLOAT, -- The calculated trend slope or count
    message TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_anomaly_status ON public.anomaly_alerts(status);
CREATE INDEX IF NOT EXISTS idx_anomaly_target ON public.anomaly_alerts(target_name);

-- 2. Watchdog Function (Linear Regression on Daily Incidents)
CREATE OR REPLACE FUNCTION public.detect_anomalies()
RETURNS void AS $$
DECLARE
    r RECORD;
    v_slope FLOAT;
    v_threshold FLOAT := 0.5; -- Sensitivity threshold (e.g., +0.5 incidents/day increase)
BEGIN
    -- Temporary table to aggregate daily counts per Node (Last 14 days)
    CREATE TEMP TABLE tmp_daily_counts AS
    SELECT 
        topologia as node_name,
        DATE_TRUNC('day', dh_inicio) as day_date,
        COUNT(*) as incident_count,
        EXTRACT(EPOCH FROM DATE_TRUNC('day', dh_inicio)) as x_val -- X for regression
    FROM public.coprede_master_incidents
    WHERE dh_inicio >= NOW() - INTERVAL '14 days'
      AND topologia IS NOT NULL
      AND nm_status NOT ILIKE '%FECHADO%' -- Only analyze active/recent trends
    GROUP BY topologia, DATE_TRUNC('day', dh_inicio);

    -- Loop through nodes with enough data points (e.g. at least 5 days of activity)
    FOR r IN 
        SELECT node_name
        FROM tmp_daily_counts
        GROUP BY node_name
        HAVING COUNT(*) >= 5
    LOOP
        -- Calculate Slope (regr_slope(y, x))
        SELECT regr_slope(incident_count, x_val) * 86400 -- Convert slope back to "per day" unit
        INTO v_slope
        FROM tmp_daily_counts
        WHERE node_name = r.node_name;

        -- Check Threshold
        IF v_slope > v_threshold THEN
            -- Insert Alert if not recently detected (avoid spam)
            INSERT INTO public.anomaly_alerts (target_type, target_name, severity, metric_value, message)
            SELECT 
                'NODE', 
                r.node_name, 
                CASE WHEN v_slope > 2.0 THEN 'HIGH' ELSE 'MEDIUM' END,
                ROUND(v_slope::numeric, 2),
                'Degradação de sinal detectada: +' || ROUND(v_slope::numeric, 2) || ' inc/dia'
            WHERE NOT EXISTS (
                SELECT 1 FROM public.anomaly_alerts 
                WHERE target_name = r.node_name 
                  AND status = 'ACTIVE'
                  AND detected_at > NOW() - INTERVAL '24 hours'
            );
        END IF;
    END LOOP;

    -- Cleanup
    DROP TABLE tmp_daily_counts;
END;
$$ LANGUAGE plpgsql;

-- 3. RLS Policies
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'anomaly_alerts' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON public.anomaly_alerts FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'anomaly_alerts' AND policyname = 'Enable update for authenticated') THEN
         CREATE POLICY "Enable update for authenticated" ON public.anomaly_alerts FOR UPDATE USING (true);
    END IF;
     
    -- Allow function/admin to insert
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'anomaly_alerts' AND policyname = 'Enable insert for authenticated and anon') THEN
        CREATE POLICY "Enable insert for authenticated and anon" ON public.anomaly_alerts FOR INSERT WITH CHECK (true);
    END IF;
END $$;
