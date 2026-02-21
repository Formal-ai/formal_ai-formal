import { supabase } from "@/integrations/supabase/client";

// C6 FIX: File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

/**
 * Validates a file before upload.
 * @throws Error if file is invalid
 */
export function validateImageFile(file: File): void {
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(
            `Invalid file type "${file.type}". Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
        );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(
            `File too large (${sizeMB}MB). Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
        );
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
        throw new Error(
            `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
        );
    }
}

/**
 * Validates a base64 data URI string.
 * @throws Error if data URI is invalid or too large
 */
export function validateBase64Image(dataUri: string): void {
    if (!dataUri.startsWith('data:image/')) {
        throw new Error('Invalid image data: not a valid data URI');
    }

    // Extract MIME type from data URI
    const mimeMatch = dataUri.match(/^data:(image\/[a-z+]+);base64,/);
    if (!mimeMatch) {
        throw new Error('Invalid image data: unrecognized format');
    }

    const mimeType = mimeMatch[1];
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error(`Invalid image type "${mimeType}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }

    // Estimate decoded size (base64 adds ~33% overhead)
    const base64Part = dataUri.split(',')[1];
    if (base64Part) {
        const estimatedSize = (base64Part.length * 3) / 4;
        if (estimatedSize > MAX_FILE_SIZE) {
            const sizeMB = (estimatedSize / (1024 * 1024)).toFixed(1);
            throw new Error(
                `Image too large (~${sizeMB}MB). Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
            );
        }
    }
}

/**
 * Uploads a file to Supabase storage and returns the public URL.
 * @param file The file to upload (File object or base64 data URI string)
 * @param bucket The storage bucket name
 * @returns The public URL of the uploaded file
 */
export const uploadImage = async (file: File | string, bucket: string = "generations"): Promise<string> => {
    let fileToUpload: File | Blob;
    let contentType = 'image/jpeg'; // Default

    if (typeof file === 'string') {
        // C6 FIX: Validate base64 data URI
        validateBase64Image(file);

        // Extract actual content type from data URI
        const mimeMatch = file.match(/^data:(image\/[a-z+]+);base64,/);
        if (mimeMatch) {
            contentType = mimeMatch[1];
        }

        const response = await fetch(file);
        fileToUpload = await response.blob();
    } else {
        // C6 FIX: Validate file before upload
        validateImageFile(file);
        contentType = file.type || 'image/jpeg';
        fileToUpload = file;
    }

    // M4 FIX: Use crypto.randomUUID() for unpredictable filenames
    const extension = contentType.split('/')[1]?.replace('+xml', '') || 'jpg';
    const fileName = `${crypto.randomUUID()}.${extension}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
            contentType,
            upsert: false
        });

    if (error) {
        console.error("Storage upload error:", error);
        if (error.message?.includes("bucket not found")) {
            throw new Error("Storage Error: The 'generations' bucket does not exist. Please create a public bucket named 'generations' in your Supabase Dashboard → Storage.");
        }
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
};
