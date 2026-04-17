import { z } from "zod";

const testObj = z.object({ name: z.string() });
console.log("Keys of testObj:", Object.keys(testObj));
console.log("Keys of testObj._def:", Object.keys((testObj as any)._def));
console.log("testObj._def.type:", (testObj as any)._def.type);
console.log("testObj._def.shape:", (testObj as any)._def.shape ? "exists" : "missing");
if ((testObj as any)._def.shape) {
    console.log("Keys of testObj._def.shape:", Object.keys((testObj as any)._def.shape));
}
