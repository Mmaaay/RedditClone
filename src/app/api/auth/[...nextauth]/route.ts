import { authOptions } from "@/lib/auth";
import nextAuth from "next-auth";

const handlers = nextAuth(authOptions);

export { handlers as GET, handlers as POST };
