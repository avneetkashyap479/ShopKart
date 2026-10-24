import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="shopkart-footer pt-5">
      <div className="container-fluid px-lg-5">
        <div className="row g-4 pb-4">
          
          {/* Column 1: About */}
          <div className="col-6 col-md-3">
            <div className="footer-heading">ABOUT</div>
            <Link to="/about" className="footer-link">Contact Us</Link>
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/about" className="footer-link">Careers</Link>
            <Link to="/about" className="footer-link">ShopKart Stories</Link>
            <Link to="/about" className="footer-link">Press & Media</Link>
            <Link to="/about" className="footer-link">Corporate Information</Link>
          </div>

          {/* Column 2: Help */}
          <div className="col-6 col-md-3">
            <div className="footer-heading">HELP</div>
            <Link to="/help" className="footer-link">Payments</Link>
            <Link to="/help" className="footer-link">Shipping & Delivery</Link>
            <Link to="/help" className="footer-link">Cancellation & Returns</Link>
            <Link to="/help" className="footer-link">FAQ & Support</Link>
            <Link to="/help" className="footer-link">Report Infringement</Link>
          </div>

          {/* Column 3: Policy */}
          <div className="col-6 col-md-3">
            <div className="footer-heading">CONSUMER POLICY</div>
            <Link to="/policy" className="footer-link">Cancellation & Returns</Link>
            <Link to="/policy" className="footer-link">Terms Of Use</Link>
            <Link to="/policy" className="footer-link">Security</Link>
            <Link to="/policy" className="footer-link">Privacy Policy</Link>
            <Link to="/policy" className="footer-link">Sitemap</Link>
            <Link to="/policy" className="footer-link">EPR Compliance</Link>
          </div>

          {/* Column 4: Registered Office */}
          <div className="col-6 col-md-3">
            <div className="footer-heading">REGISTERED OFFICE ADDRESS</div>
            <p className="text-light small mb-2" style={{ lineHeight: '1.6' }}>
              ShopKart Internet Private Limited,<br />
              Buildings Alyssa, Begonia & Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103, Karnataka, India<br />
              CIN: U51109KA2026PTC066107
            </p>
            <div className="d-flex gap-3 mt-3 fs-5">
              <a href="#facebook" className="text-light"><i className="bi bi-facebook"></i></a>
              <a href="#twitter" className="text-light"><i className="bi bi-twitter-x"></i></a>
              <a href="#youtube" className="text-light"><i className="bi bi-youtube"></i></a>
              <a href="#instagram" className="text-light"><i className="bi bi-instagram"></i></a>
            </div>
          </div>

        </div>

        {/* Footer bottom bar */}
        <div className="footer-bottom d-flex flex-wrap align-items-center justify-content-between gap-3 text-secondary small">
          <div className="d-flex flex-wrap gap-4 align-items-center">
            <span className="text-white d-flex align-items-center gap-1">
              <i className="bi bi-shop text-warning"></i> Become a Seller
            </span>
            <span className="text-white d-flex align-items-center gap-1">
              <i className="bi bi-stars text-warning"></i> Advertise
            </span>
            <span className="text-white d-flex align-items-center gap-1">
              <i className="bi bi-gift text-warning"></i> Gift Cards
            </span>
            <span className="text-white d-flex align-items-center gap-1">
              <i className="bi bi-question-circle text-warning"></i> Help Center
            </span>
          </div>

          <div>
            <span>© 2026 ShopKart.com – Inspired by Flipkart shopping experience</span>
          </div>

          <div className="d-flex align-items-center gap-2 text-light fs-6">
            <span className="small text-secondary">100% Safe Payments:</span>
            <i className="bi bi-credit-card-2-front"></i>
            <i className="bi bi-shield-check text-success"></i>
            <span className="badge bg-secondary">UPI</span>
            <span className="badge bg-secondary">COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
