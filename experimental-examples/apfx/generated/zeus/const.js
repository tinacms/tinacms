/* eslint-disable */

export const AllTypesProps = {
  SpecialSkills: 'enum',
  Card: {
    attack: {
      cardID: {
        type: 'String',
        array: true,
        arrayRequired: true,
        required: true,
      },
    },
  },
  Mutation: {
    addCard: {
      card: {
        type: 'createCard',
        array: false,
        arrayRequired: false,
        required: true,
      },
    },
  },
  createCard: {
    skills: {
      type: 'SpecialSkills',
      array: true,
      arrayRequired: false,
      required: true,
    },
    name: {
      type: 'String',
      array: false,
      arrayRequired: false,
      required: true,
    },
    description: {
      type: 'String',
      array: false,
      arrayRequired: false,
      required: true,
    },
    Children: {
      type: 'Int',
      array: false,
      arrayRequired: false,
      required: false,
    },
    Attack: {
      type: 'Int',
      array: false,
      arrayRequired: false,
      required: true,
    },
    Defense: {
      type: 'Int',
      array: false,
      arrayRequired: false,
      required: true,
    },
  },
  Query: {
    cardById: {
      cardId: {
        type: 'String',
        array: false,
        arrayRequired: false,
        required: false,
      },
    },
  },
}

export const ReturnTypes = {
  Nameable: {
    '...on EffectCard': 'EffectCard',
    '...on CardStack': 'CardStack',
    '...on Card': 'Card',
    '...on SpecialCard': 'SpecialCard',
    name: 'String',
  },
  EffectCard: {
    effectSize: 'Float',
    name: 'String',
  },
  CardStack: {
    cards: 'Card',
    name: 'String',
  },
  Card: {
    Attack: 'Int',
    Children: 'Int',
    Defense: 'Int',
    attack: 'Card',
    cardImage: 'S3Object',
    description: 'String',
    id: 'ID',
    image: 'String',
    name: 'String',
    skills: 'SpecialSkills',
  },
  ChangeCard: {
    '...on SpecialCard': 'SpecialCard',
    '...on EffectCard': 'EffectCard',
  },
  Mutation: {
    addCard: 'Card',
  },
  Subscription: {
    deck: 'Card',
  },
  S3Object: {
    bucket: 'String',
    key: 'String',
    region: 'String',
  },
  SpecialCard: {
    effect: 'String',
    name: 'String',
  },
  Query: {
    cardById: 'Card',
    drawCard: 'Card',
    drawChangeCard: 'ChangeCard',
    listCards: 'Card',
    myStacks: 'CardStack',
    nameables: 'Nameable',
  },
}
