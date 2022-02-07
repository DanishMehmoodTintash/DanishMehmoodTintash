import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Viewer as PhotoSphereViewer } from '@moiz.imran/photo-sphere-viewer';
import { imageXhr } from 'helpers/imageUtils';

import {
  fetchCollectionConfig,
  fetchCollectionItemsData,
  setBaseImage,
  prefetchConnectedRooms,
  loadInitialImagesInHashMap,
  loadDefaultImagesInHashMap,
  setCurrentCollection,
  fetchCuratedRooms,
} from 'actions/collection';
import { setCanvasRef, setTooltipStatus } from 'actions/experience';
import { setAppLoading } from 'actions/interaction';

import ChangeRoomModal from 'components/ChangeRoomModal';
import IntroScreen from 'components/IntroScreen';
import OverlayLoader from 'components/common/OverlayLoader';
import RoomSettingsDropdown from 'components/RoomSettingsDropdown';
import ResetModal from 'components/ResetModal';
import Sidebar from 'components/Sidebar';
import SaveShareModal from 'components/SaveShareModal';
import Viewer from 'components/Viewer';
import RoomLoader from 'components/RoomLoader';
import MarkerPopupList from 'components/MarkerPopupList';

import config from 'config';

const Collection = ({
  overlayLoaderState,
  currentId,
  fetchCollectionItemsData,
  fetchCuratedRooms,
  fetchCollectionConfig,
  setBaseImage,
  prefetchConnectedRooms,
  isIntroScreen,
  setCanvasRef,
  PSV,
  setTooltipStatus,
  loadInitialImagesInHashMap,
  loadDefaultImagesInHashMap,
  isAppLoading,
  setAppLoading,
  imagesHashMap,
  setCurrentCollection,
  markerDropdownCategories,
}) => {
  const [isViewerReady, setViewerReady] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isPanoramaLoaded, setPanoramaLoaded] = useState(false);
  const [isImageCacheReady, setImageCacheReady] = useState(false);
  const PSVContainer = useRef(null);
  const itemsCanvas = useRef(null);
  const postItemsCanvas = useRef(null);

  const setPSVRef = ref => {
    PSVContainer.current = ref;
  };

  useLayoutEffect(() => {
    if (isViewerReady && isImageCacheReady && isPanoramaLoaded) {
      setTimeout(() => setAppLoading(false), 100);
      setTooltipStatus(true);
    }
  }, [isViewerReady, isImageCacheReady, isPanoramaLoaded]);

  useLayoutEffect(() => {
    setIsDataFetched(false);
    setImageCacheReady(false);
    setViewerReady(false);
  }, [currentId]);

  useEffect(() => {
    const fetchAllData = async () => {
      const promises = [
        fetchCollectionConfig(currentId),
        fetchCollectionItemsData(currentId),
        loadDefaultImagesInHashMap(),
      ];

      let baseImage;
      if (imagesHashMap.get(currentId)?.has('baseImage.jpg')) {
        baseImage = imagesHashMap.getIn([currentId, 'baseImage.jpg']);
      } else {
        const baseImageUrl = `${config.s3BucketUrl}/render_360/${currentId}/baseImage.jpg`;
        promises.push(imageXhr('baseImage.jpg', baseImageUrl, currentId));
      }

      const results = await Promise.allSettled(promises);
      baseImage = baseImage || results.pop().value;

      setBaseImage(baseImage);
      await fetchCuratedRooms(currentId);
      setIsDataFetched(true);

      prefetchConnectedRooms();

      await loadInitialImagesInHashMap();
      setImageCacheReady(true);
    };

    console.log(`5th event ${currentId}`);
    setCurrentCollection(currentId);
    fetchAllData();
  }, [currentId]);

  useEffect(() => {
    PSV?.on('ready', () => setViewerReady(true));

    PSV?.on('panorama-loaded', () => {
      setPanoramaLoaded(true);
    });
  }, [PSV]);

  useEffect(() => {
    setCanvasRef(itemsCanvas.current, 'default');
    setCanvasRef(postItemsCanvas.current, 'post');
  }, []);

  return (
    <>
      <OverlayLoader state={overlayLoaderState} zIndex={isIntroScreen ? 99 : null} />
      <RoomSettingsDropdown isDisabled={isAppLoading} />
      {markerDropdownCategories?.length > 0 && (
        <MarkerPopupList isDisabled={isAppLoading} />
      )}
      <Viewer
        key={currentId}
        setPSVRef={setPSVRef}
        isDataFetched={isDataFetched}
        isLoading={isAppLoading}
        setPanoramaLoaded={setPanoramaLoaded}
      />
      <Sidebar isDisabled={isAppLoading} />
      <SaveShareModal />
      <ResetModal />
      {isIntroScreen && <IntroScreen />}
      <ChangeRoomModal />
      <RoomLoader isVisible={isAppLoading} />
      <canvas ref={itemsCanvas} />
      <canvas ref={postItemsCanvas} />
    </>
  );
};

Collection.propTypes = {
  currentId: PropTypes.number.isRequired,
  overlayLoaderState: PropTypes.oneOf(['all', 'loader', 'overlay', 'none']).isRequired,
  fetchCollectionItemsData: PropTypes.func.isRequired,
  fetchCuratedRooms: PropTypes.func.isRequired,
  fetchCollectionConfig: PropTypes.func.isRequired,
  setBaseImage: PropTypes.func.isRequired,
  prefetchConnectedRooms: PropTypes.func.isRequired,
  isIntroScreen: PropTypes.bool.isRequired,
  setCanvasRef: PropTypes.func.isRequired,
  setTooltipStatus: PropTypes.func.isRequired,
  loadInitialImagesInHashMap: PropTypes.func.isRequired,
  loadDefaultImagesInHashMap: PropTypes.func.isRequired,
  isAppLoading: PropTypes.bool.isRequired,
  setAppLoading: PropTypes.func.isRequired,
  imagesHashMap: PropTypes.instanceOf(Map).isRequired,
  setCurrentCollection: PropTypes.func.isRequired,
  PSV: PropTypes.instanceOf(PhotoSphereViewer),
  markerDropdownCategories: PropTypes.instanceOf(Array).isRequired,
};

Collection.defaultProps = {
  PSV: null,
};

const mapStateToProps = state => ({
  currentId: state.collection.get('currentId'),
  overlayLoaderState: state.interaction.get('overlayLoaderState'),
  isIntroScreen: state.experience.get('isIntroScreen'),
  PSV: state.interaction.get('PSV'),
  isAppLoading: state.interaction.get('isAppLoading'),
  imagesHashMap: state.experience.get('imagesHashMap'),
  markerDropdownCategories: state.interaction.get('markerDropdownCategories'),
});

const mapDispatchToProps = {
  fetchCollectionConfig,
  fetchCollectionItemsData,
  fetchCuratedRooms,
  setBaseImage,
  prefetchConnectedRooms,
  setCanvasRef,
  setTooltipStatus,
  loadInitialImagesInHashMap,
  loadDefaultImagesInHashMap,
  setAppLoading,
  setCurrentCollection,
};

export default connect(mapStateToProps, mapDispatchToProps)(Collection);
