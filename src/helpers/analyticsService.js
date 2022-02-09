import mixpanel from 'mixpanel-browser';

import config from 'config';

mixpanel.init(config.mixpanelToken);

const isLocal = process.env.NODE_ENV !== 'production';

export const trackingProps = {
  ROOM_NAME: 'room_name',
  NAV_CATEGORY: 'nav_category',
  PRODUCT_NAME: 'product_name',
  BRAND_NAME: 'brand',
  SORT_CATEFORY_TYPE: 'sort_category',
  FILTER_VALUE: 'filter_value',
  FILTER_CATEGORY_NAME: 'filter_category',
  CURATED_ROOM_NAME: 'curated_room',
};

export const track = (clickEvent, props = {}, navEvent) => {
  if (isLocal) {
    console.log('Mixpanel Event:');
    console.log(`Clicked - ${clickEvent}`);
    if (navEvent) console.log(`Viewed - ${navEvent}`);
    console.log(props);
  }

  mixpanel.track(`Clicked - ${clickEvent} - 3DS Shop by Room`, props);
  if (navEvent) {
    mixpanel.track(`Viewed - ${navEvent}`, props);
  }
};
