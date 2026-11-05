import BlockQuote from './BlockQuote.svelte';
import DateTime from './DateTime.svelte';
import Image from './Image.svelte';
import Link from './Link.svelte';
import NewsletterSignup from './NewsletterSignup.svelte';
import PullQuote from './PullQuote.svelte';

export const customComponents: Record<string, any> = {
  DateTime,
  BlockQuote,
  pullQuote: PullQuote,
  'pull-quote': PullQuote,
  NewsletterSignup,
  img: Image,
  a: Link,
};
