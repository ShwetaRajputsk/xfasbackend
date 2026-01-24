import httpx
import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import logging
import ssl

logger = logging.getLogger(__name__)

class PriorityConnectionsService:
    """Service for integrating with Priority Connections APIs."""
    
    def __init__(self):
        self.base_url = "https://app.priorityconnections.in/api/public"
        self.timeout = 30.0
        # Create SSL context that doesn't verify certificates (for development)
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE
        
    async def get_countries_with_providers(self) -> List[Dict[str, Any]]:
        """Get all countries and their associated suppliers/providers."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout, verify=False) as client:
                response = await client.get(f"{self.base_url}/countryproviders")
                response.raise_for_status()
                data = response.json()
                return data.get('data', []) if isinstance(data, dict) else data
        except Exception as e:
            logger.error(f"Error fetching countries with providers: {e}")
            return []
    
    async def get_all_providers(self) -> List[Dict[str, Any]]:
        """Get all providers available in the system."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout, verify=False) as client:
                response = await client.get(f"{self.base_url}/getinternationalrateprovider")
                response.raise_for_status()
                data = response.json()
                providers_list = data.get('data', []) if isinstance(data, dict) else data
                
                # Convert string list to dict format for consistency
                if providers_list and isinstance(providers_list[0], str):
                    return [{'name': provider, 'providerName': provider} for provider in providers_list]
                return providers_list
        except Exception as e:
            logger.error(f"Error fetching all providers: {e}")
            return []
    
    async def get_served_countries(self) -> List[Dict[str, Any]]:
        """Get countries currently served by Priority Connections."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout, verify=False) as client:
                response = await client.get(f"{self.base_url}/countries")
                response.raise_for_status()
                data = response.json()
                countries_list = data.get('data', []) if isinstance(data, dict) else data
                
                # Convert string list to dict format with unique identifiers
                if countries_list and isinstance(countries_list[0], str):
                    return [
                        {
                            'name': country, 
                            'countryName': country, 
                            'code': country.replace(' ', '_').replace(',', '').replace("'", '').upper()[:10]  # Use country name as unique code
                        } 
                        for country in countries_list
                    ]
                return countries_list
        except Exception as e:
            logger.error(f"Error fetching served countries: {e}")
            return []
    
    async def get_provider_rates(self, country_name: str, parcel_type: str = "Parcel", weight: float = 1.0) -> List[Dict[str, Any]]:
        """Get rates for chosen country and provider."""
        try:
            params = {
                "countryName": country_name,
                "parcelType": parcel_type,
                "weight": str(weight)
            }
            
            async with httpx.AsyncClient(timeout=self.timeout, verify=False) as client:
                response = await client.get(f"{self.base_url}/providerrates", params=params)
                response.raise_for_status()
                data = response.json()
                return data.get('data', []) if isinstance(data, dict) else data
        except Exception as e:
            logger.error(f"Error fetching provider rates for {country_name}: {e}")
            return []
    
    async def get_quote_for_destination(self, country_name: str, weight: float, parcel_type: str = "Parcel") -> List[Dict[str, Any]]:
        """Get comprehensive quote data for a destination country."""
        try:
            # Get rates for the specific country
            rates = await self.get_provider_rates(country_name, parcel_type, weight)
            
            if not rates:
                logger.warning(f"No rates found for {country_name}")
                return []
            
            # Process and format the rates
            formatted_quotes = []
            for rate in rates:
                try:
                    # Extract rate information from actual API response structure
                    provider_name = rate.get('Provider', 'Unknown Provider')
                    base_rate = float(rate.get('Rate', 0))
                    zone = rate.get('Zone', 'N/A')
                    method = rate.get('Method', 'Standard')
                    
                    # Use only the base rate from Priority Connections API
                    fuel_surcharge = 0.0  # No fuel surcharge
                    handling_fee = 0.0  # No additional handling fee
                    total_cost = base_rate
                    
                    # Determine delivery days based on provider
                    delivery_days = self._get_delivery_days(provider_name, zone)
                    
                    # Create formatted quote
                    formatted_quote = {
                        'provider_name': provider_name,
                        'service_name': f"{provider_name} International",
                        'service_type': 'express' if provider_name in ['DHL', 'FedEx'] else 'standard',
                        'base_rate': base_rate,
                        'fuel_surcharge': fuel_surcharge,
                        'handling_fee': handling_fee,
                        'total_cost': total_cost,
                        'delivery_days': delivery_days,
                        'estimated_delivery': (datetime.utcnow() + timedelta(days=delivery_days)).isoformat(),
                        'country': country_name,
                        'weight': weight,
                        'parcel_type': parcel_type,
                        'zone': zone,
                        'method': method,
                        'currency': 'INR',
                        'features': self._get_provider_features(provider_name, 'express' if provider_name in ['DHL', 'FedEx'] else 'standard'),
                        'raw_data': rate  # Keep original data for reference
                    }
                    
                    formatted_quotes.append(formatted_quote)
                    
                except (ValueError, KeyError) as e:
                    logger.warning(f"Error processing rate data: {e}")
                    continue
            
            return formatted_quotes
            
        except Exception as e:
            logger.error(f"Error getting quotes for {country_name}: {e}")
            return []
    
    def _get_delivery_days(self, provider_name: str, zone: str) -> int:
        """Get estimated delivery days based on provider and zone."""
        # Base delivery days by provider
        provider_days = {
            'DHL': 2,
            'FedEx': 3,
            'UPS': 4,
            'Aramex': 5
        }
        
        base_days = provider_days.get(provider_name, 5)
        
        # Adjust based on zone (if applicable)
        if isinstance(zone, str) and zone.isdigit():
            zone_num = int(zone)
            if zone_num > 5:
                base_days += 1
        
        return base_days
    
    def _get_country_code(self, country_name: str) -> str:
        """Get country code from country name."""
        # Basic mapping - you might want to use a more comprehensive mapping
        country_code_mapping = {
            'United States Of America': 'US',
            'United Kingdom': 'GB',
            'Canada': 'CA',
            'Australia': 'AU',
            'Germany': 'DE',
            'France': 'FR',
            'Italy': 'IT',
            'Spain': 'ES',
            'Netherlands, The': 'NL',
            'Belgium': 'BE',
            'Switzerland': 'CH',
            'Austria': 'AT',
            'Sweden': 'SE',
            'Norway': 'NO',
            'Denmark': 'DK',
            'Finland': 'FI',
            'Ireland, Republic Of': 'IE',
            'Portugal': 'PT',
            'Greece': 'GR',
            'Poland': 'PL',
            'Czech Republic, The': 'CZ',
            'Hungary': 'HU',
            'Romania': 'RO',
            'Bulgaria': 'BG',
            'Croatia': 'HR',
            'Slovenia': 'SI',
            'Slovakia': 'SK',
            'Lithuania': 'LT',
            'Latvia': 'LV',
            'Estonia': 'EE',
            'Japan': 'JP',
            'Korea, Republic Of': 'KR',
            'China, People\'s Republic': 'CN',
            'Hong Kong': 'HK',
            'Singapore': 'SG',
            'Malaysia': 'MY',
            'Thailand': 'TH',
            'Indonesia': 'ID',
            'Philippines, The': 'PH',
            'Vietnam': 'VN',
            'India': 'IN',
            'United Arab Emirates': 'AE',
            'Saudi Arabia': 'SA',
            'Israel': 'IL',
            'Turkey': 'TR',
            'Egypt': 'EG',
            'South Africa': 'ZA',
            'Brazil': 'BR',
            'Mexico': 'MX',
            'Argentina': 'AR',
            'Chile': 'CL',
            'Colombia': 'CO',
            'Peru': 'PE',
            'New Zealand': 'NZ'
        }
        
        return country_code_mapping.get(country_name, country_name[:2].upper())
    
    def _get_provider_features(self, provider_name: str, service_type: str) -> List[str]:
        """Get features for a provider based on name and service type."""
        features = ["Real-time tracking", "Insurance available"]
        
        # Add service-specific features
        if service_type.lower() in ['express', 'priority']:
            features.extend(["Priority handling", "SMS notifications"])
        
        # Add provider-specific features
        provider_lower = provider_name.lower()
        
        if 'dhl' in provider_lower:
            features.extend(["Customs clearance", "Duty management", "Global network"])
        elif 'fedex' in provider_lower:
            features.extend(["Customs clearance", "Money-back guarantee"])
        elif 'ups' in provider_lower:
            features.extend(["Carbon neutral shipping", "Pickup service"])
        elif 'aramex' in provider_lower:
            features.extend(["COD available", "Regional expertise"])
        
        # International shipping features
        features.append("International delivery")
        
        return features
    
    async def validate_country_service(self, country_name: str) -> bool:
        """Check if a country is served by Priority Connections."""
        try:
            served_countries = await self.get_served_countries()
            country_names = [country.get('name', '').lower() for country in served_countries]
            return country_name.lower() in country_names
        except Exception as e:
            logger.error(f"Error validating country service: {e}")
            return False
    
    async def get_country_providers(self, country_name: str) -> List[Dict[str, Any]]:
        """Get all providers available for a specific country."""
        try:
            countries_with_providers = await self.get_countries_with_providers()
            
            # The API returns a dict with country names as keys and provider lists as values
            if isinstance(countries_with_providers, dict):
                providers_list = countries_with_providers.get(country_name, [])
                
                # Convert string list to dict format for consistency
                if providers_list and isinstance(providers_list[0], str):
                    return [{'name': provider, 'providerName': provider} for provider in providers_list]
                return providers_list
            
            # Fallback: if it's a list format (old structure)
            for country_data in countries_with_providers:
                if isinstance(country_data, dict):
                    if country_data.get('countryName', '').lower() == country_name.lower():
                        return country_data.get('providers', [])
            
            return []
        except Exception as e:
            logger.error(f"Error getting providers for {country_name}: {e}")
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Check if Priority Connections API is accessible."""
        try:
            async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
                response = await client.get(f"{self.base_url}/countries")
                response.raise_for_status()
                
                return {
                    "status": "healthy",
                    "response_time": response.elapsed.total_seconds(),
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }