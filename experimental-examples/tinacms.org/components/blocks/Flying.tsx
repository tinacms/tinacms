import { actionsTemplate, Actions } from './Actions'
import CloudsOne from '../../public/svg/clouds-1.svg'
import CloudsTwo from '../../public/svg/clouds-2.svg'
import type { TinaTemplate } from '@tinacms/cli'

export const flyingTemplate: TinaTemplate = {
  name: 'flying',
  label: 'Flying',
  ui: {
    previewSrc: '/img/blocks/flying.png',
  },
  fields: [
    { name: 'headline', label: 'Headline', type: 'string' },
    {
      name: 'text',
      label: 'Text',
      ui: { component: 'textarea' },
      type: 'string',
    },
    // @ts-ignore
    actionsTemplate,
  ],
}

export function FlyingBlock({ data, index }) {
  return (
    <>
      <div key={index} className="learnTina">
        <div className="learnContainer">
          <div>
            {data.headline && <h3 className="title">{data.headline}</h3>}
            {data.text && <p className="text">{data.text}</p>}
            {data.actions && <Actions items={data.actions} />}
          </div>
          <div className="learnImageWrapper">
            <img
              className="learnImage"
              src="/img/flyingTina.png"
              alt="Tina learning"
            />
          </div>
        </div>
        <div className="background">
          <CloudsOne />
          <CloudsOne />
        </div>
        <div className="foreground">
          <CloudsTwo />
          <CloudsTwo />
        </div>
      </div>
      <style jsx>{`
        .learnTina {
          padding: 6rem 0;
          position: relative;
          z-index: 3;
          overflow: hidden;
          background-color: var(--color-seafoam);
          background: linear-gradient(
            to bottom,
            var(--color-seafoam-100),
            var(--color-seafoam-200),
            var(--color-seafoam-300)
          );
        }

        @keyframes movingBackground {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(100%, 0, 0);
          }
        }

        .background,
        .foreground {
          position: absolute;
          top: 0;
          left: 50%;
          width: 100%;
          min-width: 800px;
          height: 0;
          padding-bottom: 50%;
          top: 50%;
          transform: translate3d(-50%, -50%, 0);
          z-index: -3;
          pointer-events: none;

          :global(svg) {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            animation-duration: 50s;
            animation-delay: -25s;
            animation-name: movingBackground;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
          }

          :global(svg:nth-child(2)) {
            left: -100%;
            margin-left: 1px;
          }
        }

        .foreground {
          z-index: -1;
          opacity: 0.7;

          :global(svg) {
            animation-duration: 30s;
            animation-delay: -15s;
          }

          :global(svg:nth-child(2)) {
            margin-left: 0px;
          }
        }

        .title {
          font-family: var(--font-tuner);
          font-weight: bold;
          line-height: 1.4;
          margin-bottom: 1.5rem;
          font-size: 2.5rem;
          color: var(--color-orangeg);
        }

        .text {
          color: var(--color-secondary);
          font-size: 1.125rem;
          opacity: 0.85;

          &:not(:last-child) {
            margin-bottom: 1.5rem;
          }
        }

        .learnContainer {
          display: grid;
          grid-gap: 2rem;
          padding: 0 var(--container-padding);
          align-content: center;
          align-items: center;
          margin: 0 auto;
          max-width: 820px;
          grid-gap: 2rem;
          grid-template-columns: 3fr 2fr;
        }

        @keyframes learnImage {
          0% {
            transform: translate3d(0, -0.5rem, 0);
          }
          100% {
            transform: translate3d(0, 0.75rem, 0);
          }
        }

        .learnImage {
          margin: 0;
          position: relative;
          animation: learnImage 3s ease-in-out infinite alternate;
          z-index: -2;

          @media (prefers-reduced-motion) {
            animation: none;
          }
        }
      `}</style>
    </>
  )
}
