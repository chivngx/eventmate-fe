/**
 * Bộ kiểm tra quy chuẩn CCCD 12 số của Bộ Công An Việt Nam
 */

// Danh mục 63 mã tỉnh/thành phố chuẩn
export const VALID_PROVINCE_CODES: Record<string, string> = {
  '001': 'Hà Nội',
  '002': 'Hà Giang',
  '004': 'Cao Bằng',
  '006': 'Bắc Kạn',
  '008': 'Tuyên Quang',
  '010': 'Lào Cai',
  '011': 'Điện Biên',
  '012': 'Lai Châu',
  '014': 'Sơn La',
  '015': 'Yên Bái',
  '017': 'Hòa Bình',
  '019': 'Thái Nguyên',
  '020': 'Lạng Sơn',
  '022': 'Quảng Ninh',
  '024': 'Bắc Giang',
  '025': 'Phú Thọ',
  '026': 'Vĩnh Phúc',
  '027': 'Bắc Ninh',
  '030': 'Hải Dương',
  '031': 'Hải Phòng',
  '033': 'Hưng Yên',
  '034': 'Thái Bình',
  '035': 'Hà Nam',
  '036': 'Nam Định',
  '037': 'Ninh Bình',
  '038': 'Thanh Hóa',
  '040': 'Nghệ An',
  '042': 'Hà Tĩnh',
  '044': 'Quảng Bình',
  '045': 'Quảng Trị',
  '046': 'Thừa Thiên Huế',
  '048': 'Đà Nẵng',
  '049': 'Quảng Nam',
  '051': 'Quảng Ngãi',
  '052': 'Bình Định',
  '054': 'Phú Yên',
  '056': 'Khánh Hòa',
  '058': 'Ninh Thuận',
  '060': 'Bình Thuận',
  '062': 'Kon Tum',
  '064': 'Gia Lai',
  '066': 'Đắk Lắk',
  '067': 'Đắk Nông',
  '068': 'Lâm Đồng',
  '070': 'Bình Phước',
  '072': 'Tây Ninh',
  '074': 'Bình Dương',
  '075': 'Đồng Nai',
  '077': 'Bà Rịa - Vũng Tàu',
  '079': 'TP. Hồ Chí Minh',
  '080': 'Long An',
  '082': 'Tiền Giang',
  '083': 'Bến Tre',
  '084': 'Trà Vinh',
  '086': 'Vĩnh Long',
  '087': 'Đồng Tháp',
  '089': 'An Giang',
  '091': 'Kiên Giang',
  '092': 'Cần Thơ',
  '093': 'Hậu Giang',
  '094': 'Sóc Trăng',
  '095': 'Bạc Liêu',
  '096': 'Cà Mau',
}

export interface CccdValidateParams {
  idNumber: string
  dob?: string // DDMMYYYY hoặc DD/MM/YYYY
  gender?: string // 'Nam' | 'Nữ'
}

export interface CccdValidateResult {
  isValid: boolean
  errorMessage?: string
  provinceName?: string
  centuryGenderDesc?: string
  birthYear?: number
}

export class CccdValidator {
  /**
   * Validate toàn bộ 6 quy tắc thẻ căn cước 12 số
   */
  static validate(params: CccdValidateParams): CccdValidateResult {
    const { idNumber, dob, gender } = params

    // 1. Độ dài và định dạng số
    if (!idNumber || !/^\d{12}$/.test(idNumber)) {
      return {
        isValid: false,
        errorMessage: 'Số CCCD phải bao gồm đúng 12 chữ số (không chứa chữ hoặc ký tự đặc biệt).',
      }
    }

    // 2. Quy tắc 3 số đầu: Mã tỉnh/thành phố
    const provinceCode = idNumber.substring(0, 3)
    const provinceName = VALID_PROVINCE_CODES[provinceCode]
    if (!provinceName) {
      return {
        isValid: false,
        errorMessage: `Mã tỉnh/thành phố (${provinceCode}) không nằm trong danh mục 63 tỉnh thành Việt Nam.`,
      }
    }

    // 3. Quy tắc số thứ 4: Thế kỷ sinh và giới tính
    // Thế kỷ 20 (1900-1999): Nam là 0, Nữ là 1
    // Thế kỷ 21 (2000-2099): Nam là 2, Nữ là 3
    // Thế kỷ 22 (2100-2199): Nam là 4, Nữ là 5
    const genderCenturyCode = idNumber.charAt(3)
    if (!['0', '1', '2', '3', '4', '5'].includes(genderCenturyCode)) {
      return {
        isValid: false,
        errorMessage: `Mã thế kỷ/giới tính (${genderCenturyCode}) không đúng quy định.`,
      }
    }

    let expectedCentury = 1900
    let expectedGender = 'Nam'

    if (genderCenturyCode === '0') {
      expectedCentury = 1900
      expectedGender = 'Nam'
    } else if (genderCenturyCode === '1') {
      expectedCentury = 1900
      expectedGender = 'Nữ'
    } else if (genderCenturyCode === '2') {
      expectedCentury = 2000
      expectedGender = 'Nam'
    } else if (genderCenturyCode === '3') {
      expectedCentury = 2000
      expectedGender = 'Nữ'
    } else if (genderCenturyCode === '4') {
      expectedCentury = 2100
      expectedGender = 'Nam'
    } else if (genderCenturyCode === '5') {
      expectedCentury = 2100
      expectedGender = 'Nữ'
    }

    if (gender) {
      const cleanGender = gender.trim().toLowerCase()
      if (
        (cleanGender === 'nam' && expectedGender !== 'Nam') ||
        (cleanGender === 'nữ' && expectedGender !== 'Nữ')
      ) {
        return {
          isValid: false,
          errorMessage: `Giới tính '${gender}' không khớp với mã giới tính số (${genderCenturyCode}) trên số CCCD.`,
        }
      }
    }

    // 4. Quy tắc số thứ 5 & 6: Hai số cuối năm sinh
    const yearSuffix = idNumber.substring(4, 6)
    const fullBirthYear = expectedCentury + parseInt(yearSuffix, 10)

    if (dob) {
      const cleanDob = dob.replace(/\D/g, '')
      let dobYearSuffix = ''
      if (cleanDob.length === 8) {
        dobYearSuffix = cleanDob.substring(6, 8)
      } else if (cleanDob.length >= 4) {
        dobYearSuffix = cleanDob.slice(-2)
      }

      if (dobYearSuffix && dobYearSuffix !== yearSuffix) {
        return {
          isValid: false,
          errorMessage: `Năm sinh (${dobYearSuffix}) trong ngày sinh không trùng khớp với số năm sinh (${yearSuffix}) trên số CCCD.`,
        }
      }
    }

    return {
      isValid: true,
      provinceName,
      birthYear: fullBirthYear,
      centuryGenderDesc: `${expectedGender}, sinh thế kỷ ${expectedCentury === 1900 ? '20' : '21'}`,
    }
  }

  static getProvinceName(idNumber: string): string {
    if (!idNumber || idNumber.length < 3) return ''
    const provinceCode = idNumber.substring(0, 3)
    return VALID_PROVINCE_CODES[provinceCode] || ''
  }
}
