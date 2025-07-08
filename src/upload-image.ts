import { showHUD, Clipboard, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { v2 as cloudinary } from "cloudinary";
import { unlink, readdir, stat } from "fs/promises";
import { join, basename } from "path";
import { tmpdir, homedir } from "os";

interface Preferences {
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

async function configureCloudinary() {
  const preferences = getPreferenceValues<Preferences>();

  cloudinary.config({
    cloud_name: preferences.cloudinaryCloudName,
    api_key: preferences.cloudinaryApiKey,
    api_secret: preferences.cloudinaryApiSecret,
  });
}

async function getMostRecentClipboardImage(): Promise<string | null> {
  try {
    const raycastCachePath = `${homedir()}/Library/Caches/com.raycast.macos/Clipboard/`;
    const files = await readdir(raycastCachePath);

    if (files.length === 0) {
      return null;
    }

    // Get file stats and sort by modification time (newest first)
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = join(raycastCachePath, file);
        const stats = await stat(filePath);
        return { path: filePath, mtime: stats.mtime };
      }),
    );

    // Sort by modification time, newest first
    fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    // Find the most recent image file
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
    for (const fileStat of fileStats) {
      const fileName = basename(fileStat.path).toLowerCase();
      if (imageExtensions.some((ext) => fileName.endsWith(ext))) {
        return fileStat.path;
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function getImageFromClipboard(): Promise<string | null> {
  try {
    const clipboardContent = await Clipboard.read();

    // Check if clipboard contains a file path
    if (clipboardContent.file) {
      // Check if it's an image file
      const fileName = clipboardContent.file.toLowerCase();
      const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

      if (imageExtensions.some((ext) => fileName.endsWith(ext))) {
        return clipboardContent.file;
      }
    }

    // Check if clipboard contains text that might be an image file path
    if (clipboardContent.text) {
      const text = clipboardContent.text.toLowerCase();
      const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

      if (imageExtensions.some((ext) => text.endsWith(ext))) {
        return clipboardContent.text;
      }
    }

    // Try to get the most recent image from Raycast clipboard cache
    const cachedImage = await getMostRecentClipboardImage();
    if (cachedImage) {
      return cachedImage;
    }

    return null;
  } catch {
    return null;
  }
}

async function uploadToCloudinary(imagePath: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "raycast-uploads",
      use_filename: true,
      unique_filename: false,
    });

    return result.secure_url;
  } catch (error) {
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export default async function main() {
  try {
    await configureCloudinary();

    const imagePath = await getImageFromClipboard();

    if (!imagePath) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No image found",
        message: "No image in clipboard or file is not an image",
      });
      return;
    }

    await showToast({
      style: Toast.Style.Animated,
      title: "Uploading image...",
      message: "Please wait",
    });

    const imageUrl = await uploadToCloudinary(imagePath);

    // Clean up temporary file if it was created
    if (imagePath.includes(tmpdir())) {
      try {
        await unlink(imagePath);
      } catch {
        // Ignore cleanup errors
      }
    }

    await Clipboard.copy(imageUrl);
    await showHUD(`Image uploaded! URL copied to clipboard`);
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Upload failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
