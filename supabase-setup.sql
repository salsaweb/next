-- Run this SQL in your Supabase SQL editor to create the updated database schema

-- Create artists table
CREATE TABLE artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  spotify_id TEXT UNIQUE,
  spotify_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create albums table
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  release_date DATE,
  cover_url TEXT,
  spotify_id TEXT UNIQUE,
  spotify_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(title, artist_id)
);

-- Create tracks table with relations
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  duration_ms INTEGER NOT NULL, -- Duration in milliseconds
  bpm INTEGER,
  track_number INTEGER,
  spotify_id TEXT UNIQUE,
  spotify_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Artists policies
CREATE POLICY "Users can view all artists" ON artists
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert artists" ON artists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update artists" ON artists
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Albums policies
CREATE POLICY "Users can view all albums" ON albums
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert albums" ON albums
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update albums" ON albums
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Tracks policies
CREATE POLICY "Users can view all tracks" ON tracks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert tracks" ON tracks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update tracks" ON tracks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete tracks" ON tracks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_album_id ON tracks(album_id);
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_artists_spotify_id ON artists(spotify_id);
CREATE INDEX idx_albums_spotify_id ON albums(spotify_id);
CREATE INDEX idx_tracks_spotify_id ON tracks(spotify_id);
