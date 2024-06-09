import { z } from "zod";
export const postValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(128, { message: "Maximum characters length is 128 " }),
  subredditId: z.string(),
  content: z.any(),
});

export type postCreationValidator = z.infer<typeof postValidator>;
