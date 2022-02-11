import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';

import { track, trackingProps } from 'helpers/analyticsService';
import { handleClusterMarkerState } from 'helpers/PSVUtils';
import { goToCollection, setCurrentCategory } from 'actions/collection';
import {
  setOverlayLoaderState,
  setMarkerDropdownOpen,
  setSidebarOpen,
  setSidebarComponent,
} from 'actions/interaction';

import ToolTip from 'components/IntroScreen/components/Tooltip';

import config from 'config';
import styles from 'styles/RoomSettingsDropdown.module.scss';

const RoomSettingsDropdown = ({
  allCollections,
  currentId,
  goToCollection,
  isSidebarOpen,
  setOverlayLoaderState,
  isDisabled,
  currentCollection,
  setMarkerDropdownOpen,
  setSidebarOpen,
  setCurrentCategory,
  setSidebarComponent,
  markerSelected,
}) => {
  const isMobile = useMemo(() => window.innerWidth <= 600, [window.innerWidth]);
  const { buttonProps, itemProps, isOpen } = useDropdownMenu(3);

  const onCollectionClick = collection => {
    if (Number(collection.get('room_type_id')) === currentId) {
      setOverlayLoaderState('none');
    } else {
      goToCollection(collection.get('room_type_id'));
      track(collection.get('type_name'));
    }
  };

  useEffect(() => {
    console.log('IS OPEN', isOpen);
    if (isOpen) {
      track('Change Room Type', {
        [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      });
      setMarkerDropdownOpen(false);
      setCurrentCategory(null);
      setSidebarOpen(false);
      setSidebarComponent(null);
      handleClusterMarkerState(markerSelected, false);
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className={styles.overlay} />}
      <div className={`${styles['room-settings']} ${isOpen ? styles.zindex : ''}`}>
        <button
          {...buttonProps}
          className={isOpen && !isMobile ? styles.hidden : ''}
          disabled={isDisabled}
        >
          {isMobile ? (
            <>
              {isOpen && <div className={`${styles.overlay} ${styles['setting-btn']}`} />}
              {!isSidebarOpen && (
                <img alt="" src={`${config.s3BucketUrl}/utils/room-setting-icon.svg`} />
              )}
              <ToolTip tooltipText="Switch Rooms" type="room-setting" enableDevice />
            </>
          ) : (
            <>
              <img alt="" src={`${config.s3BucketUrl}/utils/room-setting-menu.svg`} />
              <span>
                {allCollections
                  .find(value => value.get('room_type_id') === currentId)
                  ?.get('type_name')}
              </span>
              <img alt="" src={`${config.s3BucketUrl}/utils/room-arrow-dropdown.svg`} />
            </>
          )}
        </button>
        <div className={`(${styles['tooltip-spacing']}`}>
          <ToolTip tooltipText="Switch Rooms" type="setting-dropdown" />
        </div>
        <div
          className={`${styles['room-settings-dropdown']} ${
            isOpen ? styles.visible : undefined
          }`}
        >
          <button className={styles['close-btn']} aria-label="Close Room Settings">
            <img alt="" src={`${config.s3BucketUrl}/utils/room-settings-close.svg`} />
          </button>
          <div className={`${styles['switch-rooms']} proxima`}>Switch Rooms</div>
          <div>
            {allCollections.map((collection, key) => (
              <button
                {...itemProps[key]}
                key={key}
                onClick={() => onCollectionClick(collection)}
                className={
                  collection.get('room_type_id') === currentId ? styles.selected : ''
                }
              >
                <span>{collection.get('type_name')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

RoomSettingsDropdown.propTypes = {
  allCollections: PropTypes.instanceOf(List).isRequired,
  currentId: PropTypes.number.isRequired,
  goToCollection: PropTypes.func.isRequired,
  setOverlayLoaderState: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  currentCollection: PropTypes.instanceOf(Map),
  setMarkerDropdownOpen: PropTypes.func.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
  setCurrentCategory: PropTypes.func.isRequired,
  setSidebarComponent: PropTypes.func.isRequired,
  markerSelected: PropTypes.string.isRequired,
};

RoomSettingsDropdown.defaultProps = {
  currentCollection: null,
};

const mapStateToProps = state => ({
  allCollections: state.experience.get('allCollections'),
  currentId: state.collection.get('currentId'),
  isSettingOpen: state.interaction.get('isResetOpen'),
  isSidebarOpen: state.interaction.get('isSidebarOpen'),
  currentCollection: state.collection.get('currentCollection'),
  markerSelected: state.interaction.get('markerSelected'),
});

const mapDispatchToProps = {
  goToCollection,
  setOverlayLoaderState,
  setMarkerDropdownOpen,
  setSidebarOpen,
  setCurrentCategory,
  setSidebarComponent,
};

export default connect(mapStateToProps, mapDispatchToProps)(RoomSettingsDropdown);
