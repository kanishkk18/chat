import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { db } from "@/lib/db";
import { InitialModal } from "@/components/modals/initial-modal";

export default function SetupPage() {
  return <InitialModal />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  if (server) {
    return {
      redirect: {
        destination: `/servers/${server.id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};