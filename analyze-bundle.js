#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const DIST_DIR = "./dist/spa";

console.log("🔍 Analyzing bundle size...\n");

try {
  // Build the project first
  console.log("📦 Building project...");
  execSync("npm run build:client", { stdio: "inherit" });

  // Analyze the built files
  if (fs.existsSync(DIST_DIR)) {
    const files = fs.readdirSync(DIST_DIR, { recursive: true });

    let totalSize = 0;
    const fileAnalysis = [];

    files.forEach((file) => {
      const filePath = path.join(DIST_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const sizeKB = (stats.size / 1024).toFixed(2);
        totalSize += stats.size;

        fileAnalysis.push({
          file: file,
          size: `${sizeKB} KB`,
          sizeBytes: stats.size,
        });
      }
    });

    // Sort by size
    fileAnalysis.sort((a, b) => b.sizeBytes - a.sizeBytes);

    console.log("\n📊 Bundle Analysis:");
    console.log("=".repeat(60));

    const totalSizeKB = (totalSize / 1024).toFixed(2);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log(`Total bundle size: ${totalSizeKB} KB (${totalSizeMB} MB)\n`);

    console.log("Largest files:");
    fileAnalysis.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. ${item.file} - ${item.size}`);
    });

    // Performance recommendations
    console.log("\n💡 Performance Recommendations:");
    console.log("=".repeat(60));

    const jsFiles = fileAnalysis.filter((f) => f.file.endsWith(".js"));
    const cssFiles = fileAnalysis.filter((f) => f.file.endsWith(".css"));
    const imageFiles = fileAnalysis.filter((f) =>
      /\.(png|jpg|jpeg|gif|svg)$/i.test(f.file),
    );

    const largeJS = jsFiles.filter((f) => f.sizeBytes > 100 * 1024); // > 100KB
    const largeCSS = cssFiles.filter((f) => f.sizeBytes > 50 * 1024); // > 50KB
    const largeImages = imageFiles.filter((f) => f.sizeBytes > 100 * 1024); // > 100KB

    if (largeJS.length > 0) {
      console.log("⚠️  Large JavaScript files detected:");
      largeJS.forEach((f) => console.log(`   • ${f.file} (${f.size})`));
      console.log("   Consider code splitting or tree shaking.\n");
    }

    if (largeCSS.length > 0) {
      console.log("⚠️  Large CSS files detected:");
      largeCSS.forEach((f) => console.log(`   • ${f.file} (${f.size})`));
      console.log("   Consider CSS purging or critical CSS extraction.\n");
    }

    if (largeImages.length > 0) {
      console.log("⚠️  Large image files detected:");
      largeImages.forEach((f) => console.log(`   • ${f.file} (${f.size})`));
      console.log("   Consider image optimization or lazy loading.\n");
    }

    if (totalSize > 5 * 1024 * 1024) {
      // > 5MB
      console.log("🚨 Total bundle size is quite large. Consider:");
      console.log("   • More aggressive code splitting");
      console.log("   • Lazy loading of non-critical components");
      console.log("   • Tree shaking unused dependencies");
      console.log("   • Using dynamic imports");
    } else if (totalSize > 2 * 1024 * 1024) {
      // > 2MB
      console.log(
        "⚠️  Bundle size is moderate. Consider optimizations for better performance.",
      );
    } else {
      console.log("✅ Bundle size looks good!");
    }
  } else {
    console.error(
      "❌ Build directory not found. Make sure to run build first.",
    );
  }
} catch (error) {
  console.error("❌ Error analyzing bundle:", error.message);
  process.exit(1);
}
