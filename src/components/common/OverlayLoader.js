import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';

const OverlayLoader = ({ state, zIndex }) => {
  return (
    <div
      className={`overlay ${state !== 'none' && 'visible'} ${
        state === 'loader' && 'transparent'
      }`}
      style={{ zIndex }}
    >
      <Loader
        type="TailSpin"
        color="#999999"
        height={100}
        width={100}
        visible={state !== 'overlay'}
      />
    </div>
  );
};

OverlayLoader.propTypes = {
  state: PropTypes.oneOf(['all', 'loader', 'overlay', 'none']).isRequired,
  zIndex: PropTypes.number,
};

OverlayLoader.defaultProps = {
  zIndex: 99999999,
};

export default OverlayLoader;
