/**
 * ScribexX Theme Utilities
 * 
 * This file contains theme-related constants and utility functions for the ScribexX application.
 * It implements the "Synthwave + Cyberpunk + Botanical Futurism" aesthetic described in the PRD.
 */

// Theme color constants with their hex values for reference
export const THEME_COLORS = {
  // Primary palette
  neonPurple: '#b829f8', // Primary brand color
  electricBlue: '#00c2ff', // Secondary brand color
  cyberGreen: '#39ff14', // Accent color
  metallicGray: {
    light: '#e6e6f0', // Light mode muted
    dark: '#2a2a3a', // Dark mode muted
  },
  sleekWhite: '#f0f0f8', // Light text
  
  // Accent palette
  neonPink: '#ff2a6d', // Destructive/important actions
  sunsetOrange: '#ff9e64', // Warnings/secondary actions
  digitalTeal: '#05ffa1', // Success states
  
  // Background gradients
  darkBg: '#1a1a2e', // Dark mode background
  lightBg: '#f5f5fa', // Light mode background
};

// RPG-specific color mappings
export const RPG_COLORS = {
  // Skill tree node states
  skillNode: {
    locked: THEME_COLORS.metallicGray.dark,
    available: THEME_COLORS.electricBlue,
    completed: THEME_COLORS.cyberGreen,
    inProgress: THEME_COLORS.neonPurple,
  },
  
  // Character stats
  stats: {
    strength: THEME_COLORS.neonPink,
    intelligence: THEME_COLORS.electricBlue,
    creativity: THEME_COLORS.neonPurple,
    clarity: THEME_COLORS.digitalTeal,
    persuasion: THEME_COLORS.sunsetOrange,
  },
  
  // Achievement ranks
  ranks: {
    C: '#a0a0a0', // Silver
    B: '#cd7f32', // Bronze
    A: '#ffd700', // Gold
    S: THEME_COLORS.neonPurple, // Special
  },
  
  // Faction themes (base colors that can be customized)
  factions: {
    journalists: THEME_COLORS.electricBlue,
    poets: THEME_COLORS.neonPurple,
    novelists: THEME_COLORS.digitalTeal,
    essayists: THEME_COLORS.sunsetOrange,
  },
};

// Helper function to apply neon glow effect to elements
export const applyNeonGlow = (color: string, intensity: 'low' | 'medium' | 'high' = 'medium') => {
  const intensityMap = {
    low: '0 0 5px',
    medium: '0 0 10px',
    high: '0 0 20px',
  };
  
  return `${intensityMap[intensity]} ${color}`;
};

// Helper to generate gradient backgrounds
export const gradients = {
  cyberpunk: `linear-gradient(135deg, ${THEME_COLORS.darkBg}, #2a1758)`,
  synthwave: `linear-gradient(135deg, #2b1331, #3b0f50)`,
  botanical: `linear-gradient(135deg, #0f2027, #203a43)`,
};

// Helper for generating grid backgrounds
export const generateGridBackground = (color = THEME_COLORS.electricBlue, opacity = 0.1, size = 20) => {
  const rgbaColor = hexToRgba(color, opacity);
  return {
    backgroundImage: `linear-gradient(${rgbaColor} 1px, transparent 1px), linear-gradient(90deg, ${rgbaColor} 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
  };
};

// Utility to convert hex to rgba
const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default {
  colors: THEME_COLORS,
  rpgColors: RPG_COLORS,
  applyNeonGlow,
  gradients,
  generateGridBackground,
}; 