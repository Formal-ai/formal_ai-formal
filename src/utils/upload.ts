import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to Supabase storage and returns the public URL.
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @returns The public URL of the uploaded file
 */
export const uploadImage = async (file: File | string, bucket: string = "generations"): Promise<string> => {
    let fileToUpload: File | Blob;

    if (typeof file === 'string') {
        // Convert base64 to Blob if needed
        const response = await fetch(file);
        fileToUpload = await response.blob();
    } else {
        fileToUpload = file;
    }

    const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.jpg`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
            contentType: 'image/jpeg',
            upsert: false
        });

    if (error) {
        console.error("Storage upload error:", error);
        if (error.message?.includes("bucket not found")) {
            throw new Error("Storage Error: The 'generations' bucket does not exist. Please create a public bucket named 'generations' in your Supabase Dashboard -> Storage.");
        }
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
};
