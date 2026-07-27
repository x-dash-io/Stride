const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  'image/jpeg': [new Uint8Array([0xFF, 0xD8, 0xFF])],
  'image/png': [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  'image/webp': [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
  'image/avif': [new Uint8Array([0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66])],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

export function validateFileSignature(buffer: ArrayBuffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) return false

  const header = new Uint8Array(buffer.slice(0, 16))
  return signatures.some((sig) => {
    if (sig.length > header.length) return false
    return sig.every((byte, i) => byte === header[i])
  })
}

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE
}
