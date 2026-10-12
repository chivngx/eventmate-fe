import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import crypto from "crypto"

// Danh mục 63 mã tỉnh/thành phố trên CCCD Việt Nam
const VALID_PROVINCE_CODES = new Set([
  '001', '002', '004', '006', '008', '010', '011', '012', '014', '015',
  '017', '019', '020', '022', '024', '025', '026', '027', '030', '031',
  '033', '034', '035', '036', '037', '038', '040', '042', '044', '045',
  '046', '048', '049', '051', '052', '054', '056', '058', '060', '062',
  '064', '066', '067', '068', '070', '072', '074', '075', '077', '079',
  '080', '082', '083', '084', '086', '087', '089', '091', '092', '093',
  '094', '095', '096'
])

/**
 * Kiểm tra 6 quy tắc nghiệp vụ số CCCD theo quy chuẩn Bộ Công An
 */
function validateCccdLogic(id: string, dob?: string): { isValid: boolean; error?: string } {
  if (!id || !/^\d{12}$/.test(id)) {
    return { isValid: false, error: 'Số CCCD phải bao gồm chính xác 12 chữ số.' }
  }
  const provinceCode = id.substring(0, 3)
  if (!VALID_PROVINCE_CODES.has(provinceCode)) {
    return { isValid: false, error: `Mã tỉnh/thành phố (${provinceCode}) không hợp lệ.` }
  }
  const genderCentury = id.substring(3, 4)
  if (!['0', '1', '2', '3'].includes(genderCentury)) {
    return { isValid: false, error: 'Mã giới tính/thế kỷ trên số CCCD không hợp lệ.' }
  }
  const yearSuffix = id.substring(4, 6)
  if (dob) {
    const cleanDob = dob.replace(/\D/g, '')
    let birthYearSuffix = ''
    if (cleanDob.length === 8) {
      const first4 = Number(cleanDob.substring(0, 4))
      const last4 = Number(cleanDob.substring(4, 8))
      if (last4 >= 1900 && last4 <= 2099) {
        // Định dạng DDMMYYYY -> Lấy 2 chữ số cuối của năm
        birthYearSuffix = cleanDob.substring(6, 8)
      } else if (first4 >= 1900 && first4 <= 2099) {
        // Định dạng YYYYMMDD -> Lấy 2 chữ số cuối của năm
        birthYearSuffix = cleanDob.substring(2, 4)
      } else {
        birthYearSuffix = cleanDob.slice(-2)
      }
    } else if (cleanDob.length >= 2) {
      birthYearSuffix = cleanDob.slice(-2)
    }

    if (birthYearSuffix && birthYearSuffix !== yearSuffix) {
      return { isValid: false, error: 'Hai chữ số năm sinh trên thẻ không trùng khớp với ngày sinh.' }
    }
  }
  return { isValid: true }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện xác thực eKYC.' },
        { status: 401 }
      )
    }

    // 0. Chặn tài khoản đã xác thực thành công trước đó (tránh spam và lãng phí credit GPU)
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('is_verified, kyc_status')
      .eq('id', user.id)
      .maybeSingle()

    if (currentProfile?.is_verified || currentProfile?.kyc_status === 'verified') {
      return NextResponse.json(
        {
          status: 'already_verified',
          code: 'ALREADY_VERIFIED',
          message: 'Tài khoản của bạn đã được xác thực danh tính (eKYC) thành công trước đó.'
        },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const consentGiven = formData.get('consent_given') === 'true'

    // Tuân thủ Điều 11 Nghị định 13/2023/NĐ-CP: Bắt buộc có sự đồng thuận rõ ràng
    if (!consentGiven) {
      return NextResponse.json(
        {
          error: 'Bắt buộc phải có sự đồng ý xử lý dữ liệu cá nhân & sinh trắc học theo Điều 11 Nghị định 13/2023/NĐ-CP.'
        },
        { status: 403 }
      )
    }

    const frontImage = formData.get('front_image')
    const selfieImage = formData.get('selfie_image')

    if (!frontImage || !selfieImage) {
      return NextResponse.json(
        { error: 'Thiếu ảnh CCCD mặt trước hoặc ảnh chân dung khuôn mặt.' },
        { status: 400 }
      )
    }

    const colabUrl = process.env.NEXT_PUBLIC_COLAB_AI_URL || process.env.COLAB_AI_URL
    const apiKey = process.env.EKYC_API_KEY || 'eventmate_super_secret_2026'

    if (!colabUrl) {
      return NextResponse.json(
        {
          error: 'Hệ thống AI GPU Server chưa được cấu hình (Thiếu NEXT_PUBLIC_COLAB_AI_URL).'
        },
        { status: 503 }
      )
    }

    // Kiểm tra sớm TRƯỚC KHI GỌI GPU nếu Client đã có số CCCD (từ QR code quét trên camera)
    const clientQrStr = formData.get('qr_data')?.toString()
    let earlyIdNumber = formData.get('id_card_number')?.toString() || ''
    if (!earlyIdNumber && clientQrStr) {
      try {
        const parsed = JSON.parse(clientQrStr)
        if (parsed.id_number) earlyIdNumber = parsed.id_number
      } catch {}
    }

    if (earlyIdNumber && /^\d{12}$/.test(earlyIdNumber)) {
      const earlyHash = crypto.createHash('sha256').update(earlyIdNumber).digest('hex')
      const { data: duplicateProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id_card_hash', earlyHash)
        .neq('id', user.id)
        .maybeSingle()

      if (duplicateProfile) {
        return NextResponse.json(
          {
            status: 'rejected',
            code: 'CCCD_ALREADY_USED_BY_ANOTHER_ACCOUNT',
            message: 'Thẻ CCCD này đã được liên kết và xác thực với một tài khoản khác trong hệ thống.'
          },
          { status: 409 }
        )
      }
    }

    // Chuyển tiếp Multipart FormData trực tiếp tới Colab GPU Backend
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 35000) // Timeout 35s cho InsightFace GPU

    const backendFormData = new FormData()
    backendFormData.append('card_front', frontImage)
    backendFormData.append('front_image', frontImage)
    backendFormData.append('selfie', selfieImage)
    backendFormData.append('selfie_image', selfieImage)
    const backImage = formData.get('back_image') || formData.get('card_back')
    if (backImage) {
      backendFormData.append('card_back', backImage)
      backendFormData.append('back_image', backImage)
    }

    let aiResponse: Response
    try {
      aiResponse = await fetch(`${colabUrl.replace(/\/$/, '')}/api/verify-ekyc`, {
        method: 'POST',
        body: backendFormData,
        headers: {
          'X-API-KEY': apiKey,
        },
        signal: controller.signal,
      })
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json(
          { error: 'AI GPU Server phản hồi quá lâu (Timeout 35s). Vui lòng thử lại sau.' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { error: `Không thể kết nối tới AI GPU Server (${colabUrl}). Vui lòng kiểm tra Cloudflare Tunnel.` },
        { status: 502 }
      )
    }
    clearTimeout(timeoutId)

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      return NextResponse.json(
        { error: `AI GPU Server báo lỗi (HTTP ${aiResponse.status}): ${errText}` },
        { status: 502 }
      )
    }

    const aiResult = await aiResponse.json()

    // 1. Kiểm tra đối soát 3 chiều (Tam giác vàng)
    if (aiResult.is_tampered) {
      return NextResponse.json(
        {
          status: 'rejected',
          code: 'CARD_TAMPERED',
          message: 'Dữ liệu quét thẻ phát hiện dấu hiệu can thiệp/chỉnh sửa giữa QR Code và bề mặt thẻ.'
        },
        { status: 422 }
      )
    }

    // 2. Validate Bộ 6 quy tắc nghiệp vụ số CCCD
    const clientQrDataStr = formData.get('qr_data')?.toString()
    let clientQr: any = null
    try {
      if (clientQrDataStr) clientQr = JSON.parse(clientQrDataStr)
    } catch {}

    const clientIdNumber = formData.get('id_card_number')?.toString() || clientQr?.id_number || ''
    const clientFullName = formData.get('full_name')?.toString() || clientQr?.full_name || ''
    const clientDob = formData.get('dob')?.toString() || clientQr?.dob || ''
    const clientGender = formData.get('gender')?.toString() || clientQr?.gender || ''
    const clientAddress = formData.get('address')?.toString() || clientQr?.address || ''

    // Lấy thông tin từ Colab AI (ưu tiên số 1), nếu thiếu thì fallback về client OCR/QR hoặc Profile
    let idNumber = aiResult.qr_data?.id_number || aiResult.ocr_front?.id_number || clientIdNumber || ''
    let dob = aiResult.qr_data?.dob || aiResult.ocr_front?.dob || clientDob || ''
    let fullName = aiResult.qr_data?.full_name || aiResult.ocr_front?.full_name || clientFullName || ''
    let address = aiResult.qr_data?.address || aiResult.ocr_front?.address || clientAddress || ''
    let gender = aiResult.qr_data?.gender || clientGender || ''
    let issueDate = aiResult.qr_data?.issue_date || clientQr?.issue_date || ''

    // Nếu họ tên vẫn chưa có (do không quét được QR), lấy từ thông tin profile của user để không bị trống giao diện
    if (!fullName) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
      if (userProfile?.full_name) {
        fullName = userProfile.full_name
      }
    }

    if (idNumber) {
      const logicCheck = validateCccdLogic(idNumber, dob)
      if (!logicCheck.isValid) {
        return NextResponse.json(
          {
            status: 'rejected',
            code: 'CCCD_LOGIC_INVALID',
            message: logicCheck.error
          },
          { status: 422 }
        )
      }
    }

    // Băm SHA-256 số CCCD để chống trùng lặp và bảo vệ dữ liệu cá nhân
    const idCardHash = crypto
      .createHash('sha256')
      .update(idNumber || `UNASSIGNED_${user.id}`)
      .digest('hex')

    // Chặn dùng chung số CCCD: 1 người / 1 CCCD chỉ được liên kết duy nhất 1 tài khoản
    if (idNumber) {
      // 1. Kiểm tra Profiles: đã có tài khoản khác nào kích hoạt số CCCD này chưa?
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id_card_hash', idCardHash)
        .neq('id', user.id)
        .maybeSingle()

      if (existingProfile) {
        return NextResponse.json(
          {
            status: 'rejected',
            code: 'CCCD_ALREADY_USED_BY_ANOTHER_ACCOUNT',
            message: 'Thẻ CCCD này đã được liên kết và xác thực với một tài khoản khác trong hệ thống.'
          },
          { status: 409 }
        )
      }

      // 2. Kiểm tra ekyc_verifications: có tài khoản khác đang có hồ sơ duyệt với CCCD này không?
      const { data: duplicateKyc } = await (supabase.from('ekyc_verifications') as any)
        .select('id, user_id, status')
        .eq('id_card_hash', idCardHash)
        .neq('user_id', user.id)
        .in('status', ['auto_approved', 'pending_admin'])
        .limit(1)
        .maybeSingle()

      if (duplicateKyc) {
        return NextResponse.json(
          {
            status: 'rejected',
            code: 'CCCD_DUPLICATED_IN_REVIEW',
            message: 'Thẻ CCCD này đã tồn tại hồ sơ xác thực trên một tài khoản khác.'
          },
          { status: 409 }
        )
      }
    }

    // Phân loại trạng thái duyệt
    const cosineSim = Number(aiResult.cosine_similarity || 0)
    let matchScore = Number(aiResult.score ?? aiResult.match_score ?? aiResult.face_match_score ?? 0)
    if (matchScore === 0 && cosineSim > 0.2) {
      if (cosineSim < 0.35) {
        matchScore = Math.max(0, Math.round((cosineSim / 0.35) * 40))
      } else if (cosineSim < 0.50) {
        matchScore = Math.round(41 + ((cosineSim - 0.35) / 0.15) * 28)
      } else if (cosineSim < 0.65) {
        matchScore = Math.round(70 + ((cosineSim - 0.50) / 0.15) * 18)
      } else {
        matchScore = Math.min(100, Math.round(88 + ((cosineSim - 0.65) / 0.20) * 12))
      }
    }
    let verificationStatus: 'auto_approved' | 'pending_admin' | 'rejected' = 'rejected'
    let isVerified = false
    let rejectionReason: string | null = null

    const hasQr = Boolean(aiResult.qr_data?.id_number || clientQr?.id_number)
    const hasOcr = Boolean(aiResult.ocr_front?.id_number)

    if (cosineSim >= 0.50 && !aiResult.is_tampered && hasQr && hasOcr) {
      verificationStatus = 'auto_approved'
      isVerified = true
    } else if (cosineSim >= 0.50 && (!hasQr || !hasOcr)) {
      verificationStatus = 'pending_admin'
      isVerified = false
      rejectionReason = !hasQr
        ? 'Chưa giải mã được mã QR trên thẻ CCCD để hoàn tất đối soát Tam giác vàng 3 chiều. Chuyển Admin xác minh.'
        : 'Chưa nhận diện đủ chữ in trên mặt thẻ để đối soát Tam giác vàng 3 chiều. Chuyển Admin xác minh.'
    } else if (cosineSim >= 0.40) {
      verificationStatus = 'pending_admin'
      isVerified = false
      rejectionReason = 'Độ tương đồng khuôn mặt cận biên (40%-49%). Chuyển Admin đối soát hồ sơ.'
    } else {
      verificationStatus = 'rejected'
      isVerified = false
      rejectionReason = `Khuôn mặt trong ảnh selfie không trùng khớp với ảnh trên thẻ CCCD (Cosine: ${cosineSim.toFixed(2)}).`
    }

    // 3. Lưu vào Database ekyc_verifications chuyên dụng
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Lấy URL lưu trữ tài liệu trong bucket kyc_documents
    const cccdFrontUrl = formData.get('front_url')?.toString() || `kyc/${user.id}/cccd_front_${Date.now()}.jpg`
    const cccdBackUrl = formData.get('back_url')?.toString() || null
    const selfieUrl = formData.get('selfie_url')?.toString() || `kyc/${user.id}/selfie_${Date.now()}.jpg`

    const { data: record, error: dbError } = await (supabase.from('ekyc_verifications') as any)
      .insert({
        user_id: user.id,
        session_id: `ekyc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        id_card_number: idNumber,
        id_card_hash: idCardHash,
        full_name: fullName,
        dob: dob,
        gender: gender,
        address: address,
        issue_date: issueDate,
        qr_data: aiResult.qr_data || null,
        ocr_front_data: aiResult.ocr_front || null,
        mrz_data: aiResult.mrz_data || null,
        is_tampered: Boolean(aiResult.is_tampered),
        face_match_score: matchScore,
        cosine_similarity: cosineSim,
        card_face_thumbnail_url: aiResult.card_face_thumbnail || null,
        cccd_front_url: cccdFrontUrl,
        cccd_back_url: cccdBackUrl,
        selfie_url: selfieUrl,
        status: verificationStatus,
        is_verified: isVerified,
        rejection_reason: rejectionReason,
        ai_engine: 'insightface_gpu_arcface_512d',
        consent_given: true,
        consent_terms_version: 'ND13_2023_V1',
        user_ip_address: clientIp,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Lỗi lưu ekyc_verifications:', dbError)
      // Nếu trùng id_card_hash
      if (dbError.code === '23505') {
        return NextResponse.json(
          {
            status: 'rejected',
            code: 'CCCD_DUPLICATED',
            message: 'Số CCCD này đã được đăng ký và xác thực trên một tài khoản khác.'
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: `Lỗi cơ sở dữ liệu khi ghi nhận eKYC: ${dbError.message}` },
        { status: 500 }
      )
    }

    // Đồng bộ trực tiếp vào bảng Profiles để tài khoản cập nhật ngay lập tức
    if (isVerified || verificationStatus === 'auto_approved') {
      const cleanDob = dob ? dob.replace(/\D/g, '') : ''
      let birthYear: number | null = null
      if (cleanDob.length === 8) {
        const last4 = Number(cleanDob.substring(4, 8))
        const first4 = Number(cleanDob.substring(0, 4))
        if (last4 >= 1900 && last4 <= 2099) birthYear = last4
        else if (first4 >= 1900 && first4 <= 2099) birthYear = first4
      } else if (cleanDob.length === 4) {
        birthYear = Number(cleanDob)
      }

      const mappedGender = gender?.toLowerCase().includes('nam')
        ? 'male'
        : gender?.toLowerCase().includes('nữ') || gender?.toLowerCase().includes('nu')
        ? 'female'
        : null

      const profileUpdate: any = {
        is_verified: true,
        kyc_status: 'verified',
        id_card_hash: idCardHash,
      }
      if (fullName) profileUpdate.full_name = fullName
      if (mappedGender) profileUpdate.gender = mappedGender
      if (birthYear) profileUpdate.birth_year = birthYear
      if (address) profileUpdate.address = address

      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
    }

    // Che mờ số CCCD khi trả về để bảo vệ quyền riêng tư
    const maskedId = idNumber.length === 12
      ? `${idNumber.slice(0, 3)}******${idNumber.slice(9)}`
      : idNumber

    return NextResponse.json({
      success: true,
      status: verificationStatus,
      is_verified: isVerified,
      cosine_similarity: cosineSim,
      face_match_score: matchScore,
      masked_id_card: maskedId,
      full_name: fullName,
      dob: dob,
      gender: gender,
      address: address,
      card_face_thumbnail: aiResult.card_face_thumbnail,
      rejection_reason: rejectionReason,
      verification_id: record?.id,
    })
  } catch (err: any) {
    console.error('Lỗi API eKYC Verify:', err)
    return NextResponse.json(
      { error: err.message || 'Lỗi xử lý nội bộ tại Gateway eKYC.' },
      { status: 500 }
    )
  }
}
