export interface ExternalScript {
  name: string;
  src: string;
}

export enum ExternalScriptsNames {
  ALTMETRIC = 'altmetric-embed',
  DIMENSIONS = '__dimensions_badge_embed__',
  PLUMX = 'plumx-details'
}

export enum ExternalScriptsStatus {
  LOADED = 'loaded',
  ALREADY_LOADED = 'already loaded',
  NOT_LOADED = 'not loaded',
}

export const ExternalScriptsList: ExternalScript[] = [
  {name: ExternalScriptsNames.ALTMETRIC, src: 'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js'},
  {name: ExternalScriptsNames.DIMENSIONS, src: 'https://badge.dimensions.ai/badge.js'},
  {name: ExternalScriptsNames.PLUMX, src: 'https://cdn.plu.mx/widget-details.js'},
];
