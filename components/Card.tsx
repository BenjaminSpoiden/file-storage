import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { auth } from '@clerk/nextjs/server'
import React from "react";
import { getUserData } from "@/lib/auth";

export const Card: React.FC = async () => {

   
  
    try {
        const { userId, orgId: organisationId, tokenIdentifier } = await getUserData()
        let orgId: string = '';
        orgId = organisationId ?? userId ?? '';
        const files = await fetchQuery(
            api.files.onGetFiles,
            { orgId, token: tokenIdentifier }
        );
    
        return (
            <>
                {files?.map((file) => (
                    <div key={file._id}>
                        {file.name}
                    </div>
                ))}
            </>
        )
    } catch (error) {
        return (
            <div>
                No Files...
            </div>
        )
    }
    
}