# Priority Connections API Integration

## Overview

This document describes the integration of Priority Connections APIs into the XFas Logistics quotation system. The integration provides real-time shipping rates from multiple international carriers including DHL, FedEx, and UPS.

## Integrated APIs

### 1. Countries and Providers API
- **Endpoint**: `https://app.priorityconnections.in/api/public/countryproviders`
- **Purpose**: Get all countries and their associated suppliers/providers
- **Usage**: Used to populate country selection and show available carriers

### 2. All Providers API
- **Endpoint**: `https://app.priorityconnections.in/api/public/getinternationalrateprovider`
- **Purpose**: Get all providers available in the system
- **Response**: Returns DHL, DHL Express, FedEx, UPS

### 3. Served Countries API
- **Endpoint**: `https://app.priorityconnections.in/api/public/countries`
- **Purpose**: Get countries currently served by Priority Connections
- **Response**: Returns 232+ countries worldwide

### 4. Provider Rates API
- **Endpoint**: `https://app.priorityconnections.in/api/public/providerrates`
- **Parameters**: 
  - `countryName`: Destination country name
  - `parcelType`: Type of shipment (Parcel/Document)
  - `weight`: Package weight in kg
- **Purpose**: Get real-time rates for specific destination and weight

## Backend Implementation

### New Services

#### 1. PriorityConnectionsService (`backend/services/priority_connections_service.py`)
- Handles all API calls to Priority Connections
- Formats responses into consistent data structure
- Includes error handling and SSL certificate bypass for development
- Provides rate calculation with fuel surcharges and handling fees

#### 2. Updated CarrierService (`backend/services/carrier_service.py`)
- Integrated Priority Connections service
- Added methods to get PC quotes and convert to CarrierQuote objects
- Country code to name mapping for API compatibility

#### 3. Updated QuoteService (`backend/services/quote_service.py`)
- Modified to include Priority Connections quotes alongside mock quotes
- Maintains existing quote comparison and recommendation logic

### New API Endpoints

#### 1. Get Priority Connections Countries
```
GET /quotes/priority-connections/countries
```
Returns list of countries served by Priority Connections.

#### 2. Get Priority Connections Providers
```
GET /quotes/priority-connections/providers?country_name=United Kingdom
```
Returns providers available for a specific country (optional parameter).

#### 3. Get Priority Connections Rates
```
GET /quotes/priority-connections/rates?country_name=United Kingdom&weight=2.0&parcel_type=Parcel
```
Returns raw rates for specific country, weight, and parcel type.

## Frontend Implementation

### Updated Components

#### 1. QuoteForm Component (`frontend/src/components/QuoteForm.jsx`)
- Added Priority Connections country loading
- Enhanced country selection with PC countries
- Provider information display for selected countries
- Visual indicators for Priority Connections network

#### 2. API Service (`frontend/src/services/api.js`)
- Added new API methods for Priority Connections endpoints
- Maintains existing quote creation flow

### New Features

#### 1. Enhanced Country Selection
- Displays both default countries and Priority Connections countries
- Shows available carriers for selected destination
- Visual separation between local and international options

#### 2. Provider Information Display
- Shows available carriers when country is selected
- Real-time loading indicators
- Provider count and names preview

#### 3. Priority Connections Network Badge
- Special visual indicator for PC-served destinations
- Information card showing available carriers
- Enhanced user experience with carrier previews

## Sample API Responses

### Countries Response
```json
{
  "status": "success",
  "data": [
    "Afghanistan",
    "Albania",
    "Algeria",
    "..."
  ]
}
```

### Providers Response
```json
{
  "status": "success",
  "data": [
    "DHL",
    "DHL Express", 
    "FedEx",
    "UPS"
  ]
}
```

### Rates Response
```json
[
  {
    "Provider": "DHL",
    "Rate": 1797.76,
    "Zone": "7",
    "Method": "Range"
  },
  {
    "Provider": "FedEx", 
    "Rate": 1756.73,
    "Zone": "F",
    "Method": "Range"
  },
  {
    "Provider": "UPS",
    "Rate": 1328.83,
    "Zone": "GB", 
    "Method": "Range"
  }
]
```

## Rate Calculation

The system applies the following calculation to Priority Connections rates:

1. **Base Rate**: From API response
2. **Fuel Surcharge**: 12% of base rate
3. **Handling Fee**: Fixed ₹50
4. **Total Cost**: Base + Fuel Surcharge + Handling Fee

### Example Calculation (UK, 2kg)
- DHL Base Rate: ₹1,797.76
- Fuel Surcharge: ₹215.73 (12%)
- Handling Fee: ₹50.00
- **Total: ₹2,063.49**

## Delivery Time Estimation

Delivery days are estimated based on provider and zone:

- **DHL**: 2-3 days (express)
- **FedEx**: 3 days (express)  
- **UPS**: 4 days (standard)
- **Zone adjustment**: +1 day for zones > 5

## Features by Provider

### DHL
- Real-time tracking
- Insurance available
- Priority handling
- SMS notifications
- Customs clearance
- Duty management
- Global network

### FedEx
- Real-time tracking
- Insurance available
- Priority handling
- SMS notifications
- Customs clearance
- Money-back guarantee

### UPS
- Real-time tracking
- Insurance available
- Carbon neutral shipping
- Pickup service

## Testing

Run the integration test:
```bash
python test_priority_connections.py
```

This will verify:
- API connectivity
- Countries endpoint
- Providers endpoint
- Rate calculation
- Carrier service integration

## Error Handling

The integration includes comprehensive error handling:

1. **SSL Certificate Issues**: Bypassed for development (verify=False)
2. **API Timeouts**: 30-second timeout with graceful fallback
3. **Rate Parsing Errors**: Individual quote failures don't break entire process
4. **Network Issues**: Logged errors with empty response fallback

## Security Considerations

- SSL verification is disabled for development due to certificate issues
- In production, proper SSL certificates should be configured
- API calls are made server-side to protect any future API keys
- Rate limiting should be implemented for production use

## Future Enhancements

1. **Caching**: Implement Redis caching for country/provider data
2. **Rate Limiting**: Add API call throttling
3. **Webhooks**: Integrate shipment tracking webhooks
4. **Bulk Rates**: Support for multiple destinations at once
5. **Currency Conversion**: Support for multiple currencies
6. **Zone Mapping**: More accurate delivery time calculation based on zones

## Troubleshooting

### Common Issues

1. **SSL Certificate Error**: 
   - Ensure `verify=False` is set in httpx client
   - Check if Priority Connections has updated their SSL certificate

2. **No Rates Returned**:
   - Verify country name spelling (case-sensitive)
   - Check if country is in served countries list
   - Ensure weight is > 0

3. **Timeout Errors**:
   - Check internet connectivity
   - Verify Priority Connections API is accessible
   - Consider increasing timeout value

### Debug Mode

Enable debug logging by setting log level to DEBUG in the service initialization.

## Integration Status

✅ **Completed Features:**
- All 4 Priority Connections APIs integrated
- Real-time rate fetching
- Enhanced country selection
- Provider information display
- Rate calculation with surcharges
- Error handling and fallbacks
- Frontend UI enhancements

🔄 **In Progress:**
- Production SSL certificate handling
- Rate caching implementation

📋 **Planned:**
- Shipment booking integration
- Tracking webhook integration
- Bulk rate API support