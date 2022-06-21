import { RootElement } from './plate'

export const root: RootElement = {
  type: 'root',
  children: [
    {
      type: 'h1',
      children: [
        {
          type: 'text',
          text: 'Vote For Pedro',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'This is some ',
        },
        {
          type: 'text',
          text: 'code',
          code: true,
        },
        {
          type: 'text',
          text: ' ok?',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Hello ',
          italic: true,
        },
        {
          type: 'img',
          url: 'https://placehold.it/300/200',
          caption: 'Some Title',
          alt: 'Some Alt',
          children: [
            {
              type: 'text',
              text: '',
            },
          ],
        },
        {
          type: 'text',
          text: ', again',
          italic: true,
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'text',
          text: 'Hello, the current date and time is ',
        },
        {
          type: 'mdxJsxTextElement',
          name: 'DateTime',
          props: {
            format: 'iso',
          },
          children: [
            {
              type: 'text',
              text: '',
            },
          ],
        },
        {
          type: 'text',
          text: '. Quis semper ',
        },
        {
          type: 'a',
          url: 'https://example.com',
          title: null,
          children: [
            {
              type: 'text',
              text: 'vulputate',
            },
          ],
        },
        {
          type: 'text',
          text: ' aliquam venenatdis egestas sagittis quisque orci. Donec commodo sdit viverra aliquam porttitor ultrices gravida eu. Tincidunt leo, elementum mattis elementum ut nisl, justo, amet, mattis. Nunc purus, diam cdommodo tincidunt turpis. Amet, duis sed elit interdum dignissim',
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'img',
          url: 'http://res.cloudinary.com/deuzrsg3m/image/upload/v1634858384/tina-upload_yxevty.jpg',
          alt: '',
          caption: null,
          children: [
            {
              type: 'text',
              text: '',
            },
          ],
        },
      ],
    },
    {
      type: 'hr',
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
    {
      type: 'code_block',
      lang: 'javascript',
      children: [
        {
          type: 'code_line',
          children: [
            {
              type: 'text',
              text: 'const a = "b"',
            },
          ],
        },
      ],
    },
    {
      type: 'blockquote',
      children: [
        {
          type: 'p',
          children: [
            {
              type: 'text',
              text: 'Id orci tellus laoreet id ac. Dolor, aenean leo, ac etiam consequat in. Convallis arcu ipsum urna nibh. Pha',
            },
          ],
        },
        {
          type: 'p',
          children: [
            {
              type: 'text',
              text: 'retra, euismod vitae interdum mauris enim, consequat vulputate nibh. Maecenas pellentesque id sed tellus mauris, ultrices mauris. Tincidunt enim cursus ridiculus mi. Pellentesque nam sed nullam sed diam turpis ipsum eu a sed convallis diam.',
            },
          ],
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'img',
          url: 'http://res.cloudinary.com/deuzrsg3m/image/upload/v1631389967/apfx/kevin-bosc-oeqBJZd1GWY-unsplash_rtuyot.jpg',
          alt: 'This is an image',
          caption: 'Building, by Thomas Carlisle',
          children: [
            {
              type: 'text',
              text: '',
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
          text: 'Quis semper ',
        },
        {
          type: 'a',
          url: 'https://example.com',
          title: null,
          children: [
            {
              type: 'text',
              text: 'vulputate',
            },
          ],
        },
        {
          type: 'text',
          text: ' aliquam venenatdis egestas sagittis quisque orci. Donec commodo sit viverra aliquam porttitor ultrices gravida eu. Tincidunt leo, elementum mattis elementum ut nisl, justo, amet, mattis. Nunc purus, diam cdommodo tincidunt turpis. Amet, duis sed elit interdum dignissim',
        },
      ],
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'NewsletterSignup',
      props: {
        placeholder: 'Enter your email',
        buttonText: 'Notify Me',
        disclaimer: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [
                {
                  type: 'text',
                  text: 'We care about the protection of your data. Read our ',
                },
                {
                  type: 'a',
                  url: 'http://example.com',
                  title: null,
                  children: [
                    {
                      type: 'text',
                      text: 'Privacy Policy',
                    },
                  ],
                },
                {
                  type: 'text',
                  text: '.',
                },
              ],
            },
          ],
        },
        children: {
          type: 'root',
          children: [
            {
              type: 'h2',
              children: [
                {
                  type: 'text',
                  text: 'Stay in touch!',
                },
              ],
            },
            {
              type: 'p',
              children: [
                {
                  type: 'img',
                  url: 'http://placehold.it/300x200',
                  alt: '',
                  caption: null,
                },
              ],
            },
            {
              type: 'p',
              children: [
                {
                  type: 'text',
                  text: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui Lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat.',
                },
              ],
            },
          ],
        },
      },
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
    {
      type: 'h3',
      children: [
        {
          type: 'text',
          text: '3 Reasons to vote for Pedro',
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
                {
                  type: 'text',
                  text: 'Anim aute id magna aliqua ad ad non deserunt sunt',
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
                  text: 'Qui irure qui Lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat.',
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
                  text: 'Lorem markdownum evinctus ut cape adhaeret gravis licet progenies ut haesit maxima ille. Est scorpius, mori vel in visaeque Haemoniis viperei furoris e ad vasti, distulit. Crudus sub coniuge iam: dea propera sive?',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'h3',
      children: [
        {
          type: 'text',
          text: '3 More Reasons to vote for Pedro',
        },
      ],
    },
    {
      type: 'ol',
      children: [
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                {
                  type: 'text',
                  text: 'Anim aute id magna aliqua ad ad non deserunt sunt',
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
                  text: 'Qui irure qui Lorem cupidatat commodo.\n.   Elit sunt amet fugiat veniam occaecat fugiat.',
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
                  text: 'Lorem markdownum evinctus ut cape adhaeret gravis licet progenies ut haesit maxima ille. Est scorpius, mori vel in visaeque Haemoniis viperei furoris e ad vasti, distulit. Crudus sub coniuge iam: dea propera sive?',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'hr',
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'BlockQuote',
      props: {
        authorName: 'Uncle Rico',
        children: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [
                {
                  type: 'text',
                  text: 'How much you wanna make a bet I can throw a football over ',
                },
                {
                  type: 'a',
                  url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2110&q=80',
                  title: null,
                  children: [
                    {
                      type: 'text',
                      text: 'them mountains',
                    },
                  ],
                },
                {
                  type: 'text',
                  text: '?',
                },
              ],
            },
          ],
        },
      },
      children: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
  ],
}
