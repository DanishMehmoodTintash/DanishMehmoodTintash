import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import EscapeOutside from 'react-escape-outside';
import { List, Map } from 'immutable';

import { track, trackingProps } from 'helpers/analyticsService';

import { resetCollection, setSelectedItemsAndImages } from 'actions/collection';
import { setChangeRoomOpen, resetFilters } from 'actions/interaction';

import styles from 'styles/ResetModal.module.scss';

const ChangeRoomModal = ({
  isChangeRoomOpen,
  setChangeRoomOpen,
  curatedRooms,
  setSelectedItemsAndImages,
  resetCollection,
  curatedRoomId,
  resetFilters,
  currentCollection,
}) => {
  const onClose = () => {
    setChangeRoomOpen(false);
    track('Cancel Curated Rooms', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
    });
  };

  const resetFilterAndSearch = () => {
    resetFilters();
    resetCollection();
  };

  const selectCuratedRoom = () => {
    resetFilterAndSearch();
    setChangeRoomOpen(false);
    const currentCuratedRoom = curatedRooms.find(
      room => room.get('curated_room_id') === curatedRoomId
    );
    const curatedItemsMap = currentCuratedRoom.get('itemsMap');
    setSelectedItemsAndImages(curatedItemsMap);
    track('Take Me to Curated Room ', {
      [trackingProps.ROOM_NAME]: currentCollection.get('type_name'),
      [trackingProps.CURATED_ROOM_NAME]: currentCuratedRoom.get('curated_room_name'),
    });
  };

  return (
    <>
      {isChangeRoomOpen && (
        <>
          <div className={`${styles.overlay} ${styles['change-room-model']}`} />
          <EscapeOutside onEscapeOutside={onClose}>
            <div
              className={`${styles['reset-container']} ${styles['change-room-container']}`}
            >
              <div className={`${styles['reset-popup']} ${styles['curated-popup']}`}>
                <div
                  className={`${styles['reset-heading']} ${styles['curated-heading']} proxima-bold`}
                >
                  Changing Your Room?
                </div>
                <div className={styles['reset-desc']}>
                  Changing your room will override all of your product selections from
                  your room and shopping list.
                </div>
                <button
                  className={`${styles['reset-popup-btn']} ${styles['curated-room-popup-btn']}`}
                  onClick={selectCuratedRoom}
                >
                  Yes, Take Me To a Curated Room
                </button>
                <button
                  className={`${styles['reset-popup-btn']} ${styles['curated-room-popup-btn']} ${styles['cancel-curated-option']}`}
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </EscapeOutside>
        </>
      )}
    </>
  );
};

ChangeRoomModal.propTypes = {
  isChangeRoomOpen: PropTypes.bool.isRequired,
  setChangeRoomOpen: PropTypes.func.isRequired,
  resetCollection: PropTypes.func.isRequired,
  resetFilters: PropTypes.func.isRequired,
  setSelectedItemsAndImages: PropTypes.func.isRequired,
  curatedRoomId: PropTypes.number,
  curatedRooms: PropTypes.instanceOf(List),
  currentCollection: PropTypes.instanceOf(Map),
};

ChangeRoomModal.defaultProps = {
  curatedRooms: [],
  curatedRoomId: null,
  currentCollection: null,
};

const mapStateToProps = state => ({
  isChangeRoomOpen: state.interaction.get('isChangeRoomOpen'),
  curatedRooms: state.collection.get('curatedRooms'),
  curatedRoomId: state.collection.get('curatedRoomId'),
  itemsData: state.collection.get('itemsData'),
  currentCollection: state.collection.get('currentCollection'),
});

const mapDispatchToProps = {
  setChangeRoomOpen,
  resetCollection,
  resetFilters,
  setSelectedItemsAndImages,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangeRoomModal);
