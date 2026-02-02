-- Migration: Create Diario de Bordo (Logbook) table
-- Description: Table to track operational incidents that impact team work
-- Examples: System slowness, tool failures, service unavailability, etc.

-- Create the diario_bordo table
CREATE TABLE IF NOT EXISTS public.diario_bordo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    impacto TEXT,
    status VARCHAR(50) DEFAULT 'Aberto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_diario_bordo_data ON public.diario_bordo(data DESC);
CREATE INDEX idx_diario_bordo_categoria ON public.diario_bordo(categoria);
CREATE INDEX idx_diario_bordo_status ON public.diario_bordo(status);
CREATE INDEX idx_diario_bordo_created_by ON public.diario_bordo(created_by);

-- Enable Row Level Security
ALTER TABLE public.diario_bordo ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to read all records
CREATE POLICY "Allow authenticated users to read diario_bordo"
    ON public.diario_bordo
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert records
CREATE POLICY "Allow authenticated users to insert diario_bordo"
    ON public.diario_bordo
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own records
CREATE POLICY "Allow users to update own diario_bordo"
    ON public.diario_bordo
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Allow users to delete their own records
CREATE POLICY "Allow users to delete own diario_bordo"
    ON public.diario_bordo
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_diario_bordo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_diario_bordo_updated_at
    BEFORE UPDATE ON public.diario_bordo
    FOR EACH ROW
    EXECUTE FUNCTION update_diario_bordo_updated_at();

-- Grant permissions
GRANT ALL ON public.diario_bordo TO authenticated;
GRANT ALL ON public.diario_bordo TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.diario_bordo IS 'Operational incidents logbook - tracks issues that impact team operations';
COMMENT ON COLUMN public.diario_bordo.titulo IS 'Short title/summary of the incident';
COMMENT ON COLUMN public.diario_bordo.data IS 'Date when the incident occurred';
COMMENT ON COLUMN public.diario_bordo.horario IS 'Time when the incident occurred';
COMMENT ON COLUMN public.diario_bordo.categoria IS 'Category of the incident (SGO, Sistema, Rede, Ferramentas, etc.)';
COMMENT ON COLUMN public.diario_bordo.descricao IS 'Detailed description of the problem';
COMMENT ON COLUMN public.diario_bordo.impacto IS 'Impact on operations';
COMMENT ON COLUMN public.diario_bordo.status IS 'Current status (Aberto, Em Análise, Resolvido)';
