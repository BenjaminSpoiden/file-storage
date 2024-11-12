import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const ROLES = v.union(v.literal("admin"), v.literal("member"));

export const FILE_TYPES = v.union(
  v.literal("image/png"),
  v.literal("image/jpeg"),
  v.literal("text/csv"),
  v.literal("application/pdf"),
  v.literal('audio/mpeg'),
  v.literal('audio/wav')
);

export default defineSchema({
  files: defineTable({ 
    name: v.string(),
    type: FILE_TYPES,
    orgId: v.string(),
    fileId: v.id("_storage"),
    userId: v.id("users"),
    size: v.number(),
    shouldDelete: v.optional(v.boolean()),
  }).index('byOrgId', ['orgId']).index("by_shouldDelete", ["shouldDelete"]),
  favorites: defineTable({
    fileId: v.id("files"),
    orgId: v.string(),
    userId: v.id("users"),
  }).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.object({
      orgId: v.string(),
      role: ROLES
    })),
    name: v.string(),
    image: v.string(),
    clerkId: v.string()
  }).index('byTokenIdentifier', ['tokenIdentifier']).index('byClerkId', ['clerkId'])
}); 