import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// Initialize Cloudinary if credentials exist
let isCloudinaryConfigured = false;
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  isCloudinaryConfigured = true;
}

export const uploadToCloudinary = async (filePath, folder = "general") => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `medicare/${folder}`,
      });
      // Delete temporary file from local server
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      console.error("Cloudinary upload failed, falling back to local storage:", error);
    }
  }

  // Fallback to local storage (served via static middleware)
  try {
    const filename = path.basename(filePath);
    const destFolder = path.join("public", "uploads", folder);
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    const destPath = path.join(destFolder, filename);
    fs.copyFileSync(filePath, destPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Return local server URL (assumed host domain will be prepend on request if needed, or relative)
    const localUrl = `http://localhost:4000/uploads/${folder}/${filename}`;
    return {
      secure_url: localUrl,
      public_id: filename,
    };
  } catch (error) {
    console.error("Local file save failed:", error);
    return null;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (isCloudinaryConfigured && publicId && !publicId.includes(".")) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error("Cloudinary delete failed:", error);
      return false;
    }
  }

  // If local, we can try to find and delete the file in public/uploads
  try {
    // Attempt local file cleanup
    const searchPaths = [
      path.join("public", "uploads", "doctors", publicId),
      path.join("public", "uploads", "services", publicId)
    ];
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log(`Deleted local file: ${p}`);
        return true;
      }
    }
  } catch (e) {
    console.warn("Local file deletion warning:", e.message);
  }
  return true;
};
