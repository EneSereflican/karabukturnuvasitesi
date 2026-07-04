'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { lineupArchiveByTeamId } from '@/lib/portfolio-data'

interface Player {
  id: string
  first_name: string
  last_name: string
  jersey_number: number
}

export default function IlkOnBirOlusturPage() {
  const params = useParams()
  const team_id = params.team_id as string

  const archive = lineupArchiveByTeamId[team_id] ?? lineupArchiveByTeamId['team-karabuk-belediyesi']

  return (
    <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/basvuru-durumlari" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
          ← Geri Dön
        </Link>

        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8">
          <h1 className="text-white text-2xl font-bold mb-2">İlk 11 Arşivi</h1>
          <p className="text-gray-400 text-sm mb-6">Seçim ekranı artık kapalı. Aşağıda örnek bir kadro yer alıyor.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border border-[#2d4a32] bg-[#0d1f12] p-4">
              <p className="text-gray-400 text-xs mb-1">Takım</p>
              <p className="text-white font-semibold">{archive.teamName}</p>
            </div>
            <div className="rounded-xl border border-[#2d4a32] bg-[#0d1f12] p-4">
              <p className="text-gray-400 text-xs mb-1">Formasyon</p>
              <p className="text-[#f0a500] font-semibold">{archive.formation}</p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-[#2d4a32] bg-[#0d1f12] p-4 text-sm text-gray-300">
            Bu turnuva için ilk 11 seçimleri tamamlandı. Arşiv verisi gösteriliyor, yeni kayıt alınmıyor.
          </div>
        </div>
      </div>
    </main>
  )

  // Auth state
  const [authStep, setAuthStep] = useState<'auth' | 'form'>('auth')
  const [identifier, setIdentifier] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  // Players & lineup state
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  const [substitutes, setSubstitutes] = useState<Set<string>>(new Set())
  const [formation, setFormation] = useState('4-4-2')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Load existing lineup
  useEffect(() => {
    if (authStep === 'form') {
      fetchPlayers()
      fetchExistingLineup()
    }
  }, [authStep])

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`/api/oyuncu-listesi?team_id=${team_id}`)
      const data = await res.json()
      if (data.players) {
        setPlayers(data.players.sort((a: Player, b: Player) => a.jersey_number - b.jersey_number))
      }
    } catch {
      setError('Oyuncular getirilemedi')
    }
  }

  const fetchExistingLineup = async () => {
    try {
      const res = await fetch(`/api/ilk11-getir?team_id=${team_id}`)
      const data = await res.json()
      if (data.lineup && data.lineup.players && data.lineup.players.length > 0) {
        setSelectedPlayers(new Set(data.lineup.players))
        setSubstitutes(new Set(data.lineup.substitutes || []))
        if (data.lineup.formation) {
          setFormation(data.lineup.formation)
        }
      }
    } catch {
      // Ignore errors
    }
  }

  const handleAuth = () => {
    if (!identifier.trim()) {
      setAuthError('Lütfen kimlik bilgisi girin')
      return
    }
    setAuthError(null)
    setAuthStep('form')
  }

  const handlePlayerToggle = (playerId: string) => {
    const newSelected = new Set(selectedPlayers)
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId)
    } else {
      if (newSelected.size >= 11) {
        setError('Maksimum 11 oyuncu seçebilirsiniz')
        return
      }
      newSelected.add(playerId)
    }
    setSelectedPlayers(newSelected)
    setError(null)
  }

  const handleSubstituteToggle = (playerId: string) => {
    const newSubs = new Set(substitutes)
    if (newSubs.has(playerId)) {
      newSubs.delete(playerId)
    } else {
      if (newSubs.size >= 4) {
        setError('Maksimum 4 yedek seçebilirsiniz')
        return
      }
      if (selectedPlayers.has(playerId)) {
        setError('İlk 11\'de olan bir oyuncu yedekte seçilemez')
        return
      }
      newSubs.add(playerId)
    }
    setSubstitutes(newSubs)
    setError(null)
  }

  const handleSave = async () => {
    if (selectedPlayers.size !== 11) {
      setError('Tam 11 oyuncu seçmelisiniz')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ilk11-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id,
          formation,
          player_ids: Array.from(selectedPlayers),
          substitute_ids: Array.from(substitutes),
          identifier
        })
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'Bu bilgi ile takımda kayıtlı kişi bulunamadı') {
          setAuthError(data.error)
          setAuthStep('auth')
          setLoading(false)
          return
        }
        setError(data.error || 'Kayıt başarısız')
        setLoading(false)
        return
      }
      setSuccessMessage(`İlk 11 kaydedildi! ${data.created_by} tarafından oluşturuldu.`)
      setSuccess(true)
    } catch {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8 text-center">
            <CheckCircle2 size={64} className="text-green-400 mx-auto mb-4" />
            <h1 className="text-white text-2xl font-bold mb-2">Başarılı!</h1>
            <p className="text-gray-400 mb-6">{successMessage}</p>
            <Link href="/basvuru-durumlari">
              <button className="bg-[#f0a500] text-[#0d1f12] font-bold px-6 py-3 rounded-xl hover:bg-[#f0a500]/90 transition-colors">
                Geri Dön
              </button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (authStep === 'auth') {
    return (
      <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
        <div className="max-w-md mx-auto">
          <Link href="/basvuru-durumlari" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
            ← Geri Dön
          </Link>

          <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8">
            <h1 className="text-white text-xl font-bold mb-2">İlk 11 Oluştur</h1>
            <p className="text-gray-400 text-sm mb-6">Kimlik doğrulaması yaparak başlayın</p>

            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">
                Telefon No, TC No veya E-posta
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Örn: 05XX XXX XXXX"
                className="w-full bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 px-4 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder-gray-600 transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
            </div>

            {authError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{authError}</p>
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={!identifier}
              className="w-full bg-[#f0a500] text-[#0d1f12] font-bold h-11 rounded-xl hover:bg-[#f0a500]/90 disabled:opacity-50 transition-colors"
            >
              Devam Et
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/basvuru-durumlari" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
          ← Geri Dön
        </Link>

        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8">
          <h1 className="text-white text-2xl font-bold mb-2">İlk 11 Oluştur</h1>
          <p className="text-gray-400 text-sm mb-6">Formasyon ve oyuncuları seçin.</p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Formasyon Seçimi */}
          <div className="mb-8">
            <h2 className="text-white font-bold mb-4 text-lg border-l-4 border-[#f0a500] pl-3">
              Formasyon Seç
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2', '4-5-1', '3-4-3'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormation(f)}
                  className={`py-3 px-4 rounded-lg font-bold transition-colors border ${
                    formation === f
                      ? 'bg-[#f0a500] text-[#0d1f12] border-[#f0a500]'
                      : 'bg-[#0d1f12] text-white border-[#2d4a32] hover:border-[#f0a500]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Oyuncu Seçimi */}
          <div className="mb-8">
            <h2 className="text-white font-bold mb-4 text-lg border-l-4 border-[#f0a500] pl-3">
              İlk 11 Seç ({selectedPlayers.size}/11)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map(player => (
                <label
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlayers.has(player.id)
                      ? 'bg-[#f0a500]/20 border-[#f0a500]'
                      : 'bg-[#0d1f12] border-[#2d4a32] hover:border-[#f0a500]/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlayers.has(player.id)}
                    onChange={() => handlePlayerToggle(player.id)}
                    className="w-4 h-4 accent-[#f0a500] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-gray-400 text-xs">#{player.jersey_number}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Yedek Seçimi */}
          <div className="mb-8">
            <h2 className="text-white font-bold mb-4 text-lg border-l-4 border-[#9333ea] pl-3">
              Yedekler Seç ({substitutes.size}/4)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.filter(p => !selectedPlayers.has(p.id)).map(player => (
                <label
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    substitutes.has(player.id)
                      ? 'bg-[#9333ea]/20 border-[#9333ea]'
                      : 'bg-[#0d1f12] border-[#2d4a32] hover:border-[#9333ea]/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={substitutes.has(player.id)}
                    onChange={() => handleSubstituteToggle(player.id)}
                    className="w-4 h-4 accent-[#9333ea] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-gray-400 text-xs">#{player.jersey_number}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Kaydet Butonu */}
          <button
            onClick={handleSave}
            disabled={loading || selectedPlayers.size !== 11}
            className="w-full bg-[#f0a500] text-[#0d1f12] font-bold h-12 rounded-xl hover:bg-[#f0a500]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "İlk 11'i Kaydet"
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
