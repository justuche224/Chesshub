import { NewPasswordSchema } from "@/schemas";
import * as z from "zod";

export type NewPasswordValues = z.infer<typeof NewPasswordSchema>;
