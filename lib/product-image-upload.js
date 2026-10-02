import { getSupabase } from "./supabase";
import { uploadProductImage as uploadImage } from "./product-image-upload.mjs";

export const uploadProductImage = (file) => uploadImage(file, getSupabase);
