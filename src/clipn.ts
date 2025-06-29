import { showHUD, Clipboard, showToast, Toast } from "@raycast/api";
import { readdir, stat } from "fs/promises";
import { basename, join } from "path";
import { homedir } from "os";

async function getMostRecentClipboardFile(): Promise<string | null> {
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

    return fileStats[0]?.path || null;
  } catch {
    return null;
  }
}

export default async function main() {
  try {
    const mostRecentFile = await getMostRecentClipboardFile();

    if (mostRecentFile) {
      const fileName = basename(mostRecentFile);
      await Clipboard.copy(mostRecentFile);
      await showHUD(`Copied newest cached file: ${fileName}`);
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "No cached files found",
        message: "No files in Raycast clipboard cache",
      });
    }
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Error accessing cache",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
