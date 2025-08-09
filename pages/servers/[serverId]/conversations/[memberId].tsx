import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/conversation";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";

interface MemberIdPageProps {
  memberId: string;
  serverId: string;
  currentMember: any;
  conversation: any;
  otherMember: any;
  video?: boolean;
}

export default function MemberIdPage({
  memberId,
  serverId,
  currentMember,
  conversation,
  otherMember,
  video
}: MemberIdPageProps) {
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
            imageUrl={otherMember.profile.imageUrl}
            name={otherMember.profile.name}
            serverId={serverId}
            type="conversation"
          />
          {video && <MediaRoom chatId={conversation.id} video audio />}
          {!video && (
            <>
              <ChatMessages
                member={currentMember}
                name={otherMember.profile.name}
                chatId={conversation.id}
                type="conversation"
                apiUrl="/api/direct-messages"
                paramKey="conversationId"
                paramValue={conversation.id}
                socketUrl="/api/socket/direct-messages"
                socketQuery={{
                  conversationId: conversation.id
                }}
              />
              <ChatInput
                name={otherMember.profile.name}
                type="conversation"
                apiUrl="/api/socket/direct-messages"
                query={{
                  conversationId: conversation.id
                }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { memberId, serverId } = context.params!;
  const { video } = context.query;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: serverId as string,
      profileId: session.user.id
    },
    include: {
      profile: true
    }
  });

  if (!currentMember) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId as string
  );

  if (!conversation) {
    return {
      redirect: {
        destination: `/servers/${serverId}`,
        permanent: false,
      },
    };
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === session.user.id ? memberTwo : memberOne;

  return {
    props: {
      memberId,
      serverId,
      currentMember: JSON.parse(JSON.stringify(currentMember)),
      conversation: JSON.parse(JSON.stringify(conversation)),
      otherMember: JSON.parse(JSON.stringify(otherMember)),
      video: video === "true" || false,
    },
  };
};