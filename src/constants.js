export const TILE_SIZE = 16;

// Física
export const GRAVITY = 1200; // px/s^2 (sobre base 320x180)
export const MAX_FALL_SPEED = 800;

// Jugador
export const PLAYER_MOVE_ACCEL = 900;
export const PLAYER_MAX_SPEED = 120;
export const PLAYER_AIR_ACCEL = 600;
export const FRICTION_GROUND = 0.82;
export const FRICTION_AIR = 0.92;
export const JUMP_VELOCITY = 310;
export const COYOTE_TIME = 0.08; // segundos margen de salto tras dejar suelo
export const JUMP_BUFFER_TIME = 0.1; // buffer de pulsación de salto

// Colores
export const COLORS = {
  skyTop: '#0b1b2e',
  skyBottom: '#1a2a48',
  hill1: '#1d2b3f',
  hill2: '#132237',
  ground: '#4d3b2f',
  brick: '#7a5140',
  block: '#5a446d',
  player: '#ffd25e',
  enemy: '#ef6b5e',
  boss: '#ff3d6e',
  projectile: '#facc15',
  flag: '#74f0a7',
  particle: '#ffd25e',
  white: '#f0f4ff',
  hazard: '#dc2626',
  fireball: '#f97316',
};

// Teclas
export const KEY = {
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  JUMP: [' ', 'Space'],
  START: ['Enter'],
};


