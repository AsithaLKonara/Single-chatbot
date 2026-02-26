"use client";

import { useSearchParams } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget";
import { Suspense } from "react";

function ChatEmbed() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId") || undefined;
    const primaryColor = searchParams.get("primaryColor") || undefined;

    return (
        <div className="bg-transparent w-full h-full flex items-end justify-end p-0">
            <ChatWidget
                defaultOpen={true}
                projectId={projectId}
                primaryColor={primaryColor}
            />
        </div>
    );
}

export default function EmbedPage() {
    return (
        <Suspense>
            <ChatEmbed />
        </Suspense>
    );
}
