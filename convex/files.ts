import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { FILE_TYPES } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

export const onGenerateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export interface FileWithPreview extends File {
    preview: string;
}

export const onHasAccess = async (ctx: QueryCtx | MutationCtx, orgId: string, authToken: string) => {
   
    const user = await getUser(ctx, authToken)
    const hasAcces = 
        user.orgIds.some((item) => item.orgId === orgId) ||
        user.tokenIdentifier === authToken

    if(!hasAcces) throw new ConvexError('No access to this organization.');

    return { user }
}

export const acceptedMimeTypes = {
    'image/jpeg': [],
    'image/png': [],
    'text/csv': ['.csv'],
    'application/pdf': ['.pdf'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
}
  
export type MimeType = keyof typeof acceptedMimeTypes

export const onCreateFile = mutation(
    async (ctx, args: {
        orgId: string,
        name: string,
        fileId: Id<"_storage">,
        type: MimeType,
        tokenIdentifier: string,
        size: number
    }) => {
        try {
            const hasAccess = await onHasAccess(ctx, args.orgId, args.tokenIdentifier)
            
            return await ctx.db.insert('files', {
                name: args.name,
                orgId: args.orgId,
                fileId: args.fileId,
                type: args.type,
                userId: hasAccess.user._id,
                size: args.size
            })
        } catch (error: any) {
            throw new ConvexError(error.message)
        }
       
    }
)

export const onGetFiles = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favorites: v.optional(v.boolean()),
        deletedOnly: v.optional(v.boolean()),
        type: v.optional(FILE_TYPES),
        token: v.string()
    },
    handler: async (ctx, args) => {
        const hasAccess = await onHasAccess(ctx, args.orgId, args.token)

        if(!hasAccess) {
            return null
        }
        let files = await ctx.db.query('files').withIndex('byOrgId', (q) => q.eq('orgId', args.orgId)).collect()
        
        const query = args.query

        if (query) {
            files = files.filter((file) =>
              file.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (args.favorites) {
            const favorites = await ctx.db
              .query("favorites")
              .withIndex("by_userId_orgId_fileId", (q) =>
                q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
              )
              .collect();
      
            files = files.filter((file) =>
              favorites.some((favorite) => favorite.fileId === file._id)
            );
        }

        if (args.deletedOnly) {
            files = files.filter((file) => file.shouldDelete);
        } else {
            files = files.filter((file) => !file.shouldDelete);
        }

        if (args.type) {
            files = files.filter((file) => file.type === args.type);
        }

        const filesWithUrl = await Promise.all(
            files.map(async (file) => ({
              ...file,
              url: await ctx.storage.getUrl(file.fileId),
            }))
        );

        return filesWithUrl
    }
})

export const onDeleteAllFiles = internalMutation({
    args: {},
    async handler(ctx) {
      const files = await ctx.db
        .query("files")
        .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
        .collect();
  
      await Promise.all(
        files.map(async (file) => {
          await ctx.storage.delete(file.fileId);
          return await ctx.db.delete(file._id);
        })
      );
    },
});



export const onMarkFileForDeletion = mutation({
    args: {
        fileId: v.id('files')
    },
    handler: async (ctx, args) => {
        const access = await hasAccessToFile(ctx, args.fileId)

        if(!access) {
            throw new ConvexError("No access to this file.")
        }

        canDeleteFile(access.user, access.file)

        await ctx.db.patch(args.fileId, { 
            shouldDelete: true
        })
    }
})

export const onUnmarkFileForDeletion = mutation({
    args: {
        fileId: v.id('files')
    },
    handler: async (ctx, args) => {
        const access = await hasAccessToFile(ctx, args.fileId)

        if(!access) {
            throw new ConvexError("No access to this file.")
        }

        canDeleteFile(access.user, access.file)

        await ctx.db.patch(args.fileId, {
            shouldDelete: false
        })
    }
})

export const onToggleFavoriteFile = mutation({
    args: {
        fileId: v.id('files')
    },
    handler: async (ctx, args) => {
        const access = await hasAccessToFile(ctx, args.fileId);

        if (!access) {
          throw new ConvexError("no access to file");
        }

        const favorite = await ctx.db
            .query("favorites")
            .withIndex("by_userId_orgId_fileId", (q) =>
                q
                .eq("userId", access.user._id)
                .eq("orgId", access.file.orgId)
                .eq("fileId", access.file._id)
            )
            .first();

        if(!favorite) {
            await ctx.db.insert('favorites', {
                fileId: access.file._id,
                orgId: access.file.orgId,
                userId: access.user._id
            })
        } else {
            await ctx.db.delete(favorite._id)
        }
    }
})

export const onGetAllFavorites = query({
    args: {
        orgId: v.string()
    },
    handler: async (ctx, args) => {
        const hasAcces = await onHasAccess(ctx, args.orgId, '')

        if(!hasAcces) return []

        return await ctx.db
            .query('favorites')
            .withIndex('by_userId_orgId_fileId', (q) => q.eq('userId', hasAcces?.user._id).eq("orgId", args.orgId))
            .collect()
    }
}) 

function canDeleteFile(user: Doc<"users">, file: Doc<"files">) {
    const canDelete =
      file.userId === user._id ||
      user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin";
  
    if (!canDelete) {
      throw new ConvexError("you have no acces to delete this file");
    }
}

async function hasAccessToFile(
    ctx: QueryCtx | MutationCtx,
    fileId: Id<"files">
  ) {
    const file = await ctx.db.get(fileId);
  
    if (!file) {
      return null;
    }
  
    const hasAccess = await onHasAccess(ctx, file.orgId, '');
  
    if (!hasAccess) {
      return null;
    }
  
    return { user: hasAccess.user, file };
}


