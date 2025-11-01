import { StreamingState } from '../types';
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface StreamingIndicatorProps {
  state: StreamingState;
}

export function StreamingIndicator({ state }: StreamingIndicatorProps) {
  if (state.status === 'idle') {
    return null;
  }

  const getStatusInfo = () => {
    switch (state.status) {
      case 'connecting':
        return {
          icon: <Wifi size={16} />,
          text: 'Connecting to AI...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'streaming':
        return {
          icon: <Loader2 size={16} className="animate-spin" />,
          text: 'AI is thinking...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'completed':
        return {
          icon: <CheckCircle size={16} />,
          text: 'Response complete',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} />,
          text: state.error || 'Connection error',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          icon: <WifiOff size={16} />,
          text: 'Disconnected',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={clsx(
      'flex items-center gap-2 px-3 py-2 rounded-full text-sm',
      statusInfo.bgColor,
      statusInfo.color
    )}>
      {statusInfo.icon}
      <span>{statusInfo.text}</span>
    </div>
  );
}