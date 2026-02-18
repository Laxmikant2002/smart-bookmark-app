"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check user session and fetch bookmarks
  useEffect(() => {
    const initializeUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/");
      } else {
        setUser(data.user);
        // Fetch initial bookmarks
        const { data: bookmarksData } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false });
        setBookmarks(bookmarksData || []);
      }
    };

    initializeUser();

    // Listen for auth state changes and update user immediately
    // No ts-expect-error needed: Supabase onAuthStateChange is correctly typed
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.push("/");
          setUser(null);
        } else {
          setUser(session.user);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookmarks(data || []);
    };

    // No ts-expect-error needed: Supabase channel is correctly typed
    const channel = supabase
      .channel("bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        fetchBookmarks,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !user) return;
    setLoading(true);
    await supabase.from("bookmarks").insert([{ title, url, user_id: user.id }]);
    setTitle("");
    setUrl("");
    setLoading(false);
    // Immediately fetch bookmarks after add
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookmarks(data || []);
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    // Immediately fetch bookmarks after delete
    if (user) {
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookmarks(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Sign Out
          </button>
        </div>

        {/* Add bookmark form */}
        <form
          onSubmit={addBookmark}
          className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200"
        >
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="url"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Bookmark"}
            </button>
          </div>
        </form>

        {/* Bookmarks list */}
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No bookmarks yet. Add one above!
            </p>
          ) : (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center justify-between group hover:shadow-md transition"
              >
                <div>
                  <h3 className="text-gray-900 font-medium">
                    {bookmark.title}
                  </h3>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-700 break-all"
                  >
                    {bookmark.url}
                  </a>
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="ml-4 p-2 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
