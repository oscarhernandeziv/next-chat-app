import Chat from "@/app/components/Chat";
import { getChat } from "@/db";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function ChatDetail({
  params,
}: {
  params: { chatId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const chatId = resolvedParams.chatId;

  const chat = await getChat(+chatId);
  if (!chat) {
    notFound();
  }

  const session = await getServerSession();
  if (!session || session.user?.email !== chat.user_email) {
    redirect("/");
  }

  return (
    <main className="pt-5">
      <Chat id={+chatId} key={chatId} messages={chat?.messages} />
    </main>
  );
}

export const dynamic = "force-dynamic";
