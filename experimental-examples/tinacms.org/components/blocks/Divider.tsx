export const TripleDividerSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 1200 150"
      className="dividerSvg"
    >
      <g>
        <path
          stroke="var(--color-orange)"
          strokeWidth="4"
          strokeDasharray="8 14"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          d="M591.036 0v70.447m0 0H20c-11.046 0-20 8.955-20 20v51.406m591.036-71.406H1180c11.05 0 20 8.955 20 20V150"
        ></path>
      </g>
      <line
        x1="49.25%"
        x2="49.25%"
        y1="0"
        y2="100%"
        stroke="var(--color-orange)"
        strokeWidth="4"
        strokeDasharray="8 14"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export const SingleDividerSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 600 120"
      width="100%"
      preserveAspectRatio="false"
    >
      <line
        x1="50%"
        x2="50%"
        y1="0"
        y2="100%"
        stroke="var(--color-orange)"
        strokeWidth="4"
        strokeDasharray="8 14"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

interface DividerProps {
  type?: 'desktop' | 'mobile'
}

export const Divider = ({ type = 'desktop' }: DividerProps) => {
  return (
    <>
      {type === 'mobile' && (
        <div className="divider dividerMobile">
          <SingleDividerSvg />
        </div>
      )}
      {type === 'desktop' && (
        <div className="divider dividerDesktop">
          <TripleDividerSvg />
        </div>
      )}
      <style jsx>{`
        .divider {
          display: flex;
          justify-content: center;
          width: 100%;

          :global(svg) {
            width: 100%;
            margin: 0 auto;
            overflow: visible !important;
            :global(line),
            :global(path) {
              animation: dash 1s infinite linear;
            }
          }

          @media (min-width: 1000px) {
            :global(svg) {
              width: 66%;
            }
          }
        }

        .dividerDesktop {
          height: 7.5rem;

          :global(svg) {
            height: 100%;
          }

          @media (max-width: 999px) {
            display: none;
          }
        }

        .dividerMobile {
          height: 4rem;

          @media (min-width: 1000px) {
            display: none;
          }
          :global(svg) {
            width: 100%;
          }
        }

        @keyframes dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            /* strokeDasharray="8 14" <- Sum of these numbers */
            stroke-dashoffset: 22;
          }
        }
      `}</style>
    </>
  )
}
