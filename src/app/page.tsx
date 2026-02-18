"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showConfirmMsg, setShowConfirmMsg] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Bookmark
          </h1>
          <p className="text-gray-600">
            Sign in to manage your private bookmarks
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {showConfirmMsg ? (
            <div className="text-green-600 text-center font-medium mb-4">
              Check your email for the confirmation link to verify your account.
            </div>
          ) : null}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#8B5CF6",
                    brandAccent: "#A78BFA",
                  },
                },
              },
            }}
            providers={["google"]}
            view="sign_in"
            // Listen for sign up events to show confirmation message
            // @ts-ignore
            onViewChange={async (view) => {
              if (view === "sign_up") {
                setShowConfirmMsg(false);
              }
            }}
            // @ts-ignore
            onAuthStateChange={async (event, session) => {
              if (
                event === "USER_SIGNED_UP" &&
                session?.user?.email &&
                !session.user.email_confirmed_at
              ) {
                setShowConfirmMsg(true);
              }
            }}
          />
          <p className="text-xs text-gray-500 text-center mt-4">
            Powered by Supabase + Next.js
          </p>
        </div>
      </div>
    </main>
  );
}
