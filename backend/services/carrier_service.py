from typing import List, Dict, Optional
import httpx
import asyncio
import math
from datetime import datetime

from models.quote import CarrierQuote, QuoteRequest
from services.priority_connections_service import PriorityConnectionsService

class CarrierService:
    """Service for integrating with various carrier APIs."""
    
    def __init__(self):
        # In production, these would be loaded from environment variables
        self.carrier_configs = {
            "DHL": {
                "api_key": "dhl_api_key",
                "base_url": "https://api.dhl.com",
                "enabled": False  # Disable until we have real API keys
            },
            "FedEx": {
                "api_key": "fedex_api_key", 
                "base_url": "https://apis.fedex.com",
                "enabled": False
            },
            "UPS": {
                "api_key": "ups_api_key",
                "base_url": "https://onlinetools.ups.com",
                "enabled": False
            }
        }
        
        # Initialize Priority Connections service
        self.priority_connections = PriorityConnectionsService()
    
    async def get_dhl_quote(self, request: QuoteRequest) -> Optional[CarrierQuote]:
        """Get quote from DHL API."""
        if not self.carrier_configs["DHL"]["enabled"]:
            return None
            
        try:
            # DHL API integration would go here
            # For now, return None to use mock data
            return None
        except Exception as e:
            print(f"DHL API error: {e}")
            return None
    
    async def get_fedex_quote(self, request: QuoteRequest) -> Optional[CarrierQuote]:
        """Get quote from FedEx API."""
        if not self.carrier_configs["FedEx"]["enabled"]:
            return None
            
        try:
            # FedEx API integration would go here
            return None
        except Exception as e:
            print(f"FedEx API error: {e}")
            return None
    
    async def get_ups_quote(self, request: QuoteRequest) -> Optional[CarrierQuote]:
        """Get quote from UPS API.""" 
        if not self.carrier_configs["UPS"]["enabled"]:
            return None
            
        try:
            # UPS API integration would go here
            return None
        except Exception as e:
            print(f"UPS API error: {e}")
            return None
    
    async def track_shipment(self, carrier: str, tracking_number: str) -> Dict:
        """Track shipment with carrier API."""
        
        if carrier.lower() == "dhl":
            return await self._track_dhl(tracking_number)
        elif carrier.lower() == "fedex":
            return await self._track_fedex(tracking_number)
        elif carrier.lower() == "ups":
            return await self._track_ups(tracking_number)
        else:
            # Return mock tracking data
            return {
                "tracking_number": tracking_number,
                "status": "In Transit",
                "location": "New Delhi, India",
                "estimated_delivery": "2025-01-02",
                "events": [
                    {
                        "timestamp": "2025-01-01T10:00:00Z",
                        "status": "Picked up",
                        "location": "New Delhi Hub"
                    }
                ]
            }
    
    async def _track_dhl(self, tracking_number: str) -> Dict:
        """Track DHL shipment."""
        # DHL tracking API integration
        return {}
    
    async def _track_fedex(self, tracking_number: str) -> Dict:
        """Track FedEx shipment."""
        # FedEx tracking API integration
        return {}
    
    async def _track_ups(self, tracking_number: str) -> Dict:
        """Track UPS shipment."""
        # UPS tracking API integration
        return {}
    
    async def get_priority_connections_quotes(self, request: QuoteRequest) -> List[CarrierQuote]:
        """Get quotes from Priority Connections API."""
        try:
            # DEBUG: Log the incoming request
            print(f"DEBUG: Received quote request:")
            print(f"  Weight: {request.weight}kg")
            print(f"  Length: {request.length}")
            print(f"  Width: {request.width}")
            print(f"  Height: {request.height}")
            print(f"  Shipment type: {request.shipment_type}")
            
            # Get country name from request - handle both old ISO codes and new format
            if len(request.to_country) <= 3:
                # Old ISO code format - use mapping
                country_name = self._get_country_name(request.to_country)
            else:
                # New format - convert back to country name
                country_name = request.to_country.replace('_', ' ').title()
                
                # Handle special cases for truncated names
                if country_name == 'United Kin':
                    country_name = 'United Kingdom'
                elif country_name == 'United Sta':
                    country_name = 'United States Of America'
                elif country_name == 'Russian Fe':
                    country_name = 'Russian Federation, The'
                elif country_name == 'Czech Repu':
                    country_name = 'Czech Republic, The'
                elif 'Peoples' in country_name:
                    country_name = country_name.replace('Peoples', "People's")
                elif 'Divoire' in country_name:
                    country_name = "Cote D'ivoire"
            
            if not country_name:
                return []
            
            # Calculate chargeable weight (higher of actual weight or volumetric weight)
            chargeable_weight = max(request.weight, 0.5)  # Minimum 0.5kg
            
            # Calculate volumetric weight if dimensions are provided
            if request.length and request.width and request.height:
                volumetric_weight = (request.length * request.width * request.height) / 5000  # cm³ to kg
                volumetric_weight = math.ceil(volumetric_weight)  # Round up to next whole number
                chargeable_weight = max(chargeable_weight, volumetric_weight)
                chargeable_weight = math.ceil(chargeable_weight)  # Round up to next whole number
                print(f"✅ Volumetric weight calculation: {request.length}x{request.width}x{request.height} = {volumetric_weight}kg (rounded up)")
                print(f"✅ Chargeable weight: {chargeable_weight}kg (higher of {request.weight}kg actual vs {volumetric_weight}kg volumetric)")
            else:
                print(f"⚠️  No dimensions provided, using actual weight: {chargeable_weight}kg")
            
            print(f"🌍 Requesting quotes for {country_name} with {chargeable_weight}kg")
            
            # Get quotes from Priority Connections using chargeable weight
            pc_quotes = await self.priority_connections.get_quote_for_destination(
                country_name=country_name,
                weight=chargeable_weight,  # Use chargeable weight instead of just actual weight
                parcel_type=request.shipment_type.title()
            )
            
            # Convert to CarrierQuote objects
            carrier_quotes = []
            for quote_data in pc_quotes:
                try:
                    # Calculate volumetric weight if dimensions were provided
                    volumetric_weight = None
                    if request.length and request.width and request.height:
                        volumetric_weight = (request.length * request.width * request.height) / 5000
                        volumetric_weight = math.ceil(volumetric_weight)  # Round up to next whole number
                    
                    # Determine chargeable weight (higher of actual or volumetric)
                    actual_weight = request.weight
                    chargeable_weight = max(actual_weight, volumetric_weight) if volumetric_weight else actual_weight
                    chargeable_weight = math.ceil(chargeable_weight)  # Round up to next whole number
                    
                    print(f"💰 Quote weight details: actual={actual_weight}kg, volumetric={volumetric_weight}kg, chargeable={chargeable_weight}kg")
                    
                    carrier_quote = CarrierQuote(
                        carrier_name=quote_data['provider_name'],
                        service_name=quote_data['service_name'],
                        service_level=quote_data['service_type'].lower(),
                        base_rate=quote_data['base_rate'],
                        fuel_surcharge=quote_data['fuel_surcharge'],
                        insurance_cost=0,  # Will be calculated separately if needed
                        additional_fees=quote_data['handling_fee'],
                        total_cost=quote_data['total_cost'],
                        estimated_delivery_days=quote_data['delivery_days'],
                        estimated_delivery_date=datetime.fromisoformat(quote_data['estimated_delivery'].replace('Z', '+00:00')),
                        features=quote_data['features'],
                        rate_id=f"pc_{quote_data['provider_name']}_{request.to_country}_{chargeable_weight}",
                        # Add weight information for frontend display - ensure they're always set
                        weight=actual_weight,
                        chargeable_weight=chargeable_weight,
                        volumetric_weight=volumetric_weight if volumetric_weight else 0.0
                    )
                    carrier_quotes.append(carrier_quote)
                except Exception as e:
                    print(f"Error converting Priority Connections quote: {e}")
                    continue
            
            return carrier_quotes
            
        except Exception as e:
            print(f"Priority Connections API error: {e}")
            return []
    
    def _get_country_name(self, country_code: str) -> Optional[str]:
        """Convert country code to country name for Priority Connections API."""
        # Comprehensive ISO 3166-1 alpha-2 country code mapping
        country_mapping = {
            'AD': 'Andorra',
            'AE': 'United Arab Emirates',
            'AF': 'Afghanistan',
            'AG': 'Antigua',
            'AI': 'Anguilla',
            'AL': 'Albania',
            'AM': 'Armenia',
            'AN': 'Netherlands Antilles',
            'AO': 'Angola',
            'AR': 'Argentina',
            'AS': 'American Samoa',
            'AT': 'Austria',
            'AU': 'Australia',
            'AW': 'Aruba',
            'AZ': 'Azerbaijan',
            'BA': 'Bosnia And Herzegovina',
            'BB': 'Barbados',
            'BD': 'Bangladesh',
            'BE': 'Belgium',
            'BF': 'Burkina Faso',
            'BG': 'Bulgaria',
            'BH': 'Bahrain',
            'BI': 'Burundi',
            'BJ': 'Benin',
            'BL': 'St Barthelemy',
            'BM': 'Bermuda',
            'BN': 'Brunei',
            'BO': 'Bolivia',
            'BQ': 'Bonaire',
            'BR': 'Brazil',
            'BS': 'Bahamas',
            'BT': 'Bhutan',
            'BW': 'Botswana',
            'BY': 'Belarus',
            'BZ': 'Belize',
            'CA': 'Canada',
            'CD': 'Congo, The Democratic Republic',
            'CF': 'Central African Republic',
            'CG': 'Congo',
            'CH': 'Switzerland',
            'CI': 'Cote D\'ivoire',
            'CK': 'Cook Islands',
            'CL': 'Chile',
            'CM': 'Cameroon',
            'CN': 'China, People\'s Republic',
            'CO': 'Colombia',
            'CR': 'Costa Rica',
            'CU': 'Cuba',
            'CV': 'Cape Verde',
            'CW': 'Curacao',
            'CY': 'Cyprus',
            'CZ': 'Czech Republic, The',
            'DE': 'Germany',
            'DJ': 'Djibouti',
            'DK': 'Denmark',
            'DM': 'Dominica',
            'DO': 'Dominican Republic',
            'DZ': 'Algeria',
            'EC': 'Ecuador',
            'EE': 'Estonia',
            'EG': 'Egypt',
            'EH': 'Western Sahara',
            'ER': 'Eritrea',
            'ES': 'Spain',
            'ET': 'Ethiopia',
            'FI': 'Finland',
            'FJ': 'Fiji',
            'FK': 'Falkland Islands',
            'FM': 'Micronesia, Federated States Of',
            'FO': 'Faroe Islands',
            'FR': 'France',
            'GA': 'Gabon',
            'GB': 'United Kingdom',
            'GD': 'Grenada',
            'GE': 'Georgia',
            'GF': 'French Guyana',
            'GG': 'Guernsey',
            'GH': 'Ghana',
            'GI': 'Gibraltar',
            'GL': 'Greenland',
            'GM': 'Gambia',
            'GN': 'Guinea Republic',
            'GP': 'Guadeloupe',
            'GQ': 'Equatorial Guinea',
            'GR': 'Greece',
            'GT': 'Guatemala',
            'GU': 'Guam',
            'GW': 'Guinea-Bissau',
            'GY': 'Guyana (British)',
            'HK': 'Hong Kong',
            'HN': 'Honduras',
            'HR': 'Croatia',
            'HT': 'Haiti',
            'HU': 'Hungary',
            'IC': 'Canary Islands, The',
            'ID': 'Indonesia',
            'IE': 'Ireland, Republic Of',
            'IL': 'Israel',
            'IN': 'India',
            'IQ': 'Iraq',
            'IR': 'Iran (Islamic Republic Of)',
            'IS': 'Iceland',
            'IT': 'Italy',
            'JE': 'Jersey',
            'JM': 'Jamaica',
            'JO': 'Jordan',
            'JP': 'Japan',
            'KE': 'Kenya',
            'KG': 'Kyrgyzstan',
            'KH': 'Cambodia',
            'KI': 'Kiribati',
            'KM': 'Comoros',
            'KN': 'St Kitts',
            'KP': 'Korea, The D.P.R Of',
            'KR': 'Korea, Republic Of',
            'KW': 'Kuwait',
            'KY': 'Cayman Islands',
            'KZ': 'Kazakhstan',
            'LA': 'Lao People\'s Democratic Republic',
            'LB': 'Lebanon',
            'LI': 'Liechtenstein',
            'LK': 'Sri Lanka',
            'LR': 'Liberia',
            'LS': 'Lesotho',
            'LT': 'Lithuania',
            'LU': 'Luxembourg',
            'LV': 'Latvia',
            'LY': 'Libya',
            'MA': 'Morocco',
            'MC': 'Monaco',
            'MD': 'Moldova, Republic Of',
            'ME': 'Montenegro, Republic Of',
            'MG': 'Madagascar',
            'MH': 'Marshall Islands',
            'MK': 'Macedonia, Republic Of',
            'ML': 'Mali',
            'MM': 'Myanmar',
            'MN': 'Mongolia',
            'MO': 'Macau',
            'MP': 'Saipan',
            'MQ': 'Martinique',
            'MR': 'Mauritania',
            'MS': 'Montserrat',
            'MT': 'Malta',
            'MU': 'Mauritius',
            'MV': 'Maldives',
            'MW': 'Malawi',
            'MX': 'Mexico',
            'MY': 'Malaysia',
            'MZ': 'Mozambique',
            'NA': 'Namibia',
            'NC': 'New Caledonia',
            'NE': 'Niger',
            'NG': 'Nigeria',
            'NI': 'Nicaragua',
            'NL': 'Netherlands, The',
            'NO': 'Norway',
            'NP': 'Nepal',
            'NR': 'Nauru, Republic Of',
            'NU': 'Niue',
            'NZ': 'New Zealand',
            'OM': 'Oman',
            'PA': 'Panama',
            'PE': 'Peru',
            'PF': 'Tahiti',
            'PG': 'Papua New Guinea',
            'PH': 'Philippines, The',
            'PK': 'Pakistan',
            'PL': 'Poland',
            'PR': 'Puerto Rico',
            'PT': 'Portugal',
            'PW': 'Palau',
            'PY': 'Paraguay',
            'QA': 'Qatar',
            'RE': 'Reunion, Island Of',
            'RO': 'Romania',
            'RS': 'Serbia, Republic Of',
            'RU': 'Russian Federation, The',
            'RW': 'Rwanda',
            'SA': 'Saudi Arabia',
            'SB': 'Solomon Islands',
            'SC': 'Seychelles',
            'SD': 'Sudan',
            'SE': 'Sweden',
            'SG': 'Singapore',
            'SH': 'Saint Helena',
            'SI': 'Slovenia',
            'SK': 'Slovakia',
            'SL': 'Sierra Leone',
            'SM': 'San Marino',
            'SN': 'Senegal',
            'SO': 'Somalia',
            'SR': 'Suriname',
            'SS': 'South Sudan',
            'ST': 'Sao Tome And Principe',
            'SV': 'El Salvador',
            'SX': 'St Maarten',
            'SY': 'Syria',
            'SZ': 'Swaziland',
            'TC': 'Turks & Caicos Islands',
            'TD': 'Chad',
            'TG': 'Togo',
            'TH': 'Thailand',
            'TJ': 'Tajikistan',
            'TM': 'Turkmenistan',
            'TN': 'Tunisia',
            'TO': 'Tonga',
            'TR': 'Turkey',
            'TT': 'Trinidad & Tobago',
            'TV': 'Tuvalu',
            'TW': 'Taiwan',
            'TZ': 'Tanzania',
            'UA': 'Ukraine',
            'UG': 'Uganda',
            'UK': 'United Kingdom',
            'US': 'United States Of America',
            'UY': 'Uruguay',
            'UZ': 'Uzbekistan',
            'VC': 'Saint Vincent',
            'VE': 'Venezuela',
            'VG': 'British Virgin Islands',
            'VI': 'U.S. Virgin Islands',
            'VN': 'Vietnam',
            'VU': 'Vanuatu',
            'WS': 'Samoa',
            'XE': 'St Eustatius',
            'XK': 'Kosovo',
            'XS': 'Somaliland, Rep Of (North Somalia)',
            'YE': 'Yemen, Republic Of',
            'YT': 'Mayotte',
            'ZA': 'South Africa',
            'ZM': 'Zambia',
            'ZW': 'Zimbabwe'
        }
        
        return country_mapping.get(country_code.upper())
    
    async def get_xfas_network_quotes(self, request: QuoteRequest) -> List[CarrierQuote]:
        """Get quotes from XFas Self Network API (to be implemented)."""
        # TODO: Implement XFas Self Network API integration
        # This method should be implemented when XFas API is available
        try:
            # Placeholder for XFas Self Network API
            # xfas_quotes = await self.xfas_api.get_quotes(request)
            # return self._convert_xfas_quotes(xfas_quotes)
            return []
        except Exception as e:
            print(f"XFas Self Network API error: {e}")
            return []
    
    async def get_priority_connections_countries(self) -> List[Dict]:
        """Get list of countries served by Priority Connections."""
        try:
            return await self.priority_connections.get_served_countries()
        except Exception as e:
            print(f"Error getting Priority Connections countries: {e}")
            return []
    
    async def get_priority_connections_providers(self, country_name: str = None) -> List[Dict]:
        """Get list of providers available through Priority Connections."""
        try:
            if country_name:
                return await self.priority_connections.get_country_providers(country_name)
            else:
                return await self.priority_connections.get_all_providers()
        except Exception as e:
            print(f"Error getting Priority Connections providers: {e}")
            return []
        """Create shipment with carrier API."""
        
        # Mock shipment creation
        return {
            "success": True,
            "tracking_number": f"XF{carrier[:3].upper()}{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "carrier_reference": f"REF_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "estimated_delivery": "2025-01-05",
            "label_url": "https://example.com/label.pdf"
        }