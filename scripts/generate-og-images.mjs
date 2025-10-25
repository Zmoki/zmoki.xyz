import puppeteer from "puppeteer";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

let SITE_URL = "http://localhost:4321";
const OG_IMAGES_DIR = "public/og-images";

// Ensure og-images directory exists
if (!existsSync(OG_IMAGES_DIR)) {
  mkdirSync(OG_IMAGES_DIR, { recursive: true });
}

// Function to parse sitemap.xml and extract URLs
function parseSitemap(sitemapPath) {
  const sitemapContent = readFileSync(sitemapPath, "utf-8");
  const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);

  if (!urlMatches) {
    console.log("No URLs found in sitemap");
    return [];
  }

  return urlMatches.map((match) => {
    const url = match.replace(/<\/?loc>/g, "");
    return url.replace("https://zmoki.xyz", ""); // Convert to local path
  });
}

// Function to generate filename from URL path
function getImageFilename(path) {
  if (path === "/") {
    return "index.png";
  }

  // Remove leading slash and trailing slash, replace slashes with hyphens
  const cleanPath = path.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  return `${cleanPath}.png`;
}

// Function to start Astro preview server
function startPreviewServer() {
  return new Promise((resolve, reject) => {
    console.log("Starting Astro preview server...");
    const server = spawn("npm", ["run", "preview"], {
      stdio: "pipe",
      shell: true,
    });

    let serverReady = false;

    server.stdout.on("data", (data) => {
      const output = data.toString();
      console.log("Server output:", output);

      if (output.includes("Local") && output.includes("http://localhost:") && !serverReady) {
        // Extract the actual port from the output
        const portMatch = output.match(/http:\/\/localhost:(\d+)/);
        if (portMatch) {
          SITE_URL = `http://localhost:${portMatch[1]}`;
          console.log(`Using server URL: ${SITE_URL}`);
        }
        serverReady = true;
        console.log("Preview server is ready!");
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      console.error("Server error:", data.toString());
    });

    server.on("error", (error) => {
      console.error("Failed to start server:", error);
      reject(error);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!serverReady) {
        server.kill();
        reject(new Error("Server startup timeout"));
      }
    }, 60000);
  });
}

// Function to generate OG image for a single page
async function generateOGImage(browser, url, filename) {
  try {
    console.log(`Generating OG image for: ${url}`);

    const page = await browser.newPage();

    // Set viewport to 1000px width
    await page.setViewport({ width: 1000, height: 800 });

    // Navigate to the page
    await page.goto(`${SITE_URL}${url}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for main content to load and ensure it's fully rendered
    await page.waitForSelector("main", { timeout: 10000 });

    // Wait a bit more for any dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the main element
    const mainElement = await page.$("main");

    if (!mainElement) {
      console.log(`No main element found for ${url}`);
      await page.close();
      return false;
    }

    // Get the bounding box of the main element
    const boundingBox = await mainElement.boundingBox();

    if (!boundingBox) {
      console.log(`Could not get bounding box for main element on ${url}`);
      await page.close();
      return false;
    }

    console.log(`Main element bounding box for ${url}:`, boundingBox);

    // Calculate screenshot dimensions (1000px width, 500px height max)
    const screenshotWidth = Math.min(1000, boundingBox.width);
    const screenshotHeight = Math.min(500, boundingBox.height);

    // Take screenshot of the main element, starting from the top
    await mainElement.screenshot({
      path: join(OG_IMAGES_DIR, filename),
      type: "png",
      clip: {
        x: 0, // Start from the left edge of the main element
        y: 0, // Start from the top of the main element
        width: screenshotWidth,
        height: screenshotHeight,
      },
    });

    console.log(`✓ Generated: ${filename}`);
    await page.close();
    return true;
  } catch (error) {
    console.error(`Error generating OG image for ${url}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log("🚀 Starting OG image generation...");

  let server;
  let browser;

  try {
    // Start the preview server
    server = await startPreviewServer();

    // Wait a bit for server to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Parse sitemap to get all URLs
    console.log("📄 Reading sitemap...");
    const urls = parseSitemap("dist/sitemap.xml");
    console.log(`Found ${urls.length} URLs in sitemap`);

    // Launch Puppeteer
    console.log("🌐 Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Generate OG images for each URL
    let successCount = 0;
    let failCount = 0;

    for (const url of urls) {
      const filename = getImageFilename(url);
      const success = await generateOGImage(browser, url, filename);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Small delay between screenshots
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ OG image generation complete!`);
    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`📁 Images saved to: ${OG_IMAGES_DIR}`);
  } catch (error) {
    console.error("❌ Error during OG image generation:", error);
    process.exit(1);
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.kill();
    }
  }
}

// Run the script
main().catch(console.error);
