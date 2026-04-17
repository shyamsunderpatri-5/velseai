import { z } from "zod";

const testSchema = z.array(z.string()).default([]);

console.log("Keys of testSchema:", Object.keys(testSchema));
console.log("Keys of testSchema._def:", testSchema._def ? Object.keys(testSchema._def) : "null");

const inner = (testSchema as any)._def?.innerType;
if (inner) {
  console.log("Keys of inner:", Object.keys(inner));
  console.log("Keys of inner._def:", inner._def ? Object.keys(inner._def) : "null");
  console.log("inner.type:", inner.type);
}
