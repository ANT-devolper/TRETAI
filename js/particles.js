import {
  PARTICLE_GRAVITY,
  PARTICLE_MIN_SPEED,
  PARTICLE_MAX_SPEED,
  PARTICLE_UPWARD_BIAS,
  PARTICLE_MIN_LIFE,
  PARTICLE_MAX_LIFE,
} from './constants.js';

export function createBurst(x, y, color, count, opts = {}) {
  const {
    minSpeed = PARTICLE_MIN_SPEED,
    maxSpeed = PARTICLE_MAX_SPEED,
    upwardBias = PARTICLE_UPWARD_BIAS,
    minLife = PARTICLE_MIN_LIFE,
    maxLife = PARTICLE_MAX_LIFE,
    minSize = 2,
    maxSize = 5,
    rand = Math.random,
  } = opts;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const speed = minSpeed + rand() * (maxSpeed - minSpeed);
    const life = minLife + rand() * (maxLife - minLife);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - upwardBias,
      life,
      maxLife: life,
      size: minSize + rand() * (maxSize - minSize),
      color,
    });
  }
  return particles;
}

export function stepParticles(particles, dt, gravity = PARTICLE_GRAVITY) {
  const alive = [];
  for (const p of particles) {
    const life = p.life - dt;
    if (life <= 0) continue;
    alive.push({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + gravity * dt,
      life,
    });
  }
  return alive;
}
