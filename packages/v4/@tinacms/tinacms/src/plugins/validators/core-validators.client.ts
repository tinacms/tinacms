import { defineClientPlugin } from '../../client';
import { coreValidatorFactories } from './core-validators.factories';

export default defineClientPlugin({ validators: coreValidatorFactories });
