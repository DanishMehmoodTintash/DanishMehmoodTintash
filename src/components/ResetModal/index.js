import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import EscapeOutside from 'react-escape-outside';
import { Map } from 'immutable';

import { resetCollection } from 'actions/collection';
import { setResetOpen } from 'actions/interaction';

import { track, trackingProps } from 'helpers/analyticsService';

import styles from 'styles/ResetModal.module.scss';

const ResetModal = ({
  isResetOpen,
  resetCollection,
  setResetOpen,
  currentCollection,
}) => {
  const onReset = () => {
    track('Yes Reset My Room', {
      [trackingProps.ROOM_NAME]: currentCollection?.get('type_name'),
    });
    resetCollection();
    setResetOpen(false);
  };

  const onClose = () => {
    track('No Keep My Choices', {
      [trackingProps.ROOM_NAME]: currentCollection?.get('type_name'),
    });
    setResetOpen(false);
  };

  return (
    <>
      {isResetOpen && (
        <>
          <div className={styles.overlay} />
          <EscapeOutside onEscapeOutside={onClose}>
            <div className={styles['reset-container']}>
              <div className={styles['reset-popup']}>
                <div className={`${styles['reset-heading']} proxima-bold`}>
                  {' '}
                  Reset Your Room?
                </div>
                <div className={styles['reset-desc']}>
                  {' '}
                  Start fresh! This will clear all of your product selections from your
                  room.
                </div>
                <button className={styles['reset-popup-btn']} onClick={onReset}>
                  Yes, Reset My Room
                </button>
                <button
                  className={`${styles['reset-popup-btn']} ${styles['cancel-reset-option']}`}
                  onClick={onClose}
                >
                  Nevermind, I’ll keep my choices
                </button>
              </div>
            </div>
          </EscapeOutside>
        </>
      )}
    </>
  );
};

ResetModal.propTypes = {
  isResetOpen: PropTypes.bool.isRequired,
  resetCollection: PropTypes.func.isRequired,
  setResetOpen: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map),
};

ResetModal.defaultProps = {
  currentCollection: null,
};

const mapStateToProps = state => ({
  isResetOpen: state.interaction.get('isResetOpen'),
  currentCollection: state.collection.get('currentCollection'),
});

const mapDispatchToProps = { resetCollection, setResetOpen };

export default connect(mapStateToProps, mapDispatchToProps)(ResetModal);
