import React, { useEffect, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { OrderedMap, Map } from 'immutable';

import { Viewer as PhotoSphereViewer } from '@moiz.imran/photo-sphere-viewer';

import constants from 'appConstants';

import useWindowDimensions from 'helpers/windowSize';
import {
  fillMarkers,
  updateMarkersState,
  adjustView,
  resize360View,
  reset360View,
  getPSVConfig,
  handleClusterMarkerState,
} from 'helpers/PSVUtils';

import {
  setCurrentImagesMap,
  setSelectedItemsMap,
  syncSelectedItemsAndImages,
  loadVariant,
} from 'actions/collection';
import {
  setPSV,
  onCategoryClick,
  setMarkerDropdownOpen,
  setDropdownPosition,
} from 'actions/interaction';

import config from 'config';

import styles from 'styles/Viewer.module.scss';

const Viewer = ({
  PSV,
  setPSV,
  currentConfig,
  currentPanorama,
  onCategoryClick,
  setSelectedItemsMap,
  setCurrentImagesMap,
  syncSelectedItemsAndImages,
  isSidebarOpen,
  currentCategory,
  setPSVRef,
  isDataFetched,
  currentImagesMap,
  selectedItemsMap,
  loadVariant,
  sidebarComponent,
  isSaveShareOpen,
  isResetOpen,
  isLoading,
  currentId,
  setPanoramaLoaded,
  curatedRoomId,
  setMarkerDropdownOpen,
  setDropdownPosition,
  markerSelected,
  isMarkerDropdownOpen,
}) => {
  const firstLoad = useRef(true);
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    if (!PSV) return;
    updateMarkersState();
  }, [
    isResetOpen,
    isSidebarOpen,
    isSaveShareOpen,
    sidebarComponent,
    currentCategory,
    PSV,
  ]);

  useEffect(() => {
    if (currentCategory) {
      adjustView(PSV);
    }
  }, [currentCategory]);

  useEffect(() => {
    if (!PSV) return;

    if (isSidebarOpen) resize360View(PSV);
    else reset360View(PSV);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isDataFetched && firstLoad.current) {
      syncSelectedItemsAndImages();
      firstLoad.current = false;
    }
  }, [isDataFetched]);

  useEffect(() => {
    if (!PSV || !currentPanorama) return;
    setPanoramaLoaded(false);
    PSV.setPanorama(currentPanorama, { showLoader: false, transition: false });
  }, [PSV, currentPanorama]);

  useEffect(() => {
    if (currentConfig && currentImagesMap.size && isDataFetched) loadVariant(!isLoading);
  }, [currentImagesMap, currentConfig, isDataFetched]);

  useEffect(() => {
    if (!currentCategory && !isMarkerDropdownOpen) {
      handleClusterMarkerState(markerSelected, false);
    }
  }, [currentCategory, isMarkerDropdownOpen]);

  useEffect(() => {
    if (PSV) {
      PSV.on('ready', () => {
        window.dispatchEvent(new Event('resize'));
        fillMarkers(PSV, onCategoryClick);
      });

      PSV.on('click', (_, data) => {
        if (isMarkerDropdownOpen) {
          setMarkerDropdownOpen(false);
          handleClusterMarkerState(markerSelected, false);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('longitude:', data.longitude);
          console.log('latitude:', data.latitude);
        }
      });
      PSV.on('zoom-updated', (_, level) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('zoom level:', level);
        }
      });
      PSV.on('position-updated', (_, position) => {
        if (isMarkerDropdownOpen) {
          setMarkerDropdownOpen(false);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('position:', position);
        }
      });
    }
  }, [PSV, markerSelected, currentCategory, isMarkerDropdownOpen, isSidebarOpen]);

  useEffect(() => {
    try {
      setDropdownPosition(
        PSV.plugins.markers.getMarker(markerSelected)?.props.position2D
      );
    } catch (e) {}
  }, [height, width]);

  useLayoutEffect(() => {
    if (!currentConfig) return;

    const [...itemList] = currentConfig.get('sortingOrder').values();

    const emptyItemsMap = new OrderedMap(itemList.map(key => [key, '']));
    if (selectedItemsMap.size === 0) {
      setSelectedItemsMap(emptyItemsMap);
    }

    if (currentImagesMap.size === 0) {
      if (!curatedRoomId) {
        const defaultCollectionRenders = constants.DEFAULT_RENDERS[currentId];
        const defaultImagesMap = new OrderedMap(
          itemList.map(key => {
            if (defaultCollectionRenders && key in defaultCollectionRenders) {
              const imageUrl = `${config.s3BucketUrl}/utils/${defaultCollectionRenders[key]}`;
              return [key, imageUrl];
            }

            return [key, ''];
          })
        );

        setCurrentImagesMap(defaultImagesMap);
      } else {
        setCurrentImagesMap(emptyItemsMap);
      }
    }

    setPSV(new PhotoSphereViewer({ ...getPSVConfig() }));
  }, [currentConfig]);

  return (
    <>
      <div className={styles.container}>
        <div id="photosphere" ref={ref => setPSVRef(ref)} />
      </div>
    </>
  );
};

