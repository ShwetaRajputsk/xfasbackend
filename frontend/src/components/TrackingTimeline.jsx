import React from 'react';
import { CheckCircle, Circle, Clock, Calendar, MapPin, Truck, Navigation, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const TrackingTimeline = ({ milestones, trackingEvents, currentStatus, estimatedDelivery, nextUpdate }) => {
  const getMilestoneIcon = (iconName, status) => {
    const iconProps = { className: `w-5 h-5 ${status === 'completed' ? 'text-green-600' : status === 'current' ? 'text-orange-500' : 'text-gray-400'}` };
    
    const icons = {
      'check-circle': <CheckCircle {...iconProps} />,
      'calendar': <Calendar {...iconProps} />,
      'truck': <Truck {...iconProps} />,
      'navigation': <Navigation {...iconProps} />,
      'map-pin': <MapPin {...iconProps} />,
      'check-circle-2': <CheckCircle {...iconProps} />
    };
    
    return icons[iconName] || <Circle {...iconProps} />;
  };

  const getEventIcon = (status) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes('delivered')) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (lowerStatus.includes('out for delivery')) return <MapPin className="w-4 h-4 text-blue-600" />;
    if (lowerStatus.includes('transit') || lowerStatus.includes('departed')) return <Navigation className="w-4 h-4 text-purple-600" />;
    if (lowerStatus.includes('picked') || lowerStatus.includes('collected')) return <Truck className="w-4 h-4 text-orange-600" />;
    if (lowerStatus.includes('scheduled')) return <Calendar className="w-4 h-4 text-yellow-600" />;
    
    return <Circle className="w-4 h-4 text-gray-500" />;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Milestones Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-orange-500" />
            <span>Delivery Milestones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  milestone.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : milestone.status === 'current'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {getMilestoneIcon(milestone.icon, milestone.status)}
                </div>
                
                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      milestone.status === 'completed' ? 'text-green-900' :
                      milestone.status === 'current' ? 'text-orange-900' : 'text-gray-900'
                    }`}>
                      {milestone.title}
                    </h4>
                    {milestone.status === 'current' && (
                      <Badge className="bg-orange-100 text-orange-800">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  {milestone.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(milestone.timestamp).date} at {formatDateTime(milestone.timestamp).time}
                    </p>
                  )}
                </div>
                
                {/* Connector Line */}
                {index < milestones.length - 1 && (
                  <div className={`absolute left-9 mt-10 w-0.5 h-8 ${
                    milestone.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                  }`} style={{ marginLeft: '-1px' }} />
                )}
              </div>
            ))}
          </div>

          {/* Next Update Prediction */}
          {nextUpdate && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Next Update Expected</h4>
                  <p className="text-sm text-blue-700 mt-1">{nextUpdate.description}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Expected: {formatDateTime(nextUpdate.estimated_time).date} at {formatDateTime(nextUpdate.estimated_time).time}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Tracking Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span>Tracking History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {trackingEvents.map((event, index) => {
              const { date, time } = formatDateTime(event.timestamp);
              
              return (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                    {getEventIcon(event.status)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.status}</h4>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500 flex-shrink-0 ml-4">
                        <div>{date}</div>
                        <div>{time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estimated Delivery */}
          {estimatedDelivery && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Estimated Delivery</h4>
                  <p className="text-sm text-green-700">
                    {formatDateTime(estimatedDelivery).date} by end of day
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingTimeline;