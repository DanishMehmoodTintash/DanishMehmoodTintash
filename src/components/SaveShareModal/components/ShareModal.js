import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import {
  FacebookShareButton,
  PinterestShareButton,
  FacebookMessengerShareButton,
} from 'react-share';

import { getShareUrl, copyUrlToClipboard } from 'helpers/shareUtils';
import { track, trackingProps } from 'helpers/analyticsService';

import Actions from 'components/common/Actions';

import config from 'config';

const ShareModal = ({
  styles,
  sendEmail,
  shareImage,
  showEmailShare,
  showExportPdf,
  onCloseButtonClick,
  currentCollection,
  selectedItemsMap,
}) => {
  const [email, setEmail] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [disableExportPdfButton, setDisableExportPdfButton] = useState(true);
  const shareIconsContainer = useRef(null);

  const trackShare = label => {
    track(label, { [trackingProps.ROOM_NAME]: currentCollection.get('type_name') });
  };

  useEffect(() => {
    const [...categories] = selectedItemsMap.keys();
    const sortedCategories = [
      ...categories.filter(category => !!selectedItemsMap.get(category)),
      ...categories.filter(category => !selectedItemsMap.get(category)),
    ];

    const items = sortedCategories
      .map(category => selectedItemsMap.get(category))
      .filter(item => item);

    if (items.length > 0) {
      setDisableExportPdfButton(false);
    } else {
      setDisableExportPdfButton(true);
    }
  }, selectedItemsMap);

  useEffect(() => {
    const shareButtons = shareIconsContainer.current.querySelectorAll('button');

    shareButtons.forEach(button => {
      const label = button.getAttribute('aria-label');
      button.addEventListener('click', () => trackShare(label));
    });

    return () => {
      shareButtons.forEach(button => {
        const label = button.getAttribute('aria-label');
        button.removeEventListener('click', () => trackShare(label));
      });
    };
  }, []);

  const handleEmailChange = event => {
    setEmail(event.target.value);
    const emailRegex = /\S+@\S+\.\S+/;
    if (event.target.validity.valid) {
      if (emailRegex.test(event.target.value)) {
        setButtonDisabled(false);
      } else {
        setButtonDisabled(true);
      }
    } else {
      setButtonDisabled(true);
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    await sendEmail(email);

    onCloseButtonClick();
    trackShare('Save Email');
  };

  return (
    <>
      <div className={styles['actions-container']}>
        <Actions styles={styles} onCloseButtonClick={onCloseButtonClick} />
      </div>
      <div className={styles.scroll}>
        <div className={styles['share-box']}>
          <div className={`${styles['share-heading']} brandon-medium`}>
            To Save Your Design, Please Enter Your Email
          </div>
          <div className={styles['share-content']}>
            {`You'll receive your design, item selections, and a link to bookmark both
            momentarily.`}
          </div>

          <form onSubmit={handleSubmit}>
            <input
              className={`${styles['share-input']} font1`}
              id="search-input"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              name="search"
              required
            />
            <input
              type="submit"
              className={`${styles['save-btn']} ${styles['save-btn-content']}`}
              value="Save"
              disabled={buttonDisabled}
            />
          </form>
        </div>
        <div ref={shareIconsContainer} className={styles['share-icons-box']}>
          <div
            className={`${styles['share-heading']} ${styles['share-with']} proxima-semibold`}
          >
            or share with
          </div>
          <div className={styles['social-media-imgs']}>
            <button aria-label="Email Share" onClick={showEmailShare}>
              <img
                alt=""
                src={`${config.s3BucketUrl}/utils/email-icon.svg`}
                className={styles['button-padding']}
              />
            </button>

            <button aria-label="Copy Link" onClick={copyUrlToClipboard}>
              <img
                alt=""
                src={`${config.s3BucketUrl}/utils/copy-icon.svg`}
                className={styles['button-padding']}
              />
            </button>
            <button
              aria-label="Copy Link"
              onClick={showExportPdf}
              disabled={disableExportPdfButton}
              className={styles['export-button-state']}
            >
              <img
                alt=""
                src={`${config.s3BucketUrl}/utils/${
                  disableExportPdfButton
                    ? 'export_pdf_disable_button.svg'
                    : 'exportpdf_icon.svg'
                }`}
                className={styles['button-padding']}
              />
            </button>
            <div className={styles['button-padding']}>
              <FacebookMessengerShareButton
                appId="5303202981"
                aria-label="Share With Messenger"
                url={getShareUrl()}
              >
                <img
                  alt=""
                  src={`${config.s3BucketUrl}/utils/messenger-icon.svg`}
                  className={styles['button-padding']}
                />
              </FacebookMessengerShareButton>
            </div>

            <div className={styles['button-padding']}>
              <FacebookShareButton url={getShareUrl()} aria-label="Share With Facebook">
                <img
                  alt=""
                  src={`${config.s3BucketUrl}/utils/facebook-icon.svg`}
                  className={styles['button-padding']}
                />
              </FacebookShareButton>
            </div>

            <div className={styles['button-padding']}>
              <PinterestShareButton
                url={getShareUrl()}
                media={shareImage}
                aria-label="Share With Pinterest"
              >
                <img
                  alt=""
                  src={`${config.s3BucketUrl}/utils/pinterest-icon.svg`}
                  className={styles['button-padding']}
                />
              </PinterestShareButton>
            </div>
          </div>
        </div>
        <div className={`${styles['bottom-text']} proxima`}>
          *We’ll also share design tips, special offers, and more. You can unsubscribe at
          any time.
        </div>
      </div>
    </>
  );
};

ShareModal.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  shareImage: PropTypes.string.isRequired,
  sendEmail: PropTypes.func.isRequired,
  showEmailShare: PropTypes.func.isRequired,
  showExportPdf: PropTypes.func.isRequired,
  onCloseButtonClick: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map).isRequired,
  selectedItemsMap: PropTypes.instanceOf(Map).isRequired,
};

const mapStateToProps = state => ({
  selectedItemsMap: state.collection.get('selectedItemsMap'),
});

export default connect(mapStateToProps)(ShareModal);
