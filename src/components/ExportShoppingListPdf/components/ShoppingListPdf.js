import React from 'react';
import { useSelector } from 'react-redux';

import config from 'config';

import styles from 'styles/ExportPdf.module.scss';

const ShoppingListPdf = React.forwardRef((props, ref) => {
  const selectedItemsMap = useSelector(state => state.collection.get('selectedItemsMap'));
  const [...categories] = selectedItemsMap.keys();
  const sortedCategories = [
    ...categories.filter(category => !!selectedItemsMap.get(category)),
    ...categories.filter(category => !selectedItemsMap.get(category)),
  ];
  const isMobile = window.innerWidth <= 600;
  const pageBreak = 10;

  const displayHeading = pdf => {
    return (
      <h1 className={`${styles['main-heading']} ${pdf && styles['main-heading-pdf']}`}>
        Your Selected Items
      </h1>
    );
  };

  return (
    <div className={styles['shopping-list-container']}>
      <div className={styles['collapse-container']}>
        <div className={styles['print-content-container']} ref={ref}>
          {displayHeading(true)}
          <div className={`${styles['table-headers']} ${styles['table-headers-pdf']}`}>
            <ul>
              <li className={styles['table-img']}>Image</li>
              <li className={styles['table-brand']}>Brand</li>
              <li className={styles['table-itemname']}>Item Name</li>
              <li className={styles['table-price']}>Price</li>
            </ul>
          </div>
          <div className={styles['table-container-pdf']}>
            <table className={styles['item-table']}>
              <tbody>
                {sortedCategories.map((category, index) => {
                  const item = selectedItemsMap.get(category);
                  return (
                    item && (
                      <tr>
                        <td
                          className={`${styles['table-img']} ${
                            styles['column-padding']
                          } ${index === pageBreak && styles['page-break-image']}`}
                        >
                          <img
                            alt={item.get('name')}
                            src={`${config.baseUrl}/${item.get('thumbnail')}`}
                          />
                        </td>
                        <td
                          className={`${styles['table-brand']} ${
                            styles['column-padding']
                          } ${index === pageBreak && styles['page-break']}`}
                        >
                          {item.get('brand')}
                        </td>
                        <td
                          className={`${styles['table-itemname']} ${
                            styles['column-padding']
                          } ${index === pageBreak && styles['page-break']}`}
                        >
                          {item.get('name')}
                        </td>
                        <td
                          className={`${styles['table-price']} ${
                            styles['column-padding']
                          } ${index === pageBreak && styles['page-break']}`}
                        >
                          {item.get('price') ? `$${item.get('price').toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    )
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!isMobile && (
        <div className={styles['desktop-container']}>
          {displayHeading(false)}
          <div className={styles['table-headers']}>
            <ul>
              <li className={styles['table-img']}>Image</li>
              <li className={styles['table-brand']}>Brand</li>
              <li className={styles['table-itemname']}>Item Name</li>
              <li className={styles['table-price']}>Price</li>
            </ul>
          </div>
          <div className={styles['content-container']}>
            <div className={styles['table-container']}>
              <table className={styles['item-table']}>
                <tbody>
                  {sortedCategories.map(category => {
                    const item = selectedItemsMap.get(category);
                    return (
                      item && (
                        <tr>
                          <td
                            className={`${styles['table-img']} ${styles['column-padding']}`}
                          >
                            <img
                              alt={item.get('name')}
                              src={`${config.baseUrl}/${item.get('thumbnail')}`}
                            />
                          </td>
                          <td
                            className={`${styles['table-brand']} ${styles['column-padding']}`}
                          >
                            {item.get('brand')}
                          </td>
                          <td
                            className={`${styles['table-itemname']} ${styles['column-padding']}`}
                          >
                            {item.get('name')}
                          </td>
                          <td
                            className={`${styles['table-price']} ${styles['column-padding']}`}
                          >
                            {item.get('price') ? `$${item.get('price').toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      )
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {isMobile && (
        <div className={styles['mobile-main-container']}>
          {displayHeading(false)}
          <div className={styles['mobile-container']}>
            <div className={styles['mobile-content-container']}>
              {sortedCategories.map(category => {
                const item = selectedItemsMap.get(category);
                return (
                  item && (
                    <div className={styles['mobile-item-container']}>
                      <img
                        alt={item.get('name')}
                        src={`${config.baseUrl}/${item.get('thumbnail')}`}
                      />
                      <div className={styles['mobile-item-info']}>
                        <p className={styles['mobile-item-brand']}>{item.get('brand')}</p>
                        <p className={styles['mobile-item-name']}>{item.get('name')}</p>
                        <p>
                          {item.get('price') ? `$${item.get('price').toFixed(2)}` : '-'}
                        </p>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ShoppingListPdf;
