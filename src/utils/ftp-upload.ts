/**
 * Namecheap FTP Upload Service
 * 
 * Handles file uploads to Namecheap hosting via FTP.
 * Used for product images and videos storage.
 * 
 * @author Philip Depaytez
 * @version 1.0.0
 */

import FTP from "ftp";
import { promisify } from "util";
import { Readable } from "stream";

/**
 * FTP connection configuration
 */
interface FTPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  baseUrl: string;
}

/**
 * Upload result interface
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  filename?: string;
}

/**
 * Get FTP configuration from environment variables
 */
function getFTPConfig(): FTPConfig | null {
  const host = process.env.NAMECHEAP_FTP_HOST;
  const port = process.env.NAMECHEAP_FTP_PORT;
  const user = process.env.NAMECHEAP_FTP_USER;
  const password = process.env.NAMECHEAP_FTP_PASSWORD;
  const baseUrl = process.env.NAMECHEAP_FTP_BASE_URL;

  if (!host || !user || !password || !baseUrl) {
    console.warn("FTP configuration is incomplete. Please check environment variables.");
    return null;
  }

  return {
    host,
    port: parseInt(port || "21", 10),
    user,
    password,
    baseUrl: baseUrl.replace(/\/$/, ""), // Remove trailing slash
  };
}

/**
 * Connect to FTP server
 */
function connectFTP(config: FTPConfig): Promise<FTP> {
  return new Promise((resolve, reject) => {
    const client = new FTP();
    
    client.on("ready", () => {
      resolve(client);
    });
    
    client.on("error", (err) => {
      reject(err);
    });
    
    client.connect({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      secure: false, // Set to true if FTPS is required
      secureOptions: {
        rejectUnauthorized: false,
      },
    });
  });
}

/**
 * Upload a single file to Namecheap FTP
 * 
 * @param file - File object from FormData
 * @param folder - Destination folder on FTP server (e.g., "products", "products/images")
 * @returns Upload result with URL or error
 */
export async function uploadFileToFTP(
  file: File,
  folder: string = "products"
): Promise<UploadResult> {
  const config = getFTPConfig();
  
  if (!config) {
    return {
      success: false,
      error: "FTP configuration is missing. Please check environment variables.",
    };
  }

  let client: FTP | null = null;

  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split(".").pop() || "file";
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Construct remote path
    const remotePath = `/${folder}/${filename}`;
    
    // Connect to FTP
    client = await connectFTP(config);
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readableStream = Readable.from(buffer);
    
    // Promisify put method
    const put = promisify(client.put.bind(client));
    
    // Ensure directory exists (FTP doesn't auto-create directories)
    await ensureDirectoryExists(client, folder);
    
    // Upload file
    await put(readableStream, remotePath);
    
    // Construct public URL
    const publicUrl = `${config.baseUrl}/${folder}/${filename}`;
    
    return {
      success: true,
      url: publicUrl,
      filename,
    };
  } catch (error) {
    console.error("FTP upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    };
  } finally {
    // Close FTP connection
    if (client) {
      client.end();
    }
  }
}

/**
 * Upload multiple files to Namecheap FTP
 * 
 * @param files - Array of File objects from FormData
 * @param folder - Destination folder on FTP server
 * @returns Array of upload results
 */
export async function uploadMultipleFilesToFTP(
  files: File[],
  folder: string = "products"
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const file of files) {
    const result = await uploadFileToFTP(file, folder);
    results.push(result);
  }
  
  return results;
}

/**
 * Ensure directory exists on FTP server
 */
async function ensureDirectoryExists(client: FTP, directory: string): Promise<void> {
  const cwd = promisify(client.cwd.bind(client));
  const mkdir = promisify(client.mkdir.bind(client));
  
  try {
    await cwd(directory);
  } catch {
    // Directory doesn't exist, create it
    try {
      // Try to create directory recursively by splitting path
      const parts = directory.split("/").filter(Boolean);
      let currentPath = "";
      
      for (const part of parts) {
        currentPath += "/" + part;
        try {
          await cwd(currentPath);
        } catch {
          await mkdir(currentPath);
        }
      }
    } catch (mkdirError) {
      console.warn("Failed to create directory:", mkdirError);
      // Continue anyway - the upload might still work
    }
  }
}

/**
 * Delete a file from FTP server
 * 
 * @param filename - Name of the file to delete
 * @param folder - Folder where the file is located
 * @returns Result of deletion operation
 */
export async function deleteFileFromFTP(
  filename: string,
  folder: string = "products"
): Promise<{ success: boolean; error?: string }> {
  const config = getFTPConfig();
  
  if (!config) {
    return {
      success: false,
      error: "FTP configuration is missing.",
    };
  }

  let client: FTP | null = null;

  try {
    client = await connectFTP(config);
    
    const deleteFile = promisify(client.delete.bind(client));
    const remotePath = `/${folder}/${filename}`;
    
    await deleteFile(remotePath);
    
    return { success: true };
  } catch (error) {
    console.error("FTP delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  } finally {
    if (client) {
      client.end();
    }
  }
}

/**
 * Extract filename from URL
 * 
 * @param url - Full URL of the file
 * @returns Filename extracted from URL
 */
export function extractFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.substring(pathname.lastIndexOf("/") + 1);
  } catch {
    // If URL parsing fails, try simple string manipulation
    return url.substring(url.lastIndexOf("/") + 1);
  }
}
