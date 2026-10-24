import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const CategoryRibbon = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.warn('Failed to load categories ribbon:', err.message);
      }
    };
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="category-ribbon">
      <div className="container-fluid px-lg-4">
        <div className="d-flex align-items-center justify-content-between overflow-x-auto pb-1 gap-2 gap-md-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="category-item flex-shrink-0"
            >
              <div className="category-icon-wrapper shadow-sm">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="category-icon-img"
                />
              </div>
              <span className="category-label text-truncate" style={{ maxWidth: '90px' }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryRibbon;
