import { ExtractedResumeSchema } from "../src/lib/resume-builder/schemas";
import { zodToJsonSchema } from "../src/lib/ai/structured-outputs";

console.log(JSON.stringify(zodToJsonSchema(ExtractedResumeSchema), null, 2));
