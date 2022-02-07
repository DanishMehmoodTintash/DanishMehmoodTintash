import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import { track, trackingProps } from 'helpers/analyticsService';

import config from 'config';

const SearchBar = ({
  styles,
  currentCategory,
  searchString,
  setSearchString,
  searchBarState,
  setSearchBarState,
  currentCollection,
}) => {
  const [isActive, setIsActive] = useState(!!searchString);
  const [isCancel, setIsCancel] = useState(false);
  const searchInput = useRef(null);

  useEffect(() => {
    searchBarState === 'full' && searchInput.current.focus();
  }, [searchBarState]);

  const onCancel = () => {
    setSearchString('');
    setSearchBarState('');
    track('Clear Search Filter', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
  };

  const onFocus = () => {
    setIsActive(true);
    setSearchBarState('full');
    track('Search Box', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
  };

  const onBlur = () => {
    if (isCancel) {
      onCancel();
    } else {
      setIsActive(false);
      searchString ? setSearchBarState('half') : setSearchBarState('');
    }
  };

  return (
    <div
      className={`${styles['search-wrapper']} ${styles.mobile} ${styles[searchBarState]}`}
    >
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
          ref={searchInput}
          onChange={e => setSearchString(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`${styles.search} ${styles.websearch} proxima`}
        />
        <button
          className={`${styles['clear-icon']} ${!!searchString && styles.visible}`}
          onClick={onCancel}
          onMouseEnter={() => setIsCancel(true)}
          onMouseLeave={() => setIsCancel(false)}
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
  searchBarState: PropTypes.string.isRequired,
  setSearchBarState: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map),
};

SearchBar.defaultProps = {
  currentCollection: null,
};

export default SearchBar;
