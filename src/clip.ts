import { showHUD, Clipboard, showToast, Toast } from "@raycast/api";
import { readFile } from "fs/promises";
import { resolve } from "path";

export default async function main() {
  try {
    // First try to read the clipboard content (handles files, images, etc.)
    const clipboardContent = await Clipboard.read();

    // Check if there's a file in the clipboard
    if (clipboardContent.file) {
      const realPath = resolve(clipboardContent.file);
      await Clipboard.copy(realPath);
      await showHUD(`Copied real path: ${realPath}`);
      return;
    }

    // If no file, try to read text content and look for file paths
    const textContent = clipboardContent.text;

    if (!textContent) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No file or text content in clipboard",
      });
      return;
    }

    // Split by lines and find the first line that looks like a file path
    const lines = textContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    const firstFilePath = lines.find((line) => {
      // Check if line looks like a file path (contains / or \ and doesn't start with http/https)
      return (line.includes("/") || line.includes("\\")) && !line.startsWith("http://") && !line.startsWith("https://");
    });

    if (!firstFilePath) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No file path found in clipboard",
      });
      return;
    }

    // Resolve to absolute path
    const realPath = resolve(firstFilePath);

    // Verify the file exists
    try {
      await readFile(realPath);
      await Clipboard.copy(realPath);
      await showHUD(`Copied real path: ${realPath}`);
    } catch {
      await showToast({
        style: Toast.Style.Failure,
        title: "File not found",
        message: `Path: ${realPath}`,
      });
    }
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Error reading clipboard",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
