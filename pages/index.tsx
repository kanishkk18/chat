import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { db } from "@/lib/db";
import { GetServerSideProps } from "next";

interface HomePageProps {
  hasServer: boolean;
  firstServerId?: string;
}

export default function HomePage({ hasServer, firstServerId }: HomePageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/sign-in");
      return;
    }

    if (hasServer && firstServerId) {
      router.push(`/servers/${firstServerId}`);
    }
  }, [session, status, router, hasServer, firstServerId]);

  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Discord Clone</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Create a server to get started or join an existing one.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: session.user.id
        }
      }
    }
  });

  return {
    props: {
      hasServer: !!server,
      firstServerId: server?.id || null,
    },
  };
};