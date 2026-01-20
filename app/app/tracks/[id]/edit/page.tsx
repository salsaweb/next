'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Track {
  id: string
  title: string
  duration_ms: number
  duration_formatted: string
  bpm?: number
  track_number?: number
  spotify_id?: string
  created_at: string
  artist: {
    name: string
    spotify_id?: string
  }
  album: {
    title: string
    cover_url?: string
    release_date?: string
    spotify_id?: string
  }
}

export default function EditTrackPage() {
  const params = useParams()
  const router = useRouter()
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    bpm: '',
    artist_name: '',
    album_title: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchTrack(params.id as string)
    }
  }, [params.id])

  const fetchTrack = async (id: string) => {
    try {
      const response = await fetch(`/api/tracks/${id}`)
      if (!response.ok) throw new Error('Failed to fetch track')
      const trackData = await response.json()
      setTrack(trackData)
      setFormData({
        title: trackData.title,
        bpm: trackData.bpm?.toString() || '',
        artist_name: trackData.artist.name,
        album_title: trackData.album.title
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!track) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/tracks/${track.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          bpm: formData.bpm ? parseInt(formData.bpm) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update track')

      router.push(`/app/tracks/${track.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update track')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading track...</div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">Track not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/app/tracks/${track.id}`}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            ← Back to Track
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
            Edit Track
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-8">
              <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
                {track.album.cover_url ? (
                  <Image
                    src={track.album.cover_url}
                    alt={`${track.album.title} cover`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 002 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Track Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="artist" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Artist
                  </label>
                  <input
                    type="text"
                    id="artist"
                    value={formData.artist_name}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Artist cannot be changed (Spotify data)
                  </p>
                </div>

                <div>
                  <label htmlFor="album" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Album
                  </label>
                  <input
                    type="text"
                    id="album"
                    value={formData.album_title}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Album cannot be changed (Spotify data)
                  </p>
                </div>

                <div>
                  <label htmlFor="bpm" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    BPM
                  </label>
                  <input
                    type="number"
                    id="bpm"
                    value={formData.bpm}
                    onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
                    min="0"
                    max="300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <Link
                href={`/app/tracks/${track.id}`}
                className="px-4 py-2 border border-zinc-300 rounded-md text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
