import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ToolTip from 'components/IntroScreen/components/Tooltip';

import styles from 'styles/Sidebar.module.scss';

import config from 'config';

const MenuButtons = ({
  onShoppingListClick,
  onCuratedRoomMenuClick,
  onSaveShareClick,
  onResetClick,
  isSidebarOpen,
  sidebarComponent,
  isSaveShareOpen,
  isIntroScreen,
  isDisabled,
}) => {
  const isMobile = useMemo(() => window.innerWidth <= 600, [window.innerWidth]);

  const ResetButton = () => {
    return (
      <button onClick={onResetClick} className={`${styles['reset-btn']}`}>
        <img alt="" src={`${config.s3BucketUrl}/utils/reset.svg`} />
      </button>
    );
  };

  return (
    <>
      <ToolTip
        tooltipText="View your shopping list, view our curated rooms, and save & share your designs."
        type="menu"
        enableDevice
      />
      <div
        className={`${styles['menu-btn-container']} ${
          isSidebarOpen && styles.translated
        } ${isDisabled ? styles.disabled : ''}`}
      >
        <div aria-labelledby="shopping-list-label">
          {!isIntroScreen && (
            <span
              id="your-selection-tooltip"
              className={`${styles['tooltip-container']} ${styles['tooltip-text']}`}
            >
              Your Selections
            </span>
          )}

          <ToolTip tooltipText="View your shopping list." />
          <button
            className={`${styles['your-selection-btn']} ${
              sidebarComponent === 'ShoppingList' ? styles.selected : ''
            }`}
            onClick={onShoppingListClick}
          >
            <img alt="" src={`${config.s3BucketUrl}/utils/your-selections.svg`} />
          </button>
          <span id="shopping-list-label" hidden>
            Open Your Selections
          </span>
        </div>
        <div className={styles['btn-margin']} aria-labelledby="save-button-label">
          {!isIntroScreen && (
            <span
              id="save-share-tooltip"
              className={`${styles['tooltip-container']} ${styles['tooltip-text']}`}
            >
              Save/ Share
            </span>
          )}

          <ToolTip tooltipText="Share & save your designs." />
          <button
            onClick={onSaveShareClick}
            className={`${styles['save-share-btn']} ${
              isSaveShareOpen ? styles.selected : ''
            }`}
          >
            <img
              id="share-menu-btn"
              alt=""
              src={`${config.s3BucketUrl}/utils/save.svg`}
            />
          </button>
          <span id="save-button-label" hidden>
            Open Save/Share Popup
          </span>
        </div>
        <div className={styles['btn-margin']} aria-labelledby="product-menu-label">
          {!isIntroScreen && (
            <span
              id="product-menu-tooltip"
              className={`${styles['tooltip-container']} ${styles['tooltip-text']}`}
            >
              Curated Rooms
            </span>
          )}

          <ToolTip tooltipText="View our curated rooms" />
          <button
            onClick={onCuratedRoomMenuClick}
            className={`${styles['product-menu-btn']} ${
              isSidebarOpen === true &&
              sidebarComponent === 'CuratedRoom' &&
              styles.selected
            }`}
          >
            <img alt="" src={`${config.s3BucketUrl}/utils/preset-rooms.svg`} />
          </button>
          <span id="product-menu-label" hidden>
            Open Products Menu
          </span>
        </div>
        <div className={styles['btn-margin']} aria-labelledby="reset-label" id="reset">
          {!isIntroScreen && (
            <span className={`${styles['tooltip-container']} ${styles['tooltip-text']}`}>
              Reset Your Design.
            </span>
          )}

          <ToolTip tooltipText="Reset your design." />
          {isMobile ? !isSidebarOpen && <ResetButton /> : <ResetButton />}
          <ToolTip tooltipText="Reset Your design." type="mbl-resets" enableDevice />
          <span id="reset-label" hidden>
            Reset your design.
          </span>
        </div>
      </div>
    </>
  );
};

MenuButtons.propTypes = {
  onCuratedRoomMenuClick: PropTypes.func.isRequired,
  onShoppingListClick: PropTypes.func.isRequired,
  onSaveShareClick: PropTypes.func.isRequired,
  onResetClick: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  isSaveShareOpen: PropTypes.bool.isRequired,
  isIntroScreen: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  sidebarComponent: PropTypes.string,
};

MenuButtons.defaultProps = {
  sidebarComponent: '',
};

const mapStateToProps = state => ({
  isSaveShareOpen: state.interaction.get('isSaveShareOpen'),
  sidebarComponent: state.interaction.get('sidebarComponent'),
  isIntroScreen: state.experience.get('isIntroScreen'),
});

export default connect(mapStateToProps)(MenuButtons);
