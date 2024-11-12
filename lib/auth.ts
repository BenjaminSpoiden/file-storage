import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";


export async function getUserData() {
   
    try {
        const { userId, orgId } = await auth()
        if (!userId) throw new Error('Not Authenticated.')
        const { tokenIdentifier } = await fetchQuery(api.users.onGetUserProfie, { userId })
        if(!tokenIdentifier) throw new Error('No Token Identifier found.')
        return {
            userId,
            orgId,
            tokenIdentifier
        }
    } catch (error: any) {
        throw new Error(error.message)
    }
    
}