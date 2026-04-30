'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Team { id: string; name: string; }
interface MatchEvent {
  id: string; event_type: string; minute: number;
  player_id: string | null; team_id: string; player_name: string | null;
}
interface Match {
  id: string; week: number; match_date: string | null; status: string;
  home_score: number | null; away_score: number | null;
  home_team: Team; away_team: Team; events: MatchEvent[];
}
interface Player { id: string; first_name: string; last_name: string; jersey_number: number | null; }

interface Props { teams: Team[]; initialMatches: Match[]; }

export default function AdminFiksturClient({ teams, initialMatches }: Props) {
  const router = useRouter();

  // Maç Ekle state
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [week, setWeek] = useState(1);
  const [matchDate, setMatchDate] = useState('');
  const [adding, setAdding] = useState(false);

  // Skor düzenleme state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editHomeScore, setEditHomeScore] = useState(0);
  const [editAwayScore, setEditAwayScore] = useState(0);
  const [saving, setSaving] = useState(false);

  // Olay yönetim state
  const [eventMatchId, setEventMatchId] = useState<string | null>(null);
  const [eventTeamId, setEventTeamId] = useState('');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventType, setEventType] = useState<string>('goal');
  const [eventMinute, setEventMinute] = useState(1);
  const [eventPlayers, setEventPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);

  // Hata state
  const [addMatchError, setAddMatchError] = useState<string | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Maç ekle
  const handleAddMatch = async () => {
    setAddMatchError(null);
    if (!homeTeamId) { setAddMatchError('Lütfen ev sahibi takımı seçin.'); return; }
    if (!awayTeamId) { setAddMatchError('Lütfen deplasman takımını seçin.'); return; }
    if (homeTeamId === awayTeamId) { setAddMatchError('Ev sahibi ve deplasman takımı aynı olamaz.'); return; }
    if (week < 1) { setAddMatchError('Hafta numarası 1 veya daha büyük olmalıdır.'); return; }
    setAdding(true);
    try {
      const body: Record<string, string | number> = { home_team_id: homeTeamId, away_team_id: awayTeamId, week };
      if (matchDate) {
        // datetime-local "YYYY-MM-DDTHH:MM" verir, Türkiye saati (UTC+3) olarak gönder
        body.match_date = matchDate + ':00+03:00';
      }
      const res = await fetch('/api/mac-ekle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        setAddMatchError(null);
        setHomeTeamId('');
        setAwayTeamId('');
        setWeek(1);
        setMatchDate('');
        window.location.reload();
      }
      else {
        const d = await res.json();
        if (d.error && (d.error.includes('duplicate') || d.error.includes('already exists'))) {
          setAddMatchError('Bu hafta bu iki takım arasında zaten maç mevcut.');
        } else {
          setAddMatchError(d.error || 'Maç eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
    } catch {
      setAddMatchError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    }
    finally { setAdding(false); }
  };

  // Skor kaydet
  const handleSaveScore = async (matchId: string) => {
    setScoreError(null);
    if (editHomeScore < 0) { setScoreError('Ev sahibi skoru 0\'dan küçük olamaz.'); return; }
    if (editAwayScore < 0) { setScoreError('Deplasman skoru 0\'dan küçük olamaz.'); return; }
    if (editHomeScore > 20 || editAwayScore > 20) { setScoreError('Skor 20\'den büyük olamaz. Lütfen kontrol edin.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/mac-guncelle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ match_id: matchId, home_score: editHomeScore, away_score: editAwayScore, status: 'completed' }) });
      if (res.ok) { setEditingMatchId(null); setScoreError(null); router.refresh(); }
      else { const d = await res.json(); setScoreError(d.error || 'Skor kaydedilirken hata oluştu.'); }
    } catch {
      setScoreError('Sunucuya bağlanılamadı.');
    }
    finally { setSaving(false); }
  };

  // Maç sil
  const handleDeleteMatch = async (matchId: string) => {
    setDeleteError(null);
    if (!confirm('Bu maçı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/mac-sil', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ match_id: matchId }) });
      if (res.ok) {
        setDeleteError(null);
        router.refresh();
        window.location.reload();
      }
      else { const d = await res.json(); setDeleteError(d.error || 'Maç silinirken hata oluştu.'); }
    } catch {
      setDeleteError('Sunucuya bağlanılamadı.');
    }
  };

  // Takım seçilince oyuncuları çek
  const handleEventTeamChange = async (teamId: string) => {
    setEventTeamId(teamId);
    setEventPlayerId('');
    setEventPlayers([]);
    if (!teamId) return;
    setLoadingPlayers(true);
    try {
      const res = await fetch(`/api/oyuncu-listesi?team_id=${teamId}`);
      const data = await res.json();
      if (data.players) setEventPlayers(data.players);
    } catch { /* ignore */ }
    finally { setLoadingPlayers(false); }
  };

  // Olay ekle
  const handleAddEvent = async (matchId: string) => {
    setEventError(null);
    if (!eventTeamId) { setEventError('Lütfen bir takım seçin.'); return; }
    if (!eventPlayerId) { setEventError('Lütfen bir oyuncu seçin.'); return; }
    if (eventMinute < 1) { setEventError('Dakika 1\'den küçük olamaz.'); return; }
    if (eventMinute > 120) { setEventError('Dakika 120\'den büyük olamaz.'); return; }
    if (!eventMinute || isNaN(eventMinute)) { setEventError('Geçerli bir dakika girin (1-120).'); return; }
    setAddingEvent(true);
    try {
      const res = await fetch('/api/mac-olay-ekle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ match_id: matchId, team_id: eventTeamId, player_id: eventPlayerId, event_type: eventType, minute: eventMinute }) });
      if (res.ok) { setEventPlayerId(''); setEventMinute(1); setEventError(null); router.refresh(); }
      else {
        const d = await res.json();
        if (d.error && (d.error.includes('already exists') || d.error.includes('duplicate'))) {
          setEventError('Bu olay zaten eklenmiş.');
        } else {
          setEventError(d.error || 'Olay eklenirken hata oluştu.');
        }
      }
    } catch {
      setEventError('Sunucuya bağlanılamadı.');
    }
    finally { setAddingEvent(false); }
  };

  // Olay sil
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch('/api/mac-olay-sil', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_id: eventId }) });
      if (res.ok) router.refresh();
    } catch { /* ignore */ }
  };

  const getEventIcon = (t: string) => t === 'goal' ? '⚽' : t === 'yellow_card' ? '🟨' : '🟥';
  const getEventLabel = (t: string) => t === 'goal' ? 'Gol' : t === 'yellow_card' ? 'Sarı Kart' : 'Kırmızı Kart';

  return (
    <div>
      <h2 style={S.pageTitle}>Fikstür Yönetimi</h2>

      {/* BÖLÜM 1 — Maç Ekle */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Maç Ekle</h3>
        <div style={S.formGrid}>
          <div style={S.field}>
            <label style={S.label}>Ev Sahibi</label>
            <select value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)} style={S.select}>
              <option value="">Takım seçin</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Deplasman</label>
            <select value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)} style={S.select}>
              <option value="">Takım seçin</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Hafta</label>
            <input type="number" min={1} value={week} onChange={e => setWeek(Number(e.target.value))} style={S.input} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Tarih (opsiyonel)</label>
            <input type="datetime-local" value={matchDate} onChange={e => setMatchDate(e.target.value)} style={S.input} />
          </div>
        </div>
        <button onClick={handleAddMatch} disabled={adding || !homeTeamId || !awayTeamId} style={{ ...S.btn, ...S.btnPrimary, opacity: adding ? 0.6 : 1, marginTop: 16 }}>
          {adding ? 'Ekleniyor...' : 'Maç Ekle'}
        </button>
        {addMatchError && <ErrorBox message={addMatchError} />}
      </div>

      {/* BÖLÜM 2 — Maç Listesi */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Maç Listesi</h3>
        {deleteError && <ErrorBox message={deleteError} />}
        {initialMatches.length === 0 ? (
          <p style={S.empty}>Henüz maç eklenmemiştir.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {initialMatches.map(match => {
              const isEditing = editingMatchId === match.id;
              const isEventOpen = eventMatchId === match.id;
              return (
                <div key={match.id} style={S.matchItem}>
                  {/* Maç bilgisi */}
                  <div style={S.matchHeader}>
                    <div style={S.matchTeams}>
                      <span style={S.matchTeamName}>{match.home_team?.name}</span>
                      <span style={S.matchVs}>
                        {match.status === 'completed' ? `${match.home_score ?? 0} - ${match.away_score ?? 0}` : 'vs'}
                      </span>
                      <span style={S.matchTeamName}>{match.away_team?.name}</span>
                    </div>
                    <div style={S.matchMeta}>
                      <span style={S.metaText}>Hafta {match.week}</span>
                      {match.match_date && <span style={S.metaText}>{new Date(match.match_date).toLocaleDateString('tr-TR')}</span>}
                      <span style={{ ...S.badge, ...(match.status === 'completed' ? S.badgeGreen : S.badgeYellow) }}>
                        {match.status === 'completed' ? 'Tamamlandı' : 'Oynanacak'}
                      </span>
                    </div>
                  </div>

                  {/* Aksiyon butonları */}
                  <div style={S.actions}>
                    <button onClick={() => { if (isEditing) { setEditingMatchId(null); } else { setEditingMatchId(match.id); setEditHomeScore(match.home_score ?? 0); setEditAwayScore(match.away_score ?? 0); } }} style={{ ...S.btn, ...S.btnSmall }}>
                      {isEditing ? 'İptal' : 'Sonuç Gir/Düzenle'}
                    </button>
                    <button onClick={() => { if (isEventOpen) { setEventMatchId(null); } else { setEventMatchId(match.id); setEventTeamId(''); setEventPlayerId(''); setEventPlayers([]); } }} style={{ ...S.btn, ...S.btnSmall }}>
                      {isEventOpen ? 'Olayları Kapat' : 'Olay Yönet'}
                    </button>
                    <button onClick={() => handleDeleteMatch(match.id)} style={{ ...S.btn, ...S.btnSmall, ...S.btnDanger }}>
                      Sil
                    </button>
                  </div>

                  {/* Skor düzenleme formu */}
                  {isEditing && (
                    <div style={S.inlineForm}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={S.inlineLabel}>{match.home_team?.name}</span>
                        <input type="number" min={0} value={editHomeScore} onChange={e => setEditHomeScore(Number(e.target.value))} style={{ ...S.input, width: 60, textAlign: 'center' }} />
                        <span style={{ color: '#5a7a5e' }}>-</span>
                        <input type="number" min={0} value={editAwayScore} onChange={e => setEditAwayScore(Number(e.target.value))} style={{ ...S.input, width: 60, textAlign: 'center' }} />
                        <span style={S.inlineLabel}>{match.away_team?.name}</span>
                      </div>
                      <button onClick={() => handleSaveScore(match.id)} disabled={saving} style={{ ...S.btn, ...S.btnPrimary, ...S.btnSmall }}>
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                      {scoreError && <ErrorBox message={scoreError} />}
                    </div>
                  )}

                  {/* BÖLÜM 3 — Olay yönetimi */}
                  {isEventOpen && (
                    <div style={S.eventPanel}>
                      <h4 style={S.eventTitle}>Olay Ekle</h4>
                      {match.status !== 'completed' && <WarningBox message="Bu maç henüz oynanmadı. Yine de olay ekleyebilirsiniz." />}
                      <div style={S.eventForm}>
                        <select value={eventTeamId} onChange={e => handleEventTeamChange(e.target.value)} style={S.select}>
                          <option value="">Takım seçin</option>
                          {match.home_team && <option value={match.home_team.id}>{match.home_team.name}</option>}
                          {match.away_team && <option value={match.away_team.id}>{match.away_team.name}</option>}
                        </select>
                        <select value={eventPlayerId} onChange={e => setEventPlayerId(e.target.value)} style={S.select} disabled={loadingPlayers || !eventTeamId}>
                          <option value="">{loadingPlayers ? 'Yükleniyor...' : 'Oyuncu seçin'}</option>
                          {eventPlayers.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.jersey_number ? `${p.jersey_number} - ` : ''}{p.first_name} {p.last_name}
                            </option>
                          ))}
                        </select>
                        {eventTeamId && eventPlayers.length === 0 && !loadingPlayers && <WarningBox message="Bu takımda kayıtlı oyuncu bulunamadı." />}
                        <select value={eventType} onChange={e => setEventType(e.target.value)} style={S.select}>
                          <option value="goal">⚽ Gol</option>
                          <option value="yellow_card">🟨 Sarı Kart</option>
                          <option value="red_card">🟥 Kırmızı Kart</option>
                        </select>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ ...S.label, fontSize: 10 }}>DAKİKA</label>
                          <input type="number" min={1} max={120} value={eventMinute} onChange={e => setEventMinute(Number(e.target.value))} placeholder="1-120" style={{ ...S.input, width: 70 }} />
                        </div>
                        <button onClick={() => handleAddEvent(match.id)} disabled={addingEvent || !eventPlayerId} style={{ ...S.btn, ...S.btnPrimary, ...S.btnSmall, opacity: addingEvent || !eventPlayerId ? 0.5 : 1 }}>
                          {addingEvent ? '...' : 'Ekle'}
                        </button>
                      </div>
                      {eventError && <ErrorBox message={eventError} />}

                      {/* Mevcut olaylar */}
                      {match.events.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={S.eventTitle}>Mevcut Olaylar</h4>
                          {[...match.events].sort((a, b) => a.minute - b.minute).map(ev => (
                            <div key={ev.id} style={S.eventRow}>
                              <span style={S.evMinute}>{ev.minute}&apos;</span>
                              <span>{getEventIcon(ev.event_type)}</span>
                              <span style={S.evPlayer}>{ev.player_name || 'Bilinmeyen'}</span>
                              <span style={S.evType}>{getEventLabel(ev.event_type)}</span>
                              <button onClick={() => handleDeleteEvent(ev.id)} style={{ ...S.btn, ...S.btnDanger, ...S.btnXs }}>Sil</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      backgroundColor: 'rgba(229,115,115,0.1)',
      border: '1px solid rgba(229,115,115,0.3)',
      borderRadius: 8, padding: '10px 14px', marginTop: 10,
      display: 'flex', alignItems: 'flex-start', gap: 8
    }}>
      <span style={{ color: '#e57373', fontSize: 16, lineHeight: 1.4 }}>⚠</span>
      <p style={{ color: '#e57373', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

function WarningBox({ message }: { message: string }) {
  return (
    <div style={{
      backgroundColor: 'rgba(240,165,0,0.1)',
      border: '1px solid rgba(240,165,0,0.3)',
      borderRadius: 8, padding: '10px 14px', marginTop: 10,
      display: 'flex', alignItems: 'flex-start', gap: 8
    }}>
      <span style={{ color: '#f0a500', fontSize: 16, lineHeight: 1.4 }}>ℹ</span>
      <p style={{ color: '#f0a500', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  pageTitle: { fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 },
  card: { backgroundColor: '#1a2e1d', border: '1px solid #2d4a32', borderRadius: 16, padding: 24, marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#f0a500', marginBottom: 16, marginTop: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  field: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: '#8a9a8e', textTransform: 'uppercase' as const },
  select: { padding: '10px 12px', borderRadius: 8, border: '1px solid #2d4a32', backgroundColor: '#0d1f12', color: '#e0e0e0', fontSize: 14, outline: 'none' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #2d4a32', backgroundColor: '#0d1f12', color: '#e0e0e0', fontSize: 14, outline: 'none' },
  btn: { padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' },
  btnPrimary: { backgroundColor: '#f0a500', color: '#0d1f12' },
  btnSmall: { padding: '6px 14px', fontSize: 13 },
  btnXs: { padding: '4px 10px', fontSize: 11 },
  btnDanger: { backgroundColor: 'rgba(229,115,115,0.15)', color: '#e57373', border: '1px solid rgba(229,115,115,0.3)' },
  empty: { color: '#8a9a8e', fontSize: 14 },
  matchItem: { backgroundColor: '#15271a', border: '1px solid #2d4a32', borderRadius: 12, padding: 16 },
  matchHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 8 },
  matchTeams: { display: 'flex', alignItems: 'center', gap: 8 },
  matchTeamName: { color: '#fff', fontWeight: 600, fontSize: 14 },
  matchVs: { color: '#f0a500', fontWeight: 800, fontSize: 16, minWidth: 50, textAlign: 'center' as const },
  matchMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
  metaText: { color: '#8a9a8e', fontSize: 12 },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  badgeYellow: { backgroundColor: 'rgba(240,165,0,0.15)', color: '#f0a500' },
  badgeGreen: { backgroundColor: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  actions: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' as const },
  inlineForm: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' as const, padding: 12, backgroundColor: '#0d1f12', borderRadius: 8 },
  inlineLabel: { color: '#8a9a8e', fontSize: 13, fontWeight: 600 },
  eventPanel: { marginTop: 12, padding: 16, backgroundColor: '#0d1f12', borderRadius: 8, border: '1px solid #2d4a32' },
  eventTitle: { fontSize: 14, fontWeight: 700, color: '#8a9a8e', marginBottom: 10, marginTop: 0, textTransform: 'uppercase' as const },
  eventForm: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, alignItems: 'center' },
  eventRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #1e3523' },
  evMinute: { color: '#f0a500', fontWeight: 700, fontSize: 13, minWidth: 30 },
  evPlayer: { color: '#e0e0e0', fontWeight: 600, fontSize: 13 },
  evType: { color: '#8a9a8e', fontSize: 11, marginRight: 'auto' },
};
