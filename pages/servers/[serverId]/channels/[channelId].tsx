import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { ChannelType } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";

interface ChannelIdPageProps {
  serverId: string;
  channelId: string;
  channel: any;
  member: any;
}

export default function ChannelIdPage({
  channelId,
  serverId,
  channel,
  member
}: ChannelIdPageProps) {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 left-[72px]">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-[332px]">
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
          <ChatHeader
            name={channel.name}
            serverId={channel.serverId}
            type="channel"
          />
          {channel.type === ChannelType.TEXT && (
            <>
              <ChatMessages
                member={member}
                name={channel.name}
                chatId={channel.id}
                type="channel"
                apiUrl="/api/messages"
                socketUrl="/api/socket/messages"
                socketQuery={{
                  channelId: channel.id,
                  serverId: channel.serverId
                }}
                paramKey="channelId"
                paramValue={channel.id}
              />
              <ChatInput
                name={channel.name}
                type="channel"
                apiUrl="/api/socket/messages"
                query={{
                  channelId: channel.id,
                  serverId: channel.serverId
                }}
              />
            </>
          )}
          {channel.type === ChannelType.AUDIO && (
            <MediaRoom chatId={channel.id} video={false} audio={true} />
          )}
          {channel.type === ChannelType.VIDEO && (
            <MediaRoom chatId={channel.id} video={true} audio={true} />
          )}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { channelId, serverId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }

  const channel = await db.channel.findUnique({
    where: { id: channelId as string }
  });

  const member = await db.member.findFirst({
    where: { serverId: serverId as string, profileId: session.user.id }
  });

  if (!channel || !member) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      serverId,
      channelId,
      channel: JSON.parse(JSON.stringify(channel)),
      member: JSON.parse(JSON.stringify(member)),
    },
  };
};