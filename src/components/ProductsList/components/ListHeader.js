import React, { useMemo, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import { getFiltersCount } from 'helpers/filterUtils';
import { track, trackingProps } from 'helpers/analyticsService';

import config from 'config';
import SortDropdown from './SortDropdown';
import SearchBar from './SearchBar';
import MobileSearchBar from './MobileSearchBar';

const ListHeader = ({
  styles,
  sortState,
  setSortState,
  searchString,
  setSearchString,
  currentCategory,
  onFiltersClick,
  appliedFilters,
  tooltipVisible,
  onTooltipClose,
  currentBrand,
  currentCollection,
}) => {
  const [searchBarState, setSearchBarState] = useState('');
  const [filterCount, setFilterCount] = useState(0);

  useLayoutEffect(() => {
    setFilterCount(0);
    if (appliedFilters && currentCategory) {
      const filters = appliedFilters.toJS()[currentCategory];
      if (filters) {
        const appliedFiltersCount = getFiltersCount(filters);
        setFilterCount(appliedFiltersCount);
      }
    }
  }, [currentCategory, appliedFilters]);

  const sortStateMap = useMemo(() => ({
    newest: 'Newest',
    lowToHigh: 'Price: low to high',
    highToLow: 'Price: high to low',
  }));

  const showFilterPage = () => {
    track('Filter CTA', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
    onFiltersClick();
  };

  return (
    <>
      <div className={`${styles['list-header']} ${styles[searchBarState]}`}>
        <span className={styles['filter-search-container']}>
          <button
            className={styles['search-button-icon']}
            onClick={() => setSearchBarState('full')}
            aria-label="Open Search"
          >
            <img alt="" src={`${config.s3BucketUrl}/utils/search.svg`} />
          </button>
          <button
            className={styles['filter-button-icon']}
            onClick={showFilterPage}
            aria-label="Open Filters"
          >
            {filterCount > 0 && (
              <div className={styles['selected-filter-count']}>
                <div>{filterCount}</div>
              </div>
            )}
            <img alt="" src={`${config.s3BucketUrl}/utils/filter.svg`} />
          </button>
          {tooltipVisible && (
            <div className={styles.tooltip}>
              <div>
                <p>Tool Tip</p>
                <p>
                  {currentBrand}’s filter is applied in your room. You can change the
                  settings from this filter.
                </p>
              </div>
              <img src={`${config.s3BucketUrl}/utils/brand-filter-tooltip.svg`} alt="" />
              <button onClick={onTooltipClose} aria-label="Close Tooltip">
                <img src={`${config.s3BucketUrl}/utils/close-small.svg`} alt="" />
              </button>
            </div>
          )}
        </span>
        <SortDropdown
          sortState={sortState}
          styles={styles}
          sortStateMap={sortStateMap}
          setSortState={setSortState}
        />
        <MobileSearchBar
          styles={styles}
          currentCategory={currentCategory}
          searchString={searchString}
          setSearchString={setSearchString}
          searchBarState={searchBarState}
          setSearchBarState={setSearchBarState}
          currentCollection={currentCollection}
        />
      </div>
      <SearchBar
        styles={styles}
        currentCategory={currentCategory}
        searchString={searchString}
        setSearchString={setSearchString}
      />
    </>
  );
};

ListHeader.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  sortState: PropTypes.oneOf(['newest', 'lowToHigh', 'highToLow']).isRequired,
  setSortState: PropTypes.func.isRequired,
  currentCategory: PropTypes.string.isRequired,
  setSearchString: PropTypes.func.isRequired,
  searchString: PropTypes.string.isRequired,
  onFiltersClick: PropTypes.func.isRequired,
  appliedFilters: PropTypes.instanceOf(Map).isRequired,
  tooltipVisible: PropTypes.bool.isRequired,
  onTooltipClose: PropTypes.func.isRequired,
  currentBrand: PropTypes.string,
  currentCollection: PropTypes.instanceOf(Map),
};

ListHeader.defaultProps = {
  currentBrand: '',
  currentCollection: null,
};

export default ListHeader;
