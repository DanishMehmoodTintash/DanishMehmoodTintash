import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';

import { track, trackingProps } from 'helpers/analyticsService';

const SortDropdown = ({
  styles,
  sortState,
  sortStateMap,
  setSortState,
  currentCollection,
  currentCategory,
}) => {
  const { buttonProps, itemProps, isOpen, setIsOpen } = useDropdownMenu(3);

  const onSortStateChange = state => {
    setSortState(state);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      track('Clicked Sort CTA', {
        [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
        [trackingProps.NAV_CATEGORY]: currentCategory,
      });
    }
  }, [isOpen]);

  return (
    <>
      <button className={styles['sort-pointer']} {...buttonProps}>
        {sortStateMap[sortState]}{' '}
        <span>
          <i className={`${styles.arrow} ${styles.down}`} />
        </span>
      </button>
      <div
        className={`${styles['sort-popup']} ${styles['sort-popup-container']} ${
          isOpen && styles.visible
        }`}
        role="menu"
        aria-labelledby="sort-by"
      >
        <button
          className={`${styles.info} ${styles['sort-header']}`}
          onClick={() => setIsOpen(false)}
          aria-labelledby="sort-by"
        >
          <div className={styles['info-container']} id="sort-by">
            Sort By
            <span>
              <i className={`${styles.arrow} ${styles.up}`} />
            </span>
          </div>
        </button>
        {Object.entries(sortStateMap).map(([k, v], index) => (
          <button
            role="menuitemradio"
            aria-checked={k === sortState}
            {...itemProps[index]}
            key={k}
            className={styles.info}
            onClick={() => onSortStateChange(k)}
            aria-labelledby="sort-by sort-state"
          >
            <div className={styles['info-container']} id="sort-state">
              {v}
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

SortDropdown.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  sortStateMap: PropTypes.objectOf(PropTypes.string).isRequired,
  sortState: PropTypes.oneOf(['newest', 'lowToHigh', 'highToLow']).isRequired,
  setSortState: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map),
  currentCategory: PropTypes.string.isRequired,
};

SortDropdown.defaultProps = {
  currentCollection: null,
};

const mapStateToProps = state => ({
  currentCollection: state.collection.get('currentCollection'),
  currentCategory: state.collection.get('currentCategory'),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SortDropdown);
