import { ConvexError, v } from "convex/values";
import { internalMutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { ROLES } from "./schema";

export const getUser = async (ctx: QueryCtx | MutationCtx, tokenIdentifier: string) => {
    const user =  await ctx.db.query('users')
        .withIndex('byTokenIdentifier', q => q.eq("tokenIdentifier", tokenIdentifier))
        .first();

    if(!user) {
        throw new ConvexError('User not found.')
    }

    return user
}

export const onCreateUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        name: v.string(),
        image: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('users', {
            tokenIdentifier: args.tokenIdentifier,
            name: args.name,
            image: args.image, 
            orgIds: []
        })
    }
})

export const updateUser = internalMutation({
    args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
    async handler(ctx, args) {
      const user = await ctx.db
        .query("users")
        .withIndex('byTokenIdentifier', (q) =>
          q.eq("tokenIdentifier", args.tokenIdentifier)
        )
        .first();
  
      if (!user) {
        throw new ConvexError("no user with this token found");
      }
  
      await ctx.db.patch(user._id, {
        name: args.name,
        image: args.image,
      });
    },
});

export const onAddOrgToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: ROLES
    },
    handler: async (ctx, args) => {
        const user = await getUser(ctx, args.tokenIdentifier)

        await ctx.db.patch(user._id, {
            orgIds: [...user.orgIds, {orgId: args.orgId, role: args.role}]
        })
        
    }
})

export const onUpdateRoleInOrgForUser = internalMutation({
    args: { tokenIdentifier: v.string(), orgId: v.string(), role: ROLES },
    async handler(ctx, args) {
      const user = await getUser(ctx, args.tokenIdentifier);
  
      const org = user.orgIds.find((org) => org.orgId === args.orgId);
  
      if (!org) {
        throw new ConvexError(
          "No organization found for user."
        );
      }
  
      org.role = args.role;
  
      await ctx.db.patch(user._id, {
        orgIds: user.orgIds,
      });
    },
})

export const onGetUserProfie = query({
    args: { userId: v.id("users") },
    async handler(ctx, args) {
      const user = await ctx.db.get(args.userId);
  
      return {
        name: user?.name,
        image: user?.image,
      };
    },
});

export const onGetMe = query({
    args: {},
    async handler(ctx) {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        return null;
      }
  
      const user = await getUser(ctx, identity.tokenIdentifier);
  
      if (!user) {
        return null;
      }
  
      return user;
    },
});