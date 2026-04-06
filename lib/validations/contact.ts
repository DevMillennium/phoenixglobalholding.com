import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  company: z.string().trim().min(1).max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .transform((val) => (val === "" ? undefined : val)),
  intent: z.enum(["commerce", "tech", "corporate", "institutional", "other"]),
  message: z.string().trim().min(20).max(5000),
  consent: z.boolean().refine((v) => v === true),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
