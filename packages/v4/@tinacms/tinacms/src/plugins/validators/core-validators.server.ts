import { defineServerPlugin } from '../../server';
import { coreValidatorFactories } from './core-validators.factories';

export default defineServerPlugin({ validators: coreValidatorFactories });
