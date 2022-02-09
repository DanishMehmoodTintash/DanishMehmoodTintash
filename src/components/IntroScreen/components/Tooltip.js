import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { showAutoRotation } from 'helpers/PSVUtils';

import { setTooltipStatus } from 'actions/experience';
import { setOverlayLoaderState } from 'actions/interaction';

import config from 'config';

import styles from 'styles/ToolTip.module.scss';

const ToolTip = ({
  tooltipText,
  type,
  enableDevice,
  isIntroScreen,
  setOverlayLoaderState,
  setTooltipStatus,
}) => {
  const isMobile = useMemo(() => window.innerWidth <= 600, [window.innerWidth]);

  useEffect(() => {
    if (isIntroScreen) setOverlayLoaderState('overlay');

    const hideIntroTooltips = () => {
      if (isIntroScreen) {
        setTooltipStatus(false);
        setOverlayLoaderState('none');
        showAutoRotation();
      }
    };

    window.addEventListener('click', hideIntroTooltips);

    return () => window.removeEventListener('click', hideIntroTooltips);
  }, [isIntroScreen]);

  return (
    <>
      {isMobile && isIntroScreen && enableDevice ? (
        <div
          className={
            type === 'mbl-resets'
              ? styles['mbl-reset-btn']
              : `${
                  type === 'menu'
                    ? styles['mbl-menu-tooltip-box']
                    : styles['mbl-room-setting-tooltip-box']
                }`
          }
        >
          <span
            className={
              ('proxima',
              type === 'room-setting'
                ? styles['room-setting-tooltip']
                : `${
                    type === 'menu'
                      ? `${styles['tooltip-text']} ${styles['mbl-menu-tooltip-text']}`
                      : `${styles['room-setting-tooltip']} ${styles['reset-setting-tooltip']}`
                  }`)
            }
          >
            {tooltipText}
          </span>
          {type === 'menu' ? (
            <img
              className={styles['tooltip-black-box']}
              alt=""
              src={`${config.s3BucketUrl}/utils/mbl-menu-tooltip.svg`}
            />
          ) : (
            <>
              {type === 'room-setting' ? (
                <img
                  alt=""
                  src={`${config.s3BucketUrl}/utils/room-setting-tooltip.svg`}
                />
              ) : (
                <img alt="" src={`${config.s3BucketUrl}/utils/mbl-resert-tooltip.svg`} />
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {!isMobile && isIntroScreen && !enableDevice ? (
            <div
              className={`${styles['tooltip-box']}
               ${type !== 'menu' && styles['room-setting-tooltip-box']}`}
            >
              <div className={styles['tooltip-text-container']}>
                <span
                  className={`proxima ${
                    type === 'menu'
                      ? styles['tooltip-text']
                      : styles['room-setting-tooltip']
                  }`}
                >
                  {tooltipText}
                </span>
                {type === 'menu' ? (
                  <img
                    className={styles['tooltip-black-box']}
                    alt=""
                    src={`${config.s3BucketUrl}/utils/menu-tooltip.svg`}
                  />
                ) : (
                  <img
                    className={styles.image}
                    alt=""
                    src={`${config.s3BucketUrl}/utils/room-setting-tooltip.svg`}
                  />
                )}
              </div>
            </div>
          ) : (
            ''
          )}
        </>
      )}
    </>
  );
};

ToolTip.propTypes = {
  isIntroScreen: PropTypes.bool.isRequired,
  setOverlayLoaderState: PropTypes.func.isRequired,
  setTooltipStatus: PropTypes.func.isRequired,
  tooltipText: PropTypes.string,
  type: PropTypes.string,
  enableDevice: PropTypes.bool,
};

ToolTip.defaultProps = {
  tooltipText: '',
  type: 'menu',
  enableDevice: false,
};

const mapStateToProps = state => {
  return {
    isIntroScreen: state.experience.get('isIntroScreen'),
  };
};

const mapDispatchToProps = {
  setOverlayLoaderState,
  setTooltipStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolTip);
