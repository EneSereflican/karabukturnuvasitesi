export type TeamStatus = 'pending' | 'approved' | 'rejected'

export type EventType = 'goal' | 'yellow_card' | 'red_card'

export interface PublicTeam {
  id: string
  name: string
  institution: string
  status: TeamStatus
  teamKey: string
  totalMembers: number
  rejectionNote: string | null
  rejectedPlayerNames: string[]
  hasReceipt: boolean
  captain: string
}

export interface FixtureEvent {
  id: string
  event_type: EventType
  minute: number
  player_name: string
  team_id: string
  team_name: string
}

export interface FixtureMatch {
  id: string
  week: number
  match_date: string
  status: 'completed'
  home_score: number
  away_score: number
  home_team: { id: string; name: string }
  away_team: { id: string; name: string }
  events: FixtureEvent[]
}

export interface StandingRow {
  id: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export interface PlayerStatRow {
  playerId: string
  playerName: string
  teamName: string
  count: number
}

export interface LineupPlayer {
  id: string
  first_name: string
  last_name: string
  jersey_number: number
}

export interface LineupArchive {
  teamId: string
  teamName: string
  formation: string
  createdByName: string
  deletedByName: string | null
  players: LineupPlayer[]
  substitutes: LineupPlayer[]
}

export const archiveMeta = {
  seasonTitle: 'Karabük Kamu Kurumları Bahar Futbol Turnuvası 2026',
  subtitle: 'Turnuva tamamlandı, arşiv sayfaları portfolyo amaçlı canlı tutuluyor.',
  highlightLabel: 'Arşiv',
  teamsCount: 6,
  playersCount: 84,
  completedMatchesCount: 15,
  eventsCount: 42,
  champion: 'Karabük Belediyesi',
}

export const applicationTeams: PublicTeam[] = [
  {
    id: 'team-karabuk-belediyesi',
    name: 'Karabük Belediyesi',
    institution: 'Karabük Belediyesi',
    status: 'approved',
    teamKey: 'KRBK1A2B',
    totalMembers: 15,
    rejectionNote: null,
    rejectedPlayerNames: [],
    hasReceipt: true,
    captain: 'Mehmet Yıldız',
  },
  {
    id: 'team-safranbolu-genclik',
    name: 'Safranbolu Gençlik',
    institution: 'Gençlik ve Spor İlçe Müdürlüğü',
    status: 'approved',
    teamKey: 'SFRN3C4D',
    totalMembers: 14,
    rejectionNote: null,
    rejectedPlayerNames: [],
    hasReceipt: true,
    captain: 'Aylin Demir',
  },
  {
    id: 'team-eskipazar-egitim',
    name: 'Eskipazar Eğitim',
    institution: 'Milli Eğitim Müdürlüğü',
    status: 'approved',
    teamKey: 'ESKP5E6F',
    totalMembers: 15,
    rejectionNote: null,
    rejectedPlayerNames: [],
    hasReceipt: true,
    captain: 'Hakan Şen',
  },
  {
    id: 'team-yenice-orman',
    name: 'Yenice Orman',
    institution: 'Orman İşletme Müdürlüğü',
    status: 'pending',
    teamKey: 'YNCC7G8H',
    totalMembers: 13,
    rejectionNote: null,
    rejectedPlayerNames: [],
    hasReceipt: false,
    captain: 'Ömer Faruk Kaya',
  },
  {
    id: 'team-ozel-idaresi',
    name: 'İl Özel İdaresi',
    institution: 'İl Özel İdaresi',
    status: 'rejected',
    teamKey: 'OZEL9J1K',
    totalMembers: 12,
    rejectionNote: 'Dekont eksik olduğu için başvuru revize istendi.',
    rejectedPlayerNames: ['Murat Kaya'],
    hasReceipt: false,
    captain: 'Serkan Acar',
  },
  {
    id: 'team-universite',
    name: 'Karabük Üniversitesi',
    institution: 'Karabük Üniversitesi',
    status: 'approved',
    teamKey: 'KBU2L3M4',
    totalMembers: 15,
    rejectionNote: null,
    rejectedPlayerNames: [],
    hasReceipt: true,
    captain: 'Seda Polat',
  },
]

export const fixtures: FixtureMatch[] = [
  {
    id: 'm-1',
    week: 1,
    match_date: '2026-05-03T18:30:00.000Z',
    status: 'completed',
    home_score: 2,
    away_score: 1,
    home_team: { id: 'team-karabuk-belediyesi', name: 'Karabük Belediyesi' },
    away_team: { id: 'team-yenice-orman', name: 'Yenice Orman' },
    events: [
      { id: 'e-1', event_type: 'goal', minute: 12, player_name: 'Mehmet Yıldız', team_id: 'team-karabuk-belediyesi', team_name: 'Karabük Belediyesi' },
      { id: 'e-2', event_type: 'yellow_card', minute: 27, player_name: 'Burak Aydın', team_id: 'team-yenice-orman', team_name: 'Yenice Orman' },
      { id: 'e-3', event_type: 'goal', minute: 54, player_name: 'Emre Aksu', team_id: 'team-yenice-orman', team_name: 'Yenice Orman' },
      { id: 'e-4', event_type: 'goal', minute: 71, player_name: 'Samed Karaca', team_id: 'team-karabuk-belediyesi', team_name: 'Karabük Belediyesi' },
    ],
  },
  {
    id: 'm-2',
    week: 1,
    match_date: '2026-05-04T18:30:00.000Z',
    status: 'completed',
    home_score: 0,
    away_score: 0,
    home_team: { id: 'team-safranbolu-genclik', name: 'Safranbolu Gençlik' },
    away_team: { id: 'team-eskipazar-egitim', name: 'Eskipazar Eğitim' },
    events: [
      { id: 'e-5', event_type: 'yellow_card', minute: 33, player_name: 'Efe Yılmaz', team_id: 'team-safranbolu-genclik', team_name: 'Safranbolu Gençlik' },
      { id: 'e-6', event_type: 'yellow_card', minute: 61, player_name: 'Mert Öz', team_id: 'team-eskipazar-egitim', team_name: 'Eskipazar Eğitim' },
    ],
  },
  {
    id: 'm-3',
    week: 2,
    match_date: '2026-05-10T19:00:00.000Z',
    status: 'completed',
    home_score: 3,
    away_score: 2,
    home_team: { id: 'team-universite', name: 'Karabük Üniversitesi' },
    away_team: { id: 'team-karabuk-belediyesi', name: 'Karabük Belediyesi' },
    events: [
      { id: 'e-7', event_type: 'goal', minute: 8, player_name: 'Can Arslan', team_id: 'team-universite', team_name: 'Karabük Üniversitesi' },
      { id: 'e-8', event_type: 'goal', minute: 18, player_name: 'Mehmet Yıldız', team_id: 'team-karabuk-belediyesi', team_name: 'Karabük Belediyesi' },
      { id: 'e-9', event_type: 'goal', minute: 39, player_name: 'Samed Karaca', team_id: 'team-karabuk-belediyesi', team_name: 'Karabük Belediyesi' },
      { id: 'e-10', event_type: 'goal', minute: 64, player_name: 'Mertcan Sezer', team_id: 'team-universite', team_name: 'Karabük Üniversitesi' },
      { id: 'e-11', event_type: 'goal', minute: 78, player_name: 'Selim Korkmaz', team_id: 'team-universite', team_name: 'Karabük Üniversitesi' },
    ],
  },
  {
    id: 'm-4',
    week: 2,
    match_date: '2026-05-11T19:00:00.000Z',
    status: 'completed',
    home_score: 1,
    away_score: 2,
    home_team: { id: 'team-yenice-orman', name: 'Yenice Orman' },
    away_team: { id: 'team-safranbolu-genclik', name: 'Safranbolu Gençlik' },
    events: [
      { id: 'e-12', event_type: 'goal', minute: 22, player_name: 'Burak Aydın', team_id: 'team-yenice-orman', team_name: 'Yenice Orman' },
      { id: 'e-13', event_type: 'goal', minute: 47, player_name: 'Aylin Demir', team_id: 'team-safranbolu-genclik', team_name: 'Safranbolu Gençlik' },
      { id: 'e-14', event_type: 'goal', minute: 83, player_name: 'Efe Yılmaz', team_id: 'team-safranbolu-genclik', team_name: 'Safranbolu Gençlik' },
    ],
  },
  {
    id: 'm-5',
    week: 3,
    match_date: '2026-05-17T18:00:00.000Z',
    status: 'completed',
    home_score: 1,
    away_score: 1,
    home_team: { id: 'team-eskipazar-egitim', name: 'Eskipazar Eğitim' },
    away_team: { id: 'team-universite', name: 'Karabük Üniversitesi' },
    events: [
      { id: 'e-15', event_type: 'goal', minute: 31, player_name: 'Mert Öz', team_id: 'team-eskipazar-egitim', team_name: 'Eskipazar Eğitim' },
      { id: 'e-16', event_type: 'goal', minute: 65, player_name: 'Can Arslan', team_id: 'team-universite', team_name: 'Karabük Üniversitesi' },
      { id: 'e-17', event_type: 'yellow_card', minute: 74, player_name: 'Taha Güneş', team_id: 'team-universite', team_name: 'Karabük Üniversitesi' },
    ],
  },
  {
    id: 'm-6',
    week: 3,
    match_date: '2026-05-18T18:00:00.000Z',
    status: 'completed',
    home_score: 2,
    away_score: 0,
    home_team: { id: 'team-ozel-idaresi', name: 'İl Özel İdaresi' },
    away_team: { id: 'team-karabuk-belediyesi', name: 'Karabük Belediyesi' },
    events: [
      { id: 'e-18', event_type: 'goal', minute: 15, player_name: 'Murat Kaya', team_id: 'team-ozel-idaresi', team_name: 'İl Özel İdaresi' },
      { id: 'e-19', event_type: 'red_card', minute: 52, player_name: 'Serhat Dönmez', team_id: 'team-karabuk-belediyesi', team_name: 'Karabük Belediyesi' },
      { id: 'e-20', event_type: 'goal', minute: 88, player_name: 'Ali Rıza', team_id: 'team-ozel-idaresi', team_name: 'İl Özel İdaresi' },
    ],
  },
]

export const standings: StandingRow[] = [
  { id: 'team-karabuk-belediyesi', name: 'Karabük Belediyesi', played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 9, goalsAgainst: 5, goalDiff: 4, points: 12 },
  { id: 'team-universite', name: 'Karabük Üniversitesi', played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 8, goalsAgainst: 6, goalDiff: 2, points: 10 },
  { id: 'team-safranbolu-genclik', name: 'Safranbolu Gençlik', played: 5, won: 2, drawn: 2, lost: 1, goalsFor: 5, goalsAgainst: 4, goalDiff: 1, points: 8 },
  { id: 'team-eskipazar-egitim', name: 'Eskipazar Eğitim', played: 5, won: 1, drawn: 3, lost: 1, goalsFor: 4, goalsAgainst: 4, goalDiff: 0, points: 6 },
  { id: 'team-yenice-orman', name: 'Yenice Orman', played: 5, won: 1, drawn: 1, lost: 3, goalsFor: 4, goalsAgainst: 7, goalDiff: -3, points: 4 },
  { id: 'team-ozel-idaresi', name: 'İl Özel İdaresi', played: 5, won: 1, drawn: 1, lost: 3, goalsFor: 3, goalsAgainst: 7, goalDiff: -4, points: 4 },
]

const goalStats: PlayerStatRow[] = [
  { playerId: 'p-1', playerName: 'Mehmet Yıldız', teamName: 'Karabük Belediyesi', count: 2 },
  { playerId: 'p-2', playerName: 'Can Arslan', teamName: 'Karabük Üniversitesi', count: 2 },
  { playerId: 'p-3', playerName: 'Samed Karaca', teamName: 'Karabük Belediyesi', count: 2 },
  { playerId: 'p-4', playerName: 'Aylin Demir', teamName: 'Safranbolu Gençlik', count: 1 },
  { playerId: 'p-5', playerName: 'Burak Aydın', teamName: 'Yenice Orman', count: 1 },
  { playerId: 'p-6', playerName: 'Mert Öz', teamName: 'Eskipazar Eğitim', count: 1 },
  { playerId: 'p-7', playerName: 'Mertcan Sezer', teamName: 'Karabük Üniversitesi', count: 1 },
  { playerId: 'p-8', playerName: 'Selim Korkmaz', teamName: 'Karabük Üniversitesi', count: 1 },
  { playerId: 'p-9', playerName: 'Murat Kaya', teamName: 'İl Özel İdaresi', count: 1 },
]

const yellowCardStats: PlayerStatRow[] = [
  { playerId: 'y-1', playerName: 'Efe Yılmaz', teamName: 'Safranbolu Gençlik', count: 1 },
  { playerId: 'y-2', playerName: 'Mert Öz', teamName: 'Eskipazar Eğitim', count: 1 },
  { playerId: 'y-3', playerName: 'Burak Aydın', teamName: 'Yenice Orman', count: 1 },
  { playerId: 'y-4', playerName: 'Taha Güneş', teamName: 'Karabük Üniversitesi', count: 1 },
]

const redCardStats: PlayerStatRow[] = [
  { playerId: 'r-1', playerName: 'Serhat Dönmez', teamName: 'Karabük Belediyesi', count: 1 },
]

export const statsByEventType: Record<EventType, PlayerStatRow[]> = {
  goal: goalStats,
  yellow_card: yellowCardStats,
  red_card: redCardStats,
}

export const lineupArchiveByTeamId: Record<string, LineupArchive> = {
  'team-karabuk-belediyesi': {
    teamId: 'team-karabuk-belediyesi',
    teamName: 'Karabük Belediyesi',
    formation: '4-3-3',
    createdByName: 'Mehmet Yıldız',
    deletedByName: null,
    players: [
      { id: 'p-101', first_name: 'Ömer', last_name: 'Kaya', jersey_number: 1 },
      { id: 'p-102', first_name: 'Mehmet', last_name: 'Yıldız', jersey_number: 5 },
      { id: 'p-103', first_name: 'Serhat', last_name: 'Dönmez', jersey_number: 7 },
      { id: 'p-104', first_name: 'Samed', last_name: 'Karaca', jersey_number: 10 },
      { id: 'p-105', first_name: 'Emre', last_name: 'Aksu', jersey_number: 11 },
      { id: 'p-106', first_name: 'Burak', last_name: 'Aydın', jersey_number: 14 },
      { id: 'p-107', first_name: 'Ali', last_name: 'Rıza', jersey_number: 17 },
      { id: 'p-108', first_name: 'Can', last_name: 'Arslan', jersey_number: 18 },
      { id: 'p-109', first_name: 'Taha', last_name: 'Güneş', jersey_number: 20 },
      { id: 'p-110', first_name: 'Mert', last_name: 'Öz', jersey_number: 21 },
      { id: 'p-111', first_name: 'Selim', last_name: 'Korkmaz', jersey_number: 9 },
    ],
    substitutes: [
      { id: 'p-112', first_name: 'Aykut', last_name: 'Şahin', jersey_number: 2 },
      { id: 'p-113', first_name: 'Kerem', last_name: 'Polat', jersey_number: 12 },
      { id: 'p-114', first_name: 'Onur', last_name: 'Çetin', jersey_number: 15 },
    ],
  },
  'team-universite': {
    teamId: 'team-universite',
    teamName: 'Karabük Üniversitesi',
    formation: '4-2-3-1',
    createdByName: 'Seda Polat',
    deletedByName: 'Seda Polat',
    players: [],
    substitutes: [],
  },
}

export const playerInviteArchive = {
  token: 'KBU2L3M4',
  teamName: 'Karabük Üniversitesi',
  teamInstitution: 'Karabük Üniversitesi',
  spotsLeft: 0,
  totalMembers: 15,
  status: 'approved' as TeamStatus,
}

export const playerRegistrationArchive = {
  teamKey: 'KRBK1A2B',
  teamName: 'Karabük Belediyesi',
  institution: 'Karabük Belediyesi',
  spotsLeft: 0,
  totalMembers: 15,
}
