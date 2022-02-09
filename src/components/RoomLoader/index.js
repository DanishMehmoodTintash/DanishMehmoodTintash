import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import { Map } from 'immutable';

import config from 'config';

import styles from 'styles/Loader.module.scss';

const RoomLoader = ({ currentId, isVisible, imagesHashMap }) => {
  const backgroundImage = useMemo(() => {
    if (imagesHashMap.get(currentId)?.has('baseImage-low.jpg')) {
      return imagesHashMap.getIn([currentId, 'baseImage-low.jpg']);
    }

    return `${config.s3BucketUrl}/render_360/${currentId}/baseImage-low.jpg`;
  }, [currentId]);

  return (
    <div
      className={styles['room-loader']}
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      <div
        style={{ backgroundImage: `url(${backgroundImage})` }}
        className={styles.background}
      />
      <Loader type="Oval" color="#FFF" height={75} width={75} className={styles.loader} />
    </div>
  );
};

RoomLoader.propTypes = {
  currentId: PropTypes.number.isRequired,
  isVisible: PropTypes.bool.isRequired,
  imagesHashMap: PropTypes.instanceOf(Map).isRequired,
};

const mapStateToProps = state => {
  return {
    currentId: state.collection.get('currentId'),
    imagesHashMap: state.experience.get('imagesHashMap'),
  };
};

export default connect(mapStateToProps)(RoomLoader);
