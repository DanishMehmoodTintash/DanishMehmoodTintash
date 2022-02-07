import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { track, trackingProps } from 'helpers/analyticsService';

import Actions from 'components/common/Actions';

import config from 'config';

const ProductDetailsPage = ({
  styles,
  currentItem,
  onBackButtonClick,
  closeSidebar,
  currentCollection,
}) => {
  const trackItem = item => {
    track('Shop It CTA', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      [trackingProps.NAV_CATEGORY]: item.get('category'),
      [trackingProps.PRODUCT_NAME]: item.get('name'),
      [trackingProps.BRAND_NAME]: item.get('brand'),
    });
  };

  return (
    <div className={styles['product-details-container']} id="top_menu_desc">
      <Actions
        styles={styles}
        onBackButtonClick={onBackButtonClick}
        onCloseButtonClick={closeSidebar}
      />
      <div className={styles['detail-container']} id="item-detail-container">
        <div className={styles['detail-img']}>
          <img
            src={
              currentItem.get('thumbnailUrl')
                ? currentItem.get('thumbnailUrl')
                : `${config.baseUrl}/${currentItem.get('thumbnail')}`
            }
            alt={currentItem.get('name')}
          />
        </div>
        <span className={`${styles['brand-name']} proxima`}>
          {currentItem.get('brand')}
        </span>
        <h1 className={styles['detail-name']}>{currentItem.get('name')}</h1>
        <span className={styles['detail-price']}>
          $
          {currentItem.get('is_sale') === 'true' ? (
            <>
              {currentItem.get('price_sale')}
              <span>${currentItem.get('price')}</span>
            </>
          ) : (
            currentItem.get('price')
          )}
          {currentItem.get('more_sizes') !== 0 && (
            <p className={styles['tag-price-varies']}>*price varies by size</p>
          )}
        </span>
        <a
          href={currentItem.get('shop_it_url')}
          target="_blank"
          role="button"
          className={styles['shop-button']}
          rel="noreferrer"
        >
          <button
            aria-label={`Shop ${currentItem.get('name')}`}
            onClick={() => trackItem(currentItem)}
          >
            Buy or Register
          </button>
        </a>
        <div className={styles['details-container']}>
          <div>
            <h2 className={styles.head}>Dimensions</h2>
            <div className={styles.info}>
              Measures {currentItem.get('depth')} L x {currentItem.get('width')} W x{' '}
              {currentItem.get('height')} H
            </div>
            {currentItem.get('more_sizes') !== 0 && (
              <p>
                <img src={`${config.s3BucketUrl}/utils/sizes.svg`} alt="" /> more sizes
                avail.
              </p>
            )}
          </div>
          <div>
            <h2 className={styles.head}>Finish</h2>
            <div className={styles.info}>{currentItem.get('color')}</div>
          </div>
          <div>
            <h2 className={styles.head}>Description</h2>
            <div className={styles.info}>{currentItem.get('description')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductDetailsPage.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  currentItem: PropTypes.instanceOf(Map).isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map).isRequired,
};

const mapStateToProps = state => {
  return {
    currentItem: state.collection.get('currentItem'),
    currentCollection: state.collection.get('currentCollection'),
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailsPage);
