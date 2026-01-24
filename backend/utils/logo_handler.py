"""
Logo Handler Utility
Handles logo loading from multiple sources for PDF generation
"""

import os
import base64
from io import BytesIO
from reportlab.platypus import Image
from reportlab.lib.units import inch
import logging

logger = logging.getLogger(__name__)

class LogoHandler:
    """Handle logo loading from various sources"""
    
    def __init__(self):
        self.logo_paths = [
            # Try relative paths first (for deployed environments)
            "assets/images/xfas-logo.png",
            "static/images/xfas-logo.png",
            "public/assets/images/xfas-logo.png",
            "../frontend/public/assets/images/xfas-logo.png",
            # Try absolute paths (for local development)
            "/Users/shweta/x-fas folder/X-fas new copy/frontend/public/assets/images/xfas-logo.png",
            # Try current directory
            "./xfas-logo.png",
            "./assets/images/xfas-logo.png",
        ]
        
        # Base64 encoded fallback logo (small XFas logo)
        self.fallback_logo_base64 = """
        iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
        """
    
    def get_logo_image(self, width=2*inch, height=0.8*inch):
        """
        Get logo image for PDF generation
        
        Args:
            width: Logo width in reportlab units
            height: Logo height in reportlab units
            
        Returns:
            Image object or text fallback
        """
        # Try to load from file paths
        for logo_path in self.logo_paths:
            if os.path.exists(logo_path):
                try:
                    logger.info(f"Loading logo from: {logo_path}")
                    logo = Image(logo_path, width=width, height=height)
                    logo.hAlign = 'LEFT'
                    return logo
                except Exception as e:
                    logger.warning(f"Failed to load logo from {logo_path}: {str(e)}")
                    continue
        
        # Try to create logo from base64 (if we had a real base64 logo)
        try:
            return self._create_text_logo()
        except Exception as e:
            logger.error(f"Failed to create fallback logo: {str(e)}")
            return "XFas\nPromises Delivered!"
    
    def _create_text_logo(self):
        """Create a text-based logo as fallback"""
        return "XFas Logistics\nPromises Delivered!"
    
    def get_logo_for_table(self, width=1.5*inch, height=0.6*inch):
        """Get logo specifically sized for table cells"""
        return self.get_logo_image(width=width, height=height)

# Global instance
logo_handler = LogoHandler()

def get_logo_image(width=2*inch, height=0.8*inch):
    """Convenience function to get logo image"""
    return logo_handler.get_logo_image(width=width, height=height)

def get_table_logo(width=1.5*inch, height=0.6*inch):
    """Convenience function to get table-sized logo"""
    return logo_handler.get_logo_for_table(width=width, height=height)