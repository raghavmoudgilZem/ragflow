/**
 * Agent module constants
 * Configurable values for agent-related features
 */

export const AGENT_CONFIG = {
  // API Configuration
  API: {
    DEFAULT_PAGE_SIZE: 50,
    DEFAULT_PAGE: 1,
    DEFAULT_ORDER_BY: 'update_time',
    DEFAULT_DESC: true,
    MOCK_DELAY_MS: 800,
  },

  // UI Configuration
  UI: {
    CARD: {
      AVATAR_SIZE: 40, // px
      BORDER_RADIUS: 8, // px
      INITIAL_MAX_LENGTH: 2,
      DESCRIPTION_LINE_CLAMP: 2,
    },
    GRID: {
      GAP: 24, // px - matches Tailwind gap-6
      GAP_MOBILE: 16, // px
      MIN_CARD_WIDTH: 320, // px
      // Tailwind breakpoints for responsive grid
      BREAKPOINTS: {
        SM: 640,
        MD: 768,
        LG: 1024,
        XL: 1280,
        XXL: 1536,
      },
      // Column counts per breakpoint (matches React CardContainer)
      COLUMNS: {
        DEFAULT: 1,
        SM: 1,
        MD: 2,
        LG: 3,
        XL: 4,
        XXL: 5,
      },
    },
    BREAKPOINTS: {
      MOBILE_MAX: 768, // px
      TABLET_MIN: 769, // px
      TABLET_MAX: 1024, // px
      DESKTOP_MIN: 1025, // px
      DESKTOP_MAX: 1440, // px
      LARGE_DESKTOP_MIN: 1441, // px
    },
    LOADING: {
      SPINNER_SIZE: 48, // px
      MIN_HEIGHT: 400, // px
    },
  },

  // Animation Configuration
  ANIMATION: {
    TRANSITION_DURATION: '0.2s',
    TRANSITION_TIMING: 'ease-in-out',
    HOVER_TRANSFORM: 'translateY(-2px)',
  },
} as const;

/**
 * Agent status types
 */
export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

/**
 * Agent sort options
 */
export enum AgentSortField {
  CREATE_TIME = 'create_time',
  UPDATE_TIME = 'update_time',
  TITLE = 'title',
}
