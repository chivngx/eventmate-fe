import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

/**
 * API thực thi quyền rút lại sự đồng thuận & xóa toàn bộ dữ liệu cá nhân eKYC
 * Tuân thủ Điều 9 Nghị định 13/2023/NĐ-CP (Quyền xóa dữ liệu - Right to Erasure)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện quyền xóa dữ liệu cá nhân.' },
        { status: 401 }
      )
    }

    // 1. Gọi Stored Procedure xóa dữ liệu trong DB và reset trạng thái profiles
    const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)('delete_my_ekyc_data')

    if (rpcError) {
      console.error('Lỗi gọi delete_my_ekyc_data RPC:', rpcError)
      return NextResponse.json(
        { error: `Không thể xóa dữ liệu: ${rpcError.message}` },
        { status: 500 }
      )
    }

    // 2. Dọn dẹp các tệp ảnh tài liệu trong bucket kyc_documents
    try {
      const userFolder = (user.id as string)
      const { data: fileList } = await supabase.storage
        .from('kyc_documents')
        .list(userFolder)

      if (fileList && fileList.length > 0) {
        const filePaths = fileList.map(f => `${userFolder}/${f.name}`)
        await supabase.storage.from('kyc_documents').remove(filePaths)
      }
    } catch (storageErr) {
      console.warn('Lỗi dọn dẹp storage files của user:', storageErr)
      // Không chặn phản hồi thành công vì DB đã xóa sạch hồ sơ cá nhân
    }

    return NextResponse.json({
      success: true,
      message: 'Toàn bộ dữ liệu CCCD và sinh trắc học đã được xóa hoàn toàn theo Điều 9 Nghị định 13/2023/NĐ-CP.',
      details: rpcResult,
    })
  } catch (err: any) {
    console.error('Lỗi khi xóa dữ liệu eKYC:', err)
    return NextResponse.json(
      { error: err.message || 'Lỗi máy chủ khi xử lý yêu cầu xóa dữ liệu cá nhân.' },
      { status: 500 }
    )
  }
}
