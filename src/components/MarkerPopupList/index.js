import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { imageXhr } from 'helpers/imageUtils';
import useWindowDimensions from 'helpers/windowSize';

import { onCategoryClick, setMarkerDropdownOpen } from 'actions/interaction';

import config from 'config';

import styles from 'styles/MarkerPopupList.module.scss';

const MarkerPopupList = ({
  onCategoryClick,
  isMarkerDropdownOpen,
  dropdownPosition,
  setMarkerDropdownOpen,
  markerDropdownCategories,
  overlayLoaderState,
}) => {
  const [isLoading, setLoading] = useState(true);
  const [thumbnailsMap, setThumbnailMap] = useState({});
  const { width } = useWindowDimensions();
  const posX = width <= 600 ? 93 : 122;
  const posY = width <= 600 ? 370 : 418;

  useEffect(() => {
    const last = Object.keys(thumbnailsMap)[Object.keys(thumbnailsMap).length - 1];
    if (thumbnailsMap[last]) {
      setLoading(false);
    }
  }, [thumbnailsMap]);

  useEffect(() => {
    let hashMap = {};

    const fetchImages = async () => {
      hashMap = (
        await Promise.all(
          Object.keys(hashMap).map(async k => ({ [k]: await hashMap[k] }))
        )
      ).reduce((h, p) => ({ ...h, ...p }), {});
      setThumbnailMap(hashMap);
    };

    markerDropdownCategories.forEach(category => {
      hashMap[category] = imageXhr(null, `${config.s3BucketUrl}/utils/${category}.svg`);
    });

    fetchImages();
  }, []);

  useEffect(() => {
    setMarkerDropdownOpen(false);
  }, [overlayLoaderState]);

  const handleClick = id => {
    onCategoryClick(id, 'Cluster Button');
  };

  const createList = list => {
    const listMarkup = list.map((category, i) => (
      <li key={category}>
        <button onClick={() => handleClick(category)}>
          <img
            className={`${styles['marker-list-category-icon']}`}
            src={thumbnailsMap[category]}
            alt="not found"
          />
          <span>{category}</span>
          <img
            className={`${styles['marker-list-arrow-icon']}`}
            src="https://3d-shopping.s3.amazonaws.com/shop-by-room-dev/utils/ico-arrow-dropdown.svg"
            alt="not found"
          />
        </button>
        {i < list.length - 1 && (
          <div className={`${styles['marker-list-category-separator']}`} />
        )}
      </li>
    ));
    return listMarkup;
  };

  return (
    <>
      {isMarkerDropdownOpen && (
        <div
          className={`${styles['marker-list-container']}`}
          style={{
            top: `${dropdownPosition?.y ? dropdownPosition.y - posY : 0}px`,
            left: `${dropdownPosition?.x ? dropdownPosition.x - posX : 0}px`,
          }}
        >
          {!isLoading && (
            <ul className={`${styles['marker-list']}`}>
              {createList(markerDropdownCategories)}
            </ul>
          )}
          <div className={`${styles['triangle-down']}`} />
        </div>
      )}
    </>
  );
};

MarkerPopupList.propTypes = {
  isMarkerDropdownOpen: PropTypes.bool.isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  dropdownPosition: PropTypes.instanceOf(Map).isRequired,
  setMarkerDropdownOpen: PropTypes.func.isRequired,
  markerDropdownCategories: PropTypes.instanceOf(Array).isRequired,
  overlayLoaderState: PropTypes.oneOf(['all', 'loader', 'overlay', 'none']).isRequired,
};

const mapStateToProps = state => ({
  isSettingOpen: state.interaction.get('isResetOpen'),
  isMarkerDropdownOpen: state.interaction.get('isMarkerDropdownOpen'),
  dropdownPosition: state.interaction.get('dropdownPosition'),
  markerDropdownCategories: state.interaction.get('markerDropdownCategories'),
});

const mapDispatchToProps = {
  onCategoryClick,
  setMarkerDropdownOpen,
};

export default connect(mapStateToProps, mapDispatchToProps)(MarkerPopupList);
