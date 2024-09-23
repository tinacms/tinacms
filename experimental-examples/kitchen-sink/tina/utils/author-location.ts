export function getLocationFromHost(hostname: string): LocationEnum {
  switch (true) {
    case hostname.includes('ndcmelbourne.com'):
      return LocationEnum.Melbourne

    case hostname.includes('ndcsydney.com'):
      return LocationEnum.Sydney

    // Add more cases as needed
    default:
      return LocationEnum.Default
  }
}

// Define an enum for location
export enum LocationEnum {
  Melbourne = 'melbourne',
  Sydney = 'sydney',
  Default = 'Default',
}
