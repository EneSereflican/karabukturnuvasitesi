export async function uploadFileDirect(
  file: File,
  path: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/documents/${path}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'x-upsert': 'true',
        'Content-Type': file.type,
      },
      body: file
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Dosya yükleme hatası')
  }
  
  return path
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
}
