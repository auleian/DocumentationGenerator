import type { TemplateCard } from './types';

/**
 * Static display cards for the template picker. Only `srs` corresponds to a
 * real backend DocumentType today; the others are shown disabled until the
 * backend seeds them.
 */
export const TEMPLATE_CARDS: TemplateCard[] = [
  {
    id: 'srs',
    name: 'Software Requirements Specification',
    description: 'Define what a system must do, in AIBOS house style — adapted from IEEE 830.',
  },
  {
    id: 'design-doc',
    name: 'Design Document',
    description: 'Architecture and design rationale for a system already scoped by an SRS.',
    comingSoon: true,
  },
  {
    id: 'runbook',
    name: 'Runbook',
    description: 'Operational procedures for running and recovering a live system.',
    comingSoon: true,
  },
];
