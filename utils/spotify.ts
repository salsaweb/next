interface SpotifyTrack {
  id: string
  name: string
  duration_ms: number
  track_number: number
  external_urls: {
    spotify: string
  }
  album: {
    id: string
    name: string
    images: Array<{
      url: string
      height: number
      width: number
    }>
    release_date: string
  }
  artists: Array<{
    id: string
    name: string
  }>
}

interface SpotifyAlbum {
  id: string
  name: string
  images: Array<{
    url: string
    height: number
    width: number
  }>
  release_date: string
  artists: Array<{
    id: string
    name: string
  }>
}

interface SpotifyArtist {
  id: string
  name: string
}

class SpotifyAPI {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID!
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get Spotify access token')
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 minute early
    return data.access_token
  }

  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search Spotify tracks')
    }

    const data = await response.json()
    return data.tracks.items
  }

  async getTrack(trackId: string): Promise<SpotifyTrack> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Spotify track')
    }

    return response.json()
  }

  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Spotify album')
    }

    return response.json()
  }

  async getArtist(artistId: string): Promise<SpotifyArtist> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Spotify artist')
    }

    return response.json()
  }
}

export const spotifyAPI = new SpotifyAPI()
export type { SpotifyTrack, SpotifyAlbum, SpotifyArtist }
