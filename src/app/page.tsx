import Chat from "@/components/Chat";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";
import PreviousChats from "@/components/PreviousChats";
import { Suspense } from "react";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="p-5">
      <h1 className="text-4xl font-bold">Welcome to Next Chat App</h1>x
      {!session?.user?.email && (
        <div>You must be logged in to use this app.</div>
      )}
      {session?.user?.email && (
        <>
          <Suspense fallback={<div>Loading previous chats...</div>}>
            <PreviousChats />
          </Suspense>
          <Separator className="my-5" />
          <Chat />
        </>
      )}
    </main>
  );
}
