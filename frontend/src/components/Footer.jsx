// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin,
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Shield,
  Truck,
  RotateCcw,
  CreditCard,
  DollarSign,
  Heart,
  ShoppingBag,
  Star
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us' },
    { name: 'Contact Us' },
    { name: 'Track Order' },
    { name: 'Returns & Refunds'},
    { name: 'FAQs'},
    { name: 'Blog'},
  ];

  const shopLinks = [
    { name: 'Men\'s Fashion', path: '/products?categories=menswear' },
    { name: 'Women\'s Fashion', path: '/products?categories=womenwear' },
    { name: 'Electronics', path: '/products?categories=electronics' },
    { name: 'Footwear', path: '/products?categories=footwear' },
    { name: 'Beauty', path: '/products?categories=beauty' },
    { name: 'Watches', path: '/products?categories=watches' },
  ];

  const policyLinks = [
    { name: 'Privacy Policy' },
    { name: 'Terms of Service' },
    { name: 'Shipping Policy' },
    { name: 'Cancellation Policy' },
    { name: 'Security Policy' },
    { name: 'Seller Agreement'},
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: 'hover:text-pink-600' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com', color: 'hover:text-blue-400' },
    { name: 'Youtube', icon: Youtube, url: 'https://youtube.com', color: 'hover:text-red-600' },
    { name: 'Linkedin', icon: Linkedin, url: 'https://linkedin.com', color: 'hover:text-blue-700' },
  ];

  

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
        
        {/* Top Section with Newsletter */}
        <div className="border-b border-gray-800 pb-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-gray-400">Get the latest updates on new products and upcoming sales</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold">CartEase</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Your one-stop destination for fashion, electronics, beauty, and more. 
              Shop with confidence with our secure payment and fast delivery.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>123 Business Park, Mumbai, India - 400001</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-orange-500" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-orange-500" />
                <span>support@cartease.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Mon-Sat: 10AM - 7PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop By Category */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Shop By Category</h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies & Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Policies & Support</h4>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      

        {/* Payment Methods & Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
         
          
          <div className="text-left md:text-left">
            <h4 className="font-semibold text-sm mb-3">Follow Us</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all ${social.color}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-gray-400 text-center md:text-left">
              © {currentYear} CartEase. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link  className="text-gray-400 hover:text-orange-500 transition-colors text-xs">
                Privacy Policy
              </Link>
              <Link  className="text-gray-400 hover:text-orange-500 transition-colors text-xs">
                Terms of Use
              </Link>
              <Link className="text-gray-400 hover:text-orange-500 transition-colors text-xs">
                Sitemap
              </Link>
            </div>
            <div className="text-gray-400 text-xs">
              Made with <Heart className="h-3 w-3 inline text-red-500" /> in India
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;