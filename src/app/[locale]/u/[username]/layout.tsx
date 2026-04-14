import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface Props {
  children: React.ReactNode;
  params: Promise<{ username: string; locale: string }>;
}

export default async function UserProfileLayout({ children }: Props) {
  return <>{children}</>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, locale } = await params;
  
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, bio_public")
    .eq("username", username)
    .single();

  if (!profile || !profile.bio_public) {
    return {
      title: "Profile Not Found | VelseAI",
    };
  }

  const title = `${profile.full_name} | Professional Portfolio`;
  const description = profile.bio || `View ${profile.full_name}'s professional resume and portfolio on VelseAI. Connected with recruiters worldwide.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://velseai.com/${locale}/u/${username}`,
      images: [
        {
          url: `https://velseai.com/api/og/profile?u=${username}`,
          width: 1200,
          height: 630,
          alt: `${profile.full_name} Resume`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://velseai.com/api/og/profile?u=${username}`],
    },
  };
}