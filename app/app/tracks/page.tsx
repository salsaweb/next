'use client'

import { useEffect, useState } from 'react'
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

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/tracks')
      if (!response.ok) throw new Error('Failed to fetch tracks')
      const data = await response.json()
      setTracks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return

    try {
      const response = await fetch(`/api/tracks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete track')

      setTracks(tracks.filter(track => track.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete track')
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setImporting(true)
    setImportMessage('')

    try {
      const response = await fetch('/api/tracks/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spotifyUrl: importUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setImportMessage('Track imported successfully!')
        setImportUrl('')
        setShowImport(false)
        fetchTracks() // Refresh the tracks list
      } else {
        setImportMessage(data.error || 'Failed to import track')
      }
    } catch (err) {
      setImportMessage('An error occurred while importing')
    } finally {
      setImporting(false)
    }
  }

  const formatDuration = (duration: string) => {
    // Assuming duration is in format "MM:SS" or similar
    return duration
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading tracks...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Music Tracks
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowImport(!showImport)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
            >
              {showImport ? 'Hide Import' : 'Import from Spotify'}
            </button>
            <Link
              href="/app"
              className="px-4 py-2 bg-zinc-600 text-white rounded-md hover:bg-zinc-500 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {showImport && (
          <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
              Import Track from Spotify
            </h2>
            <form onSubmit={handleImport} className="flex gap-4">
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Paste Spotify track URL or ID"
                className="flex-1 px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
                required
              />
              <button
                type="submit"
                disabled={importing}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 disabled:opacity-50 transition-colors"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </form>
            {importMessage && (
              <p className={`mt-2 text-sm ${importMessage.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {importMessage}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Cover
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Album
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    BPM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                {tracks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-zinc-500 dark:text-zinc-400">
                      No tracks found. Add some tracks to get started.
                    </td>
                  </tr>
                ) : (
                  tracks.map((track) => (
                    <tr key={track.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 relative rounded overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                          {track.album.cover_url ? (
                            <Image
                              src={track.album.cover_url}
                              alt={`${track.album.title} cover`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 002 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {track.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300">
                        {track.artist.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300">
                        {track.album.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300">
                        {track.duration_formatted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-300">
                        {track.bpm || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/app/tracks/${track.id}`}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(track.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
