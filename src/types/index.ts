/**
 * Unified Types Export
 */

export * from './job';
export * from './cv';
export * from './ats';
export * from './strategy';
export * from './ai';

// Legacy compatibility aliases
export type CV = import('./cv').MasterCV;
export type MessageType = import('./strategy').TacticalStep;
