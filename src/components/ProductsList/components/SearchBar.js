import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import { track, trackingProps } from 'helpers/analyticsService';

import config from 'config';

const SearchBar = ({
  styles,
  currentCategory,
  searchString,
  setSearchString,
  currentCollection,
}) => {
  const [isActive, setIsActive] = useState(!!searchString);

  const clearSearch = () => {
    setSearchString('');
    track('Clear Search Filter', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
  };

  const searchBarOnFocus = () => {
    setIsActive(true);
    track('Search Box', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
  };

  return (
    <div className={styles['search-wrapper']}>
      <div className={styles.wrapper}>
        <img
          alt=""
          className={styles['search-icon']}
          src={`${config.s3BucketUrl}/utils/search-${isActive ? '' : 'in'}active.svg`}
        />
        <input
          placeholder={`search ${currentCategory?.toLowerCase()}...`}
          type="text"
          name="searchString"
          value={searchString}
          onChange={e => setSearchString(e.target.value)}
          onFocus={searchBarOnFocus}
          onBlur={() => setIsActive(false)}
          className={`${styles.search} ${styles.websearch} proxima`}
        />
        <button
          className={`${styles['clear-icon']} ${!!searchString && styles.visible}`}
          onClick={clearSearch}
        >
          <img alt="" src={`${config.s3BucketUrl}/utils/search-close.svg`} />
        </button>
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  currentCategory: PropTypes.string.isRequired,
  searchString: PropTypes.string.isRequired,
  setSearchString: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map),
};

SearchBar.defaultProps = {
  currentCollection: null,
};

const mapStateToProps = state => ({
  currentCollection: state.collection.get('currentCollection'),
});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
