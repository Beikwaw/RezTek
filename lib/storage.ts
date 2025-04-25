import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebase';

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/quicktime']
};

// Define maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024 // 50MB
};

// Function to validate file type and size
function validateFile(file: File, type: 'image' | 'document' | 'video'): { isValid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES[type].includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES[type].join(', ')}` 
    };
  }

  if (file.size > MAX_FILE_SIZES[type]) {
    return { 
      isValid: false, 
      error: `File too large. Maximum size: ${MAX_FILE_SIZES[type] / (1024 * 1024)}MB` 
    };
  }

  return { isValid: true };
}

// Function to upload a file
export async function uploadFile(
  file: File,
  path: string,
  type: 'image' | 'document' | 'video'
): Promise<{ url: string; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file, type);
    if (!validation.isValid) {
      return { url: '', error: validation.error };
    }

    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    
    return { url };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { 
      url: '', 
      error: 'Failed to upload file. Please try again.' 
    };
  }
}

// Function to delete a file
export async function deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Create storage reference from URL
    const storageRef = ref(storage, url);
    
    // Delete file
    await deleteObject(storageRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { 
      success: false, 
      error: 'Failed to delete file. Please try again.' 
    };
  }
}

// Function to get file metadata
export async function getFileMetadata(url: string): Promise<{ 
  size: number; 
  contentType: string; 
  error?: string 
}> {
  try {
    const storageRef = ref(storage, url);
    const metadata = await storageRef.getMetadata();
    
    return {
      size: metadata.size,
      contentType: metadata.contentType
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return { 
      size: 0, 
      contentType: '', 
      error: 'Failed to get file metadata.' 
    };
  }
}

// Function to check tenant's image count
export async function getTenantImageCount(tenantId: string): Promise<number> {
  try {
    const storageRef = ref(storage, `tenants/${tenantId}/images`);
    const result = await listAll(storageRef);
    return result.items.length;
  } catch (error) {
    console.error('Error getting tenant image count:', error);
    return 0;
  }
}

// Function to upload a tenant image
export async function uploadTenantImage(
  file: File,
  tenantId: string
): Promise<{ url: string; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file, 'image');
    if (!validation.isValid) {
      return { url: '', error: validation.error };
    }

    // Check image count
    const imageCount = await getTenantImageCount(tenantId);
    if (imageCount >= 2) {
      return { 
        url: '', 
        error: 'Maximum of 2 images allowed per tenant' 
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `image_${timestamp}.${fileExtension}`;
    const path = `tenants/${tenantId}/images/${fileName}`;

    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    
    return { url };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { 
      url: '', 
      error: 'Failed to upload file. Please try again.' 
    };
  }
}

// Function to get all tenant images
export async function getTenantImages(tenantId: string): Promise<{ urls: string[]; error?: string }> {
  try {
    const storageRef = ref(storage, `tenants/${tenantId}/images`);
    const result = await listAll(storageRef);
    
    const urls = await Promise.all(
      result.items.map(async (item) => {
        return await getDownloadURL(item);
      })
    );
    
    return { urls };
  } catch (error) {
    console.error('Error getting tenant images:', error);
    return { 
      urls: [], 
      error: 'Failed to get tenant images.' 
    };
  }
}

// Function to delete a tenant image
export async function deleteTenantImage(
  tenantId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create storage reference from URL
    const storageRef = ref(storage, imageUrl);
    
    // Delete file
    await deleteObject(storageRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { 
      success: false, 
      error: 'Failed to delete file. Please try again.' 
    };
  }
} 