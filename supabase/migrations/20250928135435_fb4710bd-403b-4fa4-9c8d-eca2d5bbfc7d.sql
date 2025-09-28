-- Fix RLS policies to allow unauthenticated system initialization
-- Drop existing conflicting policies first

DROP POLICY IF EXISTS "Allow system initialization of app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow system initialization of landing page settings" ON public.landing_page_settings;

-- Create better policies that allow initialization for any authenticated user when no settings exist
CREATE POLICY "Allow settings initialization when empty" 
ON public.app_settings 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if no admin settings exist yet (first time setup)
  NOT EXISTS (SELECT 1 FROM public.app_settings LIMIT 1)
  OR 
  -- Or if user is admin
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Allow landing page settings initialization when empty" 
ON public.landing_page_settings 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if no landing page settings exist yet (first time setup)
  NOT EXISTS (SELECT 1 FROM public.landing_page_settings LIMIT 1)
  OR 
  -- Or if user is admin
  has_role(auth.uid(), 'admin'::app_role)
);