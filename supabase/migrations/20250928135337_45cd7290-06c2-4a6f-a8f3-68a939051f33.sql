-- Allow system to initialize default settings for app_settings and landing_page_settings
-- This policy allows inserting default settings when no admin exists yet

-- For app_settings table
CREATE POLICY "Allow system initialization of app settings" 
ON public.app_settings 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if no settings exist yet (first time initialization)
  NOT EXISTS (SELECT 1 FROM public.app_settings LIMIT 1)
  OR 
  -- Or if user is admin
  has_role(auth.uid(), 'admin'::app_role)
);

-- For landing_page_settings table  
CREATE POLICY "Allow system initialization of landing page settings" 
ON public.landing_page_settings 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if no settings exist yet (first time initialization)
  NOT EXISTS (SELECT 1 FROM public.landing_page_settings LIMIT 1)
  OR 
  -- Or if user is admin
  has_role(auth.uid(), 'admin'::app_role)
);