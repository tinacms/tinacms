import { MemoryLevel } from 'memory-level';

export default new MemoryLevel<string, string>({ valueEncoding: 'utf8' });
