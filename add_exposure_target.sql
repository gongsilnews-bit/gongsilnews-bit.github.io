ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS exposure_target text NOT NULL DEFAULT 'all' CHECK (exposure_target IN ('all', 'realtor_only'));
