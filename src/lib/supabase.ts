import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadPaymentScreenshot(file: File): Promise<string> {
  // If Supabase credentials are configured, upload to 'payment-proofs' bucket
  if (supabaseUrl && !supabaseUrl.includes('your-supabase-project')) {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.error('Supabase upload error:', error);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch (e) {
      console.error('Failed to upload file to Supabase storage:', e);
    }
  }

  // Fallback: Convert file to Base64 data URL for instant client/demo preview
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function uploadQrCodeImage(file: File): Promise<string> {
  if (supabaseUrl && !supabaseUrl.includes('your-supabase-project')) {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `qr-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `qr-codes/${fileName}`;

      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.error('Supabase QR upload error:', error);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch (e) {
      console.error('Failed to upload QR file to Supabase storage:', e);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
