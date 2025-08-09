import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface ServerIdPageProps {
  serverId: string;
}

export default function ServerIdPage({ serverId }: ServerIdPageProps) {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serverId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId as string,
      members: {
        some: {
          profileId: session.user.id
        }
      }
    },
    include: {
      channels: {
        where: {
          name: "general"
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== "general") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `/servers/${serverId}/channels/${initialChannel?.id}`,
      permanent: false,
    },
  };
};