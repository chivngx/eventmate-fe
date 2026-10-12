import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key'

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Lấy Signed URL an toàn cho tài liệu KYC (CCCD, chân dung) từ private bucket kyc_documents
 */
export async function getKycDocumentUrl(pathOrUrl: string | null | undefined): Promise<string> {
  if (!pathOrUrl) return ""
  if (pathOrUrl.startsWith("data:") || pathOrUrl.startsWith("blob:")) return pathOrUrl

  try {
    let filePath = pathOrUrl
    if (pathOrUrl.includes("/kyc_documents/")) {
      const parts = pathOrUrl.split("/kyc_documents/")
      filePath = parts[1].split("?")[0]
    }

    if (filePath && !filePath.startsWith("http")) {
      const { data, error } = await supabase.storage
        .from("kyc_documents")
        .createSignedUrl(decodeURIComponent(filePath), 86400) // 24 hours
      if (!error && data?.signedUrl) {
        return data.signedUrl
      }
    }
  } catch (err) {
    console.error("Lỗi lấy signed url cho kyc document:", err)
  }

  return pathOrUrl
}

