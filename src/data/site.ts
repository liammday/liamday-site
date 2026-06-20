// Site-wide metadata, ported from Jekyll _config.yml.
export const site = {
  title: 'Liam Day',
  name: 'Liam Day',
  description:
    'Product manager and former British Army officer — delivering digital products, leading cross-functional teams, and holding active DV security clearance.',
  url: 'https://www.liamday.co.uk',
  social: {
    email: 'liam@liamday.co.uk',
    linkedin: 'https://www.linkedin.com/in/liammday/',
    github: 'https://github.com/liammday',
    medium: '',
  },
  contact: {
    location: 'Winchester, Hampshire, UK',
    phone: '07590 836171',
    email: 'liam@liamday.co.uk',
    linkedin: 'https://www.linkedin.com/in/liammday/',
    website: 'https://www.liamday.co.uk',
    rightToWork: 'UK citizen',
  },
} as const;

export type Site = typeof site;
