import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import storageService from 'helpers/storageService';

import styles from 'styles/ToolTip.module.scss';

const IntroScreen = ({ currentBrand }) => {
  useEffect(() => {
    storageService().session.setItem('tooltipStatus', false);
  }, []);

  return (
    <>
      <div className={styles['intro-screen-container']}>
        {currentBrand && (
          <div className={styles['brand-text']}>
            <p className="proxima-semibold">{currentBrand}</p>
            <p>
              Welcome to Shop by Room! The current items placed in your space are of{' '}
              {currentBrand}. Different brand products are available in your item menu as
              well.{' '}
            </p>
          </div>
        )}
        <button>Get Started</button>
      </div>
    </>
  );
};

IntroScreen.propTypes = {
  currentBrand: PropTypes.string,
};

IntroScreen.defaultProps = {
  currentBrand: '',
};

const mapStateToProps = state => {
  return {
    currentBrand: state.experience.get('currentBrand'),
  };
};

export default connect(mapStateToProps)(IntroScreen);
