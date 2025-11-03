-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  total_co2_saved NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create road_reports table
CREATE TABLE public.road_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  rain_level TEXT CHECK (rain_level IN ('low', 'moderate', 'high')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on road_reports
ALTER TABLE public.road_reports ENABLE ROW LEVEL SECURITY;

-- Road reports policies
CREATE POLICY "Anyone can view road reports"
  ON public.road_reports FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON public.road_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.road_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.road_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Create eco_stats table
CREATE TABLE public.eco_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  co2_saved NUMERIC NOT NULL,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on eco_stats
ALTER TABLE public.eco_stats ENABLE ROW LEVEL SECURITY;

-- Eco stats policies
CREATE POLICY "Users can view own eco stats"
  ON public.eco_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own eco stats"
  ON public.eco_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create eco_tips table
CREATE TABLE public.eco_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on eco_tips
ALTER TABLE public.eco_tips ENABLE ROW LEVEL SECURITY;

-- Eco tips policies
CREATE POLICY "Anyone can view eco tips"
  ON public.eco_tips FOR SELECT
  USING (true);

-- Insert some initial eco tips
INSERT INTO public.eco_tips (tip) VALUES
  ('Walking saves 2.3 kg CO₂ per km compared to driving!'),
  ('Public transport reduces your carbon footprint by 45%'),
  ('Carpooling can cut your commute emissions in half'),
  ('Biking is zero emission and great for your health'),
  ('Every avoided traffic jam saves fuel and reduces pollution'),
  ('Planning routes efficiently can reduce emissions by 20%');

-- Create function to update profiles updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();