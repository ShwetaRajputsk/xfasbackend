// Mock data for XFas Logistics

export const carriers = [
  {
    id: 1,
    name: "DHL Express",
    logo: "/assets/images/carriers/dhl.png",
    services: ["Express Delivery", "Same Day", "International"]
  },
  {
    id: 2,
    name: "FedEx",
    logo: "/assets/images/carriers/fedex.jpg",
    services: ["Overnight", "Express", "Ground"]
  },
  {
    id: 3,
    name: "UPS",
    logo: "/assets/images/carriers/ups.jpeg",
    services: ["Next Day", "Express", "Standard"]
  },
  {
    id: 4,
    name: "Blue Dart",
    logo: "/assets/images/carriers/bluedart.png",
    services: ["Domestic Express", "International"]
  },
  {
    id: 5,
    name: "Aramex",
    logo: "/assets/images/carriers/arame.png",
    services: ["Express", "Logistics", "International"]
  },
  {
    id: 6,
    name: "DTDC",
    logo: "/assets/images/carriers/dtdc.png",
    services: ["Express", "Surface", "Cargo"]
  }
];

export const countries = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" }
];

export const services = [
  {
    id: 1,
    title: "Domestic Delivery",
    subtitle: "Within India - Starting from ₹45",
    description: "Fast and reliable delivery across India with same-day pickup from major cities",
    features: ["Same Day Pickup", "Real-time Tracking", "Cash on Delivery", "Insurance Coverage"],
    price: "Starting ₹45",
    deliveryTime: "1-3 Business Days",
    icon: "🏠"
  },
  {
    id: 2,
    title: "International Express",
    subtitle: "Worldwide - Starting from ₹850",
    description: "Express international delivery to 190+ countries with customs clearance support",
    features: ["Express Delivery", "Customs Support", "Door-to-Door", "Live Tracking"],
    price: "Starting ₹850",
    deliveryTime: "3-7 Business Days",
    icon: "✈️"
  },
  {
    id: 3,
    title: "Large & Heavy Parcels",
    subtitle: "Oversized Items - Starting from ₹120",
    description: "Specialized handling for large, heavy, and oversized parcels with freight options",
    features: ["Freight Services", "Special Handling", "Pallet Shipping", "White Glove Service"],
    price: "Starting ₹120",
    deliveryTime: "2-5 Business Days",
    icon: "📦"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    company: "E-commerce Store Owner",
    rating: 5,
    comment: "XFas Logistics has transformed our shipping process. The rates are competitive and delivery is always on time. Highly recommended for businesses!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Priya Sharma",
    company: "Small Business Owner",
    rating: 5,
    comment: "Amazing service! I've been using XFas for my international shipments to USA. The tracking is excellent and my customers are always happy.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Mohammad Ali",
    company: "Exporter",
    rating: 5,
    comment: "Best rates in the market for international shipping. The customs clearance support saves me so much time and hassle. 5 stars!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sneha Patel",
    company: "Individual Customer",
    rating: 4,
    comment: "Sent a surprise gift to my family in London. The parcel reached on time and in perfect condition. Great service!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  }
];

export const features = [
  {
    id: 1,
    title: "Multi-Carrier Network",
    description: "Compare rates from 15+ premium carriers including DHL, FedEx, UPS, and local partners",
    icon: "Network"
  },
  {
    id: 2,
    title: "Real-Time Tracking",
    description: "Track your shipments in real-time with SMS and email notifications at every step",
    icon: "MapPin"
  },
  {
    id: 3,
    title: "Customs Support",
    description: "Complete customs documentation and clearance support for international shipments",
    icon: "FileText"
  },
  {
    id: 4,
    title: "Secure Payments",
    description: "Multiple payment options including UPI, credit/debit cards, and net banking",
    icon: "CreditCard"
  },
  {
    id: 5,
    title: "Insurance Coverage",
    description: "Comprehensive insurance coverage up to ₹50,000 for peace of mind shipping",
    icon: "Shield"
  },
  {
    id: 6,
    title: "Business Solutions",
    description: "Dedicated account management and volume discounts for businesses and enterprises",
    icon: "Building"
  }
];

export const howItWorks = [
  {
    step: 1,
    title: "Get Quote",
    description: "Enter shipment details and get instant quotes from multiple carriers",
    icon: "Calculator"
  },
  {
    step: 2,
    title: "Book & Pay",
    description: "Select your preferred service and pay securely online",
    icon: "CreditCard"
  },
  {
    step: 3,
    title: "Schedule Pickup",
    description: "Schedule convenient pickup from your location or drop at nearby center",
    icon: "Clock"
  },
  {
    step: 4,
    title: "Track Delivery",
    description: "Monitor your shipment with real-time tracking and updates",
    icon: "MapPin"
  }
];

export const pricingData = [
  {
    carrier: "DHL Express",
    domestic: "₹89",
    international: "₹1,250",
    deliveryTime: "1-2 days",
    rating: 4.8
  },
  {
    carrier: "FedEx",
    domestic: "₹95",
    international: "₹1,180",
    deliveryTime: "1-3 days", 
    rating: 4.7
  },
  {
    carrier: "UPS",
    domestic: "₹85",
    international: "₹1,320",
    deliveryTime: "2-3 days",
    rating: 4.6
  },
  {
    carrier: "Blue Dart",
    domestic: "₹65",
    international: "₹980",
    deliveryTime: "1-2 days",
    rating: 4.5
  }
];

export const supportData = {
  phone: "011-47501136",
  email: "contact@xfas.in",
  whatsapp: "9821984141",
  address: "Madhuban Tower, A-200 Road no 4, Gali no 10, Mahipalpur, New Delhi 110037",
  hours: "Mon-Sat: 9 AM - 7 PM IST"
};