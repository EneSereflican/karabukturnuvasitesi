'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Trash2, Loader2, CheckCircle2 } from 'lucide-react'

interface Player {
  id: string
  first_name: string
  last_name: string
  jersey_number: number
}

interface Lineup {
  id: string
  team_id: string
  formation: string
  players: string[]
  substitutes: string[]
  created_by_name: string | null
  deleted_by_name: string | null
}

export default function IlkOnBirGoruntulePage() {
  const params = useParams()
  const team_id = params.team_id as string

  const [lineup, setLineup] = useState<Lineup | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteIdentifier, setDeleteIdentifier] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')

  useEffect(() => {
    fetchLineup()
  }, [])

  const fetchLineup = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ilk11-getir?team_id=${team_id}`)
      const data = await res.json()
      if (data.lineup) {
        setLineup(data.lineup)
        setPlayers(data.players || [])
      }
    } catch {
      setError('İlk 11 bilgileri getirilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteIdentifier) {
      setDeleteError('Lütfen kimlik bilgisi girin')
      return
    }

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      const res = await fetch('/api/ilk11-sil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id,
          identifier: deleteIdentifier
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error || 'Silme başarısız')
        setDeleteLoading(false)
        return
      }
      setDeleteMessage(`İlk 11 silindi! ${data.deleted_by} tarafından kaldırıldı.`)
      setDeleteSuccess(true)
      setTimeout(() => {
        setShowDeleteModal(false)
        setDeleteIdentifier('')
        fetchLineup()
        setDeleteSuccess(false)
      }, 2000)
    } catch {
      setDeleteError('Bir hata oluştu')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="bg-[#0d1f12] min-h-screen py-12 px-4 flex items-center justify-center">
        <Loader2 size={32} className="text-[#f0a500] animate-spin" />
      </main>
    )
  }

  if (error) {
    return (
      <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/basvuru-durumlari" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
            ← Geri Dön
          </Link>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  if (!lineup || !lineup.players || lineup.players.length === 0) {
    if (lineup?.deleted_by_name) {
      return (
        <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Link href="/basvuru-durumlari" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
              ← Geri Dön
            </Link>
            <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8 text-center">
              <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
              <h1 className="text-white text-xl font-bold mb-2">İlk 11 Silindi</h1>
              <p className="text-gray-400 mb-6">Bu ilk 11 <span className="text-white font-semibold">{lineup.deleted_by_name}</span> tarafından silindi.</p>
              <Link href={`/ilk11-olustur/${team_id}`}>
                <button className="bg-[#f0a500] text-[#0d1f12] font-bold px-6 py-3 rounded-xl hover:bg-[#f0a500]/90 transition-colors">
                  Yeni İlk 11 Oluştur
                </button>
              </Link>
            </div>
          </div>
        </main>
      )
    }

    return (
      <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/basvuru-durumlari" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
            ← Geri Dön
          </Link>
          <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="text-gray-500 mx-auto mb-4" />
            <h1 className="text-white text-xl font-bold mb-2">Henüz İlk 11 Yok</h1>
            <p className="text-gray-400 mb-6">Bu takım için henüz ilk 11 oluşturulmamış.</p>
            <Link href={`/ilk11-olustur/${team_id}`}>
              <button className="bg-[#f0a500] text-[#0d1f12] font-bold px-6 py-3 rounded-xl hover:bg-[#f0a500]/90 transition-colors">
                İlk 11 Oluştur
              </button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const startingPlayers = players.filter(p => lineup.players.includes(p.id))
  const substitutePlayers = players.filter(p => lineup.substitutes.includes(p.id))

  return (
    <main className="bg-[#0d1f12] min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/basvuru-durumlari" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
          ← Geri Dön
        </Link>

        <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-white text-3xl font-bold">İlk 11</h1>
                <div className="flex items-center gap-4 mt-3">
                  <span className="inline-block bg-[#f0a500]/20 border border-[#f0a500]/30 text-[#f0a500] text-sm font-bold px-4 py-2 rounded-full">
                    Formasyon: {lineup.formation}
                  </span>
                  {lineup.created_by_name && (
                    <span className="text-gray-400 text-sm">
                      Oluşturan: <span className="text-white font-semibold">{lineup.created_by_name}</span>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 size={16} />
                Sil
              </button>
            </div>
          </div>

          {/* İlk 11 */}
          <div className="mb-12">
            <h2 className="text-white font-bold text-xl mb-6 border-l-4 border-[#f0a500] pl-3">
              İlk 11 Oyuncu ({startingPlayers.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {startingPlayers
                .sort((a, b) => a.jersey_number - b.jersey_number)
                .map(player => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 bg-[#0d1f12] border border-[#2d4a32] rounded-lg p-4 hover:border-[#f0a500]/30 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-full bg-[#f0a500]/20 border border-[#f0a500]/30 flex items-center justify-center shrink-0 text-[#f0a500] font-bold text-lg"
                    >
                      {player.jersey_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-gray-400 text-xs">Forma: #{player.jersey_number}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Yedekler */}
          {substitutePlayers.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-xl mb-6 border-l-4 border-[#9333ea] pl-3">
                Yedekler ({substitutePlayers.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {substitutePlayers
                  .sort((a, b) => a.jersey_number - b.jersey_number)
                  .map(player => (
                    <div
                      key={player.id}
                      className="flex items-center gap-4 bg-[#0d1f12]/50 border border-[#2d4a32]/50 rounded-lg p-4"
                    >
                      <div
                        className="w-12 h-12 rounded-full bg-[#9333ea]/20 border border-[#9333ea]/30 flex items-center justify-center shrink-0 text-[#9333ea] font-bold text-lg"
                      >
                        {player.jersey_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 font-medium truncate">
                          {player.first_name} {player.last_name}
                        </p>
                        <p className="text-gray-500 text-xs">Forma: #{player.jersey_number}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2e1d] border border-[#2d4a32] rounded-2xl p-8 max-w-md w-full">
            {deleteSuccess ? (
              <div className="text-center">
                <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
                <p className="text-green-400 font-semibold">{deleteMessage}</p>
              </div>
            ) : (
              <>
                <h2 className="text-white text-lg font-bold mb-4">İlk 11'i Sil</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Lütfen kimlik bilgilerinizi girerek silme işlemini onaylayın.
                </p>

                <div className="mb-4">
                  <label className="block text-gray-300 text-sm mb-2">
                    Telefon No, TC No veya E-posta
                  </label>
                  <input
                    type="text"
                    value={deleteIdentifier}
                    onChange={e => setDeleteIdentifier(e.target.value)}
                    placeholder="Örn: 05XX XXX XXXX"
                    className="w-full bg-[#0d1f12] border border-[#2d4a32] text-white rounded-lg h-11 px-4 focus:border-[#f0a500] focus:ring-1 focus:ring-[#f0a500] placeholder-gray-600 transition-colors"
                    onKeyDown={e => e.key === 'Enter' && handleDelete()}
                  />
                </div>

                {deleteError && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{deleteError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-[#2d4a32] text-white h-10 rounded-lg hover:bg-[#3d5a42] transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 h-10 rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Siliniyor...
                      </>
                    ) : (
                      'Sil'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
