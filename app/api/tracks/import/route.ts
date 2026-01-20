import { createClient } from '@/utils/supabase/server'
import { spotifyAPI } from '@/utils/spotify'
import { NextRequest, NextResponse } from 'next/server'

function extractSpotifyId(urlOrId: string): string | null {
  // Handle Spotify URLs
  const urlMatch = urlOrId.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
  if (urlMatch) return urlMatch[1]

  // Handle direct IDs (22 characters, alphanumeric)
  if (/^[a-zA-Z0-9]{22}$/.test(urlOrId)) return urlOrId

  return null
}

export async function POST(request: NextRequest) {
  try {
    const { spotifyUrl } = await request.json()

    if (!spotifyUrl) {
      return NextResponse.json({ error: 'Spotify URL or ID is required' }, { status: 400 })
    }

    const spotifyId = extractSpotifyId(spotifyUrl)
    if (!spotifyId) {
      return NextResponse.json({ error: 'Invalid Spotify URL or ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if track already exists
    const { data: existingTrack } = await supabase
      .from('tracks')
      .select('id')
      .eq('spotify_id', spotifyId)
      .single()

    if (existingTrack) {
      return NextResponse.json({
        error: 'Track already exists in database',
        trackId: existingTrack.id
      }, { status: 409 })
    }

    // Fetch track data from Spotify
    const spotifyTrack = await spotifyAPI.getTrack(spotifyId)

    // Get or create artist
    let artistId: string
    const primaryArtist = spotifyTrack.artists[0]

    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id')
      .eq('spotify_id', primaryArtist.id)
      .single()

    if (existingArtist) {
      artistId = existingArtist.id
    } else {
      // Create new artist
      const { data: newArtist, error: artistError } = await supabase
        .from('artists')
        .insert({
          name: primaryArtist.name,
          spotify_id: primaryArtist.id,
        })
        .select('id')
        .single()

      if (artistError) throw artistError
      artistId = newArtist.id
    }

    // Get or create album
    let albumId: string
    const { data: existingAlbum } = await supabase
      .from('albums')
      .select('id')
      .eq('spotify_id', spotifyTrack.album.id)
      .single()

    if (existingAlbum) {
      albumId = existingAlbum.id
    } else {
      // Create new album
      const coverUrl = spotifyTrack.album.images?.[0]?.url || null

      const { data: newAlbum, error: albumError } = await supabase
        .from('albums')
        .insert({
          title: spotifyTrack.album.name,
          artist_id: artistId,
          spotify_id: spotifyTrack.album.id,
          cover_url: coverUrl,
          release_date: spotifyTrack.album.release_date,
        })
        .select('id')
        .single()

      if (albumError) throw albumError
      albumId = newAlbum.id
    }

    // Create track
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .insert({
        title: spotifyTrack.name,
        artist_id: artistId,
        album_id: albumId,
        duration_ms: spotifyTrack.duration_ms,
        track_number: spotifyTrack.track_number,
        spotify_id: spotifyId,
        spotify_data: spotifyTrack,
      })
      .select(`
        *,
        artist:artists(name, spotify_id),
        album:albums(title, cover_url, release_date, spotify_id)
      `)
      .single()

    if (trackError) throw trackError

    return NextResponse.json(track, { status: 201 })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to import track'
    }, { status: 500 })
  }
}
