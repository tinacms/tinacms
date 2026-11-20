import type { ServerSegment } from '../../core/plugin';
import { coreValidatorFactories } from './core-validators.factories';

// No import from `../../server`: it pulls node modules, and a browser bundle
// reaches this segment through the manifest's lazy `server` loader (ADR-028 §4).
const segment: ServerSegment = { validators: coreValidatorFactories };

export default segment;
