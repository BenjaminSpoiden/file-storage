import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const onCreateFile = mutation({
    args: {
        name: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if(!user) {
            throw new ConvexError('Not Authentified.')
        }
        await ctx.db.insert('files', {
            name: args.name
        })
    }
})