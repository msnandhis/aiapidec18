import { Resource } from '../types';

export const frontendResources: Resource[] = [
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    logo: 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png',
    url: 'https://reactjs.org',
    description: 'A JavaScript library for building user interfaces',
    totalPages: 3,
    currentPage: 1
  },
  {
    id: 'vue',
    name: 'Vue.js',
    category: 'frontend',
    logo: 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/vue/vue.png',
    url: 'https://vuejs.org',
    description: 'The Progressive JavaScript Framework'
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'frontend',
    logo: 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/angular/angular.png',
    url: 'https://angular.io',
    description: 'Platform for building mobile and desktop web applications'
  },
  {
    id: 'svelte',
    name: 'Svelte',
    category: 'frontend',
    logo: 'https://raw.githubusercontent.com/sveltejs/svelte/29052aba7d0b78316d3a52aef1d7ddd54fe6ca84/sites/svelte.dev/static/images/svelte-android-chrome-512.png',
    url: 'https://svelte.dev',
    description: 'Cybernetically enhanced web apps'
  },
  {
    id: 'next',
    name: 'Next.js',
    category: 'frontend',
    logo: 'https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png',
    url: 'https://nextjs.org',
    description: 'The React Framework for Production'
  },
  {
    id: 'nuxt',
    name: 'Nuxt.js',
    category: 'frontend',
    logo: 'https://nuxt.com/icon.png',
    url: 'https://nuxt.com',
    description: 'The Intuitive Vue Framework'
  },
  {
    id: 'remix',
    name: 'Remix',
    category: 'frontend',
    logo: 'https://remix.run/img/og.1.jpg',
    url: 'https://remix.run',
    description: 'Full stack web framework'
  },
  {
    id: 'solid',
    name: 'SolidJS',
    category: 'frontend',
    logo: 'https://www.solidjs.com/img/logo/without-wordmark/logo.svg',
    url: 'https://www.solidjs.com',
    description: 'Simple and performant reactivity for building user interfaces'
  }
];

export const mapResources: Resource[] = [
  {
    id: 'leaflet',
    name: 'Leaflet',
    category: 'maps',
    logo: 'https://leafletjs.com/docs/images/logo.png',
    url: 'https://leafletjs.com',
    description: 'Open-source JavaScript library for mobile-friendly interactive maps',
    totalPages: 2,
    currentPage: 1
  },
  {
    id: 'mapbox',
    name: 'Mapbox GL JS',
    category: 'maps',
    logo: 'https://static-assets.mapbox.com/branding/favicon/v1/favicon-32x32.png',
    url: 'https://www.mapbox.com/mapbox-gljs',
    description: 'JavaScript library for vector maps'
  },
  {
    id: 'openlayers',
    name: 'OpenLayers',
    category: 'maps',
    logo: 'https://openlayers.org/theme/img/logo.svg',
    url: 'https://openlayers.org',
    description: 'High-performance mapping library'
  },
  {
    id: 'google-maps',
    name: 'Google Maps JavaScript API',
    category: 'maps',
    logo: 'https://www.gstatic.com/images/branding/product/2x/maps_96dp.png',
    url: 'https://developers.google.com/maps/documentation/javascript',
    description: 'Add maps and location features to your applications'
  }
];

export const usefulResources: Resource[] = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'useful',
    logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    url: 'https://github.com',
    description: 'Where the world builds software',
    totalPages: 2,
    currentPage: 1
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'useful',
    logo: 'https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png',
    url: 'https://gitlab.com',
    description: 'DevOps platform'
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    category: 'useful',
    logo: 'https://wac-cdn.atlassian.com/assets/img/favicons/bitbucket/favicon-32x32.png',
    url: 'https://bitbucket.org',
    description: 'Code & CI/CD'
  },
  {
    id: 'trello',
    name: 'Trello',
    category: 'useful',
    logo: 'https://www.trello.com/favicon.ico',
    url: 'https://trello.com',
    description: 'Collaborate & manage projects'
  }
];

export const wordpressResources: Resource[] = [
  {
    id: 'elementor',
    name: 'Elementor',
    category: 'wordpress',
    logo: 'https://elementor.com/marketing/wp-content/uploads/2021/10/Elementor-Logo-Symbol-Red.png',
    url: 'https://elementor.com',
    description: "The World's Leading WordPress Website Builder",
    totalPages: 2,
    currentPage: 1
  },
  {
    id: 'yoast',
    name: 'Yoast SEO',
    category: 'wordpress',
    logo: 'https://yoast.com/app/uploads/2020/11/yoast_seo_icon.png',
    url: 'https://yoast.com',
    description: 'SEO optimization plugin'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'wordpress',
    logo: 'https://woocommerce.com/wp-content/uploads/2020/03/wc-icon-dark.png',
    url: 'https://woocommerce.com',
    description: 'eCommerce platform'
  },
  {
    id: 'wpforms',
    name: 'WPForms',
    category: 'wordpress',
    logo: 'https://wpforms.com/wp-content/uploads/2016/11/wpforms-logo.png',
    url: 'https://wpforms.com',
    description: 'Drag & Drop Form Builder'
  }
];

export const resources = [
  ...frontendResources,
  ...mapResources,
  ...usefulResources,
  ...wordpressResources
];