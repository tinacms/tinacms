import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Crew',
      name: 'crew',
      path: 'crew',
      templates: [
        {
          label: 'Costume Designer',
          name: 'costumeDesigner',
          fields: [
            {
              name: 'favoriteColor',
              label: 'Favorite Color',
              type: 'string',
            },
          ],
        },
        {
          label: 'Stunt Person',
          name: 'stuntPerson',
          fields: [
            {
              name: 'speciality',
              label: 'Speciality',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};

export default { schema };
