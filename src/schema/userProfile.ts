import { z } from "zod";

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  passwordHash: z.string().optional(),
  googleId: z.string().optional(),
  name: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  picture: z.string().url().optional(),
  emailVerified: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type userType = z.infer<typeof UserSchema>;
// Optional: Create input schemas for create and update operations
export const UserCreateSchema = UserSchema.pick({
  email: true,
  passwordHash: true,
  name: true,
}).required();

export const UserUpdateSchema = UserCreateSchema.partial();
export const UserLoginSchema = UserSchema.pick({
  email: true,
  passwordHash: true,
}).required();