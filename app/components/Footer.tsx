"use client"
import Link from "next/link"
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaMapMarkerAlt, FaEnvelope, FaPhone, FaPaperPlane } from "react-icons/fa"
import { motion } from "framer-motion"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="relative text-white py-16 mt-auto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 z-0">
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSIxMjAiIHZpZXdCb3g9IjAgMCAxNDQwIDEyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwQzQ4MCA4MCAxMDAwIDgwIDE0NDAgMFYxMjBIMFYwWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] bg-repeat-x opacity-30"></div>
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-20"></div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute text-blue-300 opacity-10"
          style={{ fontSize: '120px', top: '10%', left: '5%' }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          ✓
        </motion.div>
        <motion.div 
          className="absolute text-blue-300 opacity-10"
          style={{ fontSize: '100px', top: '20%', right: '10%' }}
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          📋
        </motion.div>
        <motion.div 
          className="absolute text-blue-300 opacity-10"
          style={{ fontSize: '80px', bottom: '15%', left: '15%' }}
          animate={{ y: [0, 15, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          ⏱️
        </motion.div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-200 inline-block mb-2">
              Track Tec
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-cyan-300 mx-auto rounded-full mb-3"></div>
            <p className="text-blue-200 max-w-md mx-auto">
              Empowering businesses with innovative solutions for a connected future.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <h3 className="text-xl font-bold relative inline-block after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-blue-400 after:bottom-0 after:left-0">
              About Us
            </h3>
            <p className="text-blue-200 leading-relaxed">
              We provide cutting-edge tracking solutions that help businesses optimize operations and enhance productivity.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-800/30 p-2.5 rounded-full hover:bg-blue-600/50 transition-colors duration-300 flex items-center justify-center"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon size={20} className="text-blue-200" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold relative inline-block after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-blue-400 after:bottom-0 after:left-0">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ x: 5 }}>
                  <Link 
                    href={link.url} 
                    className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold relative inline-block after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-blue-400 after:bottom-0 after:left-0">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
                <span className="text-blue-200">123 Elsarhana Street, Hiyhya, Shriqia, Egypt</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-blue-300 flex-shrink-0" />
                <a href="mailto:amrsarhan1001@gmail.com" className="text-blue-200 hover:text-white transition-colors duration-300">
                  amrsarhan1001@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-blue-300 flex-shrink-0" />
                <a href="tel:+201029613028" className="text-blue-200 hover:text-white transition-colors duration-300">
                  (+20) 1029613028
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold relative inline-block after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-blue-400 after:bottom-0 after:left-0">
              Newsletter
            </h3>
            <p className="text-blue-200">
              Stay updated with our latest news and offers.
            </p>
            <form className="mt-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full p-3 pl-4 pr-12 rounded-lg bg-blue-900/50 border border-blue-700/50 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
                <motion.button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-md transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPaperPlane size={16} />
                </motion.button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative h-px w-full bg-blue-800/50 my-8 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        </div>

        <div className="text-center">
          <p className="text-blue-200">
            &copy; {currentYear} <span className="font-medium text-white">Track Tec</span>. All rights reserved.
          </p>
          <div className="mt-4 text-sm text-blue-300/70 flex justify-center space-x-6">
            <Link href="/privacy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-300">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white transition-colors duration-300">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Data arrays for cleaner JSX
const socialLinks = [
  { name: 'Facebook', icon: FaFacebook, url: 'https://facebook.com' },
  { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com' },
  { name: 'LinkedIn', icon: FaLinkedin, url: 'https://linkedin.com' },
  { name: 'Instagram', icon: FaInstagram, url: 'https://instagram.com' },
]

const quickLinks = [
  { name: 'About Us', url: '/about' },
  { name: 'Services', url: '/services' },
  { name: 'Blog', url: '/blog' },
  { name: 'Contact', url: '/contact' },
  { name: 'FAQ', url: '/faq' },
]