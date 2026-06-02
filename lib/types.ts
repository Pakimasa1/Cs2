export type MapName = 'mirage' | 'dust2' | 'inferno' | 'nuke' | 'ancient' | 'anubis' | 'vertigo'

export type Side = 'T' | 'CT'

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface LineupPoint {
  id: string
  map_name: MapName
  side: Side
  title: string
  color: string
  x_position: number
  y_position: number
  description: string | null
  throw_instructions: string | null
  additional_notes: string | null
  start_image_url: string | null
  result_image_url: string | null
  user_id: string
  created_at: string
  profiles?: Profile
  comments?: Comment[]
}

export interface Comment {
  id: string
  lineup_point_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface MapData {
  name: string
  slug: MapName
  imageUrl: string
}

export const MAPS: MapData[] = [
  { name: 'Mirage', slug: 'mirage', imageUrl: '/maps/mirage.webp' },
  { name: 'Dust 2', slug: 'dust2', imageUrl: '/maps/dust2.webp' },
  { name: 'Inferno', slug: 'inferno', imageUrl: '/maps/inferno.webp' },
  { name: 'Nuke', slug: 'nuke', imageUrl: '/maps/nuke.webp' },
  { name: 'Ancient', slug: 'ancient', imageUrl: '/maps/ancient.webp' },
  { name: 'Anubis', slug: 'anubis', imageUrl: '/maps/anubis.webp' },
  { name: 'Vertigo', slug: 'vertigo', imageUrl: '/maps/vertigo.webp' },
]

export const LINEUP_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
]
