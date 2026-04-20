'use client'

import { uploadFileDirect, sanitizeFileName } from '@/lib/uploadFile'

interface TakimKartProps {
  team: any
  bgPlayer: any
  bgCheckedFields: Record<string, boolean>
  bgFiles: Record<string, File | null>
  bgLoading: boolean
  bgError: string | null
  bgSuccess: boolean
  setBgLoading: (loading: boolean) => void
  setBgError: (error: string | null) => void
  setBgSuccess: (success: boolean) => void
}

export default function TakimKart(props: TakimKartProps) {
  const {
    team,
    bgPlayer,
    bgCheckedFields,
    bgFiles,
    bgLoading,
    bgError,
    bgSuccess,
    setBgLoading,
    setBgError,
    setBgSuccess,
  } = props

  const handleBelgeGuncelle = async () => {
    const checkedKeys = Object.keys(bgCheckedFields)
      .filter(k => bgCheckedFields[k])

    if (checkedKeys.length === 0) {
      setBgError('En az bir belge seçmelisiniz.')
      return
    }

    for (const key of checkedKeys) {
      if (!bgFiles[key]) {
        setBgError('Seçili belgeler için dosya yüklemelisiniz.')
        return
      }
    }

    setBgLoading(true)
    setBgError(null)

    try {
      // Önce takım bilgisini al
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      const teamRes = await fetch(
        `${supabaseUrl}/rest/v1/teams?team_key=eq.${team.team_key}&select=id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )
      const teamData = await teamRes.json()
      const teamId = teamData[0]?.id

      if (!teamId) {
        setBgError('Takım bulunamadı.')
        setBgLoading(false)
        return
      }

      // Dosyaları direkt Supabase'e yükle
      const uploadedFiles: Array<{
        document_type: string,
        file_path: string,
        file_name: string,
        file_size: number,
        mime_type: string
      }> = []

      for (const docType of checkedKeys) {
        const file = bgFiles[docType]
        if (!file) continue

        const timestamp = Date.now()
        const sanitized = sanitizeFileName(file.name)
        const path = `teams/${teamId}/players/${bgPlayer!.id}/${docType}/${timestamp}-${sanitized}`

        await uploadFileDirect(file, path)

        uploadedFiles.push({
          document_type: docType === 'other_document' ? 'other' : docType,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        })
      }

      // Belge kayıtlarını güncelle ve takım statüsünü pending yap
      const updateRes = await fetch('/api/belge-guncelle-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: bgPlayer!.id,
          team_id: teamId,
          team_key: team.team_key,
          documents: uploadedFiles
        })
      })

      if (!updateRes.ok) {
        const data = await updateRes.json()
        setBgError(data.error || 'Güncelleme başarısız')
        setBgLoading(false)
        return
      }

      setBgSuccess(true)

    } catch (err) {
      console.error(err)
      setBgError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setBgLoading(false)
    }
  }

  return null
}
