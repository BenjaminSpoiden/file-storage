'use client'

import { useUser } from "@clerk/nextjs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/DropdownMenu";
import { SidebarMenuButton } from "./ui/Sidebar";
import { ChevronUp } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "./ui/Avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";


export const UserButton = () => {
    const { isLoaded, user } = useUser()
    const { signOut, openUserProfile } = useClerk()
    const router = useRouter()

    if(!isLoaded) return null;
    if(!user?.id) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback>{user.firstName}</AvatarFallback>
                    </Avatar>
                    <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
            >
                <DropdownMenuItem>
                    <button onClick={() => openUserProfile()}>Profile</button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <button className="text-red-600 w-full text-start" onClick={() => signOut(() => router.push('/'))}>Sign Out</button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}