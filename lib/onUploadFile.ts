'use server'

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { FileWithPreview, MimeType } from "@/convex/files"
import { auth } from "@clerk/nextjs/server"
import { fetchMutation } from "convex/nextjs"
import { revalidatePath } from "next/cache"
import { getUserData } from "./auth"

type UploadFileType = {
    name: string,
    type: MimeType,
    file: FileWithPreview
}
 

export async function onUploadFile(uploadFileType: UploadFileType) {

    const { userId, orgId: organizationId, tokenIdentifier } = await getUserData()
    const orgId = organizationId ?? userId ?? '';

    const postUrl = await fetchMutation(api.files.onGenerateUploadUrl)
    const result = await fetch(postUrl, {
        method: 'POST',
        headers: { "Content-Type": uploadFileType.type },
        body: uploadFileType.file
    })

    const { storageId } = await result.json() as { storageId: Id<"_storage"> };
    await fetchMutation(api.files.onCreateFile, {
        fileId: storageId,
        name: uploadFileType.name,
        orgId,
        type: uploadFileType.type,
        tokenIdentifier,
        size: uploadFileType.file.size
    })

    revalidatePath('/')
}