Viewer.propTypes = {
  setCurrentImagesMap: PropTypes.func.isRequired,
  setSelectedItemsMap: PropTypes.func.isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  syncSelectedItemsAndImages: PropTypes.func.isRequired,
  setMarkerDropdownOpen: PropTypes.func.isRequired,
  setDropdownPosition: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  setPSV: PropTypes.func.isRequired,
  setPSVRef: PropTypes.func.isRequired,
  isDataFetched: PropTypes.bool.isRequired,
  currentImagesMap: PropTypes.instanceOf(Map).isRequired,
  selectedItemsMap: PropTypes.instanceOf(Map).isRequired,
  loadVariant: PropTypes.func.isRequired,
  isSaveShareOpen: PropTypes.bool.isRequired,
  isResetOpen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  currentId: PropTypes.number.isRequired,
  setPanoramaLoaded: PropTypes.func.isRequired,
  PSV: PropTypes.instanceOf(PhotoSphereViewer),
  currentCategory: PropTypes.string,
  currentConfig: PropTypes.instanceOf(Map),
  currentPanorama: PropTypes.string,
  sidebarComponent: PropTypes.string,
  curatedRoomId: PropTypes.number,
  markerSelected: PropTypes.string.isRequired,
  isMarkerDropdownOpen: PropTypes.bool.isRequired,
};

Viewer.defaultProps = {
  PSV: null,
  currentConfig: null,
  currentPanorama: '',
  currentCategory: '',
  sidebarComponent: '',
  curatedRoomId: null,
};

const mapStateToProps = state => {
  return {
    PSV: state.interaction.get('PSV'),
    currentConfig: state.collection.get('currentConfig'),
    sidebarComponent: state.interaction.get('sidebarComponent'),
    currentId: state.collection.get('currentId'),
    currentPanorama: state.collection.get('currentPanorama'),
    isSidebarOpen: state.interaction.get('isSidebarOpen'),
    isSaveShareOpen: state.interaction.get('isSaveShareOpen'),
    isResetOpen: state.interaction.get('isResetOpen'),
    currentCategory: state.collection.get('currentCategory'),
    currentImagesMap: state.collection.get('currentImagesMap'),
    selectedItemsMap: state.collection.get('selectedItemsMap'),
    curatedRoomId: state.collection.get('curatedRoomId'),
    markerSelected: state.interaction.get('markerSelected'),
    isMarkerDropdownOpen: state.interaction.get('isMarkerDropdownOpen'),
  };
};

const mapDispatchToProps = {
  setCurrentImagesMap,
  setSelectedItemsMap,
  onCategoryClick,
  syncSelectedItemsAndImages,
  setPSV,
  loadVariant,
  setMarkerDropdownOpen,
  setDropdownPosition,
};

export default connect(mapStateToProps, mapDispatchToProps)(Viewer);
