import { z } from "zod";

const testSchema = z.array(z.string()).default([]);

console.log(JSON.stringify(testSchema._def, null, 2));
