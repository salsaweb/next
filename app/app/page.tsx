import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-32 px-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Welcome to your dashboard, {data.user.email}!
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            This is a protected section of the app.
          </p>
          <div className="flex flex-col gap-4 items-center">
            <Link
              href="/app/tracks"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors text-lg font-medium"
            >
              View Music Tracks
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
