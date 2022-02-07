import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { goToCollection } from 'actions/collection';

import styles from 'styles/Landing.module.scss';

import config from 'config';

const LandingScreen = ({ selectCollection }) => {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.heading}>Let’s Get Started!</h1>
        <h2 className={styles.title}>
          What does college living look like for you this year?
        </h2>
        <div className={styles.style}>
          <div className={`${styles['box-width']} ${styles['mbl-padding']}`}>
            <div className={styles.content}>
              <img
                className={styles['box-circle']}
                src={`${config.s3BucketUrl}/utils/on-campus-icon.svg`}
                alt=""
              />
              <span className={styles['img-content']}>
                Moving in to a dorm on-campus<span>:</span>
              </span>
            </div>
            <button
              className={`${styles.button} ${styles.proxima}`}
              onClick={() => selectCollection(1, 'On Campus')}
            >
              Design Bedroom
            </button>
          </div>
          <div className={styles['box-width']}>
            <div className={styles.content}>
              <img
                className={`${styles['box-circle']} ${styles['mbl-padding']}`}
                src={`${config.s3BucketUrl}/utils/off-campus-icon.svg`}
                alt=""
              />
              <span className={styles['img-content']}>
                Living in off-campus housing or studying from home
                <span>:</span>
              </span>
            </div>
            <button
              className={`${styles.button} ${styles.proxima}`}
              onClick={() => selectCollection(2, 'Off Campus')}
            >
              Design Bathroom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

LandingScreen.propTypes = {
  selectCollection: PropTypes.func.isRequired,
};

export default connect(null, {
  selectCollection: goToCollection,
})(LandingScreen);
