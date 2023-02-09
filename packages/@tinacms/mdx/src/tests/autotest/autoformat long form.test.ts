import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './autoformat long form.md?raw'
import markdownStringFormatted from './autoformat long form.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Money talks, and there is an awful lot of money on the web these days. That is not necessarily a bad thing in and of itself, but it does seem to have hamstrung how websites are designed and financed. The pandemic — and the consequent collapse of an already warped online ad ecosystem — makes it all the clearer that the web needs to diversify the way it makes money, and who it ultimately serves.',
        },
      ],
    },
    { type: 'h2', children: [{ type: 'text', text: 'State Of The Web' }] },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'The Internet is not in the best shape right now. Back in 2017, the founder of the World Wide Web, ',
        },
        {
          type: 'a',
          url: 'https://www.theguardian.com/technology/2017/nov/15/tim-berners-lee-world-wide-web-net-neutrality',
          title: null,
          children: [{ type: 'text', text: 'Sir Tim Berners-Lee' }],
        },
        { type: 'text', text: ', said:' },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: '<blockquote>“The system is failing. The way ad revenue works with clickbait is not fulfilling the goal of helping humanity promote truth and democracy.”</blockquote>',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'I think it’s safe to say things have largely gotten worse since then. Ads everywhere, tracking run amok, clickbait, misinformation, net neutrality under siege... engagement is king — more important than nuance, ethics, or truth — because that’s where the money is. ',
        },
        {
          type: 'a',
          url: 'https://ppcprotect.com/how-many-ads-do-we-see-a-day/',
          title: null,
          children: [
            {
              type: 'text',
              text: 'The average user sees thousands of ads per day',
            },
          ],
        },
        {
          type: 'text',
          text: '. The World Wide Web isn’t exactly humanity’s shining light right now, at a time when a whole lot of things are compounding our general sense of inescapable doom.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'In the midst of this dog-track-dog online culture, the common website has been browbeaten into meek, insipid husks of what they could be. Can we get another ad in there? What about a few more pop-ups? Maybe a few affiliate links. We’ve all experienced the insidiousness of the modern web, we’ve all seen the pop-ups saying ‘We care about your privacy’ before asking us to sign away our privacy. One tires of being lied to so often, and so casually.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Still, I’m not here to complain. At least, I’m not ',
        },
        { type: 'text', text: 'just', italic: true },
        {
          type: 'text',
          text: ' here to complain. There are flickers of light in the darkness. There are other ways to pay for websites. It’s just as well too because ',
        },
        {
          type: 'a',
          url: 'https://www.vox.com/recode/2019/6/24/18715421/internet-free-data-ads-cost',
          title: null,
          children: [
            {
              type: 'text',
              text: 'legislation will catch up with the wild wild World Wide Web eventually',
            },
          ],
        },
        { type: 'text', text: ' and then ads will be worth even less.' },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'That’s what this piece is about: alternatives, and why they’re worth embracing. There will always be ads, and up to a point that’s fine, but there shouldn’t ',
        },
        { type: 'text', text: 'only', italic: true },
        { type: 'text', text: ' be ads.' },
      ],
    },
    { type: 'h4', children: [{ type: 'text', text: 'Further Reading' }] },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                { type: 'text', text: '“' },
                {
                  type: 'a',
                  url: 'https://themarkup.org/blacklight/2020/09/22/blacklight-tracking-advertisers-digital-privacy-sensitive-websites',
                  title: null,
                  children: [
                    {
                      type: 'text',
                      text: 'The High Privacy Cost of a “Free” Website',
                      italic: true,
                    },
                  ],
                },
                { type: 'text', text: ',” ' },
                { type: 'text', text: 'Matt Chase', italic: true },
              ],
            },
          ],
        },
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                {
                  type: 'a',
                  url: 'https://www.nytimes.com/2020/12/16/technology/google-monopoly-antitrust.html',
                  title: null,
                  children: [
                    {
                      type: 'text',
                      text: '10 States Accuse Google of Abusing Monopoly in Online Ads',
                      italic: true,
                    },
                  ],
                },
                { type: 'text', text: ', ' },
                {
                  type: 'text',
                  text: 'David McCabe & Daisuke Wakabayashi',
                  italic: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'h2',
      children: [{ type: 'text', text: 'Exploring Alternatives' }],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Not every website needs to make money. Let’s get that out of the way. Making money is not the measure of a thing. Not every website needs to care about cost. Hobbies, blogs, forums, digital art… plenty of things are worth doing for their own sake.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'This article is directed at sites or web apps that offer some kind of service, with operational costs and long-term financial factors that extend beyond a few dollars on a domain name. This article is about widening the horizon of the online economy beyond ads, ads, and more ads.',
        },
      ],
    },
    { type: 'h3', children: [{ type: 'text', text: 'Subscriptions' }] },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'This is probably the most obvious alternative to ads, and trickier than you might think to implement. The principle of it is simple: a website does something of value and asks users to pay for it.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'A major advantage of subscriptions is their simplicity. Want X? Pay for X. More and more people are wising up to the fact that few things online are truly free. More often than not when an online service is ‘free’ its users are the product. A valuable service reasonably priced is a welcome antidote to that.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'A high profile example of this is ' },
        {
          type: 'a',
          url: 'https://productmint.com/the-medium-business-model-how-does-medium-make-money/',
          title: null,
          children: [{ type: 'text', text: 'Medium' }],
        },
        {
          type: 'text',
          text: '. Signing up for a few dollars a month gives members access to articles. It’s an increasingly popular approach in editorial circles. Some publications, like ',
        },
        { type: 'text', text: 'The Guardian', italic: true },
        {
          type: 'text',
          text: ', make their content accessible to everyone, while the likes of ',
        },
        { type: 'text', text: 'The New York Times', italic: true },
        {
          type: 'text',
          text: ' use a paywall. In either case, the pitch is the same: help make what we do possible by subscribing.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Smashing', italic: true },
        {
          type: 'text',
          text: ' itself does this well, having pivoted away from ads during the big site redesign a few years back. Ads still play a big part, yes, but they’re not the ',
        },
        { type: 'text', text: 'only', italic: true },
        {
          type: 'text',
          text: ' part. Sustainability online isn’t about moving all your eggs from one basket to another — it’s about variety, about escaping the tunnel vision of advertising.',
        },
      ],
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'rimg',
      props: {
        breakout: 'true',
        href: 'https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/544842f6-d36f-4fab-96d5-bba83de7bb82/smashing-magazine-signup.png',
        src: 'https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/544842f6-d36f-4fab-96d5-bba83de7bb82/smashing-magazine-signup.png',
        sizes: '100vw',
        caption:
          "Weaving tasteful, on-brand subscription prompts into a site’s design can help you build a strong community. (Why yes, you can <a href='https://www.smashingmagazine.com/membership/'>learn more about becoming a Smashing member here</a>.)",
        alt: 'Signup prompt for Smashing Magazine membership',
      },
      children: [{ type: 'text', text: '' }],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'There are examples of subscriptions and donations working away from editorial contexts. ',
        },
        {
          type: 'a',
          url: 'https://www.lynda.com/',
          title: null,
          children: [{ type: 'text', text: 'Lynda' }],
        },
        { type: 'text', text: ' charges for its courses. ' },
        {
          type: 'a',
          url: 'https://wikipedia.org',
          title: null,
          children: [{ type: 'text', text: 'Wikipedia' }],
        },
        {
          type: 'text',
          text: ', mercifully, is ad-free, sustained by intermittent ',
        },
        {
          type: 'a',
          url: 'https://donate.wikimedia.org/wiki/Ways_to_Give',
          title: null,
          children: [{ type: 'text', text: 'donation drives' }],
        },
        {
          type: 'text',
          text: ' to its parent organization, the Wikimedia Foundation.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'The subscription approach isn’t for everyone. The above examples all happen to be household names, after all. Strange that. Trust is such a big factor, and if you’re new on the block how many people are likely to give you their moola?',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'And, of course, there is also the Catch-22 situation of paywalls making a site inaccessible to most of the Internet. It’s bad for growing an audience and at odds with the web’s founding spirit of openness and transparency. That doesn’t sit well with a lot of people — including myself.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'I think the saving grace here is that the ‘subscription model’ is much more of a spectrum than it was even five years ago. You can have everything from paywalls to ‘buy me a coffee’ buttons depending on what a website does.',
        },
      ],
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'rimg',
      props: {
        href: 'https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/bc4f5584-4493-4a7f-bf66-46682ae9df85/buy-coffee-button.png',
        src: 'https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/bc4f5584-4493-4a7f-bf66-46682ae9df85/buy-coffee-button.png',
        sizes: '100vw',
        caption:
          "(<a href='https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/bc4f5584-4493-4a7f-bf66-46682ae9df85/buy-coffee-button.png'>Large preview</a>)",
        alt: 'A generic ‘Buy Me a Coffee’ button',
      },
      children: [{ type: 'text', text: '' }],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'If you provide a service — be it quality editorial content, useful tools, open access to data, or whatever else — don’t be shy about asking for support. And don’t be shy about incorporating those requests into the website’s design. A variety of tools and platforms can be integrated into existing sites with relative ease. ',
        },
        {
          type: 'a',
          url: 'https://www.patreon.com/',
          title: null,
          children: [{ type: 'text', text: 'Patreon' }],
        },
        { type: 'text', text: ', ' },
        {
          type: 'a',
          url: 'https://ko-fi.com/',
          title: null,
          children: [{ type: 'text', text: 'Ko-fi' }],
        },
        { type: 'text', text: ', and plenty more.' },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'This is not about making people feel guilty. Not everyone can afford to support the sites they visit, and not everyone will think you’re worth supporting. It’s on you to make a positive case for yourself. Crowdfunding platforms like ',
        },
        {
          type: 'a',
          url: 'https://opencollective.com/',
          title: null,
          children: [{ type: 'text', text: 'Open Collective' }],
        },
        { type: 'text', text: ' and ' },
        {
          type: 'a',
          url: 'https://chuffed.org/',
          title: null,
          children: [{ type: 'text', text: 'Chuffed' }],
        },
        {
          type: 'text',
          text: ' are especially good reference points for this, modeling behavior such as:',
        },
      ],
    },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                { type: 'text', text: 'Not making visitors feel guilty;' },
              ],
            },
          ],
        },
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                {
                  type: 'text',
                  text: 'Telling stories people want to be part of and support;',
                },
              ],
            },
          ],
        },
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                {
                  type: 'text',
                  text: 'Transparency about where the money’s going.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'There is also the question of integration. Buttons, pop-ups, prudently placed CTAs. It all adds up, having started and pushed a ',
        },
        {
          type: 'a',
          url: 'https://romanroadlondon.com/support-us/',
          title: null,
          children: [{ type: 'text', text: 'reader patron scheme' }],
        },
        { type: 'text', text: ' at a previous job.' },
      ],
    },
    {
      type: 'h4',
      children: [{ type: 'text', text: 'Further Reading & Resources' }],
    },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                {
                  type: 'a',
                  url: 'https://writersanctuary.com/review-monetizing-with-buy-me-a-coffee-does-it-work/',
                  title: null,
                  children: [
                    {
                      type: 'text',
                      text: 'Monetising With Buy Me a Coffee, Does it Work?',
                      italic: true,
                    },
                  ],
                },
                { type: 'text', text: ', ' },
                { type: 'text', text: 'Michael Brockbank', italic: true },
              ],
            },
          ],
        },
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                {
                  type: 'a',
                  url: 'https://opencollective.com/',
                  title: null,
                  children: [
                    { type: 'text', text: 'Open Collective', italic: true },
                  ],
                },
                { type: 'text', text: ', ' },
                {
                  type: 'text',
                  text: 'a platform for transparent financing',
                  italic: true,
                },
              ],
            },
          ],
        },
      ],
    },
    { type: 'h3', children: [{ type: 'text', text: 'Micropayments' }] },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'It’s early days for this one, but something to keep an eye on. Web Monetization is a concept whereby Internet users have a kind of fund they top up regularly — let’s say $5 every month. When time is spent on a site, a fraction of the fund is transferred to that site.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'The Brave web browser is a major example of this. Another is Web Monetization, which is ',
        },
        {
          type: 'a',
          url: 'https://webmonetization.org/specification.html',
          title: null,
          children: [
            { type: 'text', text: 'being proposed as a W3C standard' },
          ],
        },
        { type: 'text', text: '. Or ' },
        {
          type: 'a',
          url: 'https://scroll.com/sites',
          title: null,
          children: [{ type: 'text', text: 'Scroll' }],
        },
        { type: 'text', text: ', a kind of catch-all ad-free web package.' },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'This approach seems to have struck a nerve, I think because it hits a balance between a Wild West Internet and a corporate one. The more people believe in it, the better it works. Three billion people use the web. If 10% signed up for three bucks a month that would still be a cool ten billion dollars up for grabs.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'For the time being results are closer to pennies. But hey, nothing worth having comes easy. Supporting this approach is a two-way street. Depending on the system, implementation can be as simple as adding a line of code to the ',
        },
        { type: 'text', text: '<head>', code: true },
        {
          type: 'text',
          text: ' of your website. It’s also a case of walking the walk.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Will this approach alone save the Internet? Probably not, but again, moving away from ads is about diversification, not finding a silver bullet.',
        },
      ],
    },
    {
      type: 'h3',
      children: [{ type: 'text', text: 'Free, Non-Corporate Platforms' }],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Now obviously, free platforms are not the answer to large-scale applications and web experiences. They are, however, often a perfect way to have an online presence without being sucked into the engagement black hole of modern social media.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Places like ' },
        {
          type: 'a',
          url: 'https://neocities.org/',
          title: null,
          children: [{ type: 'text', text: 'Neocities' }],
        },
        {
          type: 'text',
          text: ' — a homage of sorts to GeoCities — still have a lot of life in them. I know, I’m on it. Independent, playful non-corporate platforms feel like something from another time, but they’re still perfectly good ways of planting your flag online.',
        },
      ],
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'rimg',
      props: {
        breakout: 'true',
        href: 'https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/36022b39-7243-4337-b224-29450945c064/neocities.png',
        src: 'https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/36022b39-7243-4337-b224-29450945c064/neocities.png',
        sizes: '100vw',
        caption:
          "Weird, wonderful, self-reliant web communities are alive and well. You just have to seek them out. (<a href='https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/36022b39-7243-4337-b224-29450945c064/neocities.png'>Large preview</a>)",
        alt: 'Mobile screenshot of the Neocities website',
      },
      children: [{ type: 'text', text: '' }],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'It seems marketing has hammered into people that the only website worth having is one you’re paying through the nose for. Not so. The DIY weird web is alive and well.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'With the likes of ' },
        {
          type: 'a',
          url: 'https://www.netlify.com/',
          title: null,
          children: [{ type: 'text', text: 'Netlify' }],
        },
        { type: 'text', text: ' and ' },
        {
          type: 'a',
          url: 'https://pages.github.com/',
          title: null,
          children: [{ type: 'text', text: 'GitHub pages' }],
        },
        {
          type: 'text',
          text: ' about it’s perfectly possible to piggyback along without paying for anything more than a domain name, and even that is optional.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Of course, there is a limit to this kind of approach, but that doesn’t make it any less viable. By the time a website is bringing in enough traffic to warrant a dedicated hosting plan, it’s likely well placed to be asking for support.',
        },
      ],
    },
    { type: 'h4', children: [{ type: 'text', text: 'Further Reading' }] },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                {
                  type: 'a',
                  url: 'https://www.smashingmagazine.com/2020/08/autonomy-online-indieweb/',
                  title: null,
                  children: [
                    {
                      type: 'text',
                      text: 'Autonomy Online: A Case For The IndieWeb',
                      italic: true,
                    },
                  ],
                },
                { type: 'text', text: ', ' },
                { type: 'text', text: 'Ana Rodrigues', italic: true },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'h2',
      children: [{ type: 'text', text: 'Taking Control Of Your Data' }],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'All this talk of diversification and sustainability ties into a broader discussion going on right now about privacy. Half the battle is messaging. Although awareness is growing, a lot of people still don’t know about the costs of ‘free’ online experiences. That’s not an accident. Take the time to explain that if someone subscribes to a website’s service, they’re not just receiving the service. They’re receiving priority, respect, and privacy.',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Advocating for a less ad-centric web means taking an honest look at who our masters are online. When you make a site, who is the site for? Is it for advertisers? Affiliates? Clients? Or is it for the people visiting the site? How lovely would it be to have robust, ethical income strategies that made websites beholden first and foremost to the people who use them.',
        },
      ],
    },
    {
      type: 'h2',
      children: [{ type: 'text', text: 'The Role Of Developers' }],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'In a line of work where projects are increasingly fragmented, it’s easy to remove oneself from the moral failings of any given project. Edward Snowden said the same was true of the NSA spying programs he leaked in 2013. Just this year ',
        },
        {
          type: 'a',
          url: 'https://www.digitalinformationworld.com/2020/06/edward-snowden-tech-workers-role-in-helping-the-apps-violate-user-privacy.html',
          title: null,
          children: [
            {
              type: 'text',
              text: 'he identified social networks and apps as carrying similar risks',
            },
          ],
        },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Incorporate sustainability into your designs. Communicate what you do and how you survive and what people can do to help. Progress does not happen on its own. It never has and it never will. We have to be the change we want to see.',
        },
      ],
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'signature',
      props: { _value: 'ra, il' },
      children: [{ type: 'text', text: '' }],
    },
  ],
})

describe('./autoformat long form.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
