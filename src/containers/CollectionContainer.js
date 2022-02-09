import React, { useEffect, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from 'react-loader-spinner';
import { useLocation, useHistory } from 'react-router-dom';

import storageService from 'helpers/storageService';
import { extractObjectFromBase64 } from 'helpers/shareUtils';

import { fetchAllCollections, setCurrentBrand } from 'actions/experience';
import { goToCollection, setCurrentCollection } from 'actions/collection';

import Collection from 'components/Collection';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const CollectionContainer = ({
  currentId,
  fetchAllCollections,
  goToCollection,
  setCurrentBrand,
  setCurrentCollection,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const query = useQuery();
  const history = useHistory();

  useLayoutEffect(() => {
    const checkBrand = () => {
      const brand = query.get('brand');
      if (brand) {
        setCurrentBrand(brand);
        storageService().session.setItem('brand', brand);
      }
    };

    const loadCollection = async () => {
      const hex = query.get('hex');
      const id = Number(
        query.get('roomId') || storageService().session.getItem('collectionId') || 1
      );

      query.delete('roomId');
      query.delete('hex');

      history.replace({ search: query.toString() });

      const overloadState = {};
      if (hex) {
        storageService().session.setItem('tooltipStatus', false);
        overloadState.currentImagesMap = extractObjectFromBase64(hex, id);
      } else {
        const tooltipStatus = storageService().session.getItem('tooltipStatus');
        if (tooltipStatus !== 'false') {
          storageService().session.setItem('tooltipStatus', true);
        }
      }

      if (id) goToCollection(id, overloadState);

      setIsLoading(false);
      await fetchAllCollections();
      setCurrentCollection(id);
    };

    checkBrand();
    loadCollection();
  }, []);

  useEffect(() => {
    console.log('Loading room with id:', currentId);
  }, [currentId]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }, []);

  if (isLoading)
    return (
      <div className="app-loader">
        <Loader color="#147bd1" type="TailSpin" />
      </div>
    );

  return <Collection />;
};

CollectionContainer.propTypes = {
  fetchAllCollections: PropTypes.func.isRequired,
  goToCollection: PropTypes.func.isRequired,
  setCurrentBrand: PropTypes.func.isRequired,
  setCurrentCollection: PropTypes.func.isRequired,
  currentId: PropTypes.number,
};

CollectionContainer.defaultProps = {
  currentId: null,
};

const mapStateToProps = state => ({
  currentId: state.collection.get('currentId'),
});

const mapDispatchToProps = {
  fetchAllCollections,
  goToCollection,
  setCurrentBrand,
  setCurrentCollection,
};

export default connect(mapStateToProps, mapDispatchToProps)(CollectionContainer);
