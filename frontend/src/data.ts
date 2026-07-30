import type { Template } from './types';

export const TEMPLATES: Template[] = [
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
