import React, { useMemo, useState, useLayoutEffect } from 'react';
import { List, Map } from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Collapsible from 'react-collapsible';

import { applyFilterToList } from 'helpers/filterUtils';
import { track, trackingProps } from 'helpers/analyticsService';

import { setFilteredItems, applyFilters } from 'actions/collection';

import { onFiltersApply, setAppliedFilters, setFilterCount } from 'actions/interaction';

import Actions from 'components/common/Actions';

import config from 'config';

const FiltersPage = ({
  styles,
  filterOptions,
  currentCategory,
  closeSidebar,
  onBackButtonClick,
  filteredItems,
  onFiltersApply,
  appliedFilters,
  setAppliedFilters,
  setFilterCount,
  currentCollection,
  applyFilters,
}) => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [disabledFilters, setDisabledFilters] = useState(true);
  const [selectedFiltersCount, setSelectedFiltersCount] = useState(0);
  const [isCollapsedMap, setIsCollapsedMap] = useState({
    price: true,
    colors: true,
    brand: true,
  });

  const filterList = useMemo(() => ({
    price: 'Price',
    colors: 'Color',
    brand: 'Brand',
  }));

  useLayoutEffect(() => {
    const filters = appliedFilters.get(currentCategory)?.toJS();
    filters && setSelectedFilters(filters);
  }, [appliedFilters]);

  const applyFilterExcept = (list, filter) => {
    Object.keys(filterList).forEach(key => {
      if (key !== filter) {
        list = applyFilterToList(list, key, selectedFilters);
      }
    });
    return list;
  };

  const isOptionAvailable = (option, filter) => {
    const appliedSelectedFilters = appliedFilters.get(currentCategory);
    if (appliedSelectedFilters?.hasIn([filter, option])) {
      return true;
    }

    const items = applyFilterExcept(filteredItems.toJS(), filter);

    if (filter === 'price') {
      let [minPrice, maxPrice] = option.includes('+')
        ? option.split('+')
        : option.split('-');

      [minPrice, maxPrice] = [
        Number(minPrice),
        maxPrice ? Number(maxPrice) : Number.POSITIVE_INFINITY,
      ];

      return items.some(item => {
        const price = item.is_sale === 'true' ? item.price_sale : item.price;
        return price >= minPrice && price <= maxPrice;
      });
    }
    if (filter === 'colors') {
      return items.some(item =>
        item.color?.toLowerCase().includes(option?.toLowerCase())
      );
    }
    if (filter === 'brand') {
      return items.some(item =>
        item.brand?.toLowerCase().includes(option?.toLowerCase())
      );
    }
  };

  const checkSelectedFilters = list => {
    let selectedCount = 0;
    let selectedValues = 0;

    Object.entries(list).forEach(([key, optionList]) => {
      if (optionList) {
        Object.keys(optionList).forEach(option => {
          const optionStatus = isOptionAvailable(option, key);
          if (!optionStatus) {
            if (optionList[option] === true) {
              optionList[option] = false;
            }
          }
        });

        selectedValues = Object.keys(optionList).filter(value => optionList[value]);
        if (selectedValues.length > 0) {
          selectedCount = selectedValues.length + selectedCount;
        }
      }
    });
    return selectedCount;
  };

  const getSelectedFilter = (list, key) => {
    if (list[key]) {
      const selectedValues = Object.keys(list[key]).filter(value => list[key][value]);
      return selectedValues.length;
    }
  };

  useLayoutEffect(() => {
    setDisabledFilters(true);
    let appliedFiltersCount = 0;
    const selectedFiltersCount = checkSelectedFilters(selectedFilters);

    const filters = appliedFilters.toJS()[currentCategory];
    if (filters) {
      appliedFiltersCount = checkSelectedFilters(filters);
    }

    if (appliedFiltersCount > 0) {
      setDisabledFilters(false);
    }
    setSelectedFiltersCount(selectedFiltersCount);
  }, [selectedFilters]);

  const addDollarSign = (str, filter) => {
    if (filter === 'price') {
      const [minPrice, maxPrice] = str.split('-');
      return `$${minPrice} - $${maxPrice}`;
    }
    return str;
  };

  const totalItemsCount = (option, filter) => {
    const list = applyFilterExcept(filteredItems.toJS(), filter);

    if (filter === 'price') {
      const itemsCount = list.filter(item => {
        let [minPrice, maxPrice] = option.includes('+')
          ? option.split('+')
          : option.split('-');

        [minPrice, maxPrice] = [
          Number(minPrice),
          maxPrice ? Number(maxPrice) : Number.POSITIVE_INFINITY,
        ];

        const price = item.is_sale === 'true' ? item.price_sale : item.price;
        return price >= minPrice && price <= maxPrice;
      });
      return itemsCount.length;
    }
    if (filter === 'colors') {
      return list.filter(item =>
        item.color?.toLowerCase().includes(option?.toLowerCase())
      ).length;
    }

    return list.filter(item => item.brand?.toLowerCase().includes(option?.toLowerCase()))
      .length;
  };

  const clearSelectedFilter = () => {
    setSelectedFilters({});
    setAppliedFilters({});
    setFilterCount(0);
    applyFilters();
    track('Reset Filter', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
  };

  const updateOptions = (event, filter, option) => {
    const { checked } = event.target;
    setSelectedFilters(selectedFilters => ({
      ...selectedFilters,
      [filter]: { ...selectedFilters[filter], [option]: checked },
    }));
    track(`Product Filters`, {
      [trackingProps.ROOM_NAME]: currentCollection?.get('type_name'),
      [trackingProps.FILTER_CATEGORY_NAME]: filter,
      [trackingProps.FILTER_VALUE]: option,
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
  };

  const applyFilter = () => {
    onFiltersApply(selectedFilters);
    setFilterCount(selectedFiltersCount);
    track(`Apply Filters`, {
      [trackingProps.ROOM_NAME]: currentCollection?.get('type_name'),
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
  };

  const cancelFilters = () => {
    onBackButtonClick();
    track('Cancel Filters');
  };

  return (
    <div className={styles['product-list']} id="bottom_menu_details">
      <Actions
        styles={styles}
        onBackButtonClick={onBackButtonClick}
        onCloseButtonClick={closeSidebar}
      />
      {filterOptions.get(currentCategory) ? (
        <div className={styles['btm-actions-container']}>
          <h1 className={`${styles.marker} ${styles.margin} proxima`}>
            {currentCategory}
          </h1>
          <div id="filter-page" className={styles['filter-page']}>
            <div className={styles['filter-heading-container']}>
              <div className={styles['filter-count-box']}>
                <p className={styles['filter-heading']}>Filters</p>
                {selectedFiltersCount > 0 && (
                  <div className={`${styles['filter-count']} proximaBold`}>
                    <div> {selectedFiltersCount}</div>
                  </div>
                )}
              </div>
              <button
                className={`${styles['filter-heading']} ${styles['clear-all-btn']}`}
                disabled={disabledFilters}
                onClick={() => clearSelectedFilter()}
              >
                Reset Filter
              </button>
            </div>
            {Object.entries(filterList).map(([filter, filterName]) => (
              <div key={filter}>
                {!(
                  filter === 'brand' && !filterOptions.getIn([currentCategory, 'brand'])
                ) && (
                  <>
                    <hr className={styles.line} />
                    <div className={styles['collapsible-container']}>
                      <Collapsible
                        onOpening={() => {
                          setIsCollapsedMap(cm => ({ ...cm, [filter]: false }));
                          track(
                            `Expand ${
                              filter.charAt(0).toUpperCase() + filter.slice(1)
                            } Filter`,
                            {
                              [trackingProps.ROOM_NAME]:
                                currentCollection?.get('type_name'),
                              [trackingProps.FILTER_CATEGORY_NAME]: filter,
                            }
                          );
                        }}
                        onClosing={() => {
                          setIsCollapsedMap(cm => ({ ...cm, [filter]: true }));
                        }}
                        trigger={
                          <>
                            <button
                              className={`${styles['filter-tag']} ${styles['filter-heading']}`}
                            >
                              {getSelectedFilter(selectedFilters, filter) > 0 && (
                                <span className={styles['selected-state-marker']} />
                              )}
                              {filterName}
                            </button>
                            <img
                              className={styles.icon}
                              src={`${config.s3BucketUrl}/utils/filter-${
                                isCollapsedMap[filter] ? 'expand' : 'contract'
                              }.svg`}
                              alt=""
                            />
                          </>
                        }
                        transitionTime={200}
                      >
                        {filterOptions.getIn([currentCategory, filter]).map(f => {
                          return isOptionAvailable(f, filter) ? (
                            <div className={styles.options} key={`${filter}-${f}`}>
                              <label
                                htmlFor={`${filter}-${f}`}
                                className={styles['checkbox-container']}
                              >
                                {' '}
                                {addDollarSign(f, filter)}
                                <input
                                  id={`${filter}-${f}`}
                                  type="checkbox"
                                  className={isCollapsedMap[filter] ? 'hidden' : ''}
                                  value=""
                                  checked={
                                    (selectedFilters[filter] &&
                                      selectedFilters[filter][f]) ||
                                    false
                                  }
                                  onChange={e => updateOptions(e, filter, f)}
                                />
                                <span> ({totalItemsCount(f, filter)})</span>
                                <span className={styles.checkmark} />
                              </label>
                            </div>
                          ) : null;
                        })}
                      </Collapsible>
                    </div>
                  </>
                )}
              </div>
            ))}
            <hr className={styles.line} />
          </div>
          <div className={styles['filter-buttons']}>
            <div>
              <button onClick={cancelFilters}>Cancel</button>
              <button onClick={applyFilter} disabled={selectedFilters <= 0}>
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1 style={{ textAlign: 'center' }} className="proxima-semibold">
            No Filter Available
          </h1>
        </>
      )}
    </div>
  );
};

FiltersPage.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  filterOptions: PropTypes.instanceOf(Map).isRequired,
  currentCategory: PropTypes.string.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  filteredItems: PropTypes.instanceOf(List).isRequired,
  onFiltersApply: PropTypes.func.isRequired,
  setFilterCount: PropTypes.func.isRequired,
  appliedFilters: PropTypes.instanceOf(Map).isRequired,
  setAppliedFilters: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map),
  applyFilters: PropTypes.func.isRequired,
};

FiltersPage.defaultProps = {
  currentCollection: null,
};

const mapStateToProps = state => {
  return {
    itemsData: state.collection.get('itemsData'),
    filterOptions: state.collection.get('filterOptions'),
    filteredItems: state.collection.get('filteredItems'),
    currentCategory: state.collection.get('currentCategory'),
    appliedFilters: state.interaction.get('appliedFilters'),
    currentCollection: state.collection.get('currentCollection'),
  };
};

const mapDispatchToProps = {
  onFiltersApply,
  setAppliedFilters,
  setFilterCount,
  setFilteredItems,
  applyFilters,
};

export default connect(mapStateToProps, mapDispatchToProps)(FiltersPage);
