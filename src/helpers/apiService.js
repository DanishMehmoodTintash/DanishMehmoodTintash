import { setup } from 'axios-cache-adapter';

import config from 'config';

const api = setup({
  baseURL: `${config.baseUrl}/api/v1/shop`,

  cache: {
    maxAge: 6 * 60 * 60 * 1000,
    exclude: {
      methods: ['put', 'patch', 'delete', 'post'],
    },
  },
});

export default api;
