import styled from 'styled-components'

const VERSIONS = [
  {
    id: 'v-latest',
    url: 'https://tina.io',
    label: 'v.Latest',
  },
  {
    id: 'v-0.68.13',
    url: 'https://tinacms-site-next-i08bcbicy-tinacms.vercel.app/',
    label: 'v.0.68.13',
  },
  {
    id: 'v-0.67.3',
    url: 'https://tinacms-site-next-pu1t2v9y4-tinacms.vercel.app',
    label: 'v.0.67.3',
  },
  {
    id: 'v-pre-beta',
    url: 'https://pre-beta.tina.io',
    label: 'v.Pre-Beta',
  },
]

export const VersionSelect = () => {
  const selectedVersion =
    VERSIONS.find(
      (v) => typeof window !== 'undefined' && v.url == window.location.origin
    ) || VERSIONS[0]
  return (
    <SelectWrapper>
      <select
        aria-label="Version"
        onChange={(e) => {
          window.location.href = e.target.value
        }}
        value={selectedVersion.url}
      >
        {VERSIONS.map((version) => (
          <option
            arial-label={`vLatest`}
            aria-current={selectedVersion.id == version.id}
            value={version.url}
            key={version.id}
          >
            {version.label}
          </option>
        ))}
      </select>
    </SelectWrapper>
  )
}

const SelectWrapper = styled.div`
  display: block;
  flex-grow: 1;
  position: relative;

  @media (min-width: 840px) {
    display: inline-block;
    flex-grow: 0;
  }

  select {
    position: relative;
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
    background-color: white;
    border: 1px solid var(--color-grey-1);
    color: var(--color-grey-7);
    display: flex;
    width: 100%;
    align-items: center;
    transition: filter 250ms ease;
    border-radius: 100px;
    box-shadow: 3px 3px 4px var(--color-grey-2), -4px -4px 6px white;
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 0.7em top 50%;
    background-size: 0.65em auto;
  }
`
