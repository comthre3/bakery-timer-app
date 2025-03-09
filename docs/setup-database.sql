-- Run this script in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  flour_total DECIMAL NOT NULL,
  hydration DECIMAL NOT NULL,
  timeline JSONB NOT NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dough_batches table (without foreign key for now to simplify)
CREATE TABLE IF NOT EXISTS public.dough_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_stage TEXT,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'failed')),
  color_code TEXT,
  notes TEXT,
  scale_factor DECIMAL DEFAULT 1.0,
  expected_yield INTEGER,
  temperature_logs JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create process_stages table (without foreign key for now to simplify)
CREATE TABLE IF NOT EXISTS public.process_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID,
  stage_name TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  temperature DECIMAL,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS recipes_created_by_idx ON public.recipes(created_by);
CREATE INDEX IF NOT EXISTS dough_batches_recipe_id_idx ON public.dough_batches(recipe_id);
CREATE INDEX IF NOT EXISTS dough_batches_status_idx ON public.dough_batches(status);
CREATE INDEX IF NOT EXISTS process_stages_batch_id_idx ON public.process_stages(batch_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dough_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_stages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow access
CREATE POLICY "Allow all users to SELECT recipes"
  ON public.recipes FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to INSERT their own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow all users to SELECT dough_batches"
  ON public.dough_batches FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to INSERT their own dough_batches"
  ON public.dough_batches FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow all users to UPDATE dough_batches"
  ON public.dough_batches FOR UPDATE
  USING (true);

CREATE POLICY "Allow all users to SELECT process_stages"
  ON public.process_stages FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to INSERT process_stages"
  ON public.process_stages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to UPDATE process_stages"
  ON public.process_stages FOR UPDATE
  USING (true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at column
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dough_batches_updated_at
BEFORE UPDATE ON public.dough_batches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_stages_updated_at
BEFORE UPDATE ON public.process_stages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();