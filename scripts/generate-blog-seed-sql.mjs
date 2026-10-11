import { writeFileSync } from "node:fs";
import { renderBlogSeedFile } from "../lib/blog-seed.mjs";

writeFileSync(new URL("../supabase/blog-seed.sql", import.meta.url), renderBlogSeedFile());
process.stdout.write("Generated supabase/blog-seed.sql from lib/blog-seed.json\n");
