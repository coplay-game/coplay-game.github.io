import { GAME_ICONS } from '../data/icons';
import { GameIconItem, PlacedIcon } from '../types';

export function getIconCountForRound(round: number, startingRound: number, keepDifficulty: boolean): number {
  if (keepDifficulty) {
    // In fixed difficulty mode, keep the icon count corresponding to the chosen starting round
    // round 1 = 3 icons, round 2 = 4 ... round 18 = 20 icons
    return Math.min(20, Math.max(3, startingRound + 2));
  }
  // In progressive mode, starts from startingRound and increases
  return Math.min(20, Math.max(3, round + 2));
}

export function getIconSizePercent(count: number): number {
  // Easy levels start very large and prominent for young children;
  // scales down smoothly as icon density increases
  if (count <= 3) return 36;
  if (count === 4) return 31;
  if (count === 5) return 27;
  if (count === 6) return 24;
  if (count <= 8) return 21;
  if (count <= 10) return 18.5;
  if (count <= 13) return 16;
  if (count <= 16) return 13.5;
  if (count <= 18) return 12;
  return 10.8;
}

// Generate positions inside a circle (center 50%, 50%, radius <= 40%)
export function distributeIconsInCircle(icons: GameIconItem[]): PlacedIcon[] {
  const count = icons.length;
  const sizePercent = getIconSizePercent(count);
  const glyphSizeCqw = Number((sizePercent * 0.58).toFixed(1));
  const maxRadiusPercent = 48 - sizePercent / 1.8; // Keeps icon inside circle boundary

  const positions: { x: number; y: number }[] = [];

  if (count === 3) {
    // 3 icons in a large, balanced triangle
    const r = 24.5;
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
      positions.push({
        x: 50 + r * Math.cos(angle),
        y: 50 + r * Math.sin(angle),
      });
    }
  } else if (count === 4) {
    // 4 icons in a square layout
    const r = 25;
    for (let i = 0; i < 4; i++) {
      const angle = (i * 2 * Math.PI) / 4 - Math.PI / 4;
      positions.push({
        x: 50 + r * Math.cos(angle),
        y: 50 + r * Math.sin(angle),
      });
    }
  } else if (count <= 6) {
    // 1 in center, rest on an outer ring
    positions.push({ x: 50, y: 50 });
    const outerCount = count - 1;
    const r = maxRadiusPercent * 0.82;
    const randomOffset = Math.random() * 0.4 - 0.2;
    for (let i = 0; i < outerCount; i++) {
      const angle = (i * 2 * Math.PI) / outerCount - Math.PI / 2 + randomOffset;
      positions.push({
        x: 50 + r * Math.cos(angle),
        y: 50 + r * Math.sin(angle),
      });
    }
  } else {
    // Golden angle spiral with repulsion relaxation for larger sets
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad (~137.5 deg)
    const randomOffsetAngle = Math.random() * Math.PI * 2;

    for (let i = 0; i < count; i++) {
      // Fermat's spiral r = c * sqrt(i)
      const normRadius = Math.sqrt((i + 0.5) / count);
      const r = normRadius * maxRadiusPercent;
      const angle = i * goldenAngle + randomOffsetAngle;

      positions.push({
        x: 50 + r * Math.cos(angle),
        y: 50 + r * Math.sin(angle),
      });
    }

    // Relax positions to avoid overlaps
    const minDistance = sizePercent * 1.05;
    for (let step = 0; step < 40; step++) {
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = positions[j].x - positions[i].x;
          const dy = positions[j].y - positions[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;

          if (dist < minDistance) {
            const overlap = (minDistance - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            positions[i].x -= nx * overlap * 0.5;
            positions[i].y -= ny * overlap * 0.5;
            positions[j].x += nx * overlap * 0.5;
            positions[j].y += ny * overlap * 0.5;
          }
        }

        // Clamp inside circle
        const cdx = positions[i].x - 50;
        const cdy = positions[i].y - 50;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist > maxRadiusPercent) {
          positions[i].x = 50 + (cdx / cdist) * maxRadiusPercent;
          positions[i].y = 50 + (cdy / cdist) * maxRadiusPercent;
        }
      }
    }
  }

  // Shuffle icons order and attach random slight rotation
  const shuffledIcons = [...icons].sort(() => Math.random() - 0.5);

  return shuffledIcons.map((icon, idx) => ({
    ...icon,
    x: positions[idx].x,
    y: positions[idx].y,
    size: sizePercent,
    rotation: Math.round(Math.random() * 30 - 15), // -15 to +15 degrees
    glyphSizeCqw,
  }));
}

export function generateRoundCards(count: number): {
  matchingIcon: GameIconItem;
  player1Icons: PlacedIcon[];
  player2Icons: PlacedIcon[];
} {
  // Shuffle all available icons
  const allShuffled = [...GAME_ICONS].sort(() => Math.random() - 0.5);

  // 1 matching icon
  const matchingIcon = allShuffled[0];

  // Distractors needed for each player
  const distractorCount = count - 1;

  // Player 1 distractors from pool
  const p1Distractors = allShuffled.slice(1, 1 + distractorCount);
  // Player 2 distractors from the next slice of pool to ensure completely disjoint distractors
  const p2Distractors = allShuffled.slice(1 + distractorCount, 1 + distractorCount * 2);

  // Combine matching icon + distractors
  const p1Raw = [matchingIcon, ...p1Distractors];
  const p2Raw = [matchingIcon, ...p2Distractors];

  const player1Icons = distributeIconsInCircle(p1Raw);
  const player2Icons = distributeIconsInCircle(p2Raw);

  return {
    matchingIcon,
    player1Icons,
    player2Icons,
  };
}
