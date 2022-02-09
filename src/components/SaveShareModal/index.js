import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import EscapeOutside from 'react-escape-outside';
import { Map } from 'immutable';

import { setSaveShareOpen } from 'actions/interaction';
import { sendEmail, uploadShareImage, shareEmail } from 'actions/collection';

import styles from 'styles/SaveShareModal.module.scss';

import ShareModal from './components/ShareModal';
import ShareEmail from './components/ShareEmail';
import ExportPdf from './components/ExportPdf';

const SaveShareModal = ({
  isSaveShareOpen,
  setSaveShareOpen,
  sendEmail,
  uploadShareImage,
  shareImage,
  shareEmail,
  overlayLoaderState,
  currentCollection,
}) => {
  const [showEmailShare, setShowEmailShare] = useState(false);
  const [showPdfExport, setShowPdfExport] = useState(false);
  const overlayRef = useRef(null);

  const closeSaveShare = () => {
    setSaveShareOpen(false);
    setShowEmailShare(false);
    setShowPdfExport(false);
  };

  useEffect(() => {
    if (!isSaveShareOpen) return;

    uploadShareImage();
  }, [isSaveShareOpen]);

  useEffect(() => {
    overlayRef.current?.addEventListener('click', closeSaveShare);
  }, [overlayLoaderState]);

  return (
    <>
      {isSaveShareOpen && (
        <>
          <div className={styles.overlay} ref={overlayRef} />
          <div className={styles['share-container']}>
            <EscapeOutside
              onEscapeOutside={closeSaveShare}
              mouseEvent={null}
              touchEvent={null}
            >
              {showEmailShare && !showPdfExport && (
                <ShareEmail
                  styles={styles}
                  shareEmail={shareEmail}
                  onBackButtonClick={() => setShowEmailShare(false)}
                  onCloseButtonClick={closeSaveShare}
                />
              )}
              {!showEmailShare && showPdfExport && (
                <ExportPdf
                  styles={styles}
                  shareEmail={shareEmail}
                  onBackButtonClick={() => setShowPdfExport(false)}
                  onCloseButtonClick={closeSaveShare}
                />
              )}
              {!showEmailShare && !showPdfExport && (
                <ShareModal
                  styles={styles}
                  shareImage={shareImage}
                  sendEmail={sendEmail}
                  showEmailShare={setShowEmailShare}
                  showExportPdf={setShowPdfExport}
                  onCloseButtonClick={closeSaveShare}
                  currentCollection={currentCollection}
                />
              )}
            </EscapeOutside>
          </div>
        </>
      )}
    </>
  );
};

SaveShareModal.propTypes = {
  isSaveShareOpen: PropTypes.bool.isRequired,
  setSaveShareOpen: PropTypes.func.isRequired,
  sendEmail: PropTypes.func.isRequired,
  uploadShareImage: PropTypes.func.isRequired,
  shareImage: PropTypes.string.isRequired,
  shareEmail: PropTypes.func.isRequired,
  overlayLoaderState: PropTypes.oneOf(['all', 'loader', 'overlay', 'none']).isRequired,
  currentCollection: PropTypes.instanceOf(Map),
};

SaveShareModal.defaultProps = {
  currentCollection: null,
};

const mapStateToProps = state => ({
  isSaveShareOpen: state.interaction.get('isSaveShareOpen'),
  shareImage: state.interaction.get('shareImage'),
  overlayLoaderState: state.interaction.get('overlayLoaderState'),
  currentCollection: state.collection.get('currentCollection'),
});

const mapDispatchToProps = {
  setSaveShareOpen,
  sendEmail,
  uploadShareImage,
  shareEmail,
};

export default connect(mapStateToProps, mapDispatchToProps)(SaveShareModal);
