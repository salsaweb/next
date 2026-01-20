import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Track {
  id: string
  title: string
  duration_ms: number
  bpm?: number
  track_number?: number
  spotify_id?: string
  created_at: string
  artist: {
    name: string
    spotify_id?: string
    spotify_data?: unknown
  }
  album: {
    title: string
    cover_url?: string
    release_date?: string
    spotify_id?: string
    spotify_data?: unknown
  }
}

async function getTrack(id: string): Promise<Track | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        *,
        artist:artists(name, spotify_id, spotify_data),
        album:albums(title, cover_url, release_date, spotify_id, spotify_data)
      `)
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const track = await getTrack(id)

  if (!track) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/app/tracks"
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            ← Back to Tracks
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 p-8">
              <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                {track.album.cover_url ? (
                  <Image
                    src={track.album.cover_url}
                    alt={`${track.album.title} cover`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 002 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3 p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {track.title}
                  </h1>
                  <p className="text-xl text-zinc-600 dark:text-zinc-300 mt-2">
                    by {track.artist.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Album
                    </h3>
                    <p className="mt-1 text-lg text-zinc-900 dark:text-zinc-100">
                      {track.album.title}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Duration
                    </h3>
                    <p className="mt-1 text-lg text-zinc-900 dark:text-zinc-100">
                      {track.duration_ms}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      BPM
                    </h3>
                    <p className="mt-1 text-lg text-zinc-900 dark:text-zinc-100">
                      {track.bpm || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Added
                    </h3>
                    <p className="mt-1 text-lg text-zinc-900 dark:text-zinc-100">
                      {new Date(track.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex space-x-4">
                    <Link
                      href={`/app/tracks/${track.id}/edit`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors"
                    >
                      Edit Track
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
