export function rollNumberToEmail(rollNumber: string): string {
  // Remove hyphen and rearrange: 22F-3277 → F223277
  const cleaned = rollNumber.replace("-", "")
  const year = cleaned.substring(0, 2)
  const section = cleaned.substring(2, 3)
  const number = cleaned.substring(3)

  return `${section}${year}${number}@cfd.nu.edu.pk`.toLowerCase()
}

// Generate random password
export function generateRandomPassword(length = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}
