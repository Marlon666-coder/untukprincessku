import { isSupabaseConfigured } from '../config/env';
import { createId } from '../utils/id';

// Supabase Storage bucket for memory photos (private bucket + signed URLs).
export const MEMORY_PHOTO_BUCKET = 'memory-photos';

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export const photoService = {
  validate(file) {
    if (!file) return 'Tidak ada file.';
    if (ACCEPTED_TYPES.length && file.type && !ACCEPTED_TYPES.includes(file.type)) {
      return 'Format foto harus JPG, PNG, WEBP, atau HEIC.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Ukuran foto maksimal ${MAX_SIZE_MB}MB.`;
    return null;
  },

  /**
   * Preview mode: creates a temporary blob URL so the photo shows on screen.
   * It is NOT stored anywhere and disappears on refresh.
   *
   * Supabase version (next step):
   *   const path = `${coupleId}/${memoryId}/${fileName}`;
   *   await supabase.storage.from(MEMORY_PHOTO_BUCKET).upload(path, file);
   *   -> insert row into `memory_photos` with storage_path = path
   */
  async uploadMemoryPhoto(file, memoryId = 'draft') {
    const error = this.validate(file);
    if (error) throw new Error(error);

    const storagePath = `preview/${memoryId}/${createId('photo')}-${file.name}`;
    return {
      id: createId('photo'),
      memory_id: memoryId,
      storage_path: storagePath,
      photo_url: URL.createObjectURL(file),
      is_temporary: !isSupabaseConfigured,
      created_at: new Date().toISOString(),
    };
  },

  releasePreview(photo) {
    if (photo?.is_temporary && photo.photo_url?.startsWith('blob:')) URL.revokeObjectURL(photo.photo_url);
  },
};
