import { router } from "../router.ts";
import { getGitHandler } from "./git.server.ts";

router.use("/git", getGitHandler());
