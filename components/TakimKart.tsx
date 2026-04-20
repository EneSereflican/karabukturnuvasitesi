'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Trophy, Eye, Building2, 
         AlertCircle, FileEdit, CheckCircle,
         Loader2 } from 'lucide-react'
import DekontYukle from './DekontYukle'
import { uploadFileDirect, sanitizeFileName } from '@/lib/uploadFile'

interface Player {
  id: string
  first_name: string
  last_name: string
  jersey_number: number
}

interface TakimKartProps {
  team: {
    id: string
    name: string
    institution: string
    status: string
    rejection_note: string | null
    rejected_player_ids: string[] | null
    team_key: string
    players: Player[]
    totalMembers: number
    hasReceipt: boolean
  }
}

export default function TakimKart({ team }: TakimKartProps) {
  const [showPlayers, setShowPlayers] = useState(false)
  const [showBelgeGuncelle, setShowBelgeGuncelle] = useState(false)
  const [bgStep, setBgStep] = useState<'auth' | 'files'>('auth')
  const [bgIdentifier, setBgIdentifier] = useState('')
  const [bgIdentifierError, setBgIdentifierError] = useState<string | null>(null)
  const [bgPlayer, setBgPlayer] = useState<{ id: string, first_name: string, last_name: string } | null>(null)
  const [bgCheckedFields, setBgCheckedFields] = useState<Record<string, boolean>>({})
  const [bgFiles, setBgFiles] = useState<Record<string, File | null>>({})
  const [bgFileNames, setBgFileNames] = useState<Record<string, string>>({})
  const [bgLoading, setBgLoading] = useState(false)
  const [bgError, setBgError] = useState<string | null>(null)
  const [bgSuccess, setBgSuccess] = useState(false)

  const statusConfig = {
    pending: { label: 'Beklemede', bg: 'rgba(234,179,8,0.2)', border: 'rgba(234,179,8,0.3)', color: '#facc15' },
    approved: { label: 'Onaylandı', bg: 'rgba(34,197,94,0.2)', border: 'rgba(34,197,94,0.3)', color: '#4ade80' },
    rejected: { label: 'Reddedildi', bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
  }
  const sc = statusConfig[team.status as keyof typeof statusConfig] || statusConfig.pending

  const documentFields = [
    { key: 'tc_front', label: 'TC Kimlik Ön Yüz' },
    { key: 'tc_back', label: 'TC Kimlik Arka Yüz' },
    { key: 'work_certificate', label: 'Çalışma Belgesi' },
    { key: 'sgk_certificate', label: 'SGK Belgesi' },
    { key: 'passport_photo', label: 'Vesikalık Fotoğraf' },
    { key: 'other_document', label: 'Taahhütname' },
  ]

  const handleBgAuth = async () => {
    setBgIdentifierError(null)
    try {
      const res = await fetch('/api/oyuncu-bul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_key: team.team_key, identifier: bgIdentifier })
      })
      const data = await res.json()
      if (!res.ok) {
        setBgIdentifierError(data.error || 'Kimlik doğrulanamadı')
        return
      }
      setBgPlayer({ id: data.player_id, first_name: data.player_name.split(' ')[0], last_name: data.player_name.split(' ').slice(1).join(' ') })
      setBgStep('files')
    } catch {
      setBgIdentifierError('Bir hata oluştu')
    }
  }

  const handleBelgeGuncelle = async () => {
    const checkedKeys = Object.keys(bgCheckedFields).filter(k => bgCheckedFields[k])
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
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const teamRes = await fetch(
        `${supabaseUrl}/rest/v1/teams?team_key=eq.${team.team_key}&select=id`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      )
      const teamData = await teamRes.json()
      const teamId = teamData[0]?.id
      if (!teamId) { setBgError('Takım bulunamadı.'); setBgLoading(false); return }

      const uploadedFiles: Array<{
        document_type: string, file_path: string,
        file_name: string, file_size: number, mime_type: string
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
          file_path: path, file_name: file.name,
          file_size: file.size, mime_type: file.type
        })
      }

      const updateRes = await fetch('/api/belge-guncelle-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: bgPlayer!.id, team_id: teamId,
          team_key: team.team_key, documents: uploadedFiles
        })
      })
      if (!updateRes.ok) {
        const data = await updateRes.json()
        setBgError(data.error || 'Güncelleme başarısız')
        setBgLoading(false)
        return
      }
      setBgSuccess(true)
    } catch {
      setBgError('Bir hata oluştu.')
    } finally {
      setBgLoading(false)
    }
  }

  return (
    <div
      className="border rounded-2xl p-5 mb-4 transition-colors"
      style={{ backgroundColor: '#1a2e1d', borderColor: '#2d4a32' }}
    >
      {/* Üst kısım */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{team.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full border font-medium"
              style={{ backgroundColor: sc.bg, borderColor: sc.border, color: sc.color }}
            >
              {sc.label}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-gray-400 text-sm">
            <Building2 size={13} />
            <span>{team.institution}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-gray-400 text-sm">
            <Users size={13} />
            <span>{team.totalMembers}/15 üye</span>
          </div>
        </div>
        <div
          className="w-14 h-14 rounded-full border-2 flex items-center justify-center flex-col shrink-0"
          style={{ borderColor: sc.border }}
        >
          <span className="text-white font-bold text-lg leading-none">{team.totalMembers}</span>
          <span className="text-gray-400 text-xs">/15</span>
        </div>
      </div>

      {/* Red notu */}
      {team.status === 'rejected' && team.rejection_note && (
        <div
          className="border rounded-xl p-3 mt-3"
          style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm font-medium">Red Gerekçesi:</p>
          </div>
          <p className="text-red-300 text-sm mt-1">{team.rejection_note}</p>
          {team.rejected_player_ids && team.rejected_player_ids.length > 0 && (
            <div className="mt-2">
              <p className="text-red-400 text-xs font-medium">Sorunlu Oyuncular:</p>
              {team.rejected_player_ids.map(pid => {
                const p = team.players.find(pl => pl.id === pid)
                if (!p) return null
                return <p key={pid} className="text-red-300 text-xs">• {p.first_name} {p.last_name}</p>
              })}
            </div>
          )}
        </div>
      )}

      {/* Dekont */}
      {team.status !== 'approved' && (
        <DekontYukle teamKey={team.team_key} hasReceipt={team.hasReceipt} />
      )}

      {/* Butonlar */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => setShowPlayers(!showPlayers)}
          className="flex items-center gap-1 bg-[#2d4a32] text-white text-xs rounded-lg px-3 py-1.5 hover:bg-[#3d5a42] transition-colors"
        >
          <Users size={13} />
          {showPlayers ? 'Gizle' : 'Oyuncuları Görüntüle'}
        </button>
        <Link
          href={`/ilk11-olustur/${team.id}`}
          className="flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 border transition-colors"
          style={{ backgroundColor: 'rgba(240,165,0,0.1)', borderColor: 'rgba(240,165,0,0.3)', color: '#f0a500' }}
        >
          <Trophy size={13} />
          İlk 11 Oluştur
        </Link>
        <Link
          href={`/ilk11-goruntule/${team.id}`}
          className="flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 border transition-colors"
          style={{ backgroundColor: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' }}
        >
          <Eye size={13} />
          İlk 11&apos;i Görüntüle
        </Link>
        <button
          onClick={() => setShowBelgeGuncelle(!showBelgeGuncelle)}
          className="flex items-center gap-1 text-xs rounded-lg px-3 py-1.5 border transition-colors"
          style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa' }}
        >
          <FileEdit size={13} />
          Belgelerimi Güncelle
        </button>
      </div>

      {/* Oyuncu listesi */}
      {showPlayers && (
        <div className="border-t mt-4 pt-4" style={{ borderColor: '#2d4a32' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs font-medium">Kayıtlı Oyuncular</span>
            <span className="text-gray-400 text-xs">{team.totalMembers}/15</span>
          </div>
          {team.players.length === 0 ? (
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#0d1f12' }}>
              <p className="text-gray-400 text-xs">Henüz oyuncu kaydı bulunmamaktadır.</p>
            </div>
          ) : (
            <div>
              {team.players.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-1.5"
                  style={{ borderBottom: i < team.players.length - 1 ? '1px solid rgba(45,74,50,0.5)' : 'none' }}
                >
                  <div
                    className="w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ backgroundColor: 'rgba(240,165,0,0.1)', borderColor: 'rgba(240,165,0,0.3)', color: '#f0a500' }}
                  >
                    {p.jersey_number || '-'}
                  </div>
                  <span className="text-white text-sm">{p.first_name} {p.last_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Belge güncelleme */}
      {showBelgeGuncelle && (
        <div
          className="border rounded-xl p-4 mt-3"
          style={{ backgroundColor: '#0d1f12', borderColor: 'rgba(59,130,246,0.2)' }}
        >
          {bgSuccess ? (
            <div className="text-center py-4">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-semibold">Belgeleriniz güncellendi!</p>
              <p className="text-gray-400 text-sm mt-1">Başvurunuz tekrar incelemeye alınmıştır.</p>
            </div>
          ) : bgStep === 'auth' ? (
            <div>
              <p className="text-white font-semibold text-sm">Kimlik Doğrulama</p>
              <p className="text-gray-400 text-xs mt-1">TC kimlik numaranızı veya e-posta adresinizi girin.</p>
              <input
                type="text"
                value={bgIdentifier}
                onChange={e => setBgIdentifier(e.target.value)}
                placeholder="TC kimlik no veya e-posta"
                className="w-full rounded-lg h-10 px-3 text-sm text-white mt-3 focus:outline-none"
                style={{ backgroundColor: '#1a2e1d', border: '1px solid #2d4a32' }}
                onKeyDown={e => e.key === 'Enter' && handleBgAuth()}
              />
              {bgIdentifierError && <p className="text-red-400 text-xs mt-1">{bgIdentifierError}</p>}
              <button
                onClick={handleBgAuth}
                className="w-full h-9 rounded-lg text-sm font-bold mt-3 border transition-colors"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa' }}
              >
                Devam Et
              </button>
            </div>
          ) : (
            <div>
              <div
                className="border rounded-lg p-3 mb-3"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)' }}
              >
                <p className="text-green-400 text-sm">Merhaba {bgPlayer?.first_name}! Güncellenecek belgeleri seçin.</p>
              </div>
              {documentFields.map(field => (
                <div key={field.key} className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={bgCheckedFields[field.key] || false}
                    onChange={e => setBgCheckedFields(prev => ({ ...prev, [field.key]: e.target.checked }))}
                    className="mt-1 w-4 h-4 shrink-0 accent-blue-400"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{field.label}</p>
                    {bgCheckedFields[field.key] && (
                      <div className="mt-1">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => {
                            const file = e.target.files?.[0] || null
                            setBgFiles(prev => ({ ...prev, [field.key]: file }))
                            setBgFileNames(prev => ({ ...prev, [field.key]: file?.name || '' }))
                          }}
                          className="w-full text-xs text-gray-300 rounded-lg p-2 border"
                          style={{ backgroundColor: '#1a2e1d', borderColor: '#2d4a32' }}
                        />
                        {bgFileNames[field.key] && (
                          <p className="text-green-400 text-xs mt-1">✓ {bgFileNames[field.key]}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {bgError && <p className="text-red-400 text-xs mt-2">{bgError}</p>}
              <button
                onClick={handleBelgeGuncelle}
                disabled={bgLoading}
                className="w-full h-10 rounded-xl text-sm font-bold mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#3b82f6', color: 'white' }}
              >
                {bgLoading ? <><Loader2 size={16} className="animate-spin" /> Yükleniyor...</> : 'Belgeleri Güncelle'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
