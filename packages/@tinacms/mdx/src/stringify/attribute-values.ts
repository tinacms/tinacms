const COLOUR = /^[\w\s#.,%/()+-]{1,100}$/;

export const isColour = (value: string) => COLOUR.test(value);

export const stringLiteral = (value: unknown) => JSON.stringify(String(value));

export const numberLiteral = (value: unknown, fieldName: string) => {
  if (value === null) {
    return 'null';
  }
  const number =
    typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isFinite(number)) {
    throw new Error(`The "${fieldName}" field only accepts numbers.`);
  }
  return String(number);
};

export const booleanLiteral = (value: unknown, fieldName: string) => {
  if (value === null) {
    return 'null';
  }
  if (value === true || value === 'true') {
    return 'true';
  }
  if (value === false || value === 'false') {
    return 'false';
  }
  throw new Error(`The "${fieldName}" field only accepts true or false.`);
};
