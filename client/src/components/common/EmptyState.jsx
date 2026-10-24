import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = 'bi-search',
  title = 'No items found',
  description = 'Try checking your spelling or adjusting your filters',
  actionText = 'Browse All Products',
  actionLink = '/products',
  onActionClick
}) => {
  return (
    <div className="bg-white rounded-3 shadow-sm p-5 text-center my-4">
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary mb-3"
        style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <h4 className="fw-bold mb-2">{title}</h4>
      <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {onActionClick ? (
        <button className="btn btn-shopkart-primary px-4 fw-semibold" onClick={onActionClick}>
          {actionText}
        </button>
      ) : actionLink ? (
        <Link to={actionLink} className="btn btn-shopkart-primary px-4 fw-semibold">
          {actionText}
        </Link>
      ) : null}
    </div>
  );
};

export default EmptyState;
