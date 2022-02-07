import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { animateClusterMarker } from 'helpers/PSVUtils';

import Actions from 'components/common/Actions';

const CategoriesList = ({
  styles,
  currentConfig,
  onCategoryClick,
  closeSidebar,
  markerDropdownCategories,
  markerSelected,
}) => {
  const [...markers] = currentConfig.get('markers').keys();

  const isMobile = () => window.innerWidth <= 600;

  const clickCategory = category => {
    if (markerDropdownCategories.indexOf(category) !== -1 && !isMobile()) {
      animateClusterMarker(markerSelected).then(
        onCategoryClick(category, 'Product Category')
      );
    } else onCategoryClick(category, 'Product Category');
  };

  return (
    <div id="swap-items" className={styles['swap-items']}>
      <div className={styles['actions-container']}>
        <Actions styles={styles} onCloseButtonClick={closeSidebar} />
      </div>
      <div className={`${styles['data-container']} proxima-light`}>
        <div className={styles['prompt-container']}>
          <h1 className={`${styles.head} proxima`}>Design Your Room</h1>
          <h2 className={`${styles.info} proxima-light`}>
            Pick your favorite items from the categories below to create your cozy room.
          </h2>
        </div>
        <div className={styles['data-item']}>
          {markers.sort().map(
            category =>
              category !== markerSelected && (
                <button
                  className={styles.data}
                  id={category}
                  key={category}
                  onClick={() => clickCategory(category)}
                >
                  <div className={styles['item-container']}>
                    <div className={`${styles.item} proxima`}>{category}</div>
                    <div className={styles.action}>
                      <span>
                        <i className={`${styles.arrow} ${styles.right}`} />
                      </span>
                    </div>
                  </div>
                </button>
              )
          )}
        </div>
      </div>
    </div>
  );
};

CategoriesList.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  currentConfig: PropTypes.instanceOf(Map).isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  markerDropdownCategories: PropTypes.instanceOf(Array).isRequired,
  markerSelected: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    currentConfig: state.collection.get('currentConfig'),
    markerDropdownCategories: state.interaction.get('markerDropdownCategories'),
    markerSelected: state.interaction.get('markerSelected'),
  };
};

export default connect(mapStateToProps)(CategoriesList);
