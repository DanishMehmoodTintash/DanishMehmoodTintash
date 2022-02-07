import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from 'react-loader-spinner';

import {
  onCategoryClick,
  onItemDetailsClick,
  onBackButtonClick,
  onFiltersClick,
} from 'actions/interaction';
import { selectItem, removeItem } from 'actions/collection';

import CategoriesList from 'components/CategoriesList';
import ProductsList from 'components/ProductsList';
import ProductDetailsPage from 'components/ProductDetailsPage';
import ShoppingList from 'components/ShoppingList';
import FiltersPage from 'components/FiltersPage';
import CuratedRoom from 'components/CuratedRoom';

import styles from 'styles/SidebarContent.module.scss';

const SidebarContainer = ({
  sidebarComponent,
  closeSidebar,
  selectItem,
  removeItem,
  onCategoryClick,
  onItemDetailsClick,
  onBackButtonClick,
  onFiltersClick,
}) => {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    switch (sidebarComponent) {
      case 'CategoriesList':
        return setComponent(CategoriesList);
      case 'ProductsList':
        return setComponent(ProductsList);
      case 'ProductDetailsPage':
        return setComponent(ProductDetailsPage);
      case 'ShoppingList':
        return setComponent(ShoppingList);
      case 'FiltersPage':
        return setComponent(FiltersPage);
      case 'CuratedRoom':
        return setComponent(CuratedRoom);
      default:
        return setComponent(null);
    }
  }, [sidebarComponent]);

  return (
    <>
      <Loader
        className={styles['category-loader']}
        type="TailSpin"
        color="#313131"
        visible={false}
        height={100}
        width={100}
      />
      {Component && (
        <div className={styles['sidebar-content-container']}>
          <Component
            styles={styles}
            onCategoryClick={onCategoryClick}
            onItemDetailsClick={onItemDetailsClick}
            onBackButtonClick={onBackButtonClick}
            onFiltersClick={onFiltersClick}
            closeSidebar={closeSidebar}
            onItemClick={selectItem}
            onItemRemove={removeItem}
          />
        </div>
      )}
    </>
  );
};

SidebarContainer.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  selectItem: PropTypes.func.isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  onItemDetailsClick: PropTypes.func.isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  onFiltersClick: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  sidebarComponent: PropTypes.string,
};

SidebarContainer.defaultProps = {
  sidebarComponent: null,
};

const mapStateToProps = state => ({
  sidebarComponent: state.interaction.get('sidebarComponent'),
});

const mapDispatchToProps = {
  selectItem,
  onCategoryClick,
  onItemDetailsClick,
  onBackButtonClick,
  onFiltersClick,
  removeItem,
};

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContainer);
