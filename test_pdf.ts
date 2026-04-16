const { resumeJsonToPdfBuffer } = require("./src/lib/pdf/generator");

async function runTest() {
  try {
    console.log("Starting PDF test...");
    const sampleData = {
      personal_info: {
        name: "Test User",
        email: "test@example.com"
      },
      summary: "A test summary",
      experience: [
        {
          company: "Test Co",
          title: "Engineer",
          start_date: "2020",
          end_date: "2022",
          bullets: ["Did things"]
        }
      ],
      education: [],
      skills: ["React", "TypeScript"]
    };
    
    // Test Elite Future
    console.log("Generating Elite Future...");
    const buff1 = await resumeJsonToPdfBuffer(sampleData, { template: "elite_future" });
    console.log(`Success! PDF size: ${buff1.length} bytes`);

    // Test Viral Sidebar
    console.log("Generating Viral Sidebar...");
    const buff2 = await resumeJsonToPdfBuffer(sampleData, { template: "viral_sidebar" });
    console.log(`Success! PDF size: ${buff2.length} bytes`);
    
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
}

// Since generator.ts is written in ES module syntax or uses ES imports (pdf-lib, fontkit)
// We might need to run it via ts-node or similar.
runTest();
