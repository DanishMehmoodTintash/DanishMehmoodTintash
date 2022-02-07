import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import EscapeOutside from 'react-escape-outside';
import { Viewer } from '@moiz.imran/photo-sphere-viewer';

import { track, trackingProps } from 'helpers/analyticsService';

import { setCurrentCategory } from 'actions/collection';
import {
  setSidebarComponent,
  setSidebarOpen,
  setSaveShareOpen,
  setResetOpen,
  setMarkerDropdownOpen,
} from 'actions/interaction';

import SidebarContainer from 'containers/SidebarContainer';

import styles from 'styles/Sidebar.module.scss';
import MenuButtons from './components/MenuButtons';

const Sidebar = ({
  isSidebarOpen,
  sidebarComponent,
  setSidebarOpen,
  setSidebarComponent,
  setSaveShareOpen,
  setResetOpen,
  currentCollection,
  PSV,
  isDisabled,
  setMarkerDropdownOpen,
  setCurrentCategory,
}) => {
  const onSidebarClose = useCallback(() => {
    if (!sidebarComponent) return;

    switch (sidebarComponent) {
      case 'CategoriesList':
        track('Close Category Menu');
        break;
      case 'ProductsList':
        track('Close Product Menu');
        break;
      case 'ProductDetailsPage':
        track('Close Product Detail');
        break;
      case 'ShoppingList':
        track('Close Shopping List');
        break;
      case 'CuratedRoom':
        track('Close Curated Rooms Menu');
        break;
      case 'FiltersPage':
        track('Close Filter Menu');
        break;
      // no default
    }

    setCurrentCategory(null);
    setSidebarOpen(false);
    setSidebarComponent(null);
  }, [sidebarComponent]);

  const onCuratedRoomMenuClick = () => {
    if (sidebarComponent === 'CuratedRoom') {
      onSidebarClose();
    } else {
      setSidebarOpen(true);
      setMarkerDropdownOpen(false);
      setSidebarComponent('CuratedRoom');

      track('Curated Rooms Menu Icon', {
        [trackingProps.ROOM_NAME]: currentCollection?.get('type_name'),
      });
    }
  };

  const onShoppingListClick = () => {
    if (sidebarComponent === 'ShoppingList') {
      onSidebarClose();
    } else {
      setSidebarOpen(true);
      setMarkerDropdownOpen(false);
      setSidebarComponent('ShoppingList');

      track('Open Shopping List', {
        [trackingProps.ROOM_NAME]: currentCollection?.get('type_name'),
      });
    }
  };

  const onSaveShareClick = () => {
    setSaveShareOpen(true);
    setMarkerDropdownOpen(false);

    track(
      'Share Menu Icon',
      { [trackingProps.ROOM_NAME]: currentCollection?.get('type_name') },
      'Save and Share Modal'
    );
  };

  const onResetClick = () => {
    setResetOpen(true);
    setMarkerDropdownOpen(false);

    track('Reset CTA', {
      [trackingProps.ROOM_NAME]: currentCollection?.get('type_name'),
    });
  };

  const onSidebarOpen = () => {
    setSidebarOpen(true);
  };

  useEffect(() => {
    if (PSV) PSV.on('click', onSidebarClose);

    return () => {
      PSV?.off('click', onSidebarClose);
    };
  }, [PSV, onSidebarClose]);

  return (
    <div className={styles.wrapper}>
      <MenuButtons
        openSidebar={onSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        onShoppingListClick={onShoppingListClick}
        onSaveShareClick={onSaveShareClick}
        onResetClick={onResetClick}
        onCuratedRoomMenuClick={onCuratedRoomMenuClick}
        isDisabled={isDisabled}
      />

      <EscapeOutside
        onEscapeOutside={onSidebarClose}
        mouseEvent={null}
        touchEvent={null}
        className={`${styles.sidebar} ${isSidebarOpen && styles.visible}`}
      >
        <SidebarContainer closeSidebar={onSidebarClose} />
      </EscapeOutside>
    </div>
  );
};

Sidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
  setSidebarComponent: PropTypes.func.isRequired,
  setSaveShareOpen: PropTypes.func.isRequired,
  setResetOpen: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  PSV: PropTypes.instanceOf(Viewer),
  sidebarComponent: PropTypes.string,
  currentCollection: PropTypes.instanceOf(Map),
  setMarkerDropdownOpen: PropTypes.func.isRequired,
  setCurrentCategory: PropTypes.func.isRequired,
};

Sidebar.defaultProps = {
  sidebarComponent: null,
  PSV: null,
  currentCollection: null,
};

const mapStateToProps = state => {
  return {
    sidebarComponent: state.interaction.get('sidebarComponent'),
    isSidebarOpen: state.interaction.get('isSidebarOpen'),
    PSV: state.interaction.get('PSV'),
    currentCollection: state.collection.get('currentCollection'),
  };
};

const mapDispatchToProps = {
  setSidebarComponent,
  setSidebarOpen,
  setSaveShareOpen,
  setResetOpen,
  setMarkerDropdownOpen,
  setCurrentCategory,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